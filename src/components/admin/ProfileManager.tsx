import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Plus, Trash2, Edit, Shield, Sparkles } from 'lucide-react';
import { Profile } from '@/hooks/useAuth';
import { AvatarCustomizer } from '../profile/AvatarCustomizer';

interface ProfileManagerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileManager({ open, onClose }: ProfileManagerProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<(Profile & { pin: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(Profile & { pin: string }) | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [pin, setPin] = useState('2812');
  const [role, setRole] = useState('cajero');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los perfiles' });
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchProfiles();
  }, [open]);

  const resetForm = () => {
    setName('');
    setPin('2812');
    setRole('cajero');
    setAvatarUrl('');
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (p: Profile & { pin: string }) => {
    setEditing(p);
    setName(p.name);
    setPin(p.pin);
    setRole(p.role);
    setAvatarUrl(p.avatar_url || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast({ variant: 'destructive', title: 'PIN inválido', description: 'El PIN debe ser de 4 dígitos.' });
      return;
    }
    
    const data = {
      name,
      pin,
      role,
      avatar_url: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };

    if (editing) {
      const { error } = await supabase.from('profiles').update(data).eq('id', editing.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar' });
      } else {
        toast({ title: 'Perfil actualizado' });
      }
    } else {
      const { error } = await supabase.from('profiles').insert(data);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear' });
      } else {
        toast({ title: 'Perfil creado' });
      }
    }

    resetForm();
    fetchProfiles();
  };

  const handleDelete = async (id: string) => {
    if (profiles.length <= 1) {
      toast({ variant: 'destructive', title: 'Error', description: 'No puedes eliminar el último perfil.' });
      return;
    }
    if (!confirm('¿Eliminar este perfil? El usuario ya no podrá ingresar.')) return;
    
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar' });
    } else {
      toast({ title: 'Perfil eliminado' });
      fetchProfiles();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Gestionar Perfiles (Netflix Style)
          </DialogTitle>
        </DialogHeader>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label>Nombre</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Flor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PIN (4 dígitos)</Label>
                <Input 
                  value={pin} 
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                  required 
                  maxLength={4}
                  placeholder="2812" 
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueño">Dueño</SelectItem>
                    <SelectItem value="cajero">Cajero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Personalizar Avatar</Label>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <img 
                  src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'default'}`} 
                  className="w-16 h-16 rounded-xl bg-background shadow-sm" 
                  alt="" 
                />
                <div className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCustomizer(!showCustomizer)}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-accent" />
                    {showCustomizer ? 'Cerrar Personalizador' : 'Cambiar Apariencia'}
                  </Button>
                </div>
              </div>
              
              {showCustomizer && (
                <div className="mt-4 p-4 rounded-xl border border-accent/20 bg-accent/5">
                  <AvatarCustomizer initialUrl={avatarUrl} onSelect={setAvatarUrl} />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="flex-1">Guardar</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-4">
            <Button onClick={() => setShowForm(true)} className="w-full bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
            </Button>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {loading ? (
                <p className="text-center py-4">Cargando...</p>
              ) : (
                profiles.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 border rounded-sm">
                    <img 
                      src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} 
                      className="w-10 h-10 rounded-md bg-muted" 
                      alt="" 
                    />
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{p.role}</p>
                    </div>
                    <div className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">PIN: {p.pin}</div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
