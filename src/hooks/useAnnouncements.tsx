import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  link_text: string | null;
  background_color: string;
  text_color: string;
  is_active: boolean;
  display_order: number;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('display_order', { ascending: true });
    
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return { announcements, loading, refetch: fetchAnnouncements };
}