import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Percent, Clock } from 'lucide-react';
 import { ExpandedProduct } from '@/hooks/useExpandedProducts';
import { motion } from 'framer-motion';

interface DiscountedProductsProps {
   products: ExpandedProduct[];
}

export function DiscountedProducts({ products }: DiscountedProductsProps) {
  const discountedProducts = useMemo(() => 
    products
      .filter(p => p.is_active !== false) // Only active products
      .filter(p => p.discount_percent && p.discount_percent > 0)
      .filter(p => {
        if (!p.discount_ends_at) return true;
        return new Date(p.discount_ends_at) > new Date();
      })
      .slice(0, 6),
    [products]
  );

  if (discountedProducts.length === 0) return null;

  const formatPrice = (p: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h restantes`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Percent className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Ofertas Especiales</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-medium">
            Descuentos Imperdibles
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Aprovechá estos precios especiales por tiempo limitado
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {discountedProducts.map(product => {
            const discountedPrice = calculateDiscountedPrice(product.price, product.discount_percent || 0);
            const timeRemaining = product.discount_ends_at ? getTimeRemaining(product.discount_ends_at) : null;
            
            return (
              <motion.div key={product.id} variants={itemVariants}>
                <Link 
                  to={`/producto/${product.id}`}
                  className="group relative bg-card rounded-sm overflow-hidden border hover:shadow-lg transition-all duration-300 block h-full"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1">
                      -{product.discount_percent}%
                    </Badge>
                  </div>

                  {/* Time remaining */}
                  {timeRemaining && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {timeRemaining}
                      </Badge>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                   {product.displayImageUrl || product.image_url ? (
                      <img 
                       src={product.displayImageUrl || product.image_url || ''} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-serif font-medium text-lg truncate group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-bold text-accent">
                        {formatPrice(discountedPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center text-sm text-muted-foreground">
                      <span>Ahorrás {formatPrice(product.price - discountedPrice)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link to="/catalogo">
            <Button variant="outline" size="lg" className="group">
              Ver todas las ofertas
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}