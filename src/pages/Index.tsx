import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { DiscountedProducts } from '@/components/home/DiscountedProducts';
 import { useExpandedProducts, ExpandedProduct } from '@/hooks/useExpandedProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

const Index = () => {
   const { expandedProducts, loading } = useExpandedProducts();
  
   // Filter products marked as "new" and dedupe by product id (show only one per product)
   const newProducts = useMemo(() => {
     const seen = new Set<string>();
     return expandedProducts
       .filter(p => {
         if (!p.is_new || seen.has(p.id)) return false;
         seen.add(p.id);
         return true;
       })
       .slice(0, 8);
   }, [expandedProducts]);
   
   // Get unique active products for DiscountedProducts component
   const uniqueProducts = useMemo(() => {
     const seen = new Set<string>();
     return expandedProducts.filter(p => {
       if (seen.has(p.id)) return false;
       seen.add(p.id);
       return true;
     });
   }, [expandedProducts]);

  return (
    <Layout>
      <AnnouncementBanner />
      <Hero />
       <DiscountedProducts products={uniqueProducts} />
      <FeaturedCategories />
      
      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium mb-3">
                Destacados
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-medium">
                Nuevos Ingresos
              </h2>
              <p className="text-muted-foreground mt-2">
                Las últimas prendas que llegaron a nuestra colección
              </p>
            </div>
            <Link to="/catalogo" className="mt-4 md:mt-0">
              <Button variant="link" className="text-accent p-0 group">
                Ver catálogo completo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {newProducts.length > 0 ? (
            <ProductGrid products={newProducts} loading={loading} />
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-sm">
              <p className="text-muted-foreground">
                Próximamente nuevos ingresos. ¡Seguinos en redes!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-primary-foreground/5"
          initial={{ scale: 1 }}
          whileInView={{ scale: 1.1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
            ¿Lista para renovar tu estilo?
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-xl mx-auto mb-8">
            Visitanos en nuestro local o explorá todo el catálogo online. Envíos a todo el país.
          </p>
          <Link to="/catalogo">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 transition-transform hover:scale-105"
            >
              Explorar Catálogo
            </Button>
          </Link>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
