 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { Plus, X } from 'lucide-react';
 
 interface InlineColorFormProps {
   onColorAdded: () => void;
 }
 
 export function InlineColorForm({ onColorAdded }: InlineColorFormProps) {
   const { toast } = useToast();
   const [showForm, setShowForm] = useState(false);
   const [name, setName] = useState('');
   const [hex, setHex] = useState('#000000');
   const [saving, setSaving] = useState(false);
 
   const handleSubmit = async () => {
     if (!name.trim()) {
       toast({ variant: 'destructive', title: 'Ingresá un nombre para el color' });
       return;
     }
 
     setSaving(true);
     const { error } = await supabase.from('colors').insert({ name: name.trim(), hex_code: hex });
     setSaving(false);
 
     if (error) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
     } else {
       toast({ title: 'Color agregado' });
       setName('');
       setHex('#000000');
       setShowForm(false);
       onColorAdded();
     }
   };
 
   if (!showForm) {
     return (
       <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={() => setShowForm(true)}
         className="gap-1"
       >
         <Plus className="h-4 w-4" />
         Agregar color
       </Button>
     );
   }
 
   return (
     <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
       <Input
         placeholder="Nombre del color"
         value={name}
         onChange={(e) => setName(e.target.value)}
         className="flex-1 h-8"
         autoFocus
       />
       <Input
         type="color"
         value={hex}
         onChange={(e) => setHex(e.target.value)}
         className="w-12 h-8 p-0.5"
       />
       <Button size="sm" onClick={handleSubmit} disabled={saving}>
         {saving ? '...' : 'Guardar'}
       </Button>
       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowForm(false)}>
         <X className="h-4 w-4" />
       </Button>
     </div>
   );
 }