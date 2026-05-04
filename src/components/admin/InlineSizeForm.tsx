import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface InlineSizeFormProps {
  onSizeAdded: () => void;
}

export function InlineSizeForm({ onSizeAdded }: InlineSizeFormProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Ingresá un nombre para el talle' });
      return;
    }

    setSaving(true);
    
    // Get max display_order
    const { data: currentSizes } = await supabase.from('sizes').select('display_order');
    const maxOrder = currentSizes && currentSizes.length > 0 
      ? Math.max(...currentSizes.map(s => s.display_order)) 
      : 0;

    const { error } = await supabase.from('sizes').insert({ 
      name: name.trim().toUpperCase(),
      display_order: maxOrder + 1 
    });
    
    setSaving(false);

    if (error) {
      if (error.code === '23505') {
        toast({ variant: 'destructive', title: 'Error', description: 'El talle ya existe' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } else {
      toast({ title: 'Talle agregado' });
      setName('');
      setShowForm(false);
      onSizeAdded();
    }
  };

  if (!showForm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="gap-1 h-8"
      >
        <Plus className="h-3 w-3" />
        Nuevo Talle
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/50">
      <Input
        placeholder="Ej: XXL"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-20 h-6 text-xs"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />
      <Button size="icon" className="h-6 w-6" onClick={handleSubmit} disabled={saving}>
        <Plus className="h-3 w-3" />
      </Button>
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowForm(false)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
