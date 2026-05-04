import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Color, ProductGender, ProductCategory } from '@/types/database';

export interface ExpandedProduct extends Product {
  displayColorId: string | null;
  displayColorName: string | null;
  displayColorHex: string | null;
  displayImageUrl: string | null;
  secondaryImageUrl: string | null;
  availableColors: Array<{ id: string; name: string; hex_code: string; discount_percent?: number }>;
  colorSpecificDiscount?: number;
  colorStock?: number;
  displayPrice?: number;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  color_id: string | null;
  is_primary: boolean;
  display_order: number;
}
interface Variant {
  product_id: string;
  color_id: string | null;
  discount_percent: number;
  stock: number;
  price?: number | null;
}

export function useExpandedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, imagesRes, colorsRes, variantsRes, settingsRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('product_images').select('*').order('display_order'),
          supabase.from('colors').select('*'),
          supabase.from('product_variants').select('product_id, color_id, discount_percent, stock, price'),
          supabase.from('app_settings').select('hide_out_of_stock').eq('id', 'global').maybeSingle(),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (imagesRes.error) throw imagesRes.error;
        if (colorsRes.error) throw colorsRes.error;
        if (variantsRes.error) throw variantsRes.error;

        const typedProducts = (productsRes.data || []).map(product => ({
          ...product,
          category: product.category as ProductCategory,
          gender: product.gender as ProductGender,
        }));

        setProducts(typedProducts);
        setProductImages(imagesRes.data || []);
        setColors(colorsRes.data || []);
        setVariants(variantsRes.data || []);
        if (settingsRes.data) setHideOutOfStock(settingsRes.data.hide_out_of_stock);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to changes
    const channel = supabase
      .channel('expanded-products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const expandedProducts = useMemo(() => {
    const colorMap = new Map(colors.map(c => [c.id, c]));
    const result: ExpandedProduct[] = [];

    for (const product of products) {
      // Get all images for this product grouped by color
      const productImgs = productImages.filter(img => img.product_id === product.id);
      
      // Hide products without any image from the public catalog
      // (products without image_url AND without any gallery images are not shown to customers)
      if (!product.image_url && productImgs.length === 0) continue;

      // Get unique color IDs from variants (to ensure we only show sellable colors)
      const productVariants = variants.filter(v => v.product_id === product.id);
      
      // Calculate total stock for this product across all colors and sizes
      const totalProductStock = productVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      
      // If the product has NO stock at all in ANY variant, we hide it completely from the catalog
      if (totalProductStock <= 0) continue;

      const variantColorIds = [...new Set(productVariants.map(v => v.color_id).filter(Boolean) as string[])];
      
      // Build available colors array for the product with their discounts
      const availableColors = variantColorIds
        .map(cid => {
          const color = colorMap.get(cid);
          const maxColorDiscount = Math.max(...productVariants.filter(v => v.color_id === cid).map(v => v.discount_percent || 0), 0);
          return color ? { id: color.id, name: color.name, hex_code: color.hex_code, discount_percent: maxColorDiscount } : null;
        })
        .filter((c): c is any => !!c);

      if (variantColorIds.length === 0) {
        // Product has no color-specific variants - show once with main image
        // (Assuming if it has no variants, we check a global stock or just show it)
        result.push({
          ...product,
          displayColorId: null,
          displayColorName: null,
          displayColorHex: null,
          displayImageUrl: product.image_url,
          availableColors: [],
        });
      } else {
        // Create one expanded entry per color
        for (const colorId of variantColorIds) {
          const color = colorMap.get(colorId);
          // Find images for this color (by display_order)
          const colorImages = productImgs
            .filter(img => img.color_id === colorId)
            .sort((a, b) => a.display_order - b.display_order);
          
          const colorImage = colorImages[0];
          const secondaryImage = colorImages[1] || productImgs.find(img => !img.color_id && img.image_url !== colorImage?.image_url);

          // Get discount for this specific color
          const colorSpecificDiscount = Math.max(...productVariants.filter(v => v.color_id === colorId).map(v => v.discount_percent || 0), 0);

          // Check stock for this specific color
          const colorStock = productVariants.filter(v => v.color_id === colorId).reduce((sum, v) => sum + (v.stock || 0), 0);
          
          // If the user set "hideOutOfStock" in settings, we hide even the color variants with 0 stock
          if (hideOutOfStock && colorStock <= 0) continue;

          // Get price override for this specific color
          // We take the price of the first variant for this color (assuming all sizes have same price as per user request)
          const colorVariantWithPrice = productVariants.find(v => v.color_id === colorId && v.price);
          const displayPrice = colorVariantWithPrice ? colorVariantWithPrice.price : product.price;

          result.push({
            ...product,
            displayColorId: colorId,
            displayColorName: color?.name || null,
            displayColorHex: color?.hex_code || null,
            displayImageUrl: colorImage?.image_url || product.image_url,
            secondaryImageUrl: secondaryImage?.image_url || null,
            availableColors,
            colorSpecificDiscount: colorSpecificDiscount > 0 ? colorSpecificDiscount : undefined,
            // We'll use this in ProductCard to show "Sin Stock" badge
            colorStock: colorStock,
            displayPrice: displayPrice as number,
          });
        }
      }
    }

    return result;
  }, [products, productImages, colors, variants, hideOutOfStock]);

  return { expandedProducts, loading, error };
}