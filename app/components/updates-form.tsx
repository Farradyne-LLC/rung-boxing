"use client";
import { useState, type FormEvent } from "react";
import { Arrow } from "./ui";
export default function UpdatesForm() {
  const [done, setDone] = useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields=new FormData(e.currentTarget);setBusy(true);setError('');
    try{const r=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({firstName:fields.get('firstName'),email:fields.get('email'),consent:fields.get('consent')==='on',website:fields.get('website')||''})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to subscribe.');setDone(true);}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}
  }
  return (
    <div>
      {done ? (
        <div className="updates-success" role="status">
          <b>YOU’RE ON THE LIST.</b>
          <p>
            Your subscription has been saved. We will share Punch session news and updates.
          </p>
          <button className="text-link" onClick={() => setDone(false)}>
            ADD ANOTHER EMAIL <Arrow />
          </button>
        </div>
      ) : (
        <form className="updates-form" onSubmit={submit}>
          <div className="updates-fields">
            <label>
              First name
              <input
                name="firstName"
                autoComplete="given-name"
                placeholder="Your first name"
                required
                maxLength={80}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
              />
            </label>

          </div>
          <label className="check-row"><input type="checkbox" name="consent" required/><span>I would like to receive Punch Mentality news and session updates by email.</span></label>
            <button type="submit" className="button red" disabled={busy}>
              {busy?'SAVING…':'GET UPDATES'} <Arrow />
            </button>
          <div className="honeypot" aria-hidden="true"><input aria-label="Leave empty" name="website" tabIndex={-1} autoComplete="off"/></div>
          {error&&<p className="form-error" role="alert">{error}</p>}
          <p className="fine">
            Separate from a fighter application. See our <a href="/privacy">privacy notice</a>.
          </p>
        </form>
      )}
    </div>
  );
}
