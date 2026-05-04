-- SCRIPT DE CARGA DE VENTAS HISTORICAS

-- 1. Crear producto base para ventas externas
INSERT INTO public.products (id, name, price, category, gender, is_active, is_new) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Venta Manual (Excel)', 0, 'otros', 'unisex', false, false)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear variante base
INSERT INTO public.product_variants (id, product_id, stock) 
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 9999)
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar ventas e items
DO $$
DECLARE
  sale_id_var uuid;
BEGIN
  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 42000, 'transferencia', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Camisa', 1, 42000, 42000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 23000, 'efectivo', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sastrero', 1, 23000, 23000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 36000, 'efectivo', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Jeans', 1, 36000, 36000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 22000, 'tarjeta', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 22000, 22000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 11000, 'tarjeta', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 11000, 11000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 14500, 'tarjeta', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 14500, 14500, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 28000, 'transferencia', '2026-04-06 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 28000, 28000, '2026-04-06 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 24000, 'transferencia', '2026-04-07 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 remeras', 1, 24000, 24000, '2026-04-07 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 10000, 'transferencia', '2026-04-07 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 10000, 10000, '2026-04-07 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 10000, 'efectivo', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '3 boxer', 1, 10000, 10000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 24000, 'efectivo', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'poncho', 1, 24000, 24000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 27500, 'efectivo', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'campera', 1, 27500, 27500, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'transferencia', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 32000, 32000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 6000, 'tarjeta', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'cambio jogging', 1, 6000, 6000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 24500, 'transferencia', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 remeras', 1, 24500, 24500, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 15000, 'transferencia', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 15000, 15000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 28000, 'transferencia', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 28000, 28000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'transferencia', '2026-04-08 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-08 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 10000, 'efectivo', '2026-04-09 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 10000, 10000, '2026-04-09 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 10000, 'tarjeta', '2026-04-09 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 10000, 10000, '2026-04-09 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'efectivo', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 9000, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'falda', 1, 9000, 9000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 10500, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'falda', 1, 10500, 10500, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 4000, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'top', 1, 4000, 4000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 3300, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'collar', 1, 3300, 3300, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 8500, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'top', 1, 8500, 8500, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 28000, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'sastrero', 1, 28000, 28000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 4000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'collar', 1, 4000, 4000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'efectivo', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 8500, 'efectivo', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 8500, 8500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 6500, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'choker', 1, 6500, 6500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 24000, 'transferencia', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'pantalon', 1, 24000, 24000, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 9500, 'transferencia', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 remeras', 1, 9500, 9500, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 3000, 'transferencia', '2026-04-14 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remra', 1, 3000, 3000, '2026-04-14 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 15900, 'transferencia', '2026-04-14 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'body', 1, 15900, 15900, '2026-04-14 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 15000, 'efectivo', '2026-04-14 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 15000, 15000, '2026-04-14 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'transferencia', '2026-04-14 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-14 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 14000, 'transferencia', '2026-04-14 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'cinto', 1, 14000, 14000, '2026-04-14 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 36000, 'transferencia', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 36000, 36000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 57600, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 jeans', 1, 57600, 57600, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 15750, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 15750, 15750, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 2700, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 2700, 2700, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 2250, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'medias', 1, 2250, 2250, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 3600, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 bombachas', 1, 3600, 3600, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'tarjeta', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 26500, 'tarjeta', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'sueter', 1, 26500, 26500, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 29000, 'transferencia', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'panatalon', 1, 29000, 29000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'transferencia', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 18500, 'transferencia', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'sueter', 1, 18500, 18500, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 18500, 'transferencia', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 18500, 18500, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'campera', 1, 32000, 32000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 5000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Seña mariela', 1, 5000, 5000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 38000, 'efectivo', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans hombres', 1, 38000, 38000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 34200, 'efectivo', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans hombres', 1, 34200, 34200, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 28800, 'efectivo', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jogging hombre', 1, 28800, 28800, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 22500, 'efectivo', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'pantalon darlon', 1, 22500, 22500, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 9900, 'efectivo', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 9900, 9900, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'baggy', 1, 32000, 32000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 14000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'cinto', 1, 14000, 14000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 8000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 8000, 8000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 5000, 'tarjeta', '2026-04-16 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'seña mariela', 1, 5000, 5000, '2026-04-16 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 4000, 'efectivo', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 4000, 4000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 5000, 'tarjeta', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 5000, 5000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 16200, 'efectivo', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'camisa', 1, 16200, 16200, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 28800, 'efectivo', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 28800, 28800, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 9000, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'top', 1, 9000, 9000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 16500, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'falda', 1, 16500, 16500, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 15000, 'tarjeta', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 15000, 15000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 17500, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'short', 1, 17500, 17500, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 32000, 'tarjeta', '2026-04-20 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jeans', 1, 32000, 32000, '2026-04-20 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 30000, 'tarjeta', '2026-04-20 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', ' 2 remeras hombre', 1, 30000, 30000, '2026-04-20 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 13500, 'tarjeta', '2026-04-20 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remeron hombre', 1, 13500, 13500, '2026-04-20 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('da1a7dd7-f4d7-433f-93a7-347c7c9c246c', 11000, 'tarjeta', '2026-04-20 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'rockerita', 1, 11000, 11000, '2026-04-20 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 5000, 'efectivo', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 5000, 5000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 39000, 'transferencia', '2026-04-01 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Cartera', 1, 39000, 39000, '2026-04-01 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 28000, 'transferencia', '2026-05-01T14:42:03.006Z') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Buzo', 1, 28000, 28000, '2026-05-01T14:42:03.006Z');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 1000, 'tarjeta', '2026-05-01T14:42:03.006Z') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'mini paola', 1, 1000, 1000, '2026-05-01T14:42:03.006Z');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 3300, 'tarjeta', '2026-05-01T14:42:03.006Z') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'choquer', 1, 3300, 3300, '2026-05-01T14:42:03.006Z');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 18500, 'tarjeta', '2026-04-06 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo mujer', 1, 18500, 18500, '2026-04-06 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 7000, 'efectivo', '2026-04-07 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 calzoncillos', 1, 7000, 7000, '2026-04-07 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 37000, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'pantalon', 1, 37000, 37000, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 3000, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera frizada', 1, 3000, 3000, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('90033256-3a24-41ce-8206-3740f4bbbf7d', 13500, 'tarjeta', '2026-05-01T14:42:03.007Z') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'reme mujr', 1, 13500, 13500, '2026-05-01T14:42:03.007Z');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 70000, 'tarjeta', '2026-03-29 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Varios', 1, 70000, 70000, '2026-03-29 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 40000, 'efectivo', '2026-04-30 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Varios', 1, 40000, 40000, '2026-04-30 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 62000, 'tarjeta', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Varios', 1, 62000, 62000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24000, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 24000, 24000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 25000, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 remeras', 1, 25000, 25000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'transferencia', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 32000, 32000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 15000, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 15000, 15000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 16000, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Falda', 1, 16000, 16000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 20000, 'tarjeta', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sueters', 1, 20000, 20000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 21000, 'tarjeta', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 21000, 21000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 39000, 'tarjeta', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 39000, 39000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'transferencia', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 32000, 32000, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 3300, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Choquer', 1, 3300, 3300, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 9500, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Top', 1, 9500, 9500, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 10500, 'efectivo', '2026-04-02 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Falda', 1, 10500, 10500, '2026-04-02 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 11000, 'efectivo', '2026-04-04 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 11000, 11000, '2026-04-04 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'tarjeta', '2026-04-04 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 32000, 32000, '2026-04-04 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 17500, 'tarjeta', '2026-04-04 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Buzo', 1, 17500, 17500, '2026-04-04 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 41700, 'tarjeta', '2026-04-04 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Jeann y Remera', 1, 41700, 41700, '2026-04-04 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'transferencia', '2026-04-04 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 32000, 32000, '2026-04-04 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 14500, 'efectivo', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera y medias', 1, 14500, 14500, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 9000, 'efectivo', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Falda', 1, 9000, 9000, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'tarjeta', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Jean', 1, 32000, 32000, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 88000, 'tarjeta', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '3 joguing', 1, 88000, 88000, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 46500, 'tarjeta', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '3 remeras', 1, 46500, 46500, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 10000, 'tarjeta', '2026-04-05 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Cinturon', 1, 10000, 10000, '2026-04-05 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 5900, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'cinturon', 1, 5900, 5900, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 3300, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'choquer', 1, 3300, 3300, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jean', 1, 32000, 32000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 28500, 'transferencia', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 28500, 28500, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24000, 'tarjeta', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'joguin', 1, 24000, 24000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 6600, 'transferencia', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 choquer', 1, 6600, 6600, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 35000, 'transferencia', '2026-04-10 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'cartera', 1, 35000, 35000, '2026-04-10 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 35000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Campera', 1, 35000, 35000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 15500, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Calsa', 1, 15500, 15500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 15000, 'transferencia', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 15000, 15000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'efectivo', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Jean', 1, 32000, 32000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 35000, 'efectivo', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'joguins', 1, 35000, 35000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 4000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Choquer', 1, 4000, 4000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 20000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Cinto', 1, 20000, 20000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24500, 'efectivo', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 24500, 24500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 39000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'conjunto darlon', 1, 39000, 39000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'pantalo darlon', 1, 24000, 24000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 6500, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'polera', 1, 6500, 6500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sueters', 1, 24000, 24000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 11500, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 11500, 11500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 42000, 'transferencia', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'gamulan', 1, 42000, 42000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 11000, 'transferencia', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'polera spandex', 1, 11000, 11000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 7500, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'calzoncillos', 1, 7500, 7500, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 12000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 12000, 12000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 39000, 'tarjeta', '2026-04-11 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalonn c ch', 1, 39000, 39000, '2026-04-11 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'tarjeta', '2026-04-12 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jean', 1, 32000, 32000, '2026-04-12 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 32000, 'tarjeta', '2026-04-12 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jean', 1, 32000, 32000, '2026-04-12 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 7000, 'tarjeta', '2026-04-12 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 7000, 7000, '2026-04-12 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 11000, 'transferencia', '2026-04-12 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sueters', 1, 11000, 11000, '2026-04-12 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 6500, 'transferencia', '2026-04-12 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'polera', 1, 6500, 6500, '2026-04-12 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 18000, 'transferencia', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'short lentejuelas', 1, 18000, 18000, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 26100, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'CAMPERA', 1, 26100, 26100, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 29700, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'JOGUIN', 1, 29700, 29700, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 28800, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'JEAN', 1, 28800, 28800, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 7650, 'efectivo', '2026-05-01T14:42:03.013Z') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'REMERA', 1, 7650, 7650, '2026-05-01T14:42:03.013Z');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 10800, 'efectivo', '2026-04-13 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'REMERA', 1, 10800, 10800, '2026-04-13 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 20000, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'bouvheer', 1, 20000, 20000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 24000, 'efectivo', '2026-04-15 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'satrero', 1, 24000, 24000, '2026-04-15 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 29000, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'buzo', 1, 29000, 29000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 20500, 'tarjeta', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'pant sastrero', 1, 20500, 20500, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 13500, 'tarjeta', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'remera', 1, 13500, 13500, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 3000, 'efectivo', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'bombacha', 1, 3000, 3000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 19000, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', '2 remeras largas', 1, 19000, 19000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 15000, 'transferencia', '2026-04-17 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'reme darlon', 1, 15000, 15000, '2026-04-17 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 14850, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Chomba', 1, 14850, 14850, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 35100, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon CH', 1, 35100, 35100, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 9900, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Bodi', 1, 9900, 9900, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 26100, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Campera', 1, 26100, 26100, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 16700, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'jean', 1, 16700, 16700, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 23400, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sueters', 1, 23400, 23400, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 14000, 'tarjeta', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'REMERA', 1, 14000, 14000, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 8500, 'tarjeta', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Algo', 1, 8500, 8500, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 21000, 'tarjeta', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Sueters', 1, 21000, 21000, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 15000, 'tarjeta', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Calzas', 1, 15000, 15000, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 29000, 'tarjeta', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Joguins', 1, 29000, 29000, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 8500, 'efectivo', '2026-04-18 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'reme', 1, 8500, 8500, '2026-04-18 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 10800, 'efectivo', '2026-04-19 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 10800, 10800, '2026-04-19 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 10000, 'efectivo', '2026-04-19 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Remera', 1, 10000, 10000, '2026-04-19 00:00:00.000');

  INSERT INTO public.sales (user_id, total, payment_method, created_at) 
  VALUES ('dcaadd48-2549-46d8-b7e9-ec0852ad2026', 25000, 'efectivo', '2026-04-19 00:00:00.000') RETURNING id INTO sale_id_var;
  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) 
  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'Pantalon', 1, 25000, 25000, '2026-04-19 00:00:00.000');

END $$;