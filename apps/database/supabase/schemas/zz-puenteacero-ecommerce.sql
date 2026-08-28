-- =============================================================================
-- PuenteAcero — dominio e-commerce (ferretería: herramientas, máquinas, acero)
-- Solo DDL. Los datos semilla (units, categorías, productos, admin) viven en seed.sql
-- Nota: helper es_admin() en schema public (default privileges del init.sql le dan
-- execute a anon/authenticated); sin FORCE RLS (convención del starter).
-- =============================================================================

-- =============================================================================
-- Catálogo de unidades (cada producto tiene SU unidad asignada)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nombre text NOT NULL,
  simbolo text,
  admite_decimales boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Categorías (jerárquicas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Productos
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL REFERENCES public.units (id) ON DELETE RESTRICT,
  sku text UNIQUE,
  slug text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  especificaciones jsonb NOT NULL DEFAULT '{}'::jsonb,
  precio numeric(12,2) NOT NULL CHECK (precio >= 0),
  stock numeric(12,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
  envio_nacional boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Perfiles (cliente final + admin)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  rol text NOT NULL CHECK (rol IN ('admin', 'customer')) DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Carrito (solo usuarios logueados; el carrito invitado vive en el navegador
-- y se sincroniza al iniciar sesión)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

-- =============================================================================
-- Cupones
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  tipo text NOT NULL CHECK (tipo IN ('percentage', 'fixed')),
  valor numeric(12,2) NOT NULL CHECK (valor > 0),
  activo boolean NOT NULL DEFAULT true,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  uso_maximo integer,
  usos_actuales integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Órdenes + ítems (e-commerce one-time; proveedor de pago integrado)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES public.coupons (id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired', 'refunded', 'error')) DEFAULT 'pending',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  descuento numeric(12,2) NOT NULL DEFAULT 0,
  envio_costo numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'mxn',
  metodo_envio text NOT NULL CHECK (metodo_envio IN ('local', 'nacional')),
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider text NOT NULL CHECK (provider IN ('stripe', 'mercadopago', 'whatsapp')),
  provider_order_id text,
  provider_payment_id text,
  external_reference text UNIQUE,
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  nombre text NOT NULL,
  sku text,
  unidad text NOT NULL,
  precio_unitario numeric(12,2) NOT NULL,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  subtotal numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Índices (columnas de RLS y FKs)
-- =============================================================================
CREATE INDEX IF NOT EXISTS categories_parent_idx ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_unit_idx ON public.products (unit_id);
CREATE INDEX IF NOT EXISTS products_activo_idx ON public.products (activo) WHERE activo;
CREATE INDEX IF NOT EXISTS products_nombre_idx ON public.products (nombre);
CREATE INDEX IF NOT EXISTS products_activo_cat_idx ON public.products (activo, category_id);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON public.cart_items (cart_id);
CREATE INDEX IF NOT EXISTS cart_items_product_idx ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_external_ref_idx ON public.orders (external_reference);

-- Valida y aplica un cupón (security definer: el cliente no lee la tabla coupons).
-- Valida vigencia/uso, calcula descuento e incrementa usos_actuales en una sola
-- operación atómica. Llamable por authenticated vía rpc().
CREATE OR REPLACE FUNCTION public.aplicar_cupon(p_codigo text, p_subtotal numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_descuento numeric;
BEGIN
  SELECT * INTO v_coupon FROM coupons WHERE codigo = upper(p_codigo);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cupón inválido';
  END IF;
  IF NOT v_coupon.activo THEN
    RAISE EXCEPTION 'Cupón inactivo';
  END IF;
  IF v_coupon.valid_from IS NOT NULL AND v_coupon.valid_from > now() THEN
    RAISE EXCEPTION 'Cupón no vigente aún';
  END IF;
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RAISE EXCEPTION 'Cupón vencido';
  END IF;
  IF v_coupon.uso_maximo IS NOT NULL AND v_coupon.usos_actuales >= v_coupon.uso_maximo THEN
    RAISE EXCEPTION 'Cupón agotado';
  END IF;

  v_descuento := CASE
    WHEN v_coupon.tipo = 'percentage' THEN round((p_subtotal * v_coupon.valor) / 100, 2)
    ELSE least(v_coupon.valor, p_subtotal)
  END;

  UPDATE coupons SET usos_actuales = usos_actuales + 1 WHERE id = v_coupon.id;

  RETURN jsonb_build_object('coupon_id', v_coupon.id, 'descuento', v_descuento);
END;
$$;

GRANT EXECUTE ON FUNCTION public.aplicar_cupon(text, numeric) TO authenticated;
CREATE INDEX IF NOT EXISTS orders_coupon_idx ON public.orders (coupon_id);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);

-- =============================================================================
-- Helper: ¿es admin? (schema public; default privileges dan execute)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND rol = 'admin'
  );
$$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Catálogo: lectura pública, escritura admin
CREATE POLICY "units_select_public" ON public.units
  FOR SELECT USING (true);
CREATE POLICY "units_admin_all" ON public.units
  FOR ALL USING (public.es_admin());

CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL USING (public.es_admin());

CREATE POLICY "products_select_public" ON public.products
  FOR SELECT USING (activo);
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.es_admin());

CREATE POLICY "product_images_select_public" ON public.product_images
  FOR SELECT USING (true);
CREATE POLICY "product_images_admin_all" ON public.product_images
  FOR ALL USING (public.es_admin());

-- Perfiles: cada quien el suyo
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Carrito: solo el dueño
CREATE POLICY "carts_select_own" ON public.carts
  FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "carts_insert_own" ON public.carts
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "carts_update_own" ON public.carts
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_id AND c.user_id = (SELECT auth.uid())
    )
  );

-- Cupones: solo admin (validación/aplicación server-side)
CREATE POLICY "coupons_admin_all" ON public.coupons
  FOR ALL USING (public.es_admin());

-- Órdenes: el dueño ve las propias; admin ve todo
CREATE POLICY "orders_select_own_or_admin" ON public.orders
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.es_admin());
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (public.es_admin());

CREATE POLICY "order_items_select_own_or_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
    OR public.es_admin()
  );
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  );

-- =============================================================================
-- GRANTs explícitos (los default privileges del init.sql ya dan ALL a anon/
-- authenticated/service_role; acá aseguramos SELECT de catálogo a anon)
-- =============================================================================
GRANT SELECT ON public.units, public.categories, public.products, public.product_images TO anon, authenticated;

-- =============================================================================
-- Trigger: crear perfil al registrarse
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Trigger: updated_at (usa public.set_updated_at() definida en init.sql)
-- =============================================================================
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_carts
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
