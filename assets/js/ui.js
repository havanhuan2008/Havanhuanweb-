import { formatVND } from "./validators.js";
import { ensureState, getSessionUser } from "./store.js";

export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export function toast(title, msg, type="info") {
  const wrap = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div>
      <div class="t-title">${escapeHtml(title)}</div>
      <div class="t-msg">${escapeHtml(msg)}</div>
    </div>
    <button class="icon-btn" aria-label="Đóng">
      <span class="i i-x" aria-hidden="true"></span>
    </button>
  `;
  const btn = el.querySelector("button");
  btn.addEventListener("click", () => el.remove());
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(6px)"; }, 2600);
  setTimeout(() => el.remove(), 3050);
}

export function openModal({ title, bodyHtml, footHtml="" }) {
  const modal = $("#modal");
  $("#modalTitle").textContent = title || "Chi tiết";
  $("#modalBody").innerHTML = bodyHtml || "";
  $("#modalFoot").innerHTML = footHtml || "";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

export function closeModal() {
  const modal = $("#modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

export function bindModal() {
  $("#modalBackdrop").addEventListener("click", closeModal);
  $("#modalClose").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

export function setActiveTab(routeName) {
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.route === routeName));
}

export function moneySummary() {
  const state = ensureState();
  const u = getSessionUser(state);
  const balance = u?.wallet?.balance ?? 0;
  const promo = u?.wallet?.promo ?? 0;
  const id = u?.publicId ?? "—";
  const name = u?.name ?? "Khách";
  return { balance, promo, id, name };
}

export function renderMiniUser() {
  const { balance, id, name } = moneySummary();
  $("#miniName").textContent = name;
  $("#miniBalance").textContent = formatVND(balance);
  $("#miniId").textContent = id;
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function skeletonCards(n=6){
  const items = Array.from({length:n}).map(() => `
    <div class="card product">
      <div class="thumb"></div>
      <div class="product-body">
        <div class="badge" style="width:70%; height:14px;"></div>
        <div class="badge" style="width:55%; height:14px; margin-top:10px;"></div>
        <div class="badge" style="width:45%; height:14px; margin-top:10px;"></div>
        <div class="product-actions">
          <div class="btn w-full" style="opacity:.5">Đang tải...</div>
        </div>
      </div>
    </div>
  `).join("");
  return `<div class="grid products">${items}</div>`;
}