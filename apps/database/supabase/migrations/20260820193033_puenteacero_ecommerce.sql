
  create table "public"."cart_items" (
    "id" uuid not null default gen_random_uuid(),
    "cart_id" uuid not null,
    "product_id" uuid not null,
    "quantity" numeric(12,2) not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."cart_items" enable row level security;


  create table "public"."carts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."carts" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "parent_id" uuid,
    "nombre" text not null,
    "slug" text not null,
    "orden" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."coupons" (
    "id" uuid not null default gen_random_uuid(),
    "codigo" text not null,
    "tipo" text not null,
    "valor" numeric(12,2) not null,
    "activo" boolean not null default true,
    "valid_from" timestamp with time zone not null default now(),
    "valid_until" timestamp with time zone,
    "uso_maximo" integer,
    "usos_actuales" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."coupons" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "product_id" uuid,
    "nombre" text not null,
    "sku" text,
    "unidad" text not null,
    "precio_unitario" numeric(12,2) not null,
    "quantity" numeric(12,2) not null,
    "subtotal" numeric(12,2) not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "coupon_id" uuid,
    "status" text not null default 'pending'::text,
    "subtotal" numeric(12,2) not null default 0,
    "descuento" numeric(12,2) not null default 0,
    "envio_costo" numeric(12,2) not null default 0,
    "total" numeric(12,2) not null default 0,
    "moneda" text not null default 'mxn'::text,
    "metodo_envio" text not null,
    "shipping_address" jsonb not null default '{}'::jsonb,
    "provider" text not null,
    "provider_order_id" text,
    "provider_payment_id" text,
    "external_reference" text,
    "checkout_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."orders" enable row level security;


  create table "public"."product_images" (
    "id" uuid not null default gen_random_uuid(),
    "product_id" uuid not null,
    "url" text not null,
    "alt" text,
    "orden" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."product_images" enable row level security;


  create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "category_id" uuid not null,
    "unit_id" uuid not null,
    "sku" text,
    "slug" text not null,
    "nombre" text not null,
    "descripcion" text,
    "especificaciones" jsonb not null default '{}'::jsonb,
    "precio" numeric(12,2) not null,
    "stock" numeric(12,2) not null default 0,
    "envio_nacional" boolean not null default false,
    "activo" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."products" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "rol" text not null default 'customer'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."units" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "nombre" text not null,
    "simbolo" text,
    "admite_decimales" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."units" enable row level security;

CREATE UNIQUE INDEX cart_items_cart_id_product_id_key ON public.cart_items USING btree (cart_id, product_id);

CREATE INDEX cart_items_cart_idx ON public.cart_items USING btree (cart_id);

CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);

CREATE INDEX cart_items_product_idx ON public.cart_items USING btree (product_id);

CREATE UNIQUE INDEX carts_pkey ON public.carts USING btree (id);

CREATE UNIQUE INDEX carts_user_id_key ON public.carts USING btree (user_id);

CREATE INDEX categories_parent_idx ON public.categories USING btree (parent_id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE UNIQUE INDEX coupons_codigo_key ON public.coupons USING btree (codigo);

CREATE UNIQUE INDEX coupons_pkey ON public.coupons USING btree (id);

CREATE INDEX order_items_order_idx ON public.order_items USING btree (order_id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE INDEX orders_coupon_idx ON public.orders USING btree (coupon_id);

CREATE INDEX orders_external_ref_idx ON public.orders USING btree (external_reference);

CREATE UNIQUE INDEX orders_external_reference_key ON public.orders USING btree (external_reference);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE INDEX orders_user_idx ON public.orders USING btree (user_id);

CREATE UNIQUE INDEX product_images_pkey ON public.product_images USING btree (id);

CREATE INDEX product_images_product_idx ON public.product_images USING btree (product_id);

CREATE INDEX products_activo_idx ON public.products USING btree (activo) WHERE activo;

CREATE INDEX products_category_idx ON public.products USING btree (category_id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);

CREATE INDEX products_unit_idx ON public.products USING btree (unit_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE UNIQUE INDEX units_slug_key ON public.units USING btree (slug);

alter table "public"."cart_items" add constraint "cart_items_pkey" PRIMARY KEY using index "cart_items_pkey";

alter table "public"."carts" add constraint "carts_pkey" PRIMARY KEY using index "carts_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."coupons" add constraint "coupons_pkey" PRIMARY KEY using index "coupons_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."product_images" add constraint "product_images_pkey" PRIMARY KEY using index "product_images_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."cart_items" add constraint "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_cart_id_fkey";

alter table "public"."cart_items" add constraint "cart_items_cart_id_product_id_key" UNIQUE using index "cart_items_cart_id_product_id_key";

alter table "public"."cart_items" add constraint "cart_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_product_id_fkey";

alter table "public"."cart_items" add constraint "cart_items_quantity_check" CHECK ((quantity > (0)::numeric)) not valid;

alter table "public"."cart_items" validate constraint "cart_items_quantity_check";

alter table "public"."carts" add constraint "carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."carts" validate constraint "carts_user_id_fkey";

alter table "public"."carts" add constraint "carts_user_id_key" UNIQUE using index "carts_user_id_key";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."coupons" add constraint "coupons_codigo_key" UNIQUE using index "coupons_codigo_key";

alter table "public"."coupons" add constraint "coupons_tipo_check" CHECK ((tipo = ANY (ARRAY['percentage'::text, 'fixed'::text]))) not valid;

alter table "public"."coupons" validate constraint "coupons_tipo_check";

alter table "public"."coupons" add constraint "coupons_valor_check" CHECK ((valor > (0)::numeric)) not valid;

alter table "public"."coupons" validate constraint "coupons_valor_check";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."order_items" add constraint "order_items_quantity_check" CHECK ((quantity > (0)::numeric)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_check";

alter table "public"."orders" add constraint "orders_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL not valid;

alter table "public"."orders" validate constraint "orders_coupon_id_fkey";

alter table "public"."orders" add constraint "orders_external_reference_key" UNIQUE using index "orders_external_reference_key";

alter table "public"."orders" add constraint "orders_metodo_envio_check" CHECK ((metodo_envio = ANY (ARRAY['local'::text, 'nacional'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_metodo_envio_check";

alter table "public"."orders" add constraint "orders_provider_check" CHECK ((provider = ANY (ARRAY['stripe'::text, 'mercadopago'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_provider_check";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'expired'::text, 'refunded'::text, 'error'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_images" validate constraint "product_images_product_id_fkey";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."products" add constraint "products_precio_check" CHECK ((precio >= (0)::numeric)) not valid;

alter table "public"."products" validate constraint "products_precio_check";

alter table "public"."products" add constraint "products_sku_key" UNIQUE using index "products_sku_key";

alter table "public"."products" add constraint "products_slug_key" UNIQUE using index "products_slug_key";

alter table "public"."products" add constraint "products_stock_check" CHECK ((stock >= (0)::numeric)) not valid;

alter table "public"."products" validate constraint "products_stock_check";

alter table "public"."products" add constraint "products_unit_id_fkey" FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE RESTRICT not valid;

alter table "public"."products" validate constraint "products_unit_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_rol_check" CHECK ((rol = ANY (ARRAY['admin'::text, 'customer'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_rol_check";

alter table "public"."units" add constraint "units_slug_key" UNIQUE using index "units_slug_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.es_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND rol = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_private_item_owner_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.owner_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."cart_items" to "anon";

grant insert on table "public"."cart_items" to "anon";

grant references on table "public"."cart_items" to "anon";

grant select on table "public"."cart_items" to "anon";

grant trigger on table "public"."cart_items" to "anon";

grant truncate on table "public"."cart_items" to "anon";

grant update on table "public"."cart_items" to "anon";

grant delete on table "public"."cart_items" to "authenticated";

grant insert on table "public"."cart_items" to "authenticated";

grant references on table "public"."cart_items" to "authenticated";

grant select on table "public"."cart_items" to "authenticated";

grant trigger on table "public"."cart_items" to "authenticated";

grant truncate on table "public"."cart_items" to "authenticated";

grant update on table "public"."cart_items" to "authenticated";

grant delete on table "public"."cart_items" to "service_role";

grant insert on table "public"."cart_items" to "service_role";

grant references on table "public"."cart_items" to "service_role";

grant select on table "public"."cart_items" to "service_role";

grant trigger on table "public"."cart_items" to "service_role";

grant truncate on table "public"."cart_items" to "service_role";

grant update on table "public"."cart_items" to "service_role";

grant delete on table "public"."carts" to "anon";

grant insert on table "public"."carts" to "anon";

grant references on table "public"."carts" to "anon";

grant select on table "public"."carts" to "anon";

grant trigger on table "public"."carts" to "anon";

grant truncate on table "public"."carts" to "anon";

grant update on table "public"."carts" to "anon";

grant delete on table "public"."carts" to "authenticated";

grant insert on table "public"."carts" to "authenticated";

grant references on table "public"."carts" to "authenticated";

grant select on table "public"."carts" to "authenticated";

grant trigger on table "public"."carts" to "authenticated";

grant truncate on table "public"."carts" to "authenticated";

grant update on table "public"."carts" to "authenticated";

grant delete on table "public"."carts" to "service_role";

grant insert on table "public"."carts" to "service_role";

grant references on table "public"."carts" to "service_role";

grant select on table "public"."carts" to "service_role";

grant trigger on table "public"."carts" to "service_role";

grant truncate on table "public"."carts" to "service_role";

grant update on table "public"."carts" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."coupons" to "anon";

grant insert on table "public"."coupons" to "anon";

grant references on table "public"."coupons" to "anon";

grant select on table "public"."coupons" to "anon";

grant trigger on table "public"."coupons" to "anon";

grant truncate on table "public"."coupons" to "anon";

grant update on table "public"."coupons" to "anon";

grant delete on table "public"."coupons" to "authenticated";

grant insert on table "public"."coupons" to "authenticated";

grant references on table "public"."coupons" to "authenticated";

grant select on table "public"."coupons" to "authenticated";

grant trigger on table "public"."coupons" to "authenticated";

grant truncate on table "public"."coupons" to "authenticated";

grant update on table "public"."coupons" to "authenticated";

grant delete on table "public"."coupons" to "service_role";

grant insert on table "public"."coupons" to "service_role";

grant references on table "public"."coupons" to "service_role";

grant select on table "public"."coupons" to "service_role";

grant trigger on table "public"."coupons" to "service_role";

grant truncate on table "public"."coupons" to "service_role";

grant update on table "public"."coupons" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."product_images" to "anon";

grant insert on table "public"."product_images" to "anon";

grant references on table "public"."product_images" to "anon";

grant select on table "public"."product_images" to "anon";

grant trigger on table "public"."product_images" to "anon";

grant truncate on table "public"."product_images" to "anon";

grant update on table "public"."product_images" to "anon";

grant delete on table "public"."product_images" to "authenticated";

grant insert on table "public"."product_images" to "authenticated";

grant references on table "public"."product_images" to "authenticated";

grant select on table "public"."product_images" to "authenticated";

grant trigger on table "public"."product_images" to "authenticated";

grant truncate on table "public"."product_images" to "authenticated";

grant update on table "public"."product_images" to "authenticated";

grant delete on table "public"."product_images" to "service_role";

grant insert on table "public"."product_images" to "service_role";

grant references on table "public"."product_images" to "service_role";

grant select on table "public"."product_images" to "service_role";

grant trigger on table "public"."product_images" to "service_role";

grant truncate on table "public"."product_images" to "service_role";

grant update on table "public"."product_images" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."units" to "anon";

grant insert on table "public"."units" to "anon";

grant references on table "public"."units" to "anon";

grant select on table "public"."units" to "anon";

grant trigger on table "public"."units" to "anon";

grant truncate on table "public"."units" to "anon";

grant update on table "public"."units" to "anon";

grant delete on table "public"."units" to "authenticated";

grant insert on table "public"."units" to "authenticated";

grant references on table "public"."units" to "authenticated";

grant select on table "public"."units" to "authenticated";

grant trigger on table "public"."units" to "authenticated";

grant truncate on table "public"."units" to "authenticated";

grant update on table "public"."units" to "authenticated";

grant delete on table "public"."units" to "service_role";

grant insert on table "public"."units" to "service_role";

grant references on table "public"."units" to "service_role";

grant select on table "public"."units" to "service_role";

grant trigger on table "public"."units" to "service_role";

grant truncate on table "public"."units" to "service_role";

grant update on table "public"."units" to "service_role";


  create policy "cart_items_delete_own"
  on "public"."cart_items"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.carts c
  WHERE ((c.id = cart_items.cart_id) AND (c.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "cart_items_insert_own"
  on "public"."cart_items"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.carts c
  WHERE ((c.id = cart_items.cart_id) AND (c.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "cart_items_select_own"
  on "public"."cart_items"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.carts c
  WHERE ((c.id = cart_items.cart_id) AND (c.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "cart_items_update_own"
  on "public"."cart_items"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.carts c
  WHERE ((c.id = cart_items.cart_id) AND (c.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "carts_insert_own"
  on "public"."carts"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "carts_select_own"
  on "public"."carts"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "carts_update_own"
  on "public"."carts"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "categories_admin_all"
  on "public"."categories"
  as permissive
  for all
  to public
using (public.es_admin());



  create policy "categories_select_public"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "coupons_admin_all"
  on "public"."coupons"
  as permissive
  for all
  to public
using (public.es_admin());



  create policy "order_items_insert_own"
  on "public"."order_items"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "order_items_select_own_or_admin"
  on "public"."order_items"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.user_id = ( SELECT auth.uid() AS uid))))) OR public.es_admin()));



  create policy "orders_insert_own"
  on "public"."orders"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "orders_select_own_or_admin"
  on "public"."orders"
  as permissive
  for select
  to public
using (((( SELECT auth.uid() AS uid) = user_id) OR public.es_admin()));



  create policy "orders_update_admin"
  on "public"."orders"
  as permissive
  for update
  to public
using (public.es_admin());



  create policy "product_images_admin_all"
  on "public"."product_images"
  as permissive
  for all
  to public
using (public.es_admin());



  create policy "product_images_select_public"
  on "public"."product_images"
  as permissive
  for select
  to public
using (true);



  create policy "products_admin_all"
  on "public"."products"
  as permissive
  for all
  to public
using (public.es_admin());



  create policy "products_select_public"
  on "public"."products"
  as permissive
  for select
  to public
using (activo);



  create policy "profiles_select_own"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "profiles_update_own"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "units_admin_all"
  on "public"."units"
  as permissive
  for all
  to public
using (public.es_admin());



  create policy "units_select_public"
  on "public"."units"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER set_updated_at_carts BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


