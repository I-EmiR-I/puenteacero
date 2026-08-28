alter table "public"."orders" drop constraint "orders_provider_check";

CREATE INDEX products_activo_cat_idx ON public.products USING btree (activo, category_id);

CREATE INDEX products_nombre_idx ON public.products USING btree (nombre);

alter table "public"."orders" add constraint "orders_provider_check" CHECK ((provider = ANY (ARRAY['stripe'::text, 'mercadopago'::text, 'whatsapp'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_provider_check";


