export const requiredProfileFields = ["fullName", "phone", "address", "city", "country"];

export function missingProfileFields(profile) {
  return requiredProfileFields.filter((field) => !String(profile?.[field] ?? "").trim());
}

export function isProfileComplete(profile) {
  return missingProfileFields(profile).length === 0;
}
