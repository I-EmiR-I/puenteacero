set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.aplicar_cupon(p_codigo text, p_subtotal numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

GRANT EXECUTE ON FUNCTION public.aplicar_cupon(text, numeric) TO authenticated;


