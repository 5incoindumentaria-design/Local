import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useColors } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface ColorManagerProps {
  open: boolean;
  onClose: () => void;
}

export function ColorManager({ open, onClose }: ColorManagerProps) {
  const { colors, refetch } = useColors();
  const { toast } = useToast();
  
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#000000');
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHex, setEditHex] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ingresá un nombre' });
      return;
    }
    
    setSaving(true);
    const { error } = await supabase.from('colors').insert({ name: newName.trim(), hex_code: newHex });
    setSaving(false);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Color agregado' });
      setNewName('');
      setNewHex('#000000');
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este color? Los productos con este color perderán la referencia.')) return;
    
    const { error } = await supabase.from('colors').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Color eliminado' });
      refetch();
    }
  };

  const startEdit = (color: { id: string; name: string; hex_code: string }) => {
    setEditingId(color.id);
    setEditName(color.name);
    setEditHex(color.hex_code);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditHex('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    
    const { error } = await supabase
      .from('colors')
      .update({ name: editName.trim(), hex_code: editHex })
      .eq('id', editingId);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Color actualizado' });
      cancelEdit();
      refetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Gestionar Colores</DialogTitle>
        </DialogHeader>

        {/* Add new color */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-sm">
          <Label>Agregar nuevo color</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre (ej: Rojo)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              className="w-14 p-1 h-10"
            />
            <Button onClick={handleAdd} disabled={saving} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Color list */}
        <div className="space-y-2">
          <Label>Colores existentes ({colors.length})</Label>
          {colors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay colores</p>
          ) : (
            <div className="space-y-2">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center gap-2 p-2 border rounded-sm">
                  {editingId === color.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8"
                      />
                      <Input
                        type="color"
                        value={editHex}
                        onChange={(e) => setEditHex(e.target.value)}
                        className="w-10 p-0.5 h-8"
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
                      <div
                        className="w-6 h-6 rounded-full border flex-shrink-0"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      <span className="flex-1 text-sm">{color.name}</span>
                      <span className="text-xs text-muted-foreground">{color.hex_code}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(color)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(color.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
