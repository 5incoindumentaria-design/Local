import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  activeProfile: Profile | null;
  selectProfile: (profile: Profile, pin: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('activeProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkAdminRole(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (data) setIsAdmin(true);
    } catch (err) {
      console.error('Error checking admin role:', err);
    }
  };

  const selectProfile = async (profile: Profile, pin: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('pin')
      .eq('id', profile.id)
      .single();

    if (error || !data) return { success: false, error: 'Perfil no encontrado' };
    
    if (data.pin === pin) {
      setActiveProfile(profile);
      setIsAdmin(true);
      localStorage.setItem('activeProfile', JSON.stringify(profile));
      return { success: true };
    } else {
      return { success: false, error: 'PIN incorrecto' };
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!activeProfile) return { success: false, error: 'No hay perfil activo' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', activeProfile.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'No se pudo actualizar el perfil' };
    }

    const updatedProfile = { ...activeProfile, ...updates };
    setActiveProfile(updatedProfile);
    localStorage.setItem('activeProfile', JSON.stringify(updatedProfile));
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setActiveProfile(null);
    setIsAdmin(false);
    localStorage.removeItem('activeProfile');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin: isAdmin || !!activeProfile,
      loading, 
      activeProfile,
      selectProfile,
      updateProfile,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
