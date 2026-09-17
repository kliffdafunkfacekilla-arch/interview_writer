import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface CrudItem {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export function useCrudList<T extends CrudItem>(table: string, projectId: string | null) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    if (error) {
      console.error(`Failed to load ${table}:`, error);
      setLoading(false);
      return;
    }
    setItems((data as T[]) || []);
    setLoading(false);
  }, [table, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (payload: Record<string, unknown>): Promise<T | null> => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from(table)
        .insert({ ...payload, project_id: projectId })
        .select()
        .maybeSingle();
      if (error) {
        console.error(`Failed to create ${table}:`, error);
        return null;
      }
      if (data) {
        setItems((prev) => [...prev, data as T]);
        return data as T;
      }
      return null;
    },
    [table, projectId],
  );

  const update = useCallback(
    async (id: string, updates: Record<string, unknown>): Promise<void> => {
      const { error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        console.error(`Failed to update ${table}:`, error);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? ({ ...item, ...updates, updated_at: new Date().toISOString() } as T) : item,
        ),
      );
    },
    [table],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error(`Failed to delete from ${table}:`, error);
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [table],
  );

  return { items, loading, create, update, remove, reload: load };
}
