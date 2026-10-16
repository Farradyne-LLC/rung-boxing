'use client';
import {useState} from 'react';
export default function PayButton({endpoint,values}:{endpoint:string;values:Record<string,unknown>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,accept_terms:true})});const d=await r.json();if(!r.ok)throw new Error(d.error);location.assign(d.url);}catch(e){setError(e instanceof Error?e.message:'Checkout is unavailable.');setBusy(false);}}}><label className="check-row"><input type="checkbox" required/><span>I have reviewed and accept the order details shown above.</span></label><button className="button red" disabled={busy}>{busy?'OPENING…':'CONTINUE TO SECURE PAYMENT'}</button>{error&&<p role="alert">{error}</p>}</form>;
}
