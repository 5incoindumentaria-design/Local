import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts, useColors } from '@/hooks/useProducts';
import { Search, Percent, Package, Palette, Check, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DiscountManagerProps {
  open: boolean;
  onClose: () => void;
}

interface SelectedProduct {
  id: string;
  name: string;
  applyToAll: boolean;
  selectedColors: string[];
}

export function DiscountManager({ open, onClose }: DiscountManagerProps) {
  const { products, loading: productsLoading } = useProducts();
  const { colors } = useColors();
  const { toast } = useToast();
  
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedProduct>>({});
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>({});
  const [applying, setApplying] = useState(false);

  // Fetch variants for selected products to know available colors
  useEffect(() => {
    const fetchVariants = async () => {
      const productIds = Object.keys(selectedItems);
      if (productIds.length === 0) return;

      const { data, error } = await supabase
        .from('product_variants')
        .select('product_id, color_id')
        .in('product_id', productIds);

      if (!error && data) {
        const grouped = data.reduce((acc: any, curr) => {
          if (!acc[curr.product_id]) acc[curr.product_id] = [];
          if (curr.color_id && !acc[curr.product_id].includes(curr.color_id)) {
            acc[curr.product_id].push(curr.color_id);
          }
          return acc;
        }, {});
        setProductVariants(grouped);
      }
    };

    fetchVariants();
  }, [Object.keys(selectedItems).length]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (product: any) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = {
          id: product.id,
          name: product.name,
          applyToAll: true,
          selectedColors: []
        };
      }
      return next;
    });
  };

  const toggleColor = (productId: string, colorId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        applyToAll: false,
        selectedColors: prev[productId].selectedColors.includes(colorId)
          ? prev[productId].selectedColors.filter(id => id !== colorId)
          : [...prev[productId].selectedColors, colorId]
      }
    }));
  };

  const setApplyToAll = (productId: string, value: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        applyToAll: value,
        selectedColors: value ? [] : prev[productId].selectedColors
      }
    }));
  };

  const handleApplyDiscounts = async () => {
    if (discountPercent <= 0 || discountPercent > 100) {
      toast({
        title: "Porcentaje inválido",
        description: "El descuento debe estar entre 1 y 100",
        variant: "destructive"
      });
      return;
    }

    const items = Object.values(selectedItems);
    if (items.length === 0) {
      toast({
        title: "Sin productos",
        description: "Seleccioná al menos un producto",
        variant: "destructive"
      });
      return;
    }

    setApplying(true);
    try {
      for (const item of items) {
        if (item.applyToAll) {
          // Update product global discount
          await supabase
            .from('products')
            .update({ discount_percent: discountPercent })
            .eq('id', item.id);
          
          // Also clear any color-specific discounts for this product to avoid confusion
          await supabase
            .from('product_variants')
            .update({ discount_percent: 0 })
            .eq('product_id', item.id);
        } else if (item.selectedColors.length > 0) {
          // Clear product global discount
          await supabase
            .from('products')
            .update({ discount_percent: 0 })
            .eq('id', item.id);

          // Update specific variants
          await supabase
            .from('product_variants')
            .update({ discount_percent: discountPercent })
            .eq('product_id', item.id)
            .in('color_id', item.selectedColors);
          
          // Clear other variants of the same product
          const otherColors = (productVariants[item.id] || []).filter(cid => !item.selectedColors.includes(cid));
          if (otherColors.length > 0) {
            await supabase
              .from('product_variants')
              .update({ discount_percent: 0 })
              .eq('product_id', item.id)
              .in('color_id', otherColors);
          }
        }
      }

      toast({
        title: "Descuentos aplicados",
        description: `Se aplicó un ${discountPercent}% de descuento a ${items.length} productos.`
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron aplicar los descuentos.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const removeAllDiscounts = async () => {
    const items = Object.values(selectedItems);
    if (items.length === 0) return;

    setApplying(true);
    try {
      const ids = items.map(i => i.id);
      
      // Clear product discounts
      await supabase
        .from('products')
        .update({ discount_percent: 0 })
        .in('id', ids);
      
      // Clear variant discounts
      await supabase
        .from('product_variants')
        .update({ discount_percent: 0 })
        .in('product_id', ids);

      toast({
        title: "Descuentos eliminados",
        description: `Se quitaron los descuentos de ${items.length} productos.`
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Percent className="h-6 w-6" /> Gestión de Descuentos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Product Selection */}
          <div className="w-full md:w-1/2 p-6 border-r flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Porcentaje de Descuento (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discount"
                  type="number"
                  placeholder="Ej: 20"
                  className="pl-10"
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Buscar Productos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre del producto..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-sm p-2">
              {productsLoading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-sm cursor-pointer transition-colors",
                        selectedItems[product.id] ? "bg-accent/10 border-accent/20 border" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">Sin img</div>
                          )}
                        </div>
                        <span className="text-sm font-medium line-clamp-1">{product.name}</span>
                      </div>
                      {selectedItems[product.id] && <Check className="h-4 w-4 text-accent" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel: Granular Control */}
          <div className="w-full md:w-1/2 p-6 bg-muted/30 flex flex-col gap-4">
            <h3 className="font-serif text-lg flex items-center gap-2 border-b pb-2">
              <Package className="h-5 w-5" /> Productos Seleccionados ({Object.keys(selectedItems).length})
            </h3>

            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {Object.values(selectedItems).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Seleccioná productos de la izquierda para configurar su descuento.</p>
                  </div>
                ) : (
                  Object.values(selectedItems).map(item => (
                    <div key={item.id} className="bg-card border rounded-sm p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleProduct(item)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`all-${item.id}`} 
                            checked={item.applyToAll} 
                            onCheckedChange={(checked) => setApplyToAll(item.id, !!checked)} 
                          />
                          <Label htmlFor={`all-${item.id}`} className="text-xs">Todo el producto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`spec-${item.id}`} 
                            checked={!item.applyToAll} 
                            onCheckedChange={(checked) => setApplyToAll(item.id, !checked)} 
                          />
                          <Label htmlFor={`spec-${item.id}`} className="text-xs">Colores específicos</Label>
                        </div>
                      </div>

                      {!item.applyToAll && productVariants[item.id] && (
                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Seleccionar Colores</p>
                          <div className="flex flex-wrap gap-2">
                            {productVariants[item.id].map(colorId => {
                              const color = colors.find(c => c.id === colorId);
                              if (!color) return null;
                              const isSelected = item.selectedColors.includes(colorId);
                              return (
                                <button
                                  key={colorId}
                                  onClick={() => toggleColor(item.id, colorId)}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1 rounded-full border text-xs transition-all",
                                    isSelected ? "bg-accent text-accent-foreground border-accent" : "bg-background hover:border-accent/50"
                                  )}
                                >
                                  <span 
                                    className="w-3 h-3 rounded-full border border-white/20" 
                                    style={{ backgroundColor: color.hex_code }}
                                  />
                                  {color.name}
                                </button>
                              );
                            })}
                            {productVariants[item.id].length === 0 && (
                              <p className="text-xs text-muted-foreground italic">Este producto no tiene colores cargados.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/50 gap-2 flex-col sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={applying}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={removeAllDiscounts} 
            disabled={applying || Object.keys(selectedItems).length === 0}
            className="sm:mr-auto"
          >
            Quitar Descuentos
          </Button>
          <Button onClick={handleApplyDiscounts} disabled={applying || Object.keys(selectedItems).length === 0}>
            {applying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aplicando...</> : 'Aplicar Descuentos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
