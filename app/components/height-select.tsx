'use client';
export function formatHeight(inches:number){return `${Math.floor(inches/12)}′${inches%12}″`;}
export default function HeightSelect({value,onChange}:{value:string;onChange:(value:string)=>void}){
 return <label>Height *<select name="height" required value={value} onChange={e=>onChange(e.target.value)}><option value="">Select your height</option>{Array.from({length:65},(_,i)=>i+36).map(n=><option key={n} value={n}>{formatHeight(n)} ({Math.round(n*2.54)} cm)</option>)}</select></label>;
}
