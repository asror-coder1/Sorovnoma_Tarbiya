# KITOBMI YOKI EKRAN? 📚

O‘zbek tilidagi haqiqiy onlayn so‘rovnoma va administrator analitika paneli.

## Ishga tushirish

1. Node.js 20+ o‘rnating.
2. [Supabase](https://supabase.com) da yangi loyiha oching.
3. Supabase → SQL Editor → `supabase/schema.sql` faylini to‘liq ishga tushiring.
4. Supabase → Authentication → Users → Add user orqali administrator email va parolini yarating.
5. Auth Users ro‘yxatidan yangi foydalanuvchining UUID qiymatini oling va SQL Editor'da quyidagini bajaring:
   ```sql
   insert into public.admins (user_id) values ('ADMIN_UUID_HERE');
   ```
6. `.env.example` faylidan `.env.local` nusxa yarating. Supabase → Project Settings → API dan URL va **anon/publishable** kalitni kiriting.
7. Terminalda:
   ```bash
   npm install
   npm run dev
   ```
8. Sayt: `http://localhost:3000`, so‘rovnoma: `/survey`, admin login: `/admin/login`.

## Vercel

GitHub repository yarating va kodni push qiling. Vercel → Add New Project → GitHub repo → Environment Variables ga yuqoridagi ikkita qiymatni kiriting → Deploy.

## Maxfiylik

O‘quvchilarning ismi, maktabi, sinfi va javoblari yig‘iladi. Respondentlarga ma’lumotni kim ko‘rishi aytiladi. Supabase RLS faqat oldindan tasdiqlangan administratorlarga javoblarni o‘qishga ruxsat beradi. Admin huquqini faqat SQL Editor orqali bering.

## Muhim

- Ishga tushirishdan avval Supabase sozlash talab qilinadi. Credentials bo‘lmasa javoblar saqlanmaydi.
- CSV eksport Excel'da ochiladi (UTF-8 BOM bilan).
- Aniq shaxsni identifikatsiya qiluvchi login talab qilinmagani uchun ism/maktab/sinf bir xil bo‘lgan alohida javoblar bo‘lishi mumkin. Bir so‘rovni qayta yuborish idempotency key bilan himoyalangan.
- Katta auditoriya uchun qo‘shimcha rate limiting / bot protection (masalan, Cloudflare Turnstile) ulash tavsiya etiladi.
- Maktablar va sinflar jadvalida faqat ushbu so‘rovnomada qatnashganlar statistikasi ko‘rsatiladi.
