import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Save, X, ChevronRight, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories, Category, CategoryNode } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';

const GENDER_OPTIONS = [
  { value: 'unisex', label: 'Unisex (ambos)' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
];

export function CategoryManager() {
  const { categories, loading, refetch, getFlattenedTree } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'masculino' | 'femenino' | 'unisex'>('unisex');
  const [formParentId, setFormParentId] = useState<string | null>(null);

  const flattenedCategories = getFlattenedTree();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setFormName('');
    setFormGender('unisex');
    setFormParentId(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAdd = async () => {
    if (!formName.trim()) {
      toast({ title: 'Ingresá un nombre', variant: 'destructive' });
      return;
    }

    const slug = generateSlug(formName);
    const maxOrder = Math.max(...categories.map(c => c.display_order), 0);

    const { error } = await supabase.from('categories').insert({
      name: formName.trim(),
      slug,
      gender: formGender,
      display_order: maxOrder + 1,
      parent_id: formParentId,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Ya existe una categoría con ese nombre', variant: 'destructive' });
      } else {
        toast({ title: 'Error al crear categoría', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Categoría creada' });
      resetForm();
      refetch();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormName(category.name);
    setFormGender(category.gender);
    setFormParentId(category.parent_id);
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !formName.trim()) return;

    // Prevent setting self as parent
    if (formParentId === editingId) {
      toast({ title: 'Una categoría no puede ser su propia subcategoría', variant: 'destructive' });
      return;
    }

    const slug = generateSlug(formName);

    const { error } = await supabase
      .from('categories')
      .update({ name: formName.trim(), slug, gender: formGender, parent_id: formParentId })
      .eq('id', editingId);

    if (error) {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    } else {
      toast({ title: 'Categoría actualizada' });
      resetForm();
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    // Check if has children
    const hasChildren = categories.some(c => c.parent_id === id);
    if (hasChildren) {
      if (!confirm('Esta categoría tiene subcategorías. Al eliminarla, las subcategorías quedarán huérfanas. ¿Continuar?')) {
        return;
      }
    } else {
      if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
        return;
      }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    } else {
      toast({ title: 'Categoría eliminada' });
      refetch();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const flat = flattenedCategories;
    const temp = flat[index].display_order;
    
    await Promise.all([
      supabase.from('categories').update({ display_order: flat[index - 1].display_order }).eq('id', flat[index].id),
      supabase.from('categories').update({ display_order: temp }).eq('id', flat[index - 1].id),
    ]);

    refetch();
  };

  const handleMoveDown = async (index: number) => {
    const flat = flattenedCategories;
    if (index === flat.length - 1) return;
    const temp = flat[index].display_order;
    
    await Promise.all([
      supabase.from('categories').update({ display_order: flat[index + 1].display_order }).eq('id', flat[index].id),
      supabase.from('categories').update({ display_order: temp }).eq('id', flat[index + 1].id),
    ]);

    refetch();
  };

  // Get available parents (exclude self and descendants when editing)
  const getAvailableParents = (): CategoryNode[] => {
    if (!editingId) return flattenedCategories;
    
    // Get all descendant IDs of the current editing category
    const getDescendants = (id: string): string[] => {
      const children = categories.filter(c => c.parent_id === id);
      return [id, ...children.flatMap(c => getDescendants(c.id))];
    };
    
    const excludeIds = new Set(getDescendants(editingId));
    return flattenedCategories.filter(c => !excludeIds.has(c.id));
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Gestionar Categorías
        </CardTitle>
        {!isAdding && !editingId && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Remeras"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría padre</Label>
                <Select 
                  value={formParentId || 'none'} 
                  onValueChange={(v) => setFormParentId(v === 'none' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna (raíz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (categoría raíz)</SelectItem>
                    {getAvailableParents().map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'—'.repeat(cat.depth)} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select value={formGender} onValueChange={(v) => setFormGender(v as typeof formGender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {editingId && (
              <div className="mt-4 pt-4 border-t border-dashed">
                <Label className="text-xs text-muted-foreground uppercase mb-2 block">Subcategorías actuales</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c.parent_id === editingId).length > 0 ? (
                    categories.filter(c => c.parent_id === editingId).map(sub => (
                      <Badge key={sub.id} variant="secondary" className="flex items-center gap-1">
                        {sub.name}
                        <button onClick={() => handleDelete(sub.id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No tiene subcategorías</p>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px]"
                    onClick={() => {
                      const parentId = editingId;
                      resetForm();
                      setFormParentId(parentId);
                      setIsAdding(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Nueva subcategoría
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={editingId ? handleUpdate : handleAdd}>
                <Save className="h-4 w-4 mr-1" />
                {editingId ? 'Guardar' : 'Crear'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Categories List - Tree View */}
        <div className="space-y-1">
          {flattenedCategories.map((category, index) => (
            <div
              key={category.id}
              className={cn(
                'flex items-center justify-between p-3 border rounded-lg',
                editingId === category.id && 'bg-accent/10',
                category.depth > 0 && 'ml-6 border-l-2 border-l-accent/30'
              )}
              style={{ marginLeft: category.depth * 24 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === flattenedCategories.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {category.depth > 0 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                    <p className="font-medium">{category.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {GENDER_OPTIONS.find(g => g.value === category.gender)?.label}
                    {category.parent_id && ` • Subcategoría`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Agregar subcategoría"
                  onClick={() => {
                    resetForm();
                    setFormParentId(category.id);
                    setIsAdding(true);
                  }}
                >
                  <Plus className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No hay categorías. Creá la primera.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
