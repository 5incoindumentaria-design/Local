import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Profile } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, User as UserIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Jefecitos() {
  const { selectProfile, activeProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setPin('');
  };

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProfile || pin.length < 4) return;

    setVerifying(true);
    const { success, error } = await selectProfile(selectedProfile, pin);
    
    if (success) {
      toast({ title: `¡Hola ${selectedProfile.name}!`, description: 'Acceso concedido.' });
      navigate('/admin');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error || 'PIN incorrecto' });
      setPin('');
    }
    setVerifying(false);
  };

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!selectedProfile ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center w-full max-w-4xl"
          >
            <h1 className="text-4xl sm:text-5xl font-medium mb-12 tracking-tight">¿Quién está ahí?</h1>
            
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="group cursor-pointer flex flex-col items-center"
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-300 relative mb-4">
                    <img 
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      alt={profile.name}
                    />
                  </div>
                  <span className="text-gray-400 group-hover:text-white text-lg sm:text-xl transition-colors">
                    {profile.name}
                  </span>
                </div>
              ))}
              
              {/* Add user button (for owners in the future, visible to all now) */}
              <div className="group cursor-pointer flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:border-white transition-all mb-4">
                  <Plus className="w-12 h-12 text-gray-600 group-hover:text-white" />
                </div>
                <span className="text-gray-400 group-hover:text-white text-lg sm:text-xl transition-colors">
                  Añadir
                </span>
              </div>
            </div>

            <div className="mt-20">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-400 hover:text-white hover:border-white bg-transparent uppercase tracking-widest text-sm px-8"
                onClick={() => navigate('/')}
              >
                Volver a la tienda
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-sm w-full"
          >
            <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-white mb-6">
              <img 
                src={selectedProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedProfile.name}`} 
                className="w-full h-full object-cover"
                alt={selectedProfile.name}
              />
            </div>
            <h2 className="text-2xl font-medium mb-2">Ingresar PIN</h2>
            <p className="text-gray-400 mb-8 text-center text-sm">Hola {selectedProfile.name}, ingresá tu código de 4 dígitos para continuar.</p>
            
            <form onSubmit={handlePinSubmit} className="w-full space-y-6">
              <div className="flex justify-center">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent border-gray-600 focus:border-white text-center text-3xl tracking-[1em] h-16 w-48 font-bold"
                  autoFocus
                  disabled={verifying}
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 py-6 text-lg font-bold"
                  disabled={pin.length < 4 || verifying}
                >
                  {verifying ? 'Verificando...' : 'Entrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-white"
                  onClick={() => setSelectedProfile(null)}
                >
                  Cambiar perfil
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        body { background-color: #141414 !important; }
        .text-gradient-gold {
          background: linear-gradient(135deg, #D4AF37 0%, #F5E6AD 50%, #B8860B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      ` }} />
    </div>
  );
}
