import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from './useBusiness';
import { Expense, ExpenseCategory, PaymentMethod } from '@/types/database';

export function useExpenses() {
  const { business, refreshBusiness } = useBusiness();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (startDate?: string, endDate?: string) => {
    if (!business) return;

    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
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
        setExpenses(data as Expense[]);
      }
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const addExpense = async (
    date: string,
    category: ExpenseCategory,
    amount: number,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => {
    if (!business) {
      return { error: new Error('No business found') };
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          business_id: business.id,
          date,
          category,
          amount,
          payment_method: paymentMethod,
          notes,
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setExpenses(prev => [data as Expense, ...prev]);
      await refreshBusiness();
      return { error: null, data: data as Expense };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setExpenses(prev => prev.map(e => e.id === id ? data as Expense : e));
      await refreshBusiness();
      return { error: null, data: data as Expense };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      setExpenses(prev => prev.filter(e => e.id !== id));
      await refreshBusiness();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
