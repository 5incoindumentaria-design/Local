import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LowStockItem {
  variantId: string;
  productId: string;
  productName: string;
  colorName: string | null;
  sizeName: string | null;
  stock: number;
}

const LOW_STOCK_THRESHOLD = 5;

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      
      // Get settings first
      const { data: settings } = await supabase.from('app_settings').select('low_stock_threshold').eq('id', 'global').maybeSingle();
      const threshold = settings?.low_stock_threshold ?? 5;

      // Fetch variants with low stock
      const { data: variants } = await supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          color_id,
          size_id,
          stock
        `)
        .lte('stock', threshold)
        .order('stock', { ascending: true });

      if (!variants || variants.length === 0) {
        setLowStockItems([]);
        setLoading(false);
        return;
      }

      // Fetch related data
      const productIds = [...new Set(variants.map(v => v.product_id))];
      const colorIds = [...new Set(variants.filter(v => v.color_id).map(v => v.color_id!))];
      const sizeIds = [...new Set(variants.filter(v => v.size_id).map(v => v.size_id!))];

      const [productsRes, colorsRes, sizesRes] = await Promise.all([
        supabase.from('products').select('id, name').in('id', productIds),
        colorIds.length > 0 ? supabase.from('colors').select('id, name').in('id', colorIds) : { data: [] },
        sizeIds.length > 0 ? supabase.from('sizes').select('id, name').in('id', sizeIds) : { data: [] }
      ]);

      const products = productsRes.data || [];
      const colors = colorsRes.data || [];
      const sizes = sizesRes.data || [];

      const items: LowStockItem[] = variants.map(v => ({
        variantId: v.id,
        productId: v.product_id,
        productName: products.find(p => p.id === v.product_id)?.name || 'Producto',
        colorName: v.color_id ? colors.find(c => c.id === v.color_id)?.name || null : null,
        sizeName: v.size_id ? sizes.find(s => s.id === v.size_id)?.name || null : null,
        stock: v.stock
      }));

      setLowStockItems(items);
      setLoading(false);
    };

    fetchLowStock();
  }, []);

  if (loading || lowStockItems.length === 0) {
    return null;
  }

  const criticalItems = lowStockItems.filter(item => item.stock === 0);
  const warningItems = lowStockItems.filter(item => item.stock > 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Stock Bajo
            <Badge variant="secondary" className="ml-2">
              {lowStockItems.length} productos
            </Badge>
            {criticalItems.length > 0 && (
              <Badge variant="destructive">
                {criticalItems.length} sin stock
              </Badge>
            )}
          </span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </AlertTitle>
        <AlertDescription className="mt-1">
          Hay productos con stock bajo (menos de {LOW_STOCK_THRESHOLD} unidades).
        </AlertDescription>
        
        <CollapsibleContent className="mt-4">
          <div className="bg-background/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {lowStockItems.map(item => (
              <div 
                key={item.variantId}
                className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  <span className="font-medium">{item.productName}</span>
                  {item.colorName && (
                    <span className="text-muted-foreground">• {item.colorName}</span>
                  )}
                  {item.sizeName && (
                    <span className="text-muted-foreground">• {item.sizeName}</span>
                  )}
                </div>
                <Badge variant={item.stock === 0 ? 'destructive' : 'secondary'}>
                  {item.stock === 0 ? 'Sin stock' : `${item.stock} uds`}
                </Badge>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}
