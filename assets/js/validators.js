export function isEmail(s){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim());
}
export function isStrongPass(s){
  return String(s||"").length >= 6;
}