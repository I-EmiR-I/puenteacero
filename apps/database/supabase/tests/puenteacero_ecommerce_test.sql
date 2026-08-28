\set ON_ERROR_STOP on

BEGIN;
SELECT plan(15);

-- =============================================================================
-- Usuarios de prueba (el trigger handle_new_user crea sus profiles)
-- =============================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'authenticated', 'authenticated', 'admin-qa@test.com', '{"provider":"email","providers":["email"]}', '{"full_name":"Admin QA"}', 'x', now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'authenticated', 'authenticated', 'cust-qa@test.com', '{"provider":"email","providers":["email"]}', '{"full_name":"Cliente QA"}', 'x', now(), now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET rol = 'admin' WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

-- =============================================================================
-- anon: lectura pública del catálogo
-- =============================================================================
SET ROLE anon;
SET request.jwt.claim.sub = '';
SELECT ok((SELECT count(*) FROM public.products WHERE activo) > 0, 'T01 anon ve productos activos');
SELECT ok((SELECT count(*) FROM public.units) > 0, 'T02 anon lee unidades');
SELECT ok((SELECT count(*) FROM public.categories) > 0, 'T03 anon lee categorias');
SELECT ok((SELECT count(*) FROM public.coupons) = 0, 'T04 anon no ve cupones');

-- anon NO puede insertar producto
DO $$
DECLARE inserted boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.products (category_id, unit_id, slug, nombre, precio)
    VALUES (
      (SELECT id FROM public.categories LIMIT 1),
      (SELECT id FROM public.units LIMIT 1),
      'intruso-anon',
      'Intruso',
      1
    );
    inserted := true;
  EXCEPTION WHEN OTHERS THEN
    inserted := false;
  END;
  IF inserted THEN
    RAISE EXCEPTION 'T05 FAIL: anon pudo insertar producto';
  END IF;
END $$;
SELECT ok(TRUE, 'T05 anon bloqueado para insertar producto');

-- =============================================================================
-- customer (u2)
-- =============================================================================
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

INSERT INTO public.orders (user_id, provider, metodo_envio, subtotal, total)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'stripe', 'local', 100, 100)
RETURNING id AS _oid \gset

SELECT ok((SELECT count(*) FROM public.orders WHERE id = :'_oid') = 1, 'T06 customer ve su propia orden');
SELECT ok((SELECT count(*) FROM public.orders WHERE user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1') = 0, 'T07 customer no ve ordenes ajenas');
SELECT ok((SELECT count(*) FROM public.coupons) = 0, 'T08 customer no ve cupones');

-- customer NO puede crear orden ajena
DO $$
DECLARE inserted boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.orders (user_id, provider, metodo_envio, subtotal, total)
    VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'stripe', 'local', 1, 1);
    inserted := true;
  EXCEPTION WHEN OTHERS THEN
    inserted := false;
  END;
  IF inserted THEN
    RAISE EXCEPTION 'T09 FAIL: customer pudo crear orden ajena';
  END IF;
END $$;
SELECT ok(TRUE, 'T09 customer bloqueado para crear orden ajena');

-- carrito propio
INSERT INTO public.carts (user_id) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2')
RETURNING id AS _cid \gset
INSERT INTO public.cart_items (cart_id, product_id, quantity)
VALUES (:'_cid', (SELECT id FROM public.products WHERE activo LIMIT 1), 1);
SELECT ok((SELECT count(*) FROM public.cart_items WHERE cart_id = :'_cid') = 1, 'T10 customer ve su carrito');

-- =============================================================================
-- admin (u1)
-- =============================================================================
SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

INSERT INTO public.products (category_id, unit_id, slug, nombre, precio, activo)
VALUES (
  (SELECT id FROM public.categories LIMIT 1),
  (SELECT id FROM public.units LIMIT 1),
  'producto-qa',
  'Producto QA',
  42,
  false
) RETURNING id AS _pid \gset
SELECT ok((SELECT count(*) FROM public.products WHERE slug = 'producto-qa') = 1, 'T11 admin crea producto');

SELECT ok((SELECT count(*) FROM public.orders) > 0, 'T12 admin ve todas las ordenes');

SELECT ok((SELECT count(*) FROM public.cart_items WHERE cart_id = :'_cid') = 0, 'T13 admin no ve carrito ajeno');

-- =============================================================================
-- anon NO ve producto inactivo creado por admin
-- =============================================================================
SET ROLE anon;
SET request.jwt.claim.sub = '';
SELECT ok((SELECT count(*) FROM public.products WHERE slug = 'producto-qa') = 0, 'T14 anon no ve producto inactivo');

-- admin sí ve producto inactivo
SET ROLE authenticated;
SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
SELECT ok((SELECT count(*) FROM public.products WHERE slug = 'producto-qa') = 1, 'T15 admin ve producto inactivo');

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
