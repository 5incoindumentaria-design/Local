import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AvatarCustomizer } from './AvatarCustomizer';
import { User, Save } from 'lucide-react';

interface ProfileSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSettings({ open, onClose }: ProfileSettingsProps) {
  const { activeProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state when dialog opens or profile changes
  useEffect(() => {
    if (open && activeProfile) {
      setName(activeProfile.name || '');
      setAvatarUrl(activeProfile.avatar_url || '');
    }
  }, [open, activeProfile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre no puede estar vacío.' });
      return;
    }

    setLoading(true);
    const { success, error } = await updateProfile({ name, avatar_url: avatarUrl });
    setLoading(false);

    if (success) {
      toast({ title: '✨ Perfil actualizado', description: 'Tus cambios se han guardado con éxito.' });
      onClose();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error });
    }
  };

  if (!activeProfile) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border border-border/30 bg-background/98 backdrop-blur-xl">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              Personalizar Perfil
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Diseñá tu avatar personalizado y actualizá tu nombre.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Nombre
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/40 focus-visible:ring-2 focus-visible:ring-accent/50 text-base"
                placeholder="Tu nombre..."
              />
            </div>
          </div>

          {/* Avatar customizer */}
          <div className="rounded-2xl border border-border/30 bg-muted/10 p-5">
            <AvatarCustomizer
              initialUrl={activeProfile.avatar_url}
              onSelect={setAvatarUrl}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 bg-muted/20 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Guardar Cambios
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
