export type ApplicationData = Record<string, string | boolean>;
export const consentVersion = "v3-unified-terms-preview-2026-09-26";
export function ageFromDob(dob: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [y, m, d] = dob.split("-").map(Number);
  const birth = new Date(y, m - 1, d);
  if (
    birth.getFullYear() !== y ||
    birth.getMonth() !== m - 1 ||
    birth.getDate() !== d ||
    birth > now
  )
    return null;
  const age =
    now.getFullYear() -
    y -
    Number(
      now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d),
    );
  return age >= 0 && age <= 120 ? age : null;
}
export function normalizeApplication(
  data: ApplicationData,
  now = new Date(),
): ApplicationData {
  const result = { ...data };
  const age = ageFromDob(String(data.dob || ""), now);
  if (age !== null && age < 18) result.visibility = "Private";
  return result;
}
export function reviewStatus(data: ApplicationData, now = new Date()) {
  const age = ageFromDob(String(data.dob || ""), now);
  return age !== null && age < 18 ? "Requires Individual Review" : "Applied";
}
export function validateStep(
  step: number,
  data: ApplicationData,
): string | null {
  const required = [
    ["fullName", "email", "phone", "city", "dob"],
    [
      "weight",
      "height",
      "stance",
      "yearsBoxing",
      "homeGym",
      "coach",
      "sparringExperience",
      "amateurFights",
      "professionalFights",
      "days",
      "times",
      "intensity",
    ],
    [],
    ["termsAccepted"],
  ][step];
  if (
    required?.some((key) =>
      typeof data[key] === "boolean"
        ? !data[key]
        : !String(data[key] ?? "").trim(),
    )
  )
    return "Please complete all required fields before continuing.";
  if (step === 0) {
    if (ageFromDob(String(data.dob)) === null)
      return "Enter a valid date of birth.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email)))
      return "Enter a valid email address.";
  }
  if (step === 1) {
    if (Number(data.weight) <= 0 || Number(data.height) <= 0)
      return "Weight and height must be greater than zero.";
    if (
      Number(data.yearsBoxing) < 0 ||
      Number(data.amateurFights) < 0 ||
      Number(data.professionalFights) < 0
    )
      return "Experience and fight counts cannot be negative.";
  }
  return null;
}
