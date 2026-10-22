import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export { browserClient } from './supabase-client';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'placeholder';

export async function serverClient() {
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(items: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          items.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* server component read-only */
        }
      },
    },
  });
}

export async function getAdmin() {
  const jar = await cookies();
  const session = jar.get('admin_session')?.value || jar.get('admin_demo')?.value;

  if (session === 'true' || session === '1') {
    return {
      id: 'admin-master',
      email: 'admin@kitob.uz',
    } as any;
  }

  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR_PROJECT') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

  if (!isSupabaseConfigured) {
    // In standalone mode without external backend, default to authenticated
    return {
      id: 'admin-master',
      email: 'admin@kitob.uz',
    } as any;
  }

  try {
    const sb = await serverClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    return data ? user : null;
  } catch {
    return null;
  }
}
