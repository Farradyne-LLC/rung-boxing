'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
export default function AdminForm({action,children,label='SAVE',fixed={}}:{action:string;children?:React.ReactNode;label?:string;fixed?:Record<string,unknown>}){
 const router=useRouter();const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[links,setLinks]=useState<string[]>([]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const form=e.currentTarget;const values:Record<string,unknown>={...Object.fromEntries(new FormData(form)),...fixed};
 for(const field of Array.from(form.querySelectorAll<HTMLInputElement>('input[type=checkbox]')))values[field.name]=field.checked;
 try{const r=await fetch('/api/admin/manage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,data:values})});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage('Saved.');setLinks([d.link_a,d.link_b].filter(Boolean));router.refresh();}catch(e){setMessage(e instanceof Error?e.message:'Could not save.');}finally{setBusy(false);}}
 return <form onSubmit={submit} className="admin-form">{children}<button className="button red" disabled={busy}>{busy?'SAVING…':label}</button>{message&&<p role="status">{message}</p>}{links.length>0&&<div className="notice"><b>Private confirmation links — share only with the intended fighters.</b>{links.map((l,i)=><p key={l}><a href={l} target="_blank" rel="noreferrer">Fighter {i===0?'A':'B'} confirmation link</a><input aria-label={`Fighter ${i===0?'A':'B'} link`} readOnly value={l} onFocus={e=>e.target.select()}/></p>)}</div>}</form>;
}
export function Logout(){return <button className="text-link" onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});location.href='/admin/login';}}>SIGN OUT</button>;}
