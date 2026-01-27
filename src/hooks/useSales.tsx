import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { Sale, PaymentMethod } from '@/types/database';

export function useSales() {
  const { business, refreshBusiness } = useBusiness();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async (startDate?: string, endDate?: string) => {
    if (!business) return;

    try {
      setLoading(true);
      let query = supabase
        .from('sales')
        .select('*')
        .eq('business_id', business.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setSales(data as Sale[]);
      }
    } catch (err) {
      setError('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const addSale = async (
    date: string,
    amount: number,
    paymentMethod: PaymentMethod,
    description?: string
  ) => {
    if (!business) {
      return { error: new Error('No business found') };
    }

    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          business_id: business.id,
          date,
          amount,
          payment_method: paymentMethod,
          description,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setSales(prev => [data as Sale, ...prev]);
      await refreshBusiness();
      return { error: null, data: data as Sale };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setSales(prev => prev.map(s => s.id === id ? data as Sale : s));
      await refreshBusiness();
      return { error: null, data: data as Sale };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      setSales(prev => prev.filter(s => s.id !== id));
      await refreshBusiness();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    sales,
    loading,
    error,
    fetchSales,
    addSale,
    updateSale,
    deleteSale,
  };
}
