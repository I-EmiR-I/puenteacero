-- =============================================================================
-- PuenteAcero — datos semilla (desarrollo local)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Unidades (con UUIDs fijos para poder referenciarlas desde productos)
-- ---------------------------------------------------------------------------
INSERT INTO public.units (id, slug, nombre, simbolo, admite_decimales) VALUES
  ('10000000-0000-4000-8000-000000000001', 'metro',          'Metro',          'm',   true),
  ('10000000-0000-4000-8000-000000000002', 'metro_cuadrado', 'Metro cuadrado', 'm²',  true),
  ('10000000-0000-4000-8000-000000000003', 'kilogramo',      'Kilogramo',      'kg',  true),
  ('10000000-0000-4000-8000-000000000004', 'litro',          'Litro',          'l',   true),
  ('10000000-0000-4000-8000-000000000005', 'pieza',          'Pieza',          'pza', false),
  ('10000000-0000-4000-8000-000000000006', 'caja',           'Caja',           'cja', false),
  ('10000000-0000-4000-8000-000000000007', 'paquete',        'Paquete',        'pq',  false),
  ('10000000-0000-4000-8000-000000000008', 'bolsa',          'Bolsa',          'bol', false),
  ('10000000-0000-4000-8000-000000000009', 'juego',          'Juego',          'jgo', false),
  ('10000000-0000-4000-8000-000000000010', 'par',            'Par',            'par', false),
  ('10000000-0000-4000-8000-000000000011', 'rollo',          'Rollo',          'rol', false),
  ('10000000-0000-4000-8000-000000000012', 'galon',          'Galón',          'gal', false),
  ('10000000-0000-4000-8000-000000000013', 'cubeta',         'Cubeta',         'cub', false),
  ('10000000-0000-4000-8000-000000000014', 'saco',           'Saco',           'sco', false)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (id, parent_id, nombre, slug, orden) VALUES
  ('20000000-0000-4000-8000-000000000001', NULL, 'Herramientas', 'herramientas', 1),
  ('20000000-0000-4000-8000-000000000002', NULL, 'Máquinas',     'maquinas',     2),
  ('20000000-0000-4000-8000-000000000003', NULL, 'Acero',        'acero',        3),
  ('20000000-0000-4000-8000-000000000004', NULL, 'Ferretería',   'ferreteria',   4),
  ('20000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000001', 'Herramientas manuales',  'herramientas-manuales',  1),
  ('20000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000001', 'Herramientas eléctricas', 'herramientas-electricas', 2),
  ('20000000-0000-4000-8000-000000000031', '20000000-0000-4000-8000-000000000003', 'Varillas', 'acero-varillas', 1),
  ('20000000-0000-4000-8000-000000000032', '20000000-0000-4000-8000-000000000003', 'Láminas',  'acero-laminas',  2),
  ('20000000-0000-4000-8000-000000000033', '20000000-0000-4000-8000-000000000003', 'Perfiles', 'acero-perfiles', 3)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Productos de ejemplo
-- ---------------------------------------------------------------------------
INSERT INTO public.products (id, category_id, unit_id, sku, slug, nombre, descripcion, precio, stock, envio_nacional, activo) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000005', 'HM-MAR-001', 'martillo-una-16oz', 'Martillo de uña 16 oz', 'Martillo de uña con mango de fibra de vidrio.', 149.00, 25, false, true),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000009', 'HM-LLV-014', 'juego-llaves-14pzas', 'Juego de llaves combinadas 14 pzas', 'Juego de llaves combinadas métricas cromadas.', 899.00, 12, false, true),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000005', 'HE-TAL-018', 'taladro-inalambrico-18v', 'Taladro inalámbrico 18V', 'Taladro/atornillador inalámbrico con 2 baterías.', 2499.00, 8, true, true),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'MA-ESM-001', 'esmeril-de-banco-8', 'Esmeril de banco 8"', 'Esmeril de banco de 8 pulgadas, 3/4 HP.', 3999.00, 4, false, true),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000001', 'AC-VAR-038', 'varilla-corrugada-3-8', 'Varilla corrugada 3/8"', 'Varilla corrugada grado 42, 3/8 pulgadas.', 89.50, 500, true, true),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000003', 'AC-VAR-012', 'varilla-corrugada-1-2', 'Varilla corrugada 1/2"', 'Varilla corrugada grado 42, 1/2 pulgada, venta por kg.', 24.00, 2000, true, true),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000002', 'AC-LAM-026', 'lamina-galvanizada-cal26', 'Lámina galvanizada cal. 26', 'Lámina de acero galvanizado, calibre 26, por m².', 320.00, 300, true, true),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000001', 'AC-PRF-IPR', 'perfil-estructural-ipr', 'Perfil estructural IPR', 'Perfil estructural IPR, venta por metro lineal.', 1200.00, 150, false, true),
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 'FE-TOR-001', 'tornillo-metal-caja', 'Tornillo para metal (caja 100)', 'Tornillos autorroscantes para metal, caja con 100 pzas.', 85.00, 60, true, true),
  ('30000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', 'FE-CLA-002', 'clavo-acero-2-kg', 'Clavo de acero 2" (kg)', 'Clavos de acero de 2 pulgadas, venta por kilogramo.', 45.00, 400, true, true),
  ('30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000010', 'FE-GUA-001', 'guantes-carnaza-par', 'Guantes de carnaza (par)', 'Guantes de carnaza reforzados, venta por par.', 89.00, 80, true, true),
  ('30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'FE-PIN-001', 'pintura-esmalte-lit', 'Pintura esmalte (litro)', 'Pintura esmalte anticorrosivo, venta por litro.', 220.00, 100, false, true)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Usuario admin (dev): admin@puenteacero.mx / Password123!
-- El trigger handle_new_user crea el profile; acá se asciende a rol admin.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'admin@puenteacero.mx',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin PuenteAcero"}',
  crypt('Password123!', gen_salt('bf', 10)),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, full_name, rol)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'admin@puenteacero.mx',
  'Admin PuenteAcero',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET rol = 'admin';
