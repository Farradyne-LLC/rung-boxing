"use client";
import { useState, type FormEvent } from "react";
import { Arrow } from "./ui";
export default function UpdatesForm() {
  const [done, setDone] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(true);
  }
  return (
    <div>
      {done ? (
        <div className="updates-success" role="status">
          <b>YOU’VE REACHED THE PREVIEW FINISH LINE.</b>
          <p>
            No email was saved or sent. Live updates registration will open with
            the pilot.
          </p>
          <button className="text-link" onClick={() => setDone(false)}>
            TRY AGAIN <Arrow />
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
            <button type="submit" className="button red">
              GET UPDATES <Arrow />
            </button>
          </div>
          <p className="fine">
            Preview only — nothing is sent or saved. This is separate from a
            fighter application.
          </p>
        </form>
      )}
    </div>
  );
}
