export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

export function esc(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function vnd(n){
  return Number(n||0).toLocaleString("vi-VN") + "đ";
}

export function toast(title, msg){
  const wrap = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<b>${esc(title)}</b><div class="muted" style="margin-top:4px">${esc(msg)}</div>`;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transform="translateY(6px)"; }, 2400);
  setTimeout(()=> el.remove(), 3000);
}

export function openModal(title, bodyHtml, footHtml=""){
  $("#modalTitle").textContent = title || "Chi tiết";
  $("#modalBody").innerHTML = bodyHtml || "";
  $("#modalFoot").innerHTML = footHtml || "";
  $("#modal").classList.add("open");
  $("#modal").setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
export function closeModal(){
  $("#modal").classList.remove("open");
  $("#modal").setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}

export function setActiveTab(route){
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.route === route));
}