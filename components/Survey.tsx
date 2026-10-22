'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions, Answers, Question } from '@/lib/questions';
import { ArrowLeft, ArrowRight, Send, BookOpen, CheckCircle2 } from 'lucide-react';

type Student = {
  full_name: string;
  school: string;
  class_name: string;
};

const initial: Student = {
  full_name: '',
  school: '',
  class_name: '',
};

export default function Survey() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [student, setStudent] = useState<Student>(initial);
  const [answers, setAnswers] = useState<Answers>({});
  const [other, setOther] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submissionKey, setSubmissionKey] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('book-survey-draft');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setStudent(d.student || initial);
        setAnswers(d.answers || {});
        setOther(d.other || {});
        setConsent(!!d.consent);
      } catch {
        // ignore parse error
      }
    }
    setSubmissionKey(sessionStorage.getItem('book-survey-key') || crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (submissionKey) {
      sessionStorage.setItem('book-survey-key', submissionKey);
      sessionStorage.setItem(
        'book-survey-draft',
        JSON.stringify({ student, answers, other, consent })
      );
    }
  }, [student, answers, other, consent, submissionKey]);

  const update = (k: keyof Student, v: string) => setStudent((s) => ({ ...s, [k]: v }));

  const choose = (q: Question, v: string) => {
    setAnswers((a) => {
      if (q.multiple) {
        const old = Array.isArray(a[String(q.id)]) ? (a[String(q.id)] as string[]) : [];
        return {
          ...a,
          [q.id]: old.includes(v) ? old.filter((x) => x !== v) : [...old, v],
        };
      }
      return { ...a, [q.id]: v };
    });
    setError('');
  };

  const validate = () => {
    if (step === 0) {
      if (
        student.full_name.trim().length < 3 ||
        student.school.trim().length < 2 ||
        !/^\d{1,2}[- ]?[A-Za-zА-Яа-яЁё]{1,3}$/.test(student.class_name.trim())
      ) {
        return 'Ism-familiya, maktab va sinfni to‘g‘ri kiriting (masalan: 10-B).';
      }
      if (!consent) {
        return 'Davom etish uchun maxfiylik xabarini tasdiqlang.';
      }
    } else {
      const qs = step === 1 ? questions.slice(0, 5) : questions.slice(5);
      for (const q of qs) {
        const a = answers[String(q.id)];
        if (q.type === 'text') {
          if (typeof a !== 'string' || a.trim().length < 5) {
            return `${q.id}-savolga kamida 5 ta belgi bilan javob yozing.`;
          }
        } else if (!a || (Array.isArray(a) && !a.length)) {
          return `${q.id}-savolga javob bering.`;
        }
        if (
          q.options?.includes('Boshqa') &&
          (Array.isArray(a) ? a.includes('Boshqa') : a === 'Boshqa') &&
          !(other[String(q.id)] || '').trim()
        ) {
          return `${q.id}-savolda “Boshqa” javobini izohlang.`;
        }
      }
    }
    return '';
  };

  const next = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student, answers, other, consent, submissionKey }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) {
          throw new Error('Serverda xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.');
        }
      }
      if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
      sessionStorage.removeItem('book-survey-draft');
      sessionStorage.removeItem('book-survey-key');
      router.push('/success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Internet aloqasini tekshiring');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="library-scene survey-scene">
      <div className="shelf shelf-left" />
      <div className="shelf shelf-right" />
      <div className="survey-shell">
        <aside className="survey-side">
          <div className="side-icon">📖</div>
          <div className="side-label">O‘quvchilar o‘rtasida anonim bo‘lmagan so‘rovnoma</div>
          <h1>
            KITOBMI
            <br />
            <em>YOKI EKRAN?</em>
          </h1>
          <p>
            Sening fikring —
            <br /> bizning kelajagimiz!
          </p>
          <div className="book-stack">📚</div>
          <small>“Yaxshi kitob — bu yaxshi do‘st.”</small>
        </aside>

        <section className="survey-paper paper">
          <div className="survey-progress">
            <span>{step === 0 ? 'Boshlash' : `0${step} / 02`}</span>
            <span>
              {step === 0 ? 'Ma’lumotlaringiz' : step === 1 ? '1–5-savollar' : '6–8-savollar'}
            </span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>

          {step === 0 ? (
            <div className="identity">
              <div className="section-icon">🎓</div>
              <h2>Avval tanishib olaylik!</h2>
              <p>So‘rovnomani boshlash uchun uchta ma’lumotni kiriting.</p>
              <label>
                Ism va familiya
                <input
                  maxLength={100}
                  value={student.full_name}
                  placeholder="Masalan: Ali Valiyev"
                  onChange={(e) => update('full_name', e.target.value)}
                />
              </label>
              <label>
                Maktab
                <input
                  maxLength={120}
                  value={student.school}
                  placeholder="Masalan: 114-maktab"
                  onChange={(e) => update('school', e.target.value)}
                />
              </label>
              <label>
                Sinf
                <input
                  maxLength={12}
                  value={student.class_name}
                  placeholder="Masalan: 10-B"
                  onChange={(e) => update('class_name', e.target.value)}
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Ismim, maktabim, sinfim va javoblarim so‘rovnoma administratori tomonidan
                  ko‘rilishi hamda kitobxonlik bo‘yicha umumiy tahlil uchun ishlatilishini
                  tushundim.
                </span>
              </label>
            </div>
          ) : (
            <>
              <header className="question-page-heading">
                <BookOpen size={23} />
                <div>
                  <h2>{step === 1 ? 'Telefon va kitobxonlik' : 'Kutubxona va takliflar'}</h2>
                  <p>O‘zingizga mos javoblarni belgilang</p>
                </div>
              </header>
              {(step === 1 ? questions.slice(0, 5) : questions.slice(5)).map((q) => (
                <article className="question-row" key={q.id}>
                  <div className="question-number">{q.id}</div>
                  <div className="question-main">
                    <h3>{q.title}</h3>
                    {q.multiple && <small>Bir nechtasini tanlashingiz mumkin</small>}
                    <span className="question-art">{q.icon}</span>
                  </div>
                  <div className="answer-list">
                    {q.type === 'text' ? (
                      <textarea
                        rows={4}
                        maxLength={1500}
                        value={
                          typeof answers[String(q.id)] === 'string'
                            ? (answers[String(q.id)] as string)
                            : ''
                        }
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                        placeholder="Fikringizni yozing..."
                      />
                    ) : (
                      q.options?.map((option) => {
                        const value = answers[String(q.id)];
                        const checked = Array.isArray(value)
                          ? value.includes(option)
                          : value === option;
                        return (
                          <div key={option}>
                            <label className="answer-option">
                              <input
                                type={q.multiple ? 'checkbox' : 'radio'}
                                name={`q-${q.id}`}
                                checked={checked}
                                onChange={() => choose(q, option)}
                              />
                              <span className="fake-check">{checked ? '✓' : ''}</span>
                              <span>{option}</span>
                            </label>
                            {option === 'Boshqa' && checked && (
                              <input
                                className="other-input"
                                maxLength={300}
                                placeholder="Javobingizni yozing..."
                                value={other[String(q.id)] || ''}
                                onChange={(e) =>
                                  setOther((o) => ({ ...o, [q.id]: e.target.value }))
                                }
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              ))}
              {step === 2 && (
                <div className="suggestion-box">
                  <div className="suggestion-icon">🌱</div>
                  <div>
                    <h3>Qo‘shimcha takliflar</h3>
                    <p>
                      Agar kitobxonlik madaniyatini yaxshilash bo‘yicha boshqa takliflaringiz
                      bo‘lsa, yozib qoldiring.
                    </p>
                    <textarea
                      rows={3}
                      maxLength={1500}
                      placeholder="Takliflaringiz..."
                      value={typeof answers.extra === 'string' ? answers.extra : ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, extra: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <footer className="survey-actions">
            {step > 0 ? (
              <button
                className="secondary-btn"
                onClick={() => {
                  setError('');
                  setStep((s) => s - 1);
                }}
              >
                <ArrowLeft size={18} /> Ortga
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button className="primary-btn" onClick={next}>
                Davom etish <ArrowRight size={18} />
              </button>
            ) : (
              <button className="primary-btn" disabled={busy} onClick={submit}>
                {busy ? 'Yuborilmoqda...' : 'Javoblarni yuborish'} <Send size={17} />
              </button>
            )}
          </footer>
          <div className="survey-footnote">
            <CheckCircle2 size={14} /> Javoblaringiz xavfsiz saqlanadi
          </div>
        </section>
      </div>
    </main>
  );
}
