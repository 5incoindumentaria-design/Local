 import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useProductDetails, useColors, useSizes } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Ruler, Palette, ShoppingCart, MessageCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '2613831779';

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const initialColorId = searchParams.get('color');
 
  const { product, variants, images, loading } = useProductDetails(id);
  const { colors } = useColors();
  const { sizes } = useSizes();
  const { getCategoryLabel } = useCategories();
  const { addItem } = useCart();
  const { toast } = useToast();

   const [selectedColor, setSelectedColor] = useState<string | null>(initialColorId);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Colors/sizes available for purchasing (variants)
  const variantColorIds = useMemo(
    () => [...new Set(variants.map((v) => v.color_id).filter(Boolean) as string[])],
    [variants]
  );

  // Filter sizes based on ALL variants available for this product
  const variantSizeIds = useMemo(() => {
    return [...new Set(variants.map((v) => v.size_id).filter(Boolean) as string[])];
  }, [variants]);

  // Colors available for display (variants + color-specific images)
  const displayColorIds = useMemo(() => {
    const imageColorIds = images.map((img) => img.color_id).filter(Boolean) as string[];
    return [...new Set([...variantColorIds, ...imageColorIds])];
  }, [images, variantColorIds]);

  // Reset size selection when color changes and size is no longer available FOR THAT COLOR (optional, but better to keep it if we want to force re-selection or just mark as invalid)
  // Actually, we'll keep it but modify it slightly to check stock
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = variants.find(v => v.color_id === selectedColor && v.size_id === selectedSize);
      if (!variant || variant.stock <= 0) {
        setSelectedSize(null);
      }
    }
  }, [selectedColor]);

  // Get all images for the selected color
  const currentImages = useMemo(() => {
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    
    let resultUrls: string[] = [];
    
    if (selectedColor) {
      // Show only images for this specific color
      resultUrls = sortedImages
        .filter(img => img.color_id === selectedColor)
        .map(img => img.image_url);
      
      // If the selected color has no images, show general images instead of nothing
      if (resultUrls.length === 0) {
        resultUrls = sortedImages
          .filter(img => !img.color_id)
          .map(img => img.image_url);
      }
    } else {
      // No color selected: show all images
      resultUrls = sortedImages.map(img => img.image_url);
    }
    
    // Always include the main product image as fallback/primary if no color-specific images are found
    if (resultUrls.length === 0 && product?.image_url) {
      resultUrls = [product.image_url];
    }
    
    // Deduplicate
    return [...new Set(resultUrls)];
  }, [selectedColor, images, product?.image_url]);

  // Reset image index when color changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const isSelectionComplete =
    (variantColorIds.length === 0 || !!selectedColor) &&
    (variantSizeIds.length === 0 || !!selectedSize);

  // Get stock for selected combination (only when selection is complete)
  const selectedVariant = isSelectionComplete
    ? variants.find(
        (v) =>
          (variantColorIds.length === 0 || v.color_id === selectedColor) &&
          (variantSizeIds.length === 0 || v.size_id === selectedSize)
      )
    : null;

  const selectedColorName = selectedColor ? colors.find(c => c.id === selectedColor)?.name : undefined;
  const selectedSizeName = selectedSize ? sizes.find(s => s.id === selectedSize)?.name : undefined;

  const handleAddToCart = () => {
    if (!product) return;
    
    // If there are variants but none selected, show a message
    if ((variantColorIds.length > 0 && !selectedColor) || (variantSizeIds.length > 0 && !selectedSize)) {
      toast({
        title: 'Seleccioná las opciones',
        description: 'Por favor elegí color y talle antes de agregar al carrito.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVariant && selectedVariant.stock <= 0) {
      toast({
        title: 'Sin stock',
        description: 'Lo sentimos, esta combinación no tiene stock disponible.',
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedVariant || null, selectedColorName, selectedSizeName);
    toast({
      title: '¡Agregado al carrito!',
      description: `${product.name} se agregó correctamente.`,
    });
  };

  const handleWhatsAppConsult = () => {
    if (!product) return;
    const currentPrice = selectedVariant?.price || product.price;
    let message = `¡Hola! Me interesa este producto:\n\n*${product.name}*\nPrecio: ${formatPrice(currentPrice)}`;
    if (selectedColorName) message += `\nColor: ${selectedColorName}`;
    if (selectedSizeName) message += `\nTalle: ${selectedSizeName}`;
    message += '\n\n¿Podrían darme más información?';
    
    window.open(`https://wa.me/54${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Auto-select first color if there are color variants
  useEffect(() => {
     // Only auto-select if no color was set from URL and displayColorIds is populated
     if (!selectedColor && displayColorIds.length > 0 && !initialColorId) {
      // Find first color that HAS stock
      const colorsWithStock = displayColorIds.filter(colorId => {
        const colorStock = variants.filter(v => v.color_id === colorId).reduce((sum, v) => sum + (v.stock || 0), 0);
        return colorStock > 0;
      });

      if (colorsWithStock.length > 0) {
        setSelectedColor(colorsWithStock[0]);
      } else {
        // If none have stock, just pick the first one with images or the first one available
        const colorsWithImages = displayColorIds.filter(colorId => 
          images.some(img => img.color_id === colorId)
        );
        setSelectedColor(colorsWithImages.length > 0 ? colorsWithImages[0] : displayColorIds[0]);
      }
    }
   }, [displayColorIds, images, variants, selectedColor, initialColorId]);
 
   // If initialColorId is provided and valid, ensure it's selected once data loads
   useEffect(() => {
     if (initialColorId && displayColorIds.includes(initialColorId) && !selectedColor) {
       setSelectedColor(initialColorId);
     }
   }, [initialColorId, displayColorIds, selectedColor]);

  if (loading) {
    return (
      <Layout>
        <div className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <Skeleton className="aspect-[3/4] rounded-sm" />
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <h1 className="font-serif text-2xl mb-4">Producto no encontrado</h1>
          <Button onClick={() => navigate('/catalogo')}>Volver al catálogo</Button>
        </div>
      </Layout>
    );
  }

  // Products without any image are only visible to cashiers, not to public users
  if (!product.image_url && images.length === 0) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <h1 className="font-serif text-2xl mb-4">Producto no disponible</h1>
          <p className="text-muted-foreground mb-4">Este producto aún no está disponible para su visualización.</p>
          <Button onClick={() => navigate('/catalogo')}>Volver al catálogo</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm uppercase tracking-wide">Volver</span>
          </button>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Images */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Main Image */}
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted relative">
                {currentImages.length > 0 ? (
                  <motion.img
                    key={currentImages[currentImageIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={currentImages[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {currentImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'flex-shrink-0 w-16 h-20 rounded-sm overflow-hidden border-2 transition-colors',
                        currentImageIndex === idx ? 'border-accent' : 'border-transparent'
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div>
                <span className="inline-block text-xs uppercase tracking-widest text-accent mb-2">
                  {getCategoryLabel(product.category_id)}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-medium">
                  {product.name}
                </h1>
              </div>

              {(() => {
                // Determine the price to show
                let currentBasePrice = product.price;
                let activeDiscount = product.discount_percent || 0;
                
                if (selectedVariant) {
                  // If a specific size is selected, use its price and discount
                  currentBasePrice = selectedVariant.price || product.price;
                  activeDiscount = Math.max(product.discount_percent || 0, selectedVariant.discount_percent || 0);
                } else if (selectedColor) {
                  // If only a color is selected, look for any price override in its variants
                  const colorVariants = variants.filter(v => v.color_id === selectedColor && (v.stock || 0) > 0);
                  if (colorVariants.length > 0) {
                    // Use the price of the first available variant for this color
                    currentBasePrice = colorVariants[0].price || product.price;
                    activeDiscount = Math.max(product.discount_percent || 0, colorVariants[0].discount_percent || 0);
                  }
                }
                
                const hasDiscount = activeDiscount > 0;
                const isDiscountValid = hasDiscount && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date());
                const discountedPrice = isDiscountValid 
                  ? currentBasePrice * (1 - activeDiscount / 100) 
                  : currentBasePrice;

                return (
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl md:text-3xl font-medium text-gradient-gold">
                      {formatPrice(discountedPrice)}
                    </p>
                    {isDiscountValid && (
                      <>
                        <p className="text-lg text-muted-foreground line-through">
                          {formatPrice(currentBasePrice)}
                        </p>
                        <Badge className="bg-destructive text-destructive-foreground">
                          -{activeDiscount}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                );
              })()}

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Colors */}
              {displayColorIds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium uppercase tracking-wide">Color</span>
                    {selectedColorName && (
                      <span className="text-sm text-muted-foreground">— {selectedColorName}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayColorIds.map((colorId) => {
                      const color = colors.find((c) => c.id === colorId);
                      if (!color) return null;
                      
                      const colorStock = variants
                        .filter(v => v.color_id === colorId)
                        .reduce((sum, v) => sum + (v.stock || 0), 0);
                      const hasNoStock = colorStock <= 0;

                      return (
                        <button
                          key={colorId}
                          onClick={() => !hasNoStock && setSelectedColor(colorId === selectedColor ? null : colorId)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 border-border/50 transition-all relative',
                            selectedColor === colorId ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110' : 'ring-0 hover:scale-105 hover:border-border',
                            hasNoStock ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                          )}
                          style={{ backgroundColor: color.hex_code }}
                          title={color.name + (hasNoStock ? ' (Sin stock)' : '')}
                        >
                          {hasNoStock && (
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                              <div className="w-full h-[2px] bg-destructive/60 -rotate-45" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {variantSizeIds.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium uppercase tracking-wide">Talle</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes
                      .filter((s) => variantSizeIds.includes(s.id))
                      .map((size) => {
                        const variant = selectedColor 
                          ? variants.find(v => v.color_id === selectedColor && v.size_id === size.id)
                          : null;
                        const hasStock = variant ? (variant.stock || 0) > 0 : false;
                        const isAvailable = !!variant && hasStock;

                        return (
                          <button
                            key={size.id}
                            disabled={selectedColor ? !isAvailable : false}
                            onClick={() => setSelectedSize(size.id === selectedSize ? null : size.id)}
                            className={cn(
                              'px-4 py-2 text-sm font-medium rounded-sm border transition-all relative overflow-hidden',
                              selectedSize === size.id
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'border-border hover:border-accent/50 hover:scale-105',
                              selectedColor && !isAvailable && 'opacity-40 bg-muted/30 cursor-not-allowed grayscale'
                            )}
                          >
                            {size.name}
                            {selectedColor && !isAvailable && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[120%] h-[1px] bg-muted-foreground/30 -rotate-12" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                  {selectedColor && !selectedSize && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Seleccioná un talle disponible
                    </p>
                  )}
                </div>
              )}

              {/* Stock info */}
              {selectedVariant && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className={cn(
                    selectedVariant.stock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-destructive font-medium'
                  )}>
                    {selectedVariant.stock > 0 
                      ? `${selectedVariant.stock} disponibles` 
                      : 'Sin stock'}
                  </span>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="pt-4 space-y-3">
                <Button 
                  size="lg" 
                  className="w-full gap-2 transition-transform hover:scale-[1.02]" 
                  onClick={handleAddToCart}
                  disabled={isSelectionComplete && selectedVariant?.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full gap-2 transition-transform hover:scale-[1.02]" 
                  onClick={handleWhatsAppConsult}
                >
                  <MessageCircle className="h-5 w-5" />
                  Consultar por WhatsApp
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Envíos a todo el país • Retirá en nuestro local
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
