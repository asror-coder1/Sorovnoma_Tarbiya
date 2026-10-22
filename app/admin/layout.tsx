import {getAdmin} from '@/lib/supabase';import {redirect} from 'next/navigation';import AdminShell from '@/components/AdminShell';
export default async function AdminLayout({children}:{children:React.ReactNode}){const user=await getAdmin();if(!user)redirect('/admin/login');return <AdminShell>{children}</AdminShell>}
