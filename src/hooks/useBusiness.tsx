import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Business, BusinessType } from '@/types/database';

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
  error: string | null;
  createBusiness: (name: string, type: BusinessType) => Promise<{ error: Error | null }>;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setBusiness(data as Business | null);
      }
    } catch (err) {
      setError('Failed to fetch business');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const createBusiness = async (name: string, type: BusinessType) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name,
          type,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setBusiness(data as Business);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshBusiness = async () => {
    await fetchBusiness();
  };

  return (
    <BusinessContext.Provider value={{ business, loading, error, createBusiness, refreshBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
