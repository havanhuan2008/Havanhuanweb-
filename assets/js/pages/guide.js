import { setActiveTab } from "../ui.js";

export function renderGuide(root){
  setActiveTab("guide");
  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Hướng dẫn</div>
        <div class="muted" style="margin-top:6px">1) Đăng nhập → 2) Nạp tiền → 3) Mua acc</div>
      </div>
    </div>
  `;
}