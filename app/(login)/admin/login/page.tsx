'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, LogIn, KeyRound, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@kitob.uz');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Email yoki parol noto‘g‘ri.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Tizimga ulanishda xatolik.');
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin() {
    setEmail('admin@kitob.uz');
    setPassword('admin123');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@kitob.uz', password: 'admin123' }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || 'Kirishda xatolik.');
      }
    } catch {
      setError('Ulanish xatosi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="login-card" onSubmit={login}>
        <div className="login-icon">
          <LockKeyhole />
        </div>
        <h1>Admin panel</h1>
        <p>Kitobmi yoki ekran? — boshqaruv tizimi</p>

        <div
          style={{
            background: '#eaf7f5',
            border: '1.5px solid #a3ded7',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '13px',
            color: '#0e5e56',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <KeyRound size={15} /> Standart kirish ma’lumotlari:
          </div>
          <div><strong>Email:</strong> admin@kitob.uz</div>
          <div><strong>Parol:</strong> admin123</div>
        </div>

        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kitob.uz"
          />
        </label>
        <label>
          Parol
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button className="primary-btn" disabled={loading} type="submit" style={{ marginTop: '14px' }}>
          {loading ? 'Kirilmoqda...' : 'Kirish'} <LogIn size={18} />
        </button>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #edf2f7' }}>
          <button
            type="button"
            onClick={quickLogin}
            disabled={loading}
            className="secondary-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
          >
            <Sparkles size={16} /> 1 bosishda Admin panelga kirish
          </button>
        </div>
      </form>
    </main>
  );
}
