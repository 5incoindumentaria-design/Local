import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { motion } from 'framer-motion';

const featuredImages: Record<string, string> = {
  'remeras': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
  'pantalones': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
  'vestidos': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
  'buzos': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop',
  'camperas': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
  'faldas': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop',
  'accesorios': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
};

const defaultImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop';

export function FeaturedCategories() {
  const { categories } = useCategories();
  
  // Show first 4 categories
  const displayCategories = categories.slice(0, 4);

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
    <section className="py-16 md:py-24 bg-gradient-cream overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium mb-3">
            Explorá
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium">
            Nuestras Categorías
          </h2>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={`/catalogo?categoria=${category.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm hover-lift block h-full"
              >
                <motion.img
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={featuredImages[category.slug] || defaultImage}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-serif text-lg md:text-xl text-cream font-medium">
                    {category.name}
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-cream/70 mt-1 inline-block group-hover:text-gold transition-colors">
                    Ver colección →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
