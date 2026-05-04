import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryFilter } from '@/components/products/CategoryFilter';
 import { useExpandedProducts } from '@/hooks/useExpandedProducts';
import { useCategories } from '@/hooks/useCategories';
 import { useSizes } from '@/hooks/useProducts';
import { ProductGender } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria');
  const initialGender = searchParams.get('genero') as ProductGender | null;
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedGender, setSelectedGender] = useState<ProductGender | null>(initialGender);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
   const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
   const [showFilters, setShowFilters] = useState(true);
  
   const { expandedProducts, loading } = useExpandedProducts();
  const { getDescendantIds } = useCategories();
   const { sizes } = useSizes();

  const filteredProducts = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get all category IDs to match (selected + all descendants)
    const categoryIdsToMatch = selectedCategory 
      ? new Set(getDescendantIds(selectedCategory))
      : null;

     return expandedProducts.filter((product) => {
      // Only show active products in the catalog
      if (!product.is_active) return false;
      
      // Match category OR any descendant category
      const matchesCategory = !categoryIdsToMatch || 
        (product.category_id && categoryIdsToMatch.has(product.category_id));
      
      // Unisex products appear in both masculine and feminine filters
      const matchesGender = !selectedGender || 
        product.gender === selectedGender || 
        product.gender === 'unisex';
      const isNew = new Date(product.created_at) > weekAgo;
      const matchesNew = !showNewOnly || isNew;
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
       
       // Size filter not implemented yet on expanded products level
       // Would need variant data - for now just pass through
       return matchesCategory && matchesGender && matchesNew && matchesSearch;
    });
   }, [expandedProducts, selectedCategory, selectedGender, showNewOnly, searchTerm, getDescendantIds]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filteredProducts, sortBy]);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    updateSearchParams(categoryId, selectedGender);
  };

  const handleGenderChange = (gender: ProductGender | null) => {
    setSelectedGender(gender);
    updateSearchParams(selectedCategory, gender);
  };

  const updateSearchParams = (categoryId: string | null, gender: ProductGender | null) => {
    const params: Record<string, string> = {};
    if (categoryId) params.categoria = categoryId;
    if (gender) params.genero = gender;
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="py-8 md:py-16 bg-background min-h-screen relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none -z-10" />

        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-block text-xs uppercase tracking-[0.4em] text-accent font-medium mb-4">
              Descubre nuestra
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight mb-4">
              Colección
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explora nuestras prendas exclusivas diseñadas para brindarte estilo y comodidad en cada momento.
            </p>
          </motion.div>

          {/* Controls Bar (Search, Toggle Filters, Sort) */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-card/40 p-3 rounded-2xl border border-border/50 backdrop-blur-md shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </button>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-border bg-background focus-visible:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                <span className="font-medium text-foreground">{sortedProducts.length}</span> resultados
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] rounded-full border-border bg-background focus:ring-accent">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest" className="rounded-lg">Más recientes</SelectItem>
                  <SelectItem value="price-asc" className="rounded-lg">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc" className="rounded-lg">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name-asc" className="rounded-lg">Nombre: A - Z</SelectItem>
                  <SelectItem value="name-desc" className="rounded-lg">Nombre: Z - A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Filters Area */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                  selectedGender={selectedGender}
                  onSelectGender={handleGenderChange}
                  showNewOnly={showNewOnly}
                  onToggleNew={setShowNewOnly}
                  selectedSizeId={selectedSizeId}
                  onSelectSize={setSelectedSizeId}
                  sizes={sizes}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <ProductGrid products={sortedProducts} loading={loading} />
        </div>
      </div>
    </Layout>
  );
}
