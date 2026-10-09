'use client';
import {useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import HeightSelect from '../components/height-select';
import {ageFromDob} from '../lib/application';
import {track} from '../lib/analytics';
import {applicationSchema,contactSchema,boxingSchema} from '../lib/validation';
import {useApplicationDraft} from '../lib/use-application-draft';
import {requestId as makeRequestId} from '../lib/request-id';
const slots=['Weekday evenings','Weekend mornings','Flexible'];
export default function ApplicationForm({sessions,sessionId,open}:{sessions:{id:string;title:string;date:string}[];sessionId:string;open:boolean}){
 const [step,setStep]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false),[received,setReceived]=useState(false);
 const [d,setD]=useState<Record<string,string|boolean>>({session_id:sessionId,amateur_fights:'0',professional_fights:'0',visibility:'PUBLIC',media_consent:false,marketing_consent:false,competition_experience:'No fights',website:''});
 const requestId=useRef('');const token=useRef('');const started=useRef(false);const heading=useRef<HTMLHeadingElement>(null);
 const [privateRequested,setPrivateRequested]=useState(false);
 const [photos,setPhotos]=useState<File[]>([]);
 const draft=useApplicationDraft('punch-application-v4',d,step,received,(saved,savedStep)=>{setD(old=>({...old,...saved}));setStep(String(saved.last_name||'').trim()?savedStep:0);requestId.current=String(saved.request_id||'');token.current=String(saved.lead_token||'');},2);
 const age=ageFromDob(String(d.date_of_birth||'')),youth=age!==null&&age<18;
 function update(key:string,value:string|boolean){if(!started.current){track('application_started');started.current=true;}setD(old=>({...old,[key]:value,...(key==='professional_fights'&&Number(value)>0?{competition_experience:'Professional'}:{})}));setError('');}
 function field(key:string,label:string,type='text',required=true,min?:number,max?:number){return <label key={key}>{label}{required?'':' (optional)'}<input name={key} type={type} required={required} min={min} max={max} maxLength={type==='tel'?40:1000} autoComplete={({first_name:'given-name',last_name:'family-name',email:'email',phone:'tel',city:'address-level2'})[key]} step={type==='number'?'any':undefined} value={String(d[key]??'')} onChange={e=>update(key,e.target.value)}/></label>;}
 function select(key:string,label:string,options:string[]){return <label>{label}<select name={key} required value={String(d[key]||'')} onChange={e=>update(key,e.target.value)}><option value="">Select</option>{options.map(o=><option key={o}>{o}</option>)}</select></label>;}
 function go(n:number){setStep(n);setTimeout(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'start',behavior:'smooth'});},0);}
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');setBusy(true);
 try{
  if(!requestId.current)requestId.current=makeRequestId();if(!token.current)token.current=makeRequestId().replaceAll('-','')+makeRequestId().replaceAll('-','');
  const values={...d,request_id:requestId.current,lead_token:token.current};setD(values);
  if(step<2){
   const params=new URLSearchParams(location.search);const source={utm_source:params.get('utm_source')?.slice(0,150)||'',utm_medium:params.get('utm_medium')?.slice(0,150)||'',utm_campaign:params.get('utm_campaign')?.slice(0,150)||''};
   const contact=contactSchema.safeParse({...values,source});if(!contact.success)throw new Error(contact.error.issues[0].message);
   const boxing=step===1?boxingSchema.safeParse(values):null;if(boxing&&!boxing.success)throw new Error(boxing.error.issues[0].message);
   const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...contact.data,...(boxing?.success?{boxing:boxing.data}:{})})});const result=await r.json();if(!r.ok)throw new Error(result.error);
   track(step===0?'contact_saved':'boxing_saved');go(step+1);return;
  }
  const parsed=applicationSchema.safeParse({...values,display_name:d.first_name,accuracy_accepted:d.rules_accepted,no_guarantee_accepted:d.rules_accepted,recording_accepted:d.content_accepted,visibility:youth?'PRIVATE':'PUBLIC',media_consent:!youth&&Boolean(d.content_accepted)});
  if(!parsed.success)throw new Error(parsed.error.issues[0].message);
  const form=new FormData();form.set('application',JSON.stringify(parsed.data));photos.forEach(p=>form.append('photos',p));const r=await fetch('/api/applications',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw new Error(data.error);setReceived(true);track('application_submitted');
 }catch(e){setError(e instanceof Error?e.message:'Unable to save. Please try again.');}finally{setBusy(false);}
 }
 async function requestPrivate(){setBusy(true);setError('');try{const r=await fetch('/api/leads/private',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId.current,lead_token:token.current})});if(!r.ok)throw new Error('Unable to save. Please try again.');setPrivateRequested(true);}catch(e){setError(e instanceof Error?e.message:'Unable to save.');}finally{setBusy(false);}}
 if(received)return <div className="form-panel" role="status"><p className="eyebrow">SHOW YOUR ROUNDS</p><h2>APPLICATION RECEIVED.</h2><p>We will review your weight, experience and availability. If we find a suitable pairing, we will send you a confirmation link.</p><p>Applying does not guarantee a matchup. Sparring is free; the $99 Content Pack is optional.</p>{youth&&<p>Your application requires guardian review. Your profile stays private.</p>}<Link className="button red" href="/sessions">EXPLORE SESSIONS</Link>{!youth&&<details><summary>Prefer private footage?</summary><p>Private production is a paid arrangement. Request a quote before confirming your session. Nothing is charged now; this is not a free private hosting plan.</p>{privateRequested?<p>Request saved. Your profile and footage will remain unpublished while we agree the arrangements.</p>:<button type="button" className="button outline" disabled={busy} onClick={requestPrivate}>REQUEST PRIVATE ARRANGEMENTS</button>}{error&&<p role="alert">{error}</p>}</details>}</div>;
 if(!draft.ready)return <p role="status">Loading…</p>;
 return <form className="form-panel lead-first" onSubmit={submit} aria-busy={busy}>
  <div className="step-progress" aria-label={`Step ${step+1} of 3`}>{['CONTACT','BOXING','FINISH'].map((label,i)=><span key={label} className={i<=step?'active':''}>{i+1}. {label}</span>)}</div>
  <h2 ref={heading} tabIndex={-1}>{['LET’S GET YOU ROUNDS.','YOUR BOXING.','READY FOR REVIEW.'][step]}</h2>
  <p>{['Start with your contact details. Sparring is free.','A few details to help us find the right partner.','Two acknowledgements, then you’re done.'][step]}</p>
  {draft.restored&&<p className="fine">Your draft is restored. Continue where you left off.</p>}
  {!open&&<p className="notice">Registration is temporarily unavailable. Please check back soon.</p>}
  <div className="form-grid">
  {step===0&&<>{field('first_name','First name')}{field('last_name','Last name')}{field('email','Email','email')}{field('phone','Phone','tel')}<fieldset className="dob-picker"><legend>Date of birth</legend><div className="dob-fields">{[['Month',12],['Day',31],['Year',100]].map(([label,total],i)=>{const parts=String(d.date_of_birth||'').split('-');const index=[1,2,0][i];return <label key={label}><span className="fine">{label}</span><select aria-label={String(label)} required value={parts[index]||''} onChange={e=>{const next=parts.length===3?parts:['','',''];next[index]=e.target.value;update('date_of_birth',next.join('-'));}}><option value="">{label}</option>{Array.from({length:Number(total)},(_,n)=>i===2?new Date().getFullYear()-n:n+1).map(n=><option key={n} value={i===2?String(n):String(n).padStart(2,'0')}>{i===0?new Date(2000,n-1,1).toLocaleString('en-US',{month:'short'}):n}</option>)}</select></label>;})}</div></fieldset>
   <p className="full fine">Continue saves your contact details so we can follow up about your application. Nothing is published. <Link href="/privacy" target="_blank">Privacy notice</Link>.</p>
   <label className="check-row full"><input type="checkbox" name="marketing_consent" checked={Boolean(d.marketing_consent)} onChange={e=>update('marketing_consent',e.target.checked)}/><span>Email me Punch news and upcoming sessions. Optional.</span></label>
  </>}
  {step===1&&<>{field('city','City')}<HeightSelect value={String(d.height||'')} onChange={value=>update('height',value)}/>{field('current_weight','Weight (lb)','number',true,50,500)}{select('stance','Stance',['Orthodox','Southpaw','Switch'])}{field('years_boxing','Years boxing','number',true,0,90)}{select('skill_level','Boxing level',['Beginner','Developing','Intermediate','Advanced','Competitive amateur','Professional'])}{select('sparring_experience','How often do you spar?',['New to sparring','Occasionally','Weekly','Several times a week'])}{select('preferred_intensity','Preferred rounds',['Technical/light','Controlled/moderate','Competitive technical'])}
   <fieldset className="full availability"><legend>When would you like to spar? Choose all that fit.</legend>{slots.map(s=><label className="choice-chip" key={s}><input type="checkbox" name="availability_slot" value={s} checked={String(d.availability||'').split('; ').includes(s)} onChange={e=>{const selected=String(d.availability||'').split('; ').filter(Boolean).filter(v=>v!==s);if(e.target.checked)selected.push(s);update('availability',selected.join('; '));}}/>{s}</label>)}</fieldset>
   <details className="full optional-details"><summary>Add more details (optional)</summary><div className="form-grid">{field('gym','Gym','text',false)}{field('instagram','Instagram','text',false)}{field('amateur_fights','Amateur fights','number',false,0,1000)}{field('professional_fights','Professional fights','number',false,0,1000)}{field('boxrec_url','BoxRec link','url',false)}{field('video_url','Boxing footage link','url',false)}{sessions.length>0&&<label>Session<select name="session_id" value={String(d.session_id)} onChange={e=>update('session_id',e.target.value)}><option value="">Any suitable session</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>}<label className="full">Notes<textarea name="notes" maxLength={3000} value={String(d.notes||'')} onChange={e=>update('notes',e.target.value)}/></label></div></details>
  </>}
  {step===2&&<><p className="notice full">{youth?'Under-18 applications receive separate guardian review and remain private.':'Your profile is Public by default. Approved boxing information and footage may be published after organizer review. Your phone, email and date of birth stay private.'}</p>
   {youth&&<>{field('guardian_name','Parent / guardian name')}{field('guardian_contact','Parent / guardian email or phone')}</>}
   <label className="check-row full"><input type="checkbox" name="rules_accepted" required checked={Boolean(d.rules_accepted)} onChange={e=>update('rules_accepted',e.target.checked)}/><span>I confirm my details are accurate, understand a matchup is not guaranteed and agree to the <Link href="/terms" target="_blank">participation rules</Link>. I have read the <Link href="/privacy" target="_blank">privacy notice</Link>.</span></label>
   <label className="check-row full"><input type="checkbox" name="content_accepted" required checked={Boolean(d.content_accepted)} onChange={e=>update('content_accepted',e.target.checked)}/><span>{youth?'I understand sessions may be recorded. Any participation and media arrangements require guardian review; this is not guardian authorization.':<>I agree to recording and use of my approved profile and footage on the website, YouTube, social media and advertising under the <Link href="/terms" target="_blank">content terms</Link>.</>}</span></label>
   <p className="full fine">Sparring is free. The $99 Content Pack is optional after confirmation. No payment now. Emergency contact details are collected when you confirm a session.</p>
   <label className="full">Profile photos (optional, up to 3)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length>3||files.some(f=>f.size>5*1024*1024)){setError('Choose up to 3 photos, maximum 5 MB each.');e.target.value='';setPhotos([]);}else{setPhotos(files);setError('');}}}/><span className="fine">JPEG, PNG or WebP · up to 5 MB each. You can add these later. Reselect files after a reload.</span></label>
  </>}
  </div><div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" value={String(d.website)} onChange={e=>update('website',e.target.value)}/></label></div>
  {error&&<p className="form-error" role="alert">{error}</p>}<div className="form-actions">{step>0&&<button type="button" className="button outline" disabled={busy} onClick={()=>go(step-1)}>BACK</button>}<button className="button red" disabled={busy||!open}>{busy?'SAVING…':step===2?'SUBMIT APPLICATION':'CONTINUE →'}</button></div>
 </form>;
}
