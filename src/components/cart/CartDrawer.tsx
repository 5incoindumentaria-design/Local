import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '2613831779';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  const handleCheckout = () => {
    if (items.length === 0) return;

    const itemsList = items
      .map((item) => {
        let line = `• ${item.product.name} x${item.quantity}`;
        if (item.colorName) line += ` - Color: ${item.colorName}`;
        if (item.sizeName) line += ` - Talle: ${item.sizeName}`;
        const itemPrice = item.variant?.price || item.product.price;
        line += ` - ${formatPrice(itemPrice * item.quantity)}`;
        return line;
      })
      .join('\n');

    const message = `¡Hola! Me gustaría realizar el siguiente pedido:\n\n${itemsList}\n\n*Total: ${formatPrice(totalPrice)}*`;
    
    window.open(`https://wa.me/54${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsOpen(false)}>
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant?.id || 'no-variant'}`}
                  className="flex gap-3 p-3 border rounded-sm"
                >
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Sin img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                    {(item.colorName || item.sizeName) && (
                      <p className="text-xs text-muted-foreground">
                        {item.colorName && `Color: ${item.colorName}`}
                        {item.colorName && item.sizeName && ' | '}
                        {item.sizeName && `Talle: ${item.sizeName}`}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-accent mt-1">
                      {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => removeItem(item.product.id, item.variant?.id || null)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-bold text-accent">{formatPrice(totalPrice)}</span>
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                <MessageCircle className="h-5 w-5" />
                Hacer pedido por WhatsApp
              </Button>

              <Button variant="ghost" className="w-full" onClick={clearCart}>
                Vaciar carrito
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
