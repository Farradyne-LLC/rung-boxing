"use client";
import { useState } from "react";
import Link from "next/link";
import { Arrow } from "../../components/ui";
const statuses = [
  "Applied",
  "Under Review",
  "Need More Info",
  "Potential Match",
  "Confirmed",
  "Not Matched This Session",
  "Withdrawn / Cancelled",
];
const descriptions: Record<string, string> = {
  Applied: "Application received. Awaiting human review.",
  "Under Review":
    "Review weight, experience, availability and control. Content interest does not affect the decision.",
  "Need More Info":
    "Request the missing boxing or availability details before pairing.",
  "Potential Match":
    "A possible partner has been identified. Final coach approval is still required.",
  Confirmed:
    "Coach-approved pairing. Session details can now be communicated to the participant.",
  "Not Matched This Session":
    "No appropriate partner for this session. The participant has not been booked.",
  "Withdrawn / Cancelled": "This application is no longer active.",
  "Requires Individual Review":
    "Youth application. Private by default. Confirmation is blocked until a separately approved guardian procedure exists.",
};
export default function ReviewDemo() {
  const [youth, setYouth] = useState(false);
  const [status, setStatus] = useState("Applied");
  const [attendance, setAttendance] = useState("Not checked in");
  const [content, setContent] = useState("Not requested");
  const [checks, setChecks] = useState({
    weight: false,
    gear: false,
    coach: false,
  });
  const [pair, setPair] = useState("Public / Private");
  const [approved, setApproved] = useState(false);
  const current = youth ? "Requires Individual Review" : status;
  function changeStatus(next: string) {
    setStatus(next);
    setAttendance("Not checked in");
    setChecks({ weight: false, gear: false, coach: false });
  }
  return (
    <>
      <div className="notice blue-notice">
        <strong>Sample scenarios only</strong>No actual fighter, booking or
        permission is modified. Refreshing resets this demonstration.
      </div>
      <div className="product-grid">
        <div>
          <div className="product-panel">
            <h2>APPLICATION REVIEW</h2>
            <label className="check">
              <input
                type="checkbox"
                checked={youth}
                onChange={(e) => {
                  setYouth(e.target.checked);
                  changeStatus("Applied");
                }}
              />
              <span>Explore an under-18 application</span>
            </label>
            <span className="status-badge" role="status">
              {current}
            </span>
            <div className="status-steps">
              {statuses.map((s) => (
                <button
                  key={s}
                  disabled={youth}
                  aria-pressed={!youth && s === status}
                  onClick={() => changeStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p style={{ marginTop: 22 }}>{descriptions[current]}</p>
            {youth && (
              <div className="notice">
                <strong>Confirmation unavailable</strong>Individual review and a
                separate guardian procedure are required. Youth profiles stay
                private.
              </div>
            )}
          </div>
          <div className="product-panel">
            <h2>ATTENDANCE & CHECK-IN</h2>
            <p>
              Available after confirmation. Weight, equipment and coach checks
              are all required before check-in.
            </p>
            {(["weight", "gear", "coach"] as const).map((key) => (
              <label className="check" key={key}>
                <input
                  type="checkbox"
                  disabled={
                    youth ||
                    status !== "Confirmed" ||
                    attendance !== "Not checked in"
                  }
                  checked={checks[key]}
                  onChange={(e) =>
                    setChecks({ ...checks, [key]: e.target.checked })
                  }
                />
                <span>
                  {key === "weight"
                    ? "Actual weight checked"
                    : key === "gear"
                      ? "Equipment approved"
                      : "Coach readiness check cleared"}
                </span>
              </label>
            ))}
            <div className="actions">
              <button
                className="button outline"
                disabled={
                  youth ||
                  status !== "Confirmed" ||
                  attendance !== "Not checked in" ||
                  !Object.values(checks).every(Boolean)
                }
                onClick={() => setAttendance("Checked in")}
              >
                CHECK IN
              </button>
              <button
                className="button outline"
                disabled={attendance !== "Checked in"}
                onClick={() => setAttendance("Completed")}
              >
                MARK COMPLETE
              </button>
              <button
                className="button outline"
                disabled={
                  youth ||
                  status !== "Confirmed" ||
                  attendance !== "Not checked in"
                }
                onClick={() => setAttendance("No-show")}
              >
                NO-SHOW
              </button>
            </div>
            <p role="status" style={{ marginTop: 18 }}>
              Attendance: <strong>{attendance}</strong>
            </p>
          </div>
        </div>
        <div>
          <div className="product-panel">
            <h2>CONTENT DELIVERY</h2>
            <p>
              Delivery status is separate from application approval and
              attendance. A label alone does not grant access to media.
            </p>
            <label>
              Example content status
              <select
                value={content}
                onChange={(e) => setContent(e.target.value)}
              >
                {[
                  "Not requested",
                  "Awaiting footage",
                  "In editing",
                  "Ready",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="review-detail">
              <div>
                <span>APPLICATION</span>
                <b>{current}</b>
              </div>
              <div>
                <span>ATTENDANCE</span>
                <b>{attendance}</b>
              </div>
              <div>
                <span>CONTENT</span>
                <b>{content}</b>
              </div>
            </div>
          </div>
          <div className="product-panel">
            <h2>PUBLICATION CHECK</h2>
            <label>
              Pair visibility
              <select
                value={pair}
                onChange={(e) => {
                  setPair(e.target.value);
                  setApproved(false);
                }}
              >
                <option>Public / Private</option>
                <option>Public / Public</option>
                <option>Private / Private</option>
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              <span>
                Separate, relevant publication permission confirmed for both
                adult fighters in this example.
              </span>
            </label>
            <div className="notice">
              <strong>
                {approved
                  ? "Eligible for publication review — example only"
                  : "Publication blocked"}
              </strong>
              {approved
                ? "A reviewer still verifies the specific material and permissions before publishing. Nothing is published from this demo."
                : "Public preference does not grant permission. Shared footage stays unpublished without the necessary consent from both participants."}
            </div>
            <Link href="/sessions/demo/rounds/sample" className="text-link">
              VIEW COMPLETED SESSION LAYOUT <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
