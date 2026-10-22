import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Kitobmi yoki ekran? | So‘rovnoma',description:'O‘quvchilar o‘rtasida kitobxonlik va ekran vaqti so‘rovnomasi'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>}
