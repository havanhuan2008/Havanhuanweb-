export function isEmail(s){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}
export function isStrongPass(s){
  return String(s || "").length >= 6;
}
export function formatVND(n){
  const x = Number(n || 0);
  return x.toLocaleString("vi-VN") + "đ";
}
export function uid(prefix="id"){
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}