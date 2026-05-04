
-- Create categories table for dynamic category management
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  gender public.product_gender NOT NULL DEFAULT 'unisex',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" 
ON public.categories FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" 
ON public.categories FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert existing categories
INSERT INTO public.categories (name, slug, gender, display_order) VALUES
('Remeras', 'remeras', 'unisex', 1),
('Pantalones', 'pantalones', 'unisex', 2),
('Buzos', 'buzos', 'unisex', 3),
('Camperas', 'camperas', 'unisex', 4),
('Vestidos', 'vestidos', 'femenino', 5),
('Faldas', 'faldas', 'femenino', 6),
('Accesorios', 'accesorios', 'unisex', 7),
('Otros', 'otros', 'unisex', 8);

-- Add category_id to products table (nullable for now, will migrate data)
ALTER TABLE public.products 
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Migrate existing category data
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE c.slug = p.category::text;

-- Create index for performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_categories_gender ON public.categories(gender);
CREATE INDEX idx_categories_slug ON public.categories(slug);
