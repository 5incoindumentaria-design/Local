import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useColors, useSizes } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Trash2, X, Search, Package, CheckCircle, CreditCard, Banknote, ArrowRightLeft, Lock, Download, Printer } from 'lucide-react';
import { ProductVariant, Product } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente';

interface Debtor {
  id: string;
  name: string;
  phone: string | null;
  total_debt: number;
}

interface CashierPanelProps {
  open: boolean;
  onClose: () => void;
}

interface VariantWithDetails extends ProductVariant {
  product_name?: string;
}

interface CartItem {
  id: string;
  productId?: string;
  productName: string;
  colorId?: string;
  colorName?: string;
  colorHex?: string;
  sizeId?: string;
  sizeName?: string;
  quantity: number;
  variantId?: string;
  currentStock?: number;
  price: number; // Added price directly to cart item for manual products and easier calculation
}

export function CashierPanel({ open, onClose }: CashierPanelProps) {
  const { toast } = useToast();
  const { user, activeProfile } = useAuth();
  const { logAction } = useAuditLog();
  const { products, refetch: refetchProducts } = useProducts();
  const { colors } = useColors();
  const { sizes } = useSizes();
  const { categories, getCategoryLabel } = useCategories();

  const fetchDebtors = async () => {
    const { data } = await supabase.from('debtors').select('*').order('name');
    setDebtors(data || []);
  };

  useEffect(() => {
    if (open) fetchDebtors();
  }, [open]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Product selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<VariantWithDetails[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  
  // Variant selection
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  
  // Debtors
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>('');
  const [showNewDebtorForm, setShowNewDebtorForm] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [addingDebtor, setAddingDebtor] = useState(false);
  
  // Manual Product Mode
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);

  // Ticket / Success State
  const [lastSale, setLastSale] = useState<{
    id: string;
    total: number;
    paymentMethod: string;
    items: CartItem[];
    date: Date;
  } | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Fetch variants when product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setProductVariants([]);
      setSelectedColorId('');
      setSelectedSizeId('');
      return;
    }

    const fetchVariants = async () => {
      setLoadingVariants(true);
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', selectedProduct.id);
      
      setProductVariants(data || []);
      setSelectedColorId('');
      setSelectedSizeId('');
      setLoadingVariants(false);
    };

    fetchVariants();
  }, [selectedProduct]);

  // Available colors for selected product
  const availableColors = useMemo(() => {
    const colorIds = productVariants
      .filter(v => v.color_id && v.stock > 0)
      .map(v => v.color_id!)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return colors.filter(c => colorIds.includes(c.id));
  }, [productVariants, colors]);

  // Available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!selectedColorId) return [];
    
    const sizeIds = productVariants
      .filter(v => v.color_id === selectedColorId && v.size_id && v.stock > 0)
      .map(v => v.size_id!)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return sizes.filter(s => sizeIds.includes(s.id));
  }, [productVariants, selectedColorId, sizes]);

  // Get current variant
  const currentVariant = useMemo(() => {
    if (!selectedColorId || !selectedSizeId) return null;
    return productVariants.find(
      v => v.color_id === selectedColorId && v.size_id === selectedSizeId
    );
  }, [productVariants, selectedColorId, selectedSizeId]);

  // Check stock in cart
  const getStockInCart = (variantId: string) => {
    return cart.filter(item => item.variantId === variantId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const addToCart = () => {
    if (!selectedProduct || !currentVariant || !selectedColorId || !selectedSizeId) return;

    const color = colors.find(c => c.id === selectedColorId);
    const size = sizes.find(s => s.id === selectedSizeId);
    
    const stockInCart = getStockInCart(currentVariant.id);
    const availableStock = currentVariant.stock - stockInCart;

    if (quantity > availableStock) {
      toast({
        variant: 'destructive',
        title: 'Stock insuficiente',
        description: `Solo hay ${availableStock} unidades disponibles`
      });
      return;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex(item => item.variantId === currentVariant.id);
    
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${Date.now()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        colorId: selectedColorId,
        colorName: color?.name || '',
        colorHex: color?.hex_code || '#ccc',
        sizeId: selectedSizeId,
        sizeName: size?.name || '',
        quantity,
        variantId: currentVariant.id,
        currentStock: currentVariant.stock,
        price: selectedProduct.price
      };
      setCart([...cart, newItem]);
    }

    toast({
      title: 'Agregado al carrito',
      description: `${quantity}x ${selectedProduct.name} - ${color?.name} - ${size?.name}`
    });

    // Reset selection
    setSelectedColorId('');
    setSelectedSizeId('');
    setQuantity(1);
  };

  const addManualToCart = () => {
    if (!manualName || !manualPrice) return;
    const price = parseFloat(manualPrice);
    if (isNaN(price) || price <= 0) return;

    const newItem: CartItem = {
      id: `manual-${Date.now()}`,
      productName: manualName,
      quantity: manualQuantity,
      price: price
    };

    setCart([...cart, newItem]);
    toast({
      title: 'Producto manual agregado',
      description: `${manualQuantity}x ${manualName} - ${formatPrice(price)}`
    });

    // Reset
    setManualName('');
    setManualPrice('');
    setManualQuantity(1);
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    if (item.variantId && item.currentStock !== undefined) {
      const otherItemsStock = cart
        .filter(i => i.variantId === item.variantId && i.id !== itemId)
        .reduce((sum, i) => sum + i.quantity, 0);

      const availableStock = item.currentStock - otherItemsStock;

      if (newQuantity > availableStock) {
        toast({
          variant: 'destructive',
          title: 'Stock insuficiente'
        });
        return;
      }
    }

    if (newQuantity <= 0) {
      setCart(cart.filter(i => i.id !== itemId));
    } else {
      setCart(cart.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const formatPrice = (p: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  const processSale = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      // Group by variant to handle multiple items of same variant
      const variantUpdates: Record<string, { id: string; quantity: number; currentStock: number }> = {};
      
      for (const item of cart) {
        if (variantUpdates[item.variantId]) {
          variantUpdates[item.variantId].quantity += item.quantity;
        } else {
          variantUpdates[item.variantId] = {
            id: item.variantId,
            quantity: item.quantity,
            currentStock: item.currentStock
          };
        }
      }

      // Update each variant stock (only for non-manual items)
      for (const update of Object.values(variantUpdates)) {
        if (!update.id) continue;
        
        const newStock = update.currentStock - update.quantity;
        const { error } = await supabase
          .from('product_variants')
          .update({ stock: newStock })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Create sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000',
          profile_id: activeProfile?.id || null,
          payment_method: paymentMethod,
          total: totalPrice,
          debtor_id: paymentMethod === 'cuenta_corriente' ? selectedDebtorId : null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => {
        return {
          sale_id: saleData.id,
          product_id: item.productId || null,
          variant_id: item.variantId || null,
          product_name: item.productName,
          color_name: item.colorName || null,
          size_name: item.sizeName || null,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      const paymentLabels = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia',
        cuenta_corriente: 'Cuenta Corriente'
      };

      if (paymentMethod === 'cuenta_corriente' && !selectedDebtorId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Seleccioná un deudor para Cuenta Corriente' });
        setProcessing(false);
        return;
      }

      toast({
        title: '¡Venta registrada!',
        description: `${formatPrice(totalPrice)} - ${paymentLabels[paymentMethod]}. Stock actualizado.`
      });

      // Log to audit history
      // NOTE: Any new cashier action MUST also call logAction() so owners can track it in ActivityHistory.
      await logAction(
        `Venta registrada por ${formatPrice(totalPrice)} — ${paymentLabels[paymentMethod]}`,
        'venta',
        {
          total: totalPrice,
          payment_method: paymentMethod,
          items: cart.map(i => `${i.quantity}x ${i.productName}${i.colorName ? ` (${i.colorName}/${i.sizeName})` : ''}`),
          item_count: totalItems,
        }
      );

      // Reset everything
      setLastSale({
        id: saleData.id,
        total: totalPrice,
        paymentMethod: paymentLabels[paymentMethod],
        items: [...cart],
        date: new Date()
      });
      
      setCart([]);
      setSelectedProduct(null);
      setPaymentMethod('efectivo');
      refetchProducts();
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error al procesar la venta'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (cart.length > 0 && !confirm('¿Cerrar? Se perderán los items del carrito.')) return;
    setCart([]);
    setSelectedProduct(null);
    setSearchTerm('');
    setSelectedCategory('all');
    onClose();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const downloadTicket = (saleData: {
    id: string;
    total: number;
    paymentMethod: string;
    items: CartItem[];
    date: Date;
  }) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 150] // Ticket format
    });

    // Header
    doc.setFontSize(14);
    doc.text('5inco Indumentaria', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Ticket: ${saleData.id.slice(0, 8)}`, 40, 15, { align: 'center' });
    doc.text(`Fecha: ${saleData.date.toLocaleString()}`, 40, 19, { align: 'center' });
    doc.text('------------------------------------------', 40, 23, { align: 'center' });

    // Table
    const tableData = saleData.items.map(item => [
      item.productName + (item.colorName ? ` (${item.colorName}/${item.sizeName})` : ''),
      item.quantity,
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Prod', 'Cant', 'Unit', 'Sub']],
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fontStyle: 'bold' },
      margin: { left: 5, right: 5 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;

    doc.text('------------------------------------------', 40, finalY + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatPrice(saleData.total)}`, 40, finalY + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pago: ${saleData.paymentMethod}`, 40, finalY + 15, { align: 'center' });
    doc.text('¡Gracias por su compra!', 40, finalY + 22, { align: 'center' });

    doc.save(`ticket-5inco-${saleData.id.slice(0, 8)}.pdf`);
    
    toast({
      title: 'Ticket descargado',
      description: 'El comprobante se guardó como PDF'
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <DialogTitle className="font-serif text-xl flex items-center gap-3">
            <Logo className="h-8 w-8 text-white" />
            Panel de Cajera - Registrar Venta
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Product Selection */}
          <div className="flex-1 flex flex-col border-r">
            {/* Filters */}
            <div className="p-4 border-b bg-muted/30 space-y-3">
              <div className="relative">
                <Logo className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={!isManualMode ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setIsManualMode(false)}
                  >
                    Buscar Producto
                  </Button>
                  <Button 
                    variant={isManualMode ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setIsManualMode(true)}
                  >
                    Venta Manual (Sin cargar)
                  </Button>
                </div>

                {!isManualMode ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Todos
                    </Badge>
                    {categories.map(cat => (
                      <Badge
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] uppercase font-bold text-primary">Modo Venta Manual</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nombre del producto</Label>
                        <Input 
                          placeholder="Ej: Remera genérica" 
                          value={manualName}
                          onChange={e => setManualName(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Precio de venta</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={manualPrice}
                          onChange={e => setManualPrice(e.target.value)}
                          className="h-8 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setManualQuantity(Math.max(1, manualQuantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{manualQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setManualQuantity(manualQuantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        onClick={addManualToCart} 
                        className="flex-1 h-8 text-xs"
                        disabled={!manualName || !manualPrice}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Manual
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            {/* Products Grid */}
            {!isManualMode && (
              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`text-left p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${
                        selectedProduct?.id === product.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="aspect-square rounded bg-muted mb-2 overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{getCategoryLabel(product.category_id)}</p>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      No se encontraron productos
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Variant Selection */}
            {selectedProduct && !isManualMode && (
              <div className="p-4 border-t bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {loadingVariants ? (
                  <p className="text-sm text-muted-foreground">Cargando variantes...</p>
                ) : availableColors.length === 0 ? (
                  <p className="text-sm text-destructive">Sin stock disponible</p>
                ) : (
                  <>
                    {/* Color Selection */}
                    <div>
                      <Label className="text-xs mb-2 block">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => {
                              setSelectedColorId(color.id);
                              setSelectedSizeId('');
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
                              selectedColorId === color.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <span className="text-sm">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Selection */}
                    {selectedColorId && availableSizes.length > 0 && (
                      <div>
                        <Label className="text-xs mb-2 block">Talle</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map(size => {
                            const variant = productVariants.find(
                              v => v.color_id === selectedColorId && v.size_id === size.id
                            );
                            const stockInCart = variant ? getStockInCart(variant.id) : 0;
                            const available = (variant?.stock || 0) - stockInCart;

                            return (
                              <button
                                key={size.id}
                                onClick={() => setSelectedSizeId(size.id)}
                                disabled={available <= 0}
                                className={`px-3 py-1.5 rounded border-2 transition-all ${
                                  selectedSizeId === size.id
                                    ? 'border-primary bg-primary/10'
                                    : available <= 0
                                    ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <span className="text-sm font-medium">{size.name}</span>
                                <span className="text-xs text-muted-foreground ml-1">({available})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity and Add */}
                    {currentVariant && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button onClick={addToCart} className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar al carrito
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Cart */}
          <div className="w-80 flex flex-col bg-muted/20">
            <div className="p-4 border-b">
              <h3 className="font-serif font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrito de Venta
                {totalItems > 0 && (
                  <Badge variant="secondary">{totalItems}</Badge>
                )}
              </h3>
            </div>

            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Carrito vacío</p>
                  <p className="text-xs mt-1">Seleccioná productos para agregar</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="bg-card rounded-lg p-3 border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            {item.colorHex ? (
                              <>
                                <span
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                                {item.colorName} • {item.sizeName}
                              </>
                            ) : (
                              <span className="italic text-primary">Producto Manual</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Cart Footer */}
            <div className="p-4 border-t space-y-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Método de pago</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="flex gap-2"
                >
                  <div className="flex-1">
                    <RadioGroupItem value="efectivo" id="efectivo" className="peer sr-only" />
                    <Label
                      htmlFor="efectivo"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Banknote className="h-4 w-4 mb-1" />
                      <span className="text-xs">Efectivo</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="tarjeta" id="tarjeta" className="peer sr-only" />
                    <Label
                      htmlFor="tarjeta"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 mb-1" />
                      <span className="text-xs">Tarjeta</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="transferencia" id="transferencia" className="peer sr-only" />
                    <Label
                      htmlFor="transferencia"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <ArrowRightLeft className="h-4 w-4 mb-1" />
                      <span className="text-xs">Transfer</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="cuenta_corriente" id="cuenta_corriente" className="peer sr-only" />
                    <Label
                      htmlFor="cuenta_corriente"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Lock className="h-4 w-4 mb-1" />
                      <span className="text-xs">Fiar</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Debtor Selection */}
              {paymentMethod === 'cuenta_corriente' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Deudor / Cuenta Corriente</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] uppercase font-bold text-accent"
                      onClick={() => setShowNewDebtorForm(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Agregar deudor
                    </Button>
                  </div>
                  <Select value={selectedDebtorId} onValueChange={setSelectedDebtorId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar deudor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {debtors.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.total_debt > 0 && `(Debe: ${formatPrice(d.total_debt)})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-accent">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <Button
                onClick={processSale}
                disabled={cart.length === 0 || processing}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {processing ? 'Procesando...' : 'Confirmar Venta'}
              </Button>

              {lastSale && (
                <Button
                  variant="secondary"
                  onClick={() => downloadTicket(lastSale)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Ticket #{lastSale.id.slice(0, 4)}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* New Debtor Modal */}
      <Dialog open={showNewDebtorForm} onOpenChange={setShowNewDebtorForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar nuevo deudor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input 
                value={newDebtorName} 
                onChange={e => setNewDebtorName(e.target.value)}
                placeholder="Ej: Juan Perez"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono / Celular</Label>
              <Input 
                value={newDebtorPhone} 
                onChange={e => setNewDebtorPhone(e.target.value)}
                placeholder="Ej: 11 1234 5678"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={async () => {
                if (!newDebtorName) return;
                setAddingDebtor(true);
                const { data, error } = await supabase
                  .from('debtors')
                  .insert({ name: newDebtorName, phone: newDebtorPhone })
                  .select()
                  .single();
                
                if (data) {
                  await fetchDebtors();
                  setSelectedDebtorId(data.id);
                  setShowNewDebtorForm(false);
                  setNewDebtorName('');
                  setNewDebtorPhone('');
                  toast({ title: 'Deudor agregado' });
                }
                setAddingDebtor(false);
              }}
              disabled={addingDebtor || !newDebtorName}
            >
              {addingDebtor ? 'Agregando...' : 'Guardar y Seleccionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
