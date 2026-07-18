/** All 36 Nigerian states + FCT, used across onboarding and profile forms */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT — Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

/** Nigerian phone prefixes (Req 1) */
export const NIGERIAN_PHONE_PREFIXES = [
  "070", "080", "081", "090", "091",
] as const;

/** Validates a Nigerian mobile number (Req 1 criterion 1) */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+234/, "0");
  return (
    /^\d{11}$/.test(cleaned) &&
    NIGERIAN_PHONE_PREFIXES.some((p) => cleaned.startsWith(p))
  );
}
