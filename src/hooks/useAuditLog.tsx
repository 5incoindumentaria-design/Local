import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AuditEntry {
  id: string;
  profile_id: string;
  profile_name: string;
  action: string;
  category: string;
  details: Record<string, any>;
  created_at: string;
}

/**
 * Hook to log and query audit entries.
 *
 * === IMPORTANT ===
 * Every time a new action is added to the CashierPanel (or any other admin action),
 * it MUST be logged via `logAction()` from this hook so the owner can track it
 * in the ActivityHistory panel. Categories should be one of:
 *   - 'venta'        → Sales operations
 *   - 'stock'        → Stock modifications
 *   - 'producto'     → Product CRUD (create/edit/delete/toggle)
 *   - 'descuento'    → Discount changes
 *   - 'deuda'        → Debt / debtor operations
 *   - 'config'       → Settings & configuration changes
 *   - 'perfil'       → Profile management
 *   - 'general'      → Fallback category
 * ==================
 */
export function useAuditLog() {
  const { activeProfile } = useAuth();

  const logAction = useCallback(async (
    action: string,
    category: string = 'general',
    details: Record<string, any> = {}
  ) => {
    if (!activeProfile) return;

    try {
      await supabase.from('audit_log').insert({
        profile_id: activeProfile.id,
        profile_name: activeProfile.name,
        action,
        category,
        details,
      });
    } catch (err) {
      // Silently fail — audit log should never break the main flow
      console.warn('Audit log error:', err);
    }
  }, [activeProfile]);

  return { logAction };
}

/**
 * Hook to fetch audit log entries with filters.
 * Used by the ActivityHistory component (owner-only).
 */
export function useAuditHistory() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [profiles, setProfiles] = useState<{id: string, name: string}[]>([]);

  // Fetch all profiles from the profiles table (not from audit entries)
  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name')
      .order('name');
    setProfiles(data || []);
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (profileFilter !== 'all') {
        query = query.eq('profile_id', profileFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.warn('Error fetching audit log:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [profileFilter, categoryFilter]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    profileFilter,
    setProfileFilter,
    categoryFilter,
    setCategoryFilter,
    profiles,
    refetch: fetchEntries,
  };
}
