import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductImage, Color } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ColorGalleryManager } from './ColorGalleryManager';
import { Images } from 'lucide-react';

interface GalleryManagerProps {
  productId: string;
  productName: string;
  open: boolean;
  onClose: () => void;
}

export function GalleryManager({ productId, productName, open, onClose }: GalleryManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productColors, setProductColors] = useState<Color[]>([]);
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    
    // Get images with color info
    const { data: imagesData } = await supabase
      .from('product_images')
      .select(`*, color:colors(*)`)
      .eq('product_id', productId)
      .order('display_order');
    
    // Get product base price
    const { data: productData } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();
    
    if (productData) setBasePrice(productData.price);

    // Get variants with ALL info
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);
    
    const colorIds = [...new Set((variantsData || []).map(v => v.color_id).filter(Boolean) as string[])];
    
    let variantColors: Color[] = [];
    if (colorIds.length > 0) {
      const { data: colorsData } = await supabase
        .from('colors')
        .select('*')
        .in('id', colorIds)
        .order('name');
      variantColors = colorsData || [];
    }
    
    // Also get ALL colors for the dropdown to add new color sections
    const { data: allColorsData } = await supabase
      .from('colors')
      .select('*')
      .order('name');
    
    setImages((imagesData || []).map(img => ({
      ...img,
      color: img.color as Color | undefined,
    })));
    setVariants(variantsData || []);
    setProductColors(variantColors);
    setAllColors(allColorsData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open && productId) {
      fetchData();
    }
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Images className="h-5 w-5" />
            Gestión Integral: "{productName}"
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Gestioná fotos, talles y stock de cada color en un solo lugar.
          </p>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando...</div>
          ) : (
            <ColorGalleryManager
              productId={productId}
              images={images}
              variants={variants}
              productColors={productColors}
              allColors={allColors}
              basePrice={basePrice}
              onImagesChanged={() => fetchData(true)}
            />
          )}
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
