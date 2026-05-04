import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/types/database';

interface GalleryUploadProps {
  productId: string;
  images: ProductImage[];
  onImagesChanged: () => void;
}

export function GalleryUpload({ productId, images, onImagesChanged }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: `${file.name} no es una imagen válida` });
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: `${file.name} es mayor a 5MB` });
        continue;
      }

      uploadPromises.push(uploadImage(file, images.length + i));
    }

    await Promise.all(uploadPromises);
    setUploading(false);
    onImagesChanged();

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File, order: number) => {
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Save to product_images table
      const { error: dbError } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        display_order: order,
      });

      if (dbError) throw dbError;

    } catch (err) {
      console.error('Upload error:', err);
      toast({ variant: 'destructive', title: 'Error al subir imagen' });
    }
  };

  const handleRemoveImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Try to delete from storage (extract path from URL)
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts[1]) {
        await supabase.storage.from('product-images').remove([urlParts[1]]);
      }

      toast({ title: 'Imagen eliminada' });
      onImagesChanged();
    } catch (err) {
      console.error('Delete error:', err);
      toast({ variant: 'destructive', title: 'Error al eliminar imagen' });
    }
  };

  const handleReorder = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const currentImage = images[currentIndex];
    const swapImage = images[newIndex];

    try {
      await Promise.all([
        supabase.from('product_images').update({ display_order: newIndex }).eq('id', currentImage.id),
        supabase.from('product_images').update({ display_order: currentIndex }).eq('id', swapImage.id),
      ]);
      onImagesChanged();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al reordenar' });
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div key={img.id} className="relative group aspect-square">
            <img
              src={img.image_url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover rounded-sm border"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors rounded-sm flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleReorder(img.id, 'up')}
                  className="p-1.5 bg-background rounded-sm text-xs hover:bg-accent"
                  title="Mover antes"
                >
                  ←
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleReorder(img.id, 'down')}
                  className="p-1.5 bg-background rounded-sm text-xs hover:bg-accent"
                  title="Mover después"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(img.id, img.image_url)}
                className="p-1.5 bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90"
                title="Eliminar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Order badge */}
            <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/90 rounded text-muted-foreground">
              {index + 1}
            </span>
          </div>
        ))}

        {/* Add more button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "aspect-square border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-1 transition-colors",
            "text-muted-foreground hover:text-foreground hover:border-accent",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Agregar</span>
            </>
          )}
        </button>
      </div>

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No hay imágenes en la galería. Agregá fotos para mostrar diferentes vistas del producto.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Subiendo...' : 'Subir imágenes'}
      </Button>
    </div>
  );
}
