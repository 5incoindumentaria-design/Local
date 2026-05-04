import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Color, Size, ProductVariant, ProductImage, ProductCategory, ProductGender } from '@/types/database';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedProducts = (data || []).map(product => ({
        ...product,
        category: product.category as ProductCategory,
        gender: product.gender as ProductGender,
      }));
      
      setProducts(typedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading, error, refetch: fetchProducts };
}

export function useColors() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = async () => {
    const { data } = await supabase.from('colors').select('*').order('name');
    setColors(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchColors();
  }, []);

  return { colors, loading, refetch: fetchColors };
}

export function useSizes() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSizes = async () => {
    const { data } = await supabase.from('sizes').select('*').order('display_order');
    setSizes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  return { sizes, loading, refetch: fetchSizes };
}

export function useProductVariants(productId: string | undefined) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVariants = async () => {
    if (!productId) return;
    
    const { data } = await supabase
      .from('product_variants')
      .select(`*, color:colors(*), size:sizes(*)`)
      .eq('product_id', productId);
    
    setVariants((data || []).map(v => ({
      ...v,
      color: v.color as Color | undefined,
      size: v.size as Size | undefined,
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  return { variants, loading, refetch: fetchVariants };
}

export function useProductDetails(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        const [productRes, variantsRes, imagesRes] = await Promise.all([
          supabase.from('products').select('*').eq('id', productId).maybeSingle(),
          supabase.from('product_variants').select(`
            *,
            color:colors(*),
            size:sizes(*)
          `).eq('product_id', productId),
          supabase.from('product_images').select(`
            *,
            color:colors(*)
          `).eq('product_id', productId).order('display_order'),
        ]);

        if (productRes.data) {
          setProduct({
            ...productRes.data,
            category: productRes.data.category as ProductCategory,
            gender: productRes.data.gender as ProductGender,
          });
        }
        
        setVariants((variantsRes.data || []).map(v => ({
          ...v,
          color: v.color as Color | undefined,
          size: v.size as Size | undefined,
        })));
        setImages((imagesRes.data || []).map(img => ({
          ...img,
          color: img.color as Color | undefined,
        })));
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  return { product, variants, images, loading };
}
