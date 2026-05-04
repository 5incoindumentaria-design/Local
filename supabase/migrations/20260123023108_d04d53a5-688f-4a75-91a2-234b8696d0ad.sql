-- Add color_id to product_images to link images to specific color variants
ALTER TABLE public.product_images 
ADD COLUMN color_id uuid REFERENCES public.colors(id) ON DELETE SET NULL;

-- Add index for faster queries by color
CREATE INDEX idx_product_images_color ON public.product_images(color_id);

-- Add is_primary field to identify the main image for a color
ALTER TABLE public.product_images 
ADD COLUMN is_primary boolean NOT NULL DEFAULT false;

-- Comment explaining the structure
COMMENT ON COLUMN public.product_images.color_id IS 'Optional: links image to a specific color. NULL means it applies to all colors or is a general product image.';
COMMENT ON COLUMN public.product_images.is_primary IS 'If true, this is the main/thumbnail image for this color variant';