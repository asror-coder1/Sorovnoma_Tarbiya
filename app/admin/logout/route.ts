import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const sb = await serverClient();
    await sb.auth.signOut();
  } catch {
    // ignore
  }

  const jar = await cookies();
  jar.delete('admin_session');
  jar.delete('admin_demo');

  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303);
  res.cookies.delete('admin_session');
  res.cookies.delete('admin_demo');
  return res;
}
