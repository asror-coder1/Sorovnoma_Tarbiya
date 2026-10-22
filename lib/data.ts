import { serverClient } from './supabase';
import { ResponseRow } from './questions';
import { getLocalResponses } from './local-storage';

export async function loadResponses(): Promise<ResponseRow[]> {
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR_PROJECT') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

  if (isSupabaseConfigured) {
    try {
      const sb = await serverClient();
      const all: ResponseRow[] = [];
      for (let from = 0; from < 100000; from += 1000) {
        const { data, error } = await sb
          .from('responses')
          .select('id,full_name,school,class_name,answers,created_at')
          .order('created_at', { ascending: false })
          .range(from, from + 999);
        if (error) break;
        all.push(...((data as ResponseRow[]) || []));
        if (!data || data.length < 1000) break;
      }
      if (all.length > 0) {
        return all;
      }
    } catch {
      // Fallback to local storage if Supabase connection fails
    }
  }

  return getLocalResponses();
}
