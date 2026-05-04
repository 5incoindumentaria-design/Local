import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductImage, Color, ProductVariant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Star, X, ChevronLeft, ChevronRight, ImagePlus, Plus, Package, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSizes } from '@/hooks/useProducts';

interface ColorGalleryManagerProps {
  productId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  productColors: Color[]; // Colors that have variants
  allColors: Color[]; // All available colors
  basePrice: number;
  onImagesChanged: () => void;
}

export function ColorGalleryManager({ productId, images, variants, productColors, allColors, basePrice, onImagesChanged }: ColorGalleryManagerProps) {
  const { toast } = useToast();
  const { sizes } = useSizes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [additionalColors, setAdditionalColors] = useState<Color[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null); // colorId or 'general'

  // Combine product colors with additional colors added by user
  const displayColors = [...productColors];
  additionalColors.forEach(c => {
    if (!displayColors.find(dc => dc.id === c.id)) {
      displayColors.push(c);
    }
  });
  
  // Also include colors that already have images
  const colorsWithImages = images
    .filter(img => img.color_id)
    .map(img => img.color)
    .filter((c): c is Color => !!c);
  
  colorsWithImages.forEach(c => {
    if (!displayColors.find(dc => dc.id === c.id)) {
      displayColors.push(c);
    }
  });

  // Group images by color
  const generalImages = images.filter(img => !img.color_id);
  const imagesByColor: Record<string, ProductImage[]> = {};
  
  displayColors.forEach(color => {
    imagesByColor[color.id] = images.filter(img => img.color_id === color.id);
  });

  const uploadFiles = useCallback(async (files: FileList | File[], colorId: string | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Solo se permiten imágenes' });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Imagen muy grande (máx 5MB)' });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Get current max display order for this color
        const currentImages = colorId 
          ? imagesByColor[colorId] || []
          : generalImages;
        const maxOrder = currentImages.length > 0 
          ? Math.max(...currentImages.map(i => i.display_order)) 
          : -1;

        const { error: dbError } = await supabase.from('product_images').insert({
          product_id: productId,
          image_url: publicUrl,
          display_order: maxOrder + 1,
          color_id: colorId,
          is_primary: currentImages.length === 0, // First image for this color is primary
        });

        if (dbError) throw dbError;
        uploadedCount++;
      } catch (err) {
        console.error('Upload error:', err);
        toast({ variant: 'destructive', title: 'Error al subir imagen' });
      }
    }

    if (uploadedCount > 0) {
      toast({ title: `${uploadedCount} imagen(es) subida(s)` });
      onImagesChanged();
    }

    setUploading(false);
  }, [productId, imagesByColor, generalImages, onImagesChanged]);

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar stock' });
    } else {
      onImagesChanged();
    }
  };

  const handleUpdatePrice = async (variantId: string, newPrice: number | null) => {
    const { error } = await supabase
      .from('product_variants')
      .update({ price: newPrice })
      .eq('id', variantId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar precio' });
    } else {
      onImagesChanged();
    }
  };

  const handleAddVariant = async (colorId: string, sizeId: string) => {
    try {
      const { error } = await supabase.from('product_variants').insert({
        product_id: productId,
        color_id: colorId,
        size_id: sizeId,
        stock: 1,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ variant: 'destructive', title: 'Esta combinación ya existe' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Talle agregado' });
        onImagesChanged();
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al agregar talle' });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('¿Eliminar este talle?')) return;
    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar' });
    } else {
      onImagesChanged();
    }
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFiles(e.target.files, selectedColorId);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, colorId: string | null) => {
    e.preventDefault();
    setIsDragging(colorId || 'general');
  };

  const handleDragLeave = () => {
    setIsDragging(null);
  };

  const handleDrop = async (e: React.DragEvent, colorId: string | null) => {
    e.preventDefault();
    setIsDragging(null);
    if (e.dataTransfer.files) {
      await uploadFiles(e.dataTransfer.files, colorId);
    }
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) files.push(blob);
        }
      }

      if (files.length > 0) {
        // We use the last "selectedColorId" if available, otherwise general
        await uploadFiles(files, selectedColorId);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedColorId, uploadFiles]);

  const handleRemoveImage = async (image: ProductImage) => {
    try {
      // Delete from database
      await supabase.from('product_images').delete().eq('id', image.id);
      
      // Try to delete from storage
      const path = image.image_url.split('/product-images/')[1];
      if (path) {
        await supabase.storage.from('product-images').remove([path]);
      }
      
      toast({ title: 'Imagen eliminada' });
      onImagesChanged();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al eliminar' });
    }
  };

  const handleSetPrimary = async (image: ProductImage) => {
    try {
      // Unset all other primaries for this color
      const { error: resetError } = await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
        .eq('color_id', image.color_id);

      if (resetError) throw resetError;

      // Set this one as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', image.id);

      if (error) throw error;

      toast({ title: 'Imagen principal actualizada' });
      onImagesChanged();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al actualizar' });
    }
  };

  const handleReorder = async (image: ProductImage, direction: 'up' | 'down') => {
    const colorImages = image.color_id 
      ? (imagesByColor[image.color_id] || [])
      : generalImages;
    
    const sortedImages = [...colorImages].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedImages.findIndex(img => img.id === image.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sortedImages.length) return;

    const otherImage = sortedImages[newIndex];

    try {
      await Promise.all([
        supabase.from('product_images').update({ display_order: newIndex }).eq('id', image.id),
        supabase.from('product_images').update({ display_order: currentIndex }).eq('id', otherImage.id),
      ]);
      onImagesChanged();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al reordenar' });
    }
  };

  const renderImageGrid = (imageList: ProductImage[], colorId: string | null) => {
    const sortedImages = [...imageList].sort((a, b) => a.display_order - b.display_order);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {sortedImages.length} imagen(es)
          </span>
          <div className="flex items-center gap-2">
            {uploading && <span className="text-[10px] text-accent animate-pulse font-bold">SUBIENDO...</span>}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedColorId(colorId);
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              <ImagePlus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>

        {sortedImages.length === 0 ? (
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragging === (colorId || 'general') ? "border-accent bg-accent/5" : "border-muted-foreground/20 hover:border-accent/40"
            )}
            onDragOver={(e) => handleDragOver(e, colorId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, colorId)}
            onClick={() => {
              setSelectedColorId(colorId);
              fileInputRef.current?.click();
            }}
          >
            <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sin imágenes</p>
            <p className="text-xs">Deslizá, pegá o hacé clic para subir</p>
          </div>
        ) : (
          <div 
            className={cn(
              "grid grid-cols-3 gap-2 p-1 border-2 border-transparent rounded-md transition-colors",
              isDragging === (colorId || 'general') && "border-accent bg-accent/5"
            )}
            onDragOver={(e) => handleDragOver(e, colorId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, colorId)}
          >
            {sortedImages.map((img, idx) => (
              <div key={img.id} className="relative group aspect-square">
                <img
                  src={img.image_url}
                  alt=""
                  className={cn(
                    "w-full h-full object-cover rounded-md",
                    img.is_primary && "ring-2 ring-accent"
                  )}
                />
                
                {img.is_primary && (
                  <div className="absolute top-1 left-1 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Principal
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                  {!img.is_primary && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-white hover:text-accent hover:bg-white/20"
                      onClick={() => handleSetPrimary(img)}
                      title="Marcar como principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => handleReorder(img, 'up')}
                    disabled={idx === 0}
                    title="Mover antes"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => handleReorder(img, 'down')}
                    disabled={idx === sortedImages.length - 1}
                    title="Mover después"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:text-destructive hover:bg-white/20"
                    onClick={() => handleRemoveImage(img)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelect}
      />

      {/* General images (no color) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 border" />
          <h4 className="font-medium">Imágenes generales</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Estas imágenes se muestran cuando no hay un color seleccionado
        </p>
        {renderImageGrid(generalImages, null)}
      </div>

      {/* Images by color */}
      {displayColors.map(color => {
        const colorVariants = variants.filter(v => v.color_id === color.id);
        
        return (
          <div key={color.id} className="space-y-4 pt-6 border-t first:border-t-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 shadow-sm"
                  style={{ backgroundColor: color.hex_code }}
                />
                <h4 className="font-serif text-lg font-medium">{color.name}</h4>
              </div>
              
              {colorVariants.length > 0 && (
                <div className="bg-accent/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <Package className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {colorVariants.reduce((sum, v) => sum + (v.stock || 0), 0)} unidades en stock
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Management for this color */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Fotos del Color</span>
                </div>
                {renderImageGrid(imagesByColor[color.id] || [], color.id)}
              </div>

              {/* Stock Management for this color */}
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Talles y Stock</span>
                  </div>
                  
                  <Select onValueChange={(sizeId) => handleAddVariant(color.id, sizeId)}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Agregar talle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes
                        .filter(s => !colorVariants.find(v => v.size_id === s.id))
                        .sort((a,b) => {
                          const numA = Number(a.name);
                          const numB = Number(b.name);
                          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                          return a.name.localeCompare(b.name);
                        })
                        .map(size => (
                          <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {colorVariants.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-xs italic">No hay talles cargados para este color</p>
                    </div>
                  ) : (
                    colorVariants
                      .sort((a, b) => {
                        const sizeA = sizes.find(s => s.id === a.size_id)?.name || '';
                        const sizeB = sizes.find(s => s.id === b.size_id)?.name || '';
                        const numA = Number(sizeA);
                        const numB = Number(sizeB);
                        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                        return sizeA.localeCompare(sizeB);
                      })
                      .map(v => {
                        const sizeName = sizes.find(s => s.id === v.size_id)?.name || 'N/A';
                        return (
                          <div key={v.id} className="flex items-center gap-3 p-2 bg-background border rounded-md shadow-sm group">
                            <span className="font-bold text-sm w-10 text-center bg-muted rounded py-1">{sizeName}</span>
                            
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-muted-foreground uppercase font-bold">Stock</span>
                              <VariantInput
                                type="number"
                                initialValue={v.stock}
                                onSave={(val) => handleUpdateStock(v.id, parseInt(val) || 0)}
                                className="w-16 h-7 text-center text-xs"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-muted-foreground uppercase font-bold">Precio (Op)</span>
                              <div className="relative">
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>
                                <VariantInput
                                  type="number"
                                  initialValue={v.price || ''}
                                  placeholder={basePrice ? basePrice.toString() : "Base"}
                                  onSave={(val) => handleUpdatePrice(v.id, val ? parseFloat(val) : null)}
                                  className="w-20 h-7 pl-4 text-xs"
                                />
                              </div>
                            </div>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteVariant(v.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add new color section */}
      <div className="pt-4 border-t space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium text-muted-foreground">Agregar fotos para otro color</h4>
        </div>
        <div className="flex gap-2">
          <Select
            onValueChange={(colorId) => {
              const color = allColors.find(c => c.id === colorId);
              if (color && !displayColors.find(dc => dc.id === color.id)) {
                setAdditionalColors(prev => [...prev, color]);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar color..." />
            </SelectTrigger>
            <SelectContent>
              {allColors
                .filter(c => !displayColors.find(dc => dc.id === c.id))
                .map(color => (
                  <SelectItem key={color.id} value={color.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        {allColors.filter(c => !displayColors.find(dc => dc.id === c.id)).length === 0 && (
          <p className="text-xs text-muted-foreground">
            Todos los colores ya están agregados
          </p>
        )}
      </div>
    </div>
  );
}

function VariantInput({ initialValue, onSave, className, type, placeholder }: any) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      type={type}
      className={className}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== initialValue) {
          onSave(value);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}