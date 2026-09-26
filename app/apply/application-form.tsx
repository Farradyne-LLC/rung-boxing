"use client";
import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { Arrow } from "../components/ui";
import {
  ageFromDob,
  normalizeApplication,
  reviewStatus,
  validateStep,
  consentVersion,
  type ApplicationData,
} from "../lib/application";

const gear = [
  ["headgear", "Headgear"],
  ["mouthguard", "Mouthguard"],
  ["wraps", "Hand wraps"],
  ["groinProtection", "Groin protection"],
  ["gloves", "Suitable gloves (16 oz by default)"],
];
export default function ApplicationForm({
  interested,
}: {
  interested: boolean;
}) {
  const [data, setData] = useState<ApplicationData>({
    visibility: "Public",
    contentInterest: interested ? "Yes" : "Not now",
    stance: "",
    intensity: "",
    amateurFights: "0",
    professionalFights: "0",
  });
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const age = ageFromDob(String(data.dob || ""));
  const youth = age !== null && age < 18;
  const normalized = normalizeApplication(data);
  function update(key: string, value: string | boolean) {
    setData((prev) => normalizeApplication({ ...prev, [key]: value }));
    setError("");
  }
  function move(next: number) {
    setStep(next);
    setError("");
    setTimeout(() => titleRef.current?.focus(), 0);
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const failure = validateStep(step, data);
    if (failure) {
      setError(failure);
      return;
    }
    if (step < 3) {
      move(step + 1);
      return;
    }
    for (let i = 0; i < 3; i++) {
      const issue = validateStep(i, data);
      if (issue) {
        setStep(i);
        setError(issue);
        return;
      }
    }
    setData(normalized);
    setTimestamp(new Date().toISOString());
    setDone(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  }
  function field(
    name: string,
    label: string,
    opts: {
      type?: string;
      placeholder?: string;
      required?: boolean;
      min?: number;
      max?: number;
      step?: string;
      autoComplete?: string;
      full?: boolean;
    } = {},
  ) {
    return (
      <label className={opts.full ? "full" : undefined}>
        {label}
        {opts.required !== false ? " *" : " (optional)"}
        <input
          name={name}
          type={opts.type || "text"}
          value={String(data[name] ?? "")}
          onChange={(e) => update(name, e.target.value)}
          required={opts.required !== false}
          placeholder={opts.placeholder}
          min={opts.min}
          max={opts.max}
          step={opts.step}
          autoComplete={opts.autoComplete}
          maxLength={opts.type === "number" ? undefined : 500}
        />
      </label>
    );
  }
  function select(name: string, label: string, values: string[]) {
    return (
      <label>
        {label} *
        <select
          name={name}
          value={String(data[name] || "")}
          onChange={(e) => update(name, e.target.value)}
          required
        >
          <option value="">Choose an option</option>
          {values.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
    );
  }
  if (done)
    return (
      <div className="application-form">
        <span className="complete-icon" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">PREVIEW COMPLETE · NOTHING SENT</p>
        <h2 ref={titleRef} tabIndex={-1}>
          YOU’VE WALKED
          <br />
          THE FIRST ROUND.
        </h2>
        <p>
          This was a demonstration. Your details were not saved, sent to an
          organizer or used to create a profile.
        </p>
        <div className="notice">
          <strong>Example next status: {reviewStatus(data)}</strong>
          {youth
            ? "A youth application would remain private and require a separate guardian procedure before any confirmation."
            : "A live application would now await human review. This is not a confirmed session."}
        </div>
        <dl className="review-list">
          <div>
            <dt>Visibility preference</dt>
            <dd>{String(normalized.visibility)}</dd>
          </div>
          <div>
            <dt>Content interest</dt>
            <dd>{String(data.contentInterest)}</dd>
          </div>
          <div>
            <dt>Publication</dt>
            <dd>Nothing published</dd>
          </div>
        </dl>
        <ol className="status-trail">
          <li className="current">
            <strong>
              {youth
                ? "Individual review required"
                : "Application received — live example"}
            </strong>
            <p>
              Only shown as a received application after successful storage in
              the live version.
            </p>
          </li>
          <li>
            <strong>Match review</strong>
            <p>A coach reviews suitability and available partners.</p>
          </li>
          <li>
            <strong>Confirmation</strong>
            <p>Separate communication if a suitable match is found.</p>
          </li>
        </ol>
        <p className="fine">
          Demo terms version: {consentVersion}
          <br />
          Demonstration timestamp: {timestamp}
          <br />
          Choices exist only in this page’s memory and disappear when you leave
          or refresh.
        </p>
        <div className="form-actions">
          <button
            className="button black"
            onClick={() => {
              setDone(false);
              move(3);
            }}
          >
            REVIEW CHOICES
          </button>
          <Link href="/" className="button red">
            BACK TO HOME <Arrow />
          </Link>
        </div>
      </div>
    );
  return (
    <form ref={formRef} className="application-form" onSubmit={submit}>
      <ol className="form-progress" aria-label="Application steps">
        {["ABOUT YOU", "YOUR BOXING", "PREFERENCES", "REVIEW"].map(
          (name, i) => (
            <li
              key={name}
              className={i === step ? "active" : i < step ? "done" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              0{i + 1}
              <br />
              {name}
            </li>
          ),
        )}
      </ol>
      <h2 ref={titleRef} tabIndex={-1}>
        {
          [
            "START WITH YOU.",
            "TELL US HOW YOU BOX.",
            "YOUR ROUNDS. YOUR CHOICE.",
            "CHECK YOUR CORNER.",
          ][step]
        }
      </h2>
      <p>
        Preview application. Use sample details — nothing is sent or saved.
        Required fields are marked *.
      </p>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {step === 0 && (
        <>
          <div className="form-grid">
            {field("fullName", "Full name", { autoComplete: "name" })}
            {field("dob", "Date of birth", {
              type: "date",
              autoComplete: "bday",
            })}
            {field("email", "Email", { type: "email", autoComplete: "email" })}
            {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
            {field("city", "City", {
              autoComplete: "address-level2",
              placeholder: "e.g. Los Angeles",
            })}
            {field("instagram", "Instagram", {
              required: false,
              placeholder: "@handle",
            })}
          </div>
          {youth && (
            <div className="notice" role="status">
              <strong>Youth Application — Individual Review Required</strong>
              Standard participation is 18+. Your application would require
              separate review and parent/guardian consent. Your profile remains
              private. No automatic approval.
            </div>
          )}
        </>
      )}
      {step === 1 && (
        <>
          <div className="form-grid">
            {field("weight", "Current weight (lb)", {
              type: "number",
              min: 1,
              max: 1000,
              step: "0.1",
            })}
            {field("height", "Height (inches)", {
              type: "number",
              min: 1,
              max: 120,
              step: "0.1",
              placeholder: "e.g. 70",
            })}
            {select("stance", "Stance", ["Orthodox", "Southpaw", "Switch"])}
            {field("yearsBoxing", "Years boxing", {
              type: "number",
              min: 0,
              max: 100,
              step: "0.5",
            })}
            {field("homeGym", "Home gym", { placeholder: "Gym name" })}
            {field("coach", "Coach", {
              placeholder: "Name, or “No current coach”",
            })}
            {field("amateurFights", "Amateur fights", {
              type: "number",
              min: 0,
              max: 1000,
            })}
            {field("professionalFights", "Professional fights", {
              type: "number",
              min: 0,
              max: 1000,
            })}
            <label className="full">
              Sparring experience *
              <textarea
                name="sparringExperience"
                value={String(data.sparringExperience || "")}
                onChange={(e) => update("sparringExperience", e.target.value)}
                required
                maxLength={2000}
                placeholder="How often do you spar? Typical rounds and partner experience?"
              />
            </label>
            {field("videoLink", "Sparring / boxing video link", {
              required: false,
              type: "url",
              placeholder: "https://",
              full: true,
            })}
            {field("days", "Preferred days", {
              placeholder: "e.g. Saturday, Sunday",
            })}
            {field("times", "Preferred times", {
              placeholder: "e.g. Weekend mornings",
            })}
            {select("intensity", "Preferred intensity", [
              "Light technical",
              "Controlled technical",
              "Coach guidance requested",
            ])}
            <label>
              Session
              <select name="event" value="future" disabled>
                <option value="future">
                  Future sessions — date unconfirmed
                </option>
              </select>
            </label>
          </div>
          <fieldset className="choice-group">
            <legend>Your equipment</legend>
            <p className="field-help">
              Select what you have. Missing gear is flagged for review, not
              hidden. All required equipment must be cleared before sparring.
            </p>
            {gear.map(([key, label]) => (
              <label key={key} className="check">
                <input
                  type="checkbox"
                  name={key}
                  checked={!!data[key]}
                  onChange={(e) => update(key, e.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </>
      )}
      {step === 2 && (
        <>
          <fieldset className="choice-group">
            <legend>Interested in the optional $69 content package?</legend>
            <p className="field-help">
              Recorded sparring, one personal highlight and a portfolio entry.
              No payment now. Final scope and delivery details will be confirmed
              before a sale.
            </p>
            <div className="radio-options">
              {["Yes", "Not now"].map((value) => (
                <label
                  className={`radio-card ${data.contentInterest === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    name="contentInterest"
                    value={value}
                    checked={data.contentInterest === value}
                    onChange={() => update("contentInterest", value)}
                  />
                  <b>
                    {value === "Yes"
                      ? "Interested in content"
                      : "Just the rounds"}
                  </b>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-group">
            <legend>Profile & content visibility</legend>
            <div className="radio-options">
              {["Public", "Private"].map((value) => (
                <label
                  className={`radio-card ${normalized.visibility === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={value}
                    disabled={youth && value === "Public"}
                    checked={normalized.visibility === value}
                    onChange={() => update("visibility", value)}
                  />
                  <div>
                    <b>{value}</b>
                    <span>
                      {value === "Public"
                        ? "Your profile and session content may appear on our website, social channels, YouTube and advertising under the Terms."
                        : "Your profile and footage stay off public pages, social channels and advertising. Recording and content ownership still follow the Terms."}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="field-help">
            A fighter profile is part of every application. Public / Private
            controls visibility, not whether a profile is created or who owns
            Punch Mentality-produced content.
          </p>
          {youth && (
            <div className="notice">
              <strong>Youth profiles stay private.</strong>Individual review and
              a separate guardian procedure are required before participation.
            </div>
          )}
          <p className="field-help">
            Recording, editing, content ownership and permitted uses are covered
            together in the{" "}
            <Link href="/terms" target="_blank">
              Terms of Participation &amp; Content
            </Link>
            . You accept them once at the final step.
          </p>
        </>
      )}
      {step === 3 && (
        <>
          <dl className="review-list">
            {[
              ["Name", data.fullName],
              ["City", data.city],
              ["Weight / stance", `${data.weight} lb · ${data.stance}`],
              ["Home gym", data.homeGym],
              ["Availability", `${data.days} · ${data.times}`],
              ["Visibility", normalized.visibility],
              ["Content interest", data.contentInterest],
              ["Example review status", reviewStatus(data)],
            ].map(([key, value]) => (
              <div key={String(key)}>
                <dt>{key}</dt>
                <dd>{String(value || "—")}</dd>
              </div>
            ))}
          </dl>
          <div className="notice">
            <strong>Equipment check</strong>
            {gear.filter(([key]) => !data[key]).length
              ? `Still to confirm: ${gear
                  .filter(([key]) => !data[key])
                  .map(([, label]) => label)
                  .join(", ")}.`
              : "All listed equipment confirmed for this preview."}{" "}
            Final gear and weight checks happen on site.
          </div>
          <p className="field-help">
            Every application includes a fighter profile. Participation still
            requires review, a suitable partner and coach approval.
          </p>
          <label className="check">
            <input
              name="termsAccepted"
              type="checkbox"
              checked={!!data.termsAccepted}
              onChange={(e) => update("termsAccepted", e.target.checked)}
              required
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank">
                Terms of Participation &amp; Content
              </Link>
              , including recording, editing, Punch Mentality’s content
              ownership and use under my selected Public / Private setting. *
            </span>
          </label>
          <p className="field-help">
            Acceptance is required to register. This preview does not submit an
            application or sign an agreement.
          </p>{" "}
          <p className="fine">
            No newsletter subscription is included. Your data stays in this
            page’s memory only.
          </p>
        </>
      )}
      <div className="form-actions">
        {step > 0 ? (
          <button
            type="button"
            className="button back-button"
            onClick={() => move(step - 1)}
          >
            BACK
          </button>
        ) : (
          <span />
        )}
        <button className="button red" type="submit">
          {step === 3 ? "FINISH PREVIEW" : "CONTINUE"} <Arrow />
        </button>
      </div>
    </form>
  );
}
