import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-fashion.jpg';
import { motion } from 'framer-motion';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="relative h-[85vh] md:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={heroImage}
          alt="5inco Indumentaria - Moda contemporánea"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div 
          className="max-w-xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={itemVariants} className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium">
            Nueva Colección
          </motion.span>
          
          <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-7xl font-medium leading-tight">
            Elegancia que{' '}
            <span className="text-gradient-gold">define</span>{' '}
            tu estilo
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Descubre prendas únicas diseñadas para quienes buscan destacar con autenticidad y sofisticación.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/catalogo">
              <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Ver Catálogo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/nosotros">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 px-8">
                Conocenos
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Scroll</span>
        <motion.div 
          className="w-px h-8 bg-gradient-to-b from-accent to-transparent"
          animate={{ height: [0, 32, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </motion.div>
    </section>
  );
}
