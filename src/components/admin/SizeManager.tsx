import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSizes } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';

interface SizeManagerProps {
  open: boolean;
  onClose: () => void;
}

export function SizeManager({ open, onClose }: SizeManagerProps) {
  const { sizes, refetch } = useSizes();
  const { toast } = useToast();
  
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ingresá un nombre' });
      return;
    }
    
    // Get max display_order
    const maxOrder = sizes.length > 0 ? Math.max(...sizes.map(s => s.display_order)) : 0;
    
    setSaving(true);
    const { error } = await supabase.from('sizes').insert({ 
      name: newName.trim(), 
      display_order: maxOrder + 1 
    });
    setSaving(false);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Talle agregado' });
      setNewName('');
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este talle? Los productos con este talle perderán la referencia.')) return;
    
    const { error } = await supabase.from('sizes').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Talle eliminado' });
      refetch();
    }
  };

  const startEdit = (size: { id: string; name: string }) => {
    setEditingId(size.id);
    setEditName(size.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    
    const { error } = await supabase
      .from('sizes')
      .update({ name: editName.trim() })
      .eq('id', editingId);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Talle actualizado' });
      cancelEdit();
      refetch();
    }
  };

  const moveSize = async (id: string, direction: 'up' | 'down') => {
    const alphabeticSizes = sizes.filter(s => isNaN(Number(s.name)));
    const index = alphabeticSizes.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= alphabeticSizes.length) return;
    
    const currentSize = alphabeticSizes[index];
    const swapSize = alphabeticSizes[newIndex];
    
    // Swap display_order values
    await Promise.all([
      supabase.from('sizes').update({ display_order: swapSize.display_order }).eq('id', currentSize.id),
      supabase.from('sizes').update({ display_order: currentSize.display_order }).eq('id', swapSize.id),
    ]);
    
    refetch();
  };

  const alphabeticSizes = sizes.filter(s => isNaN(Number(s.name)));
  const numericSizes = sizes.filter(s => !isNaN(Number(s.name))).sort((a,b) => Number(a.name) - Number(b.name));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar Talles</DialogTitle>
        </DialogHeader>

        {/* Add new size */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-sm">
          <Label>Agregar nuevo talle</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre (ej: S, M, L, XL)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={saving} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Size list */}
        <div className="space-y-4">
          
          {/* ALPHABETIC SIZES */}
          <div className="space-y-2">
            <Label>Talles de Letras ({alphabeticSizes.length})</Label>
            <p className="text-xs text-muted-foreground">Usá las flechas para reordenar</p>
            {alphabeticSizes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No hay talles de letras</p>
            ) : (
              <div className="space-y-2">
                {alphabeticSizes.map((size, index) => (
                <div key={size.id} className="flex items-center gap-2 p-2 border rounded-sm">
                  {editingId === size.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8"
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-6"
                          disabled={index === 0}
                          onClick={() => moveSize(size.id, 'up')}
                        >
                          <span className="text-xs">▲</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-6"
                          disabled={index === alphabeticSizes.length - 1}
                          onClick={() => moveSize(size.id, 'down')}
                        >
                          <span className="text-xs">▼</span>
                        </Button>
                      </div>
                      <span className="flex-1 text-sm font-medium">{size.name}</span>
                      <span className="text-xs text-muted-foreground">Orden: {size.display_order}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(size)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(size.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          {/* NUMERIC SIZES */}
          {numericSizes.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Talles Numéricos ({numericSizes.length})</Label>
              <div className="grid grid-cols-2 gap-2">
                {numericSizes.map((size) => (
                  <div key={size.id} className="flex items-center gap-2 p-2 border rounded-sm">
                    {editingId === size.id ? (
                      <>
                        <Input
                          type="number"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-8"
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium">{size.name}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(size)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(size.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
