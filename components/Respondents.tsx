'use client';

import { useMemo, useState } from 'react';
import { ResponseRow, questions } from '@/lib/questions';
import { Search, Download, X, Eye } from 'lucide-react';

export default function Respondents({ rows }: { rows: ResponseRow[] }) {
  const [query, setQuery] = useState('');
  const [school, setSchool] = useState('');
  const [klass, setKlass] = useState('');
  const [selected, setSelected] = useState<ResponseRow | null>(null);
  const [page, setPage] = useState(1);

  const schools = [...new Set(rows.map((r) => r.school))].sort();
  const classes = [
    ...new Set(rows.filter((r) => !school || r.school === school).map((r) => r.class_name)),
  ].sort();

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!school || r.school === school) &&
          (!klass || r.class_name === klass) &&
          `${r.full_name} ${r.school} ${r.class_name}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [rows, school, klass, query]
  );

  const per = 20;
  const shown = filtered.slice((page - 1) * per, page * per);

  function exportCSV() {
    const header = [
      'Ism va familiya',
      'Maktab',
      'Sinf',
      'Sana',
      ...questions.map((q) => `Savol ${q.id}`),
      'Qo‘shimcha takliflar',
    ];
    const lines = [
      header,
      ...filtered.map((r) => [
        r.full_name,
        r.school,
        r.class_name,
        r.created_at,
        ...questions.map((q) => {
          const v = r.answers[String(q.id)];
          return Array.isArray(v) ? v.join('; ') : v || '';
        }),
        r.answers.extra || '',
      ]),
    ];
    const csv =
      '\ufeff' +
      lines
        .map((line) => line.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(','))
        .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kitobmi-yoki-ekran-javoblar.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="admin-title">
        <div>
          <span>ISHTIROKCHILAR</span>
          <h1>Javoblar ro‘yxati</h1>
          <p>{filtered.length} ta ishtirokchi topildi</p>
        </div>
        <button className="admin-action" onClick={exportCSV}>
          <Download size={17} /> CSV eksport
        </button>
      </div>

      <div className="table-card">
        <div className="table-filters">
          <label className="searchbox">
            <Search size={18} />
            <input
              placeholder="Ism, maktab yoki sinf bo‘yicha qidirish..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            value={school}
            onChange={(e) => {
              setSchool(e.target.value);
              setKlass('');
              setPage(1);
            }}
          >
            <option value="">Barcha maktablar</option>
            {schools.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={klass}
            onChange={(e) => {
              setKlass(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Barcha sinflar</option>
            {classes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ism va familiya</th>
                <th>Maktab</th>
                <th>Sinf</th>
                <th>Sana</th>
                <th>Javoblar</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.full_name}</strong>
                  </td>
                  <td>{r.school}</td>
                  <td>
                    <span className="class-pill">{r.class_name}</span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString('uz-UZ')}</td>
                  <td>
                    <button className="view-btn" onClick={() => setSelected(r)}>
                      <Eye size={15} /> Ko‘rish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shown.length && <p className="empty">Ishtirokchilar topilmadi.</p>}
        </div>

        <div className="pagination">
          <span>
            {filtered.length} ta natija · {page}-sahifa
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage((x) => x - 1)}>
              Oldingi
            </button>
            <button
              disabled={page * per >= filtered.length}
              onClick={() => setPage((x) => x + 1)}
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <h2>{selected.full_name}</h2>
            <p>
              {selected.school} · {selected.class_name}
            </p>
            {questions.map((q) => (
              <div className="modal-answer" key={q.id}>
                <strong>
                  {q.id}. {q.title}
                </strong>
                <div>
                  {Array.isArray(selected.answers[String(q.id)])
                    ? (selected.answers[String(q.id)] as string[]).join(', ')
                    : String(selected.answers[String(q.id)] || '—')}
                </div>
                {(selected.answers._other as unknown as Record<string, string> | undefined)?.[
                  String(q.id)
                ] && (
                  <small>
                    Boshqa:{' '}
                    {
                      (
                        selected.answers._other as unknown as Record<string, string>
                      )[String(q.id)]
                    }
                  </small>
                )}
              </div>
            ))}
            <div className="modal-answer">
              <strong>Qo‘shimcha takliflar</strong>
              <div>{String(selected.answers.extra || '—')}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
