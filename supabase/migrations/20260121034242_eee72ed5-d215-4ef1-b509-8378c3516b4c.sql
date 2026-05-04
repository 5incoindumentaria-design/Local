-- Add gender enum type
CREATE TYPE public.product_gender AS ENUM ('masculino', 'femenino', 'unisex');

-- Add gender and is_new columns to products
ALTER TABLE public.products 
ADD COLUMN gender product_gender NOT NULL DEFAULT 'unisex',
ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT true;