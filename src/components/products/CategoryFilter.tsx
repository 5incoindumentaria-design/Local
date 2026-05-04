import { GENDER_LABELS, ProductGender } from '@/types/database';
import { cn } from '@/lib/utils';
import { useCategories, Category, CategoryNode } from '@/hooks/useCategories';
 import { ChevronRight, Ruler, Sparkles } from 'lucide-react';
 import { motion, AnimatePresence } from 'framer-motion';
 
 interface SizeOption {
   id: string;
   name: string;
   display_order: number;
 }

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  selectedGender: ProductGender | null;
  onSelectGender: (gender: ProductGender | null) => void;
  showNewOnly: boolean;
  onToggleNew: (value: boolean) => void;
   selectedSizeId?: string | null;
   onSelectSize?: (sizeId: string | null) => void;
   sizes?: SizeOption[];
}

const genders: (ProductGender | null)[] = [null, 'femenino', 'masculino'];

export function CategoryFilter({ 
  selectedCategory, 
  onSelectCategory, 
  selectedGender, 
  onSelectGender,
  showNewOnly,
  onToggleNew,
   selectedSizeId,
   onSelectSize,
   sizes = [],
}: CategoryFilterProps) {
  const { categories, getRootCategories, getChildCategories, getBreadcrumb } = useCategories();

  // Get root categories filtered by gender
  const rootCategories = getRootCategories().filter(c => 
    !selectedGender || c.gender === selectedGender || c.gender === 'unisex'
  );

  // Build current navigation path
  const breadcrumb = selectedCategory ? getBreadcrumb(selectedCategory) : [];
  
  // Get subcategories of the currently selected category
  const currentSubcategories = selectedCategory 
    ? getChildCategories(selectedCategory).filter(c => 
        !selectedGender || c.gender === selectedGender || c.gender === 'unisex'
      )
    : [];

  // Get parent category if viewing a subcategory
  const currentCategory = selectedCategory 
    ? categories.find(c => c.id === selectedCategory) 
    : null;

  return (
    <div className="space-y-8 bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl shadow-sm">
      
      {/* Top filters: Gender & New Arrivals */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border/50 pb-6">
        {/* Gender Filter */}
        <div className="flex bg-muted/50 p-1 rounded-full shadow-inner">
          {genders.map((gender) => (
            <button
              key={gender ?? 'all-gender'}
              onClick={() => {
                onSelectGender(gender);
                onSelectCategory(null); // Reset category when changing gender
              }}
              className={cn(
                'relative px-6 py-2 text-sm font-medium rounded-full transition-colors z-10',
                selectedGender === gender
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {selectedGender === gender && (
                <motion.div
                  layoutId="gender-active"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {gender ? GENDER_LABELS[gender] : 'Todos'}
            </button>
          ))}
        </div>

        {/* New Arrivals Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleNew(!showNewOnly)}
          className={cn(
            'px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm border',
            showNewOnly
              ? 'bg-gradient-to-r from-gold/20 to-accent/20 border-gold/50 text-foreground'
              : 'bg-background border-border hover:border-accent/50 text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className={cn("h-4 w-4", showNewOnly ? "text-gold" : "text-muted-foreground")} />
          Nuevos Ingresos
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <AnimatePresence>
          {breadcrumb.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg"
            >
              <button
                onClick={() => onSelectCategory(null)}
                className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
              >
                Categorías
              </button>
              {breadcrumb.map((cat, index) => (
                <div key={cat.id} className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className={cn(
                      'transition-colors px-2 py-1 rounded-md',
                      index === breadcrumb.length - 1
                        ? 'text-primary font-medium bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {cat.name}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Back button */}
          <AnimatePresence mode="popLayout">
            {currentCategory?.parent_id && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSelectCategory(currentCategory.parent_id)}
                className="px-4 py-2 text-sm font-medium rounded-full border border-border hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
              >
                ← Volver
              </motion.button>
            )}
          </AnimatePresence>

          {/* Categories */}
          <AnimatePresence mode="popLayout">
            {(selectedCategory ? currentSubcategories : rootCategories).map((category) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  'px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border flex items-center gap-2 shadow-sm',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-accent/50 text-foreground hover:shadow-md'
                )}
              >
                {category.name}
                {getChildCategories(category.id).length > 0 && (
                  <ChevronRight className="h-3 w-3 opacity-50" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
          
          {selectedCategory && currentSubcategories.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground px-4 py-2"
            >
              No hay subcategorías.
            </motion.div>
          )}
        </div>
      </div>
 
      {/* Size Filter */}
      {sizes.length > 0 && onSelectSize && (
        <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full w-fit">
            <Ruler className="h-4 w-4" />
            <span className="font-medium">Talles</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => onSelectSize(null)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border',
                !selectedSizeId
                  ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                  : 'bg-background border-border hover:border-accent/50 text-muted-foreground hover:text-foreground'
              )}
            >
              Todos
            </button>

            {/* Alphabetic Sizes */}
            {sizes.filter(s => isNaN(Number(s.name))).map((size) => (
              <button
                key={size.id}
                onClick={() => onSelectSize(size.id === selectedSizeId ? null : size.id)}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border min-w-[40px]',
                  selectedSizeId === size.id
                    ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-105'
                    : 'bg-background border-border hover:border-accent/50 text-muted-foreground hover:text-foreground hover:scale-105'
                )}
              >
                {size.name}
              </button>
            ))}

            {/* Numeric Sizes Dropdown */}
            {sizes.filter(s => !isNaN(Number(s.name))).length > 0 && (
              <select
                value={selectedSizeId || ""}
                onChange={(e) => onSelectSize(e.target.value || null)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border bg-background text-foreground",
                  selectedSizeId && !isNaN(Number(sizes.find(s => s.id === selectedSizeId)?.name)) 
                    ? "bg-accent text-accent-foreground border-accent" 
                    : "border-border hover:border-accent/50 text-muted-foreground"
                )}
              >
                <option value="">Numéricos...</option>
                {sizes
                  .filter(s => !isNaN(Number(s.name)))
                  .sort((a,b) => Number(a.name) - Number(b.name))
                  .map(size => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))
                }
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
