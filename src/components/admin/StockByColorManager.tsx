 import { useState, useEffect } from 'react';
 import { Color, Size } from '@/types/database';
 import { Label } from '@/components/ui/label';
 import { Input } from '@/components/ui/input';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 import { Package, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
 

export interface VariantStock {
  colorId: string;
  sizeId: string;
  stock: number;
  price?: number;
}

interface StockByColorManagerProps {
  colors: Color[];
  sizes: Size[];
  selectedColorIds: string[];
  variantStocks: VariantStock[];
  onVariantStocksChange: (stocks: VariantStock[]) => void;
  onSizesUpdated?: () => void;
}

export function StockByColorManager({
  colors,
  sizes,
  selectedColorIds,
  variantStocks,
  onVariantStocksChange,
  onSizesUpdated,
}: StockByColorManagerProps) {
  const { toast } = useToast();
  // Track which sizes are selected for each color
  const [sizesByColor, setSizesByColor] = useState<Record<string, string[]>>({});

  // Initialize sizesByColor from existing variantStocks
  useEffect(() => {
    const initial: Record<string, string[]> = {};
    for (const colorId of selectedColorIds) {
      const sizesForColor = variantStocks
        .filter(v => v.colorId === colorId)
        .map(v => v.sizeId);
      initial[colorId] = sizesForColor;
    }
    setSizesByColor(initial);
  }, [selectedColorIds]);

  const toggleSizeForColor = (colorId: string, sizeId: string) => {
    setSizesByColor(prev => {
      const current = prev[colorId] || [];
      const updated = current.includes(sizeId)
        ? current.filter(s => s !== sizeId)
        : [...current, sizeId];

      // Update variant stocks
      if (updated.includes(sizeId)) {
        // Add new variant if it doesn't exist
        const exists = variantStocks.some(v => v.colorId === colorId && v.sizeId === sizeId);
        if (!exists) {
          onVariantStocksChange([...variantStocks, { colorId, sizeId, stock: 1 }]);
        }
      } else {
        // Remove variant
        onVariantStocksChange(variantStocks.filter(v => !(v.colorId === colorId && v.sizeId === sizeId)));
      }

      return { ...prev, [colorId]: updated };
    });
  };

  const handleAddNumericSize = async (colorId: string, sizeNum: number) => {
    if (sizeNum < 1 || sizeNum > 70) {
      toast({ variant: 'destructive', title: 'Talle inválido', description: 'El talle debe ser entre 1 y 70' });
      return;
    }

    const sizeName = String(sizeNum);
    
    // Find existing
    const existingSize = sizes.find(s => s.name === sizeName);
    
    let sizeId: string;

    if (existingSize) {
      sizeId = existingSize.id;
    } else {
      // Create missing size in DB
      const maxOrder = sizes.length > 0 ? Math.max(...sizes.map(s => s.display_order)) : 0;
      const { data, error } = await supabase
        .from('sizes')
        .insert({ name: sizeName, display_order: maxOrder + 1 })
        .select()
        .single();
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error creando talle', description: error.message });
        return;
      }

      sizeId = data.id;
      if (onSizesUpdated) onSizesUpdated(); // Refetch sizes in parent
    }

    // Now add it to the selected sizes for this color
    setSizesByColor(prev => {
      const current = prev[colorId] || [];
      if (current.includes(sizeId)) return prev;

      const updated = [...current, sizeId];

      // Update variant stocks
      const exists = variantStocks.some(v => v.colorId === colorId && v.sizeId === sizeId);
      if (!exists) {
        onVariantStocksChange([...variantStocks, { colorId, sizeId, stock: 1 }]);
      }

      return { ...prev, [colorId]: updated };
    });
    
    toast({ title: 'Talle agregado', description: `Se agregó el talle ${sizeName}` });
  };

  const updateStock = (colorId: string, sizeId: string, stock: number) => {
    onVariantStocksChange(
      variantStocks.map(v =>
        v.colorId === colorId && v.sizeId === sizeId ? { ...v, stock } : v
      )
    );
  };

  const updatePrice = (colorId: string, sizeId: string, price: number | undefined) => {
    onVariantStocksChange(
      variantStocks.map(v =>
        v.colorId === colorId && v.sizeId === sizeId ? { ...v, price: price === 0 ? undefined : price } : v
      )
    );
  };

  const updateColorPrice = (colorId: string, price: number) => {
    onVariantStocksChange(
      variantStocks.map(v =>
        v.colorId === colorId ? { ...v, price: price === 0 ? undefined : price } : v
      )
    );
  };

  const getStock = (colorId: string, sizeId: string): number => {
    const variant = variantStocks.find(v => v.colorId === colorId && v.sizeId === sizeId);
    return variant?.stock ?? 0;
  };

  const getPrice = (colorId: string, sizeId: string): number | undefined => {
    const variant = variantStocks.find(v => v.colorId === colorId && v.sizeId === sizeId);
    return variant?.price;
  };

  const getColorPrice = (colorId: string): string => {
    const variants = variantStocks.filter(v => v.colorId === colorId);
    if (variants.length === 0) return '';
    const firstPrice = variants[0].price;
    const allSame = variants.every(v => v.price === firstPrice);
    return allSame && firstPrice ? String(firstPrice) : '';
  };

  const selectedColors = colors.filter(c => selectedColorIds.includes(c.id));

  if (selectedColors.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Seleccioná al menos un color primero
      </div>
    );
  }

  // Split sizes into alphabetic and numeric for better display
  const alphabeticSizes = sizes.filter(s => isNaN(Number(s.name)));
  const numericSizes = sizes.filter(s => !isNaN(Number(s.name))).sort((a, b) => Number(a.name) - Number(b.name));

  return (
    <div className="space-y-4">
      {selectedColors.map(color => {
        const selectedSizesForColor = sizesByColor[color.id] || [];
        
        return (
          <div key={color.id} className="border rounded-md p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border-2"
                  style={{ backgroundColor: color.hex_code }}
                />
                <Label className="font-medium text-base">{color.name}</Label>
              </div>
              
              <div className="flex items-center gap-2 bg-accent/5 p-2 rounded-md border border-accent/20">
                <Label className="text-xs font-semibold text-accent uppercase tracking-wider">Precio Color:</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={getColorPrice(color.id)}
                    onChange={(e) => updateColorPrice(color.id, parseInt(e.target.value) || 0)}
                    className="h-8 w-28 pl-5 text-sm font-medium border-accent/30 focus-visible:ring-accent"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground max-w-[100px] leading-tight">
                  Dejar en 0 para usar precio base
                </p>
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-4">
              {/* Alphabetic Sizes */}
              {alphabeticSizes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Talles de Letras:</Label>
                  <div className="flex flex-wrap gap-2">
                    {alphabeticSizes.map(size => {
                      const isSelected = selectedSizesForColor.includes(size.id);
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => toggleSizeForColor(color.id, size.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-sm border text-sm font-medium transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Numeric Sizes Picker */}
              <div className="space-y-2 bg-muted/30 p-3 rounded-md border">
                <Label className="text-sm text-muted-foreground">Talles Numéricos (1 al 70):</Label>
                
                {/* Active Numeric Sizes for this color */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {numericSizes.map(size => {
                    const isSelected = selectedSizesForColor.includes(size.id);
                    if (!isSelected) return null; // Only show selected numeric sizes to avoid clutter
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => toggleSizeForColor(color.id, size.id)}
                        className="px-3 py-1 text-xs font-medium rounded-sm border border-primary bg-primary text-primary-foreground"
                      >
                        {size.name} ✕
                      </button>
                    );
                  })}
                </div>

                {/* Single Size Adder */}
                <NumericSizeAdder onAdd={(num) => handleAddNumericSize(color.id, num)} />
              </div>
            </div>

            {/* Stock inputs */}
            {selectedSizesForColor.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" /> Stock por talle:
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedSizesForColor.map(sizeId => {
                    const size = sizes.find(s => s.id === sizeId);
                    if (!size) return null;
                    return (
                      <div key={sizeId} className="flex flex-col gap-1 bg-muted/50 rounded-sm p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">{size.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Stock/Precio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={getStock(color.id, sizeId)}
                            onChange={(e) => updateStock(color.id, sizeId, parseInt(e.target.value) || 0)}
                            className="h-8 w-full text-center text-xs"
                          />
                          <div className="relative w-full">
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Base"
                              value={getPrice(color.id, sizeId) || ''}
                              onChange={(e) => updatePrice(color.id, sizeId, parseInt(e.target.value) || 0)}
                              className="h-8 w-full pl-4 text-center text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSizesForColor.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Seleccioná al menos un talle para este color
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NumericSizeAdder({ onAdd }: { onAdd: (num: number) => void }) {
  const [sizeNum, setSizeNum] = useState<string>('');

  const handleAdd = () => {
    const n = parseInt(sizeNum);
    if (!isNaN(n)) {
      onAdd(n);
      setSizeNum('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Ej: 38"
        value={sizeNum}
        onChange={e => setSizeNum(e.target.value)}
        className="w-32 h-8 text-sm"
        min="1"
        max="70"
      />
      <Button type="button" size="sm" onClick={handleAdd} disabled={!sizeNum}>
        <Plus className="h-4 w-4 mr-1" /> Agregar Talle
      </Button>
    </div>
  );
}