import fs from 'fs';
import path from 'path';
import { ResponseRow } from './questions';

const sampleResponses: ResponseRow[] = [
  {
    id: 'demo-1',
    full_name: 'Madina Karimova',
    school: '114-maktab',
    class_name: '10-A',
    answers: {
      '1': '1–3 soat',
      '2': 'Dars va ta’lim olish',
      '3': '2–3 ta',
      '4': 'Kitob',
      '5': 'Har hafta',
      '6': ['Qiziqarli hikoyalar', 'Kitobxonlik tanlovlari va sovrinlar'],
      '7': 'Kutubxonadagi kitoblar fondini yangilash va zamonaviy o‘quv zalini tashkil qilish kerak.',
      '8': 'Har kuni kechqurun kamida 45 daqiqa telefonni chetga surib kitob o‘qish odatini shakllantirish zarur.',
      extra: 'Maktabimizda kitobxonlar klubi ochilishini taklif qilaman.',
    },
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    full_name: 'Jasur Bekmurodov',
    school: '21-maktab',
    class_name: '9-B',
    answers: {
      '1': '3–5 soat',
      '2': 'Ijtimoiy tarmoqlar',
      '3': '1 ta',
      '4': 'Telefon',
      '5': 'Juda kam',
      '6': ['Do‘stlar yoki tavsiyalar'],
      '7': 'Elektron kitoblar o‘qish uchun planshetlar yoki kompyuterlar qo‘yilsa zo‘r bo‘lardi.',
      '8': 'Telefonga kitob o‘qish ilovalarini o‘rnatib, ijtimoiy tarmoqlar vaqtiga cheklov qo‘yish kerak.',
      extra: 'Kutubxonada qulay yumshoq o‘rindiqlar bo‘lsa yaxshi bo‘lardi.',
    },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'demo-3',
    full_name: 'Ziyoda Abdullayeva',
    school: '114-maktab',
    class_name: '11-A',
    answers: {
      '1': '1–3 soat',
      '2': 'Dars va ta’lim olish',
      '3': '4 ta yoki undan ko‘p',
      '4': 'Kitob',
      '5': 'Oyiga bir yoki ikki marta',
      '6': ['Qiziqarli hikoyalar', 'Do‘stlar yoki tavsiyalar'],
      '7': 'Yangi badiiy asarlar va chet tili adabiyotlari ko‘paytirilsa ajoyib bo‘lar edi.',
      '8': 'Telefonda vaqtni behuda sarflamay, reja asosida o‘qish lozim.',
      extra: 'Ko‘proq kitob muhokamalari o‘tkazilsin.',
    },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'demo-4',
    full_name: 'Asrorbek Qodirov',
    school: '45-maktab',
    class_name: '10-B',
    answers: {
      '1': '1–3 soat',
      '2': 'Ijtimoiy tarmoqlar',
      '3': '2–3 ta',
      '4': 'Sport yoki sayr',
      '5': 'Oyiga bir yoki ikki marta',
      '6': ['Qiziqarli hikoyalar', 'Kitobxonlik tadbirlari'],
      '7': 'Darsdan keyin erkin mutolaa qilish uchun sokin xona ajratilsa maqsadga muvofiq bo‘lardi.',
      '8': 'Kunda 1 soat kitob mutolaasi uchun alohida vaqt belgilab olish kerak.',
      extra: 'Audio kitoblar bazasi ham yaratilsa yaxshi bo‘lardi.',
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-5',
    full_name: 'Dilnoza Karimova',
    school: '21-maktab',
    class_name: '8-V',
    answers: {
      '1': '1 soatdan kam',
      '2': 'Dars va ta’lim olish',
      '3': '2–3 ta',
      '4': 'Kitob',
      '5': 'Har hafta',
      '6': ['Do‘stlar yoki tavsiyalar', 'Kitobxonlik tanlovlari va sovrinlar'],
      '7': 'Yangi nashrdan chiqqan qiziqarli detektiv va fantastika kitoblari keltirilsin.',
      '8': 'Ota-onalar ham uyda kitob o‘qib o‘rnak bo‘lishlari lozim.',
      extra: 'Maktabda har oy kitobxon o‘quvchi taqdirlansa yaxshi bo‘lardi.',
    },
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// Memory cache fallback for serverless (Vercel)
let memoryCache: ResponseRow[] | null = null;

function getCandidatePaths(): string[] {
  const list: string[] = [];
  try {
    list.push(path.join(process.cwd(), 'data', 'local-responses.json'));
  } catch {}
  try {
    list.push(path.join('/tmp', 'local-responses.json'));
  } catch {}
  return list;
}

export function getLocalResponses(): ResponseRow[] {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  for (const file of getCandidatePaths()) {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache = parsed;
          return parsed;
        }
      }
    } catch {
      // try next path
    }
  }

  memoryCache = sampleResponses;
  return sampleResponses;
}

export function saveLocalResponse(record: {
  id: string;
  submission_key: string;
  full_name: string;
  school: string;
  class_name: string;
  answers: Record<string, any>;
  created_at: string;
}): boolean {
  const current = getLocalResponses();
  const filtered = current.filter(
    (r: any) =>
      r.id !== record.id && (!r.submission_key || r.submission_key !== record.submission_key)
  );
  filtered.unshift(record as ResponseRow);
  memoryCache = filtered;

  let savedToFile = false;

  for (const file of getCandidatePaths()) {
    try {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(filtered, null, 2), 'utf8');
      savedToFile = true;
      break;
    } catch {
      // continue to next path
    }
  }

  return true;
}
