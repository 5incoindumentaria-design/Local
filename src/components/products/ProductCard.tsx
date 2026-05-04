 import { Link, createSearchParams } from 'react-router-dom';
import { GENDER_LABELS } from '@/types/database';
import { ExpandedProduct } from '@/hooks/useExpandedProducts';
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
   product: ExpandedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { getCategoryLabel } = useCategories();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const productDiscount = product.discount_percent || 0;
  const colorDiscount = product.colorSpecificDiscount || 0;
  const activeDiscount = Math.max(productDiscount, colorDiscount);
  
  const hasDiscount = activeDiscount > 0;
  const isDiscountValid = hasDiscount && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date());
  const productPrice = product.displayPrice || product.price;
  const discountedPrice = isDiscountValid 
    ? productPrice * (1 - activeDiscount / 100) 
    : productPrice;

   // Build link with optional color query param
   const linkTo = product.displayColorId 
     ? `/producto/${product.id}?${createSearchParams({ color: product.displayColorId })}`
     : `/producto/${product.id}`;

   const [showSecondary, setShowSecondary] = useState(false);
   const [isHovered, setIsHovered] = useState(false);

   // Preload secondary image
   useEffect(() => {
     if (product.secondaryImageUrl) {
       const img = new Image();
       img.src = product.secondaryImageUrl;
     }
   }, [product.secondaryImageUrl]);
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={linkTo}
        className="group block hover-lift"
      >
        <div 
          className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
        >
          <AnimatePresence mode="wait">
            {isHovered && product.secondaryImageUrl ? (
              <motion.img
                key="secondary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={product.secondaryImageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <motion.img
                key="primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={product.displayImageUrl || ''}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            )}
          </AnimatePresence>

          {!product.displayImageUrl && !product.secondaryImageUrl && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm">Sin imagen</span>
            </div>
          )}

          {/* Dots indicator for multi-image */}
          {product.secondaryImageUrl && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", !isHovered ? "bg-white" : "bg-white/40")} />
              <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", isHovered ? "bg-white" : "bg-white/40")} />
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider bg-background/90 text-foreground rounded-sm">
              {getCategoryLabel(product.category_id)}
            </span>
            {(() => {
              const createdDate = new Date(product.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              const isNew = createdDate > weekAgo;
              return isNew ? (
                <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider bg-gold text-charcoal rounded-sm font-medium">
                  Nuevo
                </span>
              ) : null;
            })()}
            {isDiscountValid && (
              <Badge className="bg-destructive text-destructive-foreground text-xs font-bold">
                -{activeDiscount}%
              </Badge>
            )}
            {product.colorStock !== undefined && product.colorStock <= 0 && (
              <Badge variant="secondary" className="bg-gray-500/80 text-white border-none text-[10px] uppercase">
                Sin Stock
              </Badge>
            )}
           {/* Color indicator */}
           {product.displayColorName && (
             <span 
               className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider bg-background/90 text-foreground rounded-sm"
             >
               <span 
                 className="w-2.5 h-2.5 rounded-full border border-border/50" 
                 style={{ backgroundColor: product.displayColorHex || '#ccc' }}
               />
               {product.displayColorName}
             </span>
           )}
          </div>
          
          {/* Gender badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider bg-primary/80 text-primary-foreground rounded-sm">
              {GENDER_LABELS[product.gender]}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
         {/* Show available colors count if more than 1 */}
         {product.availableColors.length > 1 && (
           <div className="flex items-center gap-1">
             {product.availableColors.slice(0, 5).map(c => (
               <span 
                 key={c.id}
                 className="w-3 h-3 rounded-full border border-border/50"
                 style={{ backgroundColor: c.hex_code }}
                 title={c.name}
               />
             ))}
             {product.availableColors.length > 5 && (
               <span className="text-xs text-muted-foreground">+{product.availableColors.length - 5}</span>
             )}
           </div>
         )}
          {isDiscountValid ? (
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-semibold text-accent">
                {formatPrice(discountedPrice)}
              </p>
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(productPrice)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-medium">
              {formatPrice(productPrice)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
