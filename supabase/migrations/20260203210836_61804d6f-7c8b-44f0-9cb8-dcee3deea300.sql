-- Add parent_id column for hierarchical categories
ALTER TABLE public.categories 
ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for faster parent lookups
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Create a recursive function to get all descendant category IDs
CREATE OR REPLACE FUNCTION public.get_category_descendants(category_id UUID)
RETURNS TABLE(id UUID)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH RECURSIVE category_tree AS (
    -- Base case: the category itself
    SELECT c.id
    FROM public.categories c
    WHERE c.id = category_id
    
    UNION ALL
    
    -- Recursive case: all children
    SELECT c.id
    FROM public.categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT ct.id FROM category_tree ct;
$$;