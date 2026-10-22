import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serverClient } from '@/lib/supabase';
import { questions } from '@/lib/questions';
import { saveLocalResponse } from '@/lib/local-storage';

const schema = z.object({
  student: z.object({
    full_name: z.string().trim().min(3).max(100),
    school: z.string().trim().min(2).max(120),
    class_name: z
      .string()
      .trim()
      .regex(/^\d{1,2}[- ]?[A-Za-zА-Яа-яЁё]{1,3}$/)
      .max(12),
  }),
  answers: z.record(z.union([z.string().max(1500), z.array(z.string().max(150)).max(6)])),
  other: z.record(z.string().max(300)),
  consent: z.literal(true),
  submissionKey: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Kiritilgan ma’lumotlarni tekshiring.' },
        { status: 400 }
      );
    }

    const { student, answers, other, submissionKey } = parsed.data;

    for (const q of questions) {
      const a = answers[String(q.id)];
      if (q.type === 'text') {
        if (typeof a !== 'string' || a.trim().length < 5) {
          return NextResponse.json(
            { error: `${q.id}-savolni to‘ldiring.` },
            { status: 400 }
          );
        }
      } else {
        const values = Array.isArray(a) ? a : [a];
        if (
          !values.length ||
          (!q.multiple && values.length !== 1) ||
          values.some((v) => !q.options?.includes(v))
        ) {
          return NextResponse.json(
            { error: `${q.id}-savol javobi noto‘g‘ri.` },
            { status: 400 }
          );
        }
        if (values.includes('Boshqa') && !other[String(q.id)]?.trim()) {
          return NextResponse.json(
            { error: 'Boshqa javobini izohlang.' },
            { status: 400 }
          );
        }
      }
    }

    const isSupabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR_PROJECT') &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

    let savedInSupabase = false;

    if (isSupabaseConfigured) {
      try {
        const sb = await serverClient();
        const { error } = await sb.rpc('submit_survey', {
          p_submission_key: submissionKey,
          p_full_name: student.full_name,
          p_school: student.school,
          p_class_name: student.class_name,
          p_answers: answers,
          p_other: other,
        });

        if (!error) {
          savedInSupabase = true;
        } else {
          console.warn('Supabase save error, falling back to local storage:', error.message || error.code);
        }
      } catch (sbErr) {
        console.warn('Supabase connection failed, falling back to local storage:', sbErr);
      }
    }

    if (!savedInSupabase) {
      // Save locally so the user's submission is never lost
      saveLocalResponse({
        id: crypto.randomUUID(),
        submission_key: submissionKey,
        full_name: student.full_name,
        school: student.school,
        class_name: student.class_name.toUpperCase().replace(/\s+/g, '-'),
        answers: {
          ...answers,
          _other: other,
        },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Submit API error:', err);
    return NextResponse.json(
      { error: 'So‘rovni qayta yuboring yoki maydonlarni tekshiring.' },
      { status: 400 }
    );
  }
}
