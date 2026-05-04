-- Add is_active column to products for soft delete
ALTER TABLE public.products 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for filtering active products
CREATE INDEX idx_products_is_active ON public.products(is_active);

-- Update existing products to be active
UPDATE public.products SET is_active = true WHERE is_active IS NULL;