export function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function resolveAge(student) {
  const derived = ageFromDob(student?.dateOfBirth);
  return derived != null ? derived : (student?.age ?? null);
}

export function isBirthdayToday(dob) {
  if (!dob) return false;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function dobInputValue(dob) {
  // For <input type="date"> which needs YYYY-MM-DD
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
