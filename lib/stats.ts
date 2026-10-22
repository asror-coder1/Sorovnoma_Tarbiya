import {questions,ResponseRow,getOption} from './questions';
export function counts(rows:ResponseRow[],id:number){const q=questions.find(q=>q.id===id);return (q?.options||[]).map(name=>({name,value:rows.filter(r=>getOption(r.answers,id).includes(name)).length}))}
export function grouped(rows:ResponseRow[],field:'school'|'class_name'){const map=new Map<string,number>();rows.forEach(r=>map.set(r[field],(map.get(r[field])||0)+1));return [...map].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)}
export function pct(n:number,total:number){return total?Math.round(n/total*100):0}
export function byDay(rows:ResponseRow[]){const map=new Map<string,number>();rows.forEach(r=>{const d=r.created_at.slice(0,10);map.set(d,(map.get(d)||0)+1)});return [...map].sort((a,b)=>a[0].localeCompare(b[0])).map(([name,value])=>({name,value}))}
