import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Color, Size, ProductVariant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useColors, useSizes, useProductVariants } from '@/hooks/useProducts';
import { Plus, Trash2, Package } from 'lucide-react';

interface VariantManagerProps {
  productId: string;
  productName: string;
  open: boolean;
  onClose: () => void;
}

export function VariantManager({ productId, productName, open, onClose }: VariantManagerProps) {
  const { toast } = useToast();
  const { colors } = useColors();
  const { sizes } = useSizes();
  const { variants, refetch } = useProductVariants(productId);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [stock, setStock] = useState('0');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddVariant = async () => {
    if (!selectedColor || !selectedSize) {
      toast({ variant: 'destructive', title: 'Seleccioná color y talle' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('product_variants').insert({
        product_id: productId,
        color_id: selectedColor,
        size_id: selectedSize,
        stock: parseInt(stock) || 0,
        price: price ? parseFloat(price) : null,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ variant: 'destructive', title: 'Esta combinación ya existe' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Variante agregada' });
        setSelectedColor('');
        setSelectedSize('');
        setStock('0');
        setPrice('');
        refetch();
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al agregar variante' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar stock' });
    } else {
      refetch();
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
      refetch();
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('¿Eliminar esta variante?')) return;

    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar' });
    } else {
      toast({ title: 'Variante eliminada' });
      refetch();
    }
  };

  const getColorName = (colorId: string | null) => colors.find(c => c.id === colorId)?.name || 'N/A';
  const getSizeName = (sizeId: string | null) => sizes.find(s => s.id === sizeId)?.name || 'N/A';
  const getColorHex = (colorId: string | null) => colors.find(c => c.id === colorId)?.hex_code || '#ccc';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock de "{productName}"
          </DialogTitle>
        </DialogHeader>

        {/* Add new variant */}
        <div className="bg-muted p-4 rounded-sm space-y-4">
          <h4 className="font-medium text-sm">Agregar Variante</h4>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger><SelectValue placeholder="Color" /></SelectTrigger>
                <SelectContent>
                  {colors.map(color => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.hex_code }} />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Talle</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger><SelectValue placeholder="Talle" /></SelectTrigger>
                <SelectContent>
                  {sizes.filter(s => isNaN(Number(s.name))).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Letras</SelectLabel>
                      {sizes.filter(s => isNaN(Number(s.name))).map(size => (
                        <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {sizes.filter(s => !isNaN(Number(s.name))).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Numéricos</SelectLabel>
                      {sizes.filter(s => !isNaN(Number(s.name))).sort((a,b) => Number(a.name) - Number(b.name)).map(size => (
                        <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Stock</Label>
              <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Precio (Opcional)</Label>
              <Input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="flex items-end col-span-4">
              <Button onClick={handleAddVariant} disabled={saving} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Agregar Combinación
              </Button>
            </div>
          </div>
        </div>

        {/* Existing variants */}
        <div className="space-y-2 mt-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Variantes existentes ({variants.length})
          </h4>
          
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay variantes. Agregá combinaciones de color y talle.
            </p>
          ) : (
            <div className="space-y-2">
              {variants.map(variant => (
                <div key={variant.id} className="flex items-center gap-3 p-3 bg-card border rounded-sm">
                  <span 
                    className="w-6 h-6 rounded-full border flex-shrink-0" 
                    style={{ backgroundColor: getColorHex(variant.color_id) }}
                    title={getColorName(variant.color_id)}
                  />
                  <span className="font-medium text-sm w-20">{getColorName(variant.color_id)}</span>
                  <span className="text-sm bg-secondary px-2 py-1 rounded">{getSizeName(variant.size_id)}</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Stock:</Label>
                      <Input
                        type="number"
                        min="0"
                        className="w-16 h-8 text-center"
                        value={variant.stock}
                        onChange={e => handleUpdateStock(variant.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Precio:</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 h-8 text-center"
                        value={variant.price || ''}
                        placeholder="Base"
                        onChange={e => handleUpdatePrice(variant.id, e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-8 w-8"
                    onClick={() => handleDeleteVariant(variant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
