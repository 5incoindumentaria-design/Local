import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/hooks/useCategories';

interface CategorySelectorProps {
  categories: Category[];
  gender: string;
  parentCategoryId: string;
  subcategoryId: string;
  onParentChange: (id: string, categoryName?: string) => void;
  onSubcategoryChange: (id: string, subcategoryName?: string) => void;
  onCategoriesUpdated: () => void;
}

export function CategorySelector({
  categories,
  gender,
  parentCategoryId,
  subcategoryId,
  onParentChange,
  onSubcategoryChange,
  onCategoriesUpdated,
}: CategorySelectorProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const parentCategories = categories.filter(
    c => !c.parent_id && (c.gender === gender || c.gender === 'unisex')
  );

  const childCategories = parentCategoryId
    ? categories.filter(c => c.parent_id === parentCategoryId)
    : [];

  const filteredParents = searchTerm
    ? parentCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : parentCategories;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateCategory = async (asChild: boolean) => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Ingresá un nombre', variant: 'destructive' });
      return;
    }

    const slug = generateSlug(newCategoryName);
    const maxOrder = Math.max(...categories.map(c => c.display_order), 0);

    const { data, error } = await supabase.from('categories').insert({
      name: newCategoryName.trim(),
      slug,
      gender: gender as 'masculino' | 'femenino' | 'unisex',
      display_order: maxOrder + 1,
      parent_id: asChild ? parentCategoryId : null,
    }).select('id, name').single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Ya existe una categoría con ese nombre', variant: 'destructive' });
      } else {
        toast({ title: 'Error al crear categoría', variant: 'destructive' });
      }
      return;
    }

    toast({ title: `Categoría "${newCategoryName.trim()}" creada` });
    setNewCategoryName('');

    // Refresh categories in parent
    onCategoriesUpdated();

    if (data) {
      if (asChild) {
        setIsAddingChild(false);
        // Auto-select the new subcategory after a small delay for refetch
        setTimeout(() => onSubcategoryChange(data.id, data.name), 300);
      } else {
        setIsAddingParent(false);
        // Auto-select the new parent category
        setTimeout(() => onParentChange(data.id, data.name), 300);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Categoría Principal */}
      <div>
        <Label>Categoría principal</Label>
        <div className="space-y-2">
          <Select
            value={parentCategoryId}
            onValueChange={v => {
              const cat = categories.find(c => c.id === v);
              onParentChange(v, cat?.name);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría..." />
            </SelectTrigger>
            <SelectContent>
              {/* Search inside dropdown */}
              <div className="px-2 pb-2 pt-1 sticky top-0 bg-popover">
                <div className="flex items-center border rounded-sm px-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    className="flex-1 py-1.5 px-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Buscar categoría..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.stopPropagation()}
                  />
                  {searchTerm && (
                    <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}>
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {filteredParents.length > 0 ? (
                filteredParents.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  {searchTerm ? 'No se encontró esa categoría' : 'No hay categorías para este género'}
                </div>
              )}

              {/* Botón para crear nueva dentro del dropdown */}
              <div className="border-t mt-1 pt-1 px-1 pb-1">
                <button
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-accent hover:bg-accent/10 rounded-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingParent(true);
                    setIsAddingChild(false);
                    setNewCategoryName(searchTerm);
                    setSearchTerm('');
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Crear nueva categoría
                </button>
              </div>
            </SelectContent>
          </Select>

          {/* Inline form para crear categoría padre */}
          {isAddingParent && (
            <div className="flex gap-2 items-center p-2 border rounded-sm bg-muted/30 animate-in fade-in slide-in-from-top-1 duration-200">
              <Input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="h-8 text-sm"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateCategory(false);
                  if (e.key === 'Escape') { setIsAddingParent(false); setNewCategoryName(''); }
                }}
              />
              <Button size="sm" className="h-8 px-3" onClick={() => handleCreateCategory(false)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Crear
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setIsAddingParent(false); setNewCategoryName(''); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Subcategoría */}
      {parentCategoryId && (
        <div>
          <Label className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            Subcategoría (opcional)
          </Label>
          <div className="space-y-2">
            <Select value={subcategoryId || 'none'} onValueChange={v => {
              if (v === 'none') {
                onSubcategoryChange('');
              } else {
                const subCat = childCategories.find(c => c.id === v);
                onSubcategoryChange(v, subCat?.name);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sin subcategoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin subcategoría</SelectItem>
                {childCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}

                {/* Botón para crear subcategoría */}
                <div className="border-t mt-1 pt-1 px-1 pb-1">
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-accent hover:bg-accent/10 rounded-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingChild(true);
                      setIsAddingParent(false);
                      setNewCategoryName('');
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Crear subcategoría
                  </button>
                </div>
              </SelectContent>
            </Select>

            {/* Inline form para crear subcategoría */}
            {isAddingChild && (
              <div className="flex gap-2 items-center p-2 border rounded-sm bg-muted/30 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {categories.find(c => c.id === parentCategoryId)?.name} &gt;
                </div>
                <Input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la subcategoría"
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateCategory(true);
                    if (e.key === 'Escape') { setIsAddingChild(false); setNewCategoryName(''); }
                  }}
                />
                <Button size="sm" className="h-8 px-3" onClick={() => handleCreateCategory(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Crear
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setIsAddingChild(false); setNewCategoryName(''); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
