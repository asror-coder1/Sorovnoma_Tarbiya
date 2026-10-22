export type Question = {id:number; title:string; options?:string[]; multiple?:boolean; type?:'text'; icon:string};
export const questions:Question[]=[
{id:1,title:'Bir kunda telefondan taxminan qancha vaqt foydalanasiz?',options:['1 soatdan kam','1–3 soat','3–5 soat','5 soatdan ko‘p'],icon:'📱'},
{id:2,title:'Telefonda asosan nima qilasiz?',options:['Dars va ta’lim olish','Ijtimoiy tarmoqlar','Video va filmlar','O‘yinlar','Boshqa'],icon:'🎮'},
{id:3,title:'Oxirgi bir oyda darsliklardan tashqari nechta kitob o‘qidingiz?',options:['Hech qanday','1 ta','2–3 ta','4 ta yoki undan ko‘p'],icon:'📖'},
{id:4,title:'Bo‘sh vaqtingizda qaysi birini ko‘proq tanlaysiz?',options:['Telefon','Kitob','Sport yoki sayr','Do‘stlar bilan vaqt o‘tkazish','Boshqa'],icon:'⏰'},
{id:5,title:'Kutubxonaga qanchalik tez-tez borasiz?',options:['Har hafta','Oyiga bir yoki ikki marta','Juda kam','Umuman bormayman','Boshqa'],icon:'🏛️'},
{id:6,title:'Nima sizni ko‘proq kitob o‘qishga undaydi?',options:['Qiziqarli hikoyalar','Do‘stlar yoki tavsiyalar','Maktabdagi kitobxonlik tadbirlari','Kitobxonlik tanlovlari va sovrinlar','Hozircha kitob o‘qishga qiziqmayman','Boshqa'],multiple:true,icon:'📚'},
{id:7,title:'Maktab kutubxonasida nimalarni o‘zgartirgan bo‘lardingiz?',type:'text',icon:'💡'},
{id:8,title:'Telefon ishlatish va kitob o‘qish o‘rtasida muvozanatni qanday saqlash mumkin deb o‘ylaysiz?',type:'text',icon:'⚖️'}
];
export type Answers=Record<string,string|string[]>;
export type ResponseRow={id:string;full_name:string;school:string;class_name:string;answers:Answers;created_at:string};
export function getOption(a:Answers, id:number):string[]{const v=a[String(id)];return Array.isArray(v)?v:typeof v==='string'?[v]:[]}
