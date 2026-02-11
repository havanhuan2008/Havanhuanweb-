import { toast } from "../ui.js";

export function renderSupport(root){
  root.innerHTML = `
    <div class="container page">
      <div class="card pad">
        <div class="h1">Hỗ trợ</div>
        <div class="muted">Liên hệ CSKH (demo UI)</div>

        <div class="divider"></div>

        <div class="grid" style="gap:12px">
          <div class="card pad" style="background: rgba(255,255,255,.03)">
            <div class="h2">Chat nhanh</div>
            <div class="muted">Nhấn nút để mở khung chat demo.</div>
            <div style="height:10px"></div>
            <button class="btn primary w-full" id="btnChat">Chat với chúng tôi</button>
          </div>

          <div class="card pad" style="background: rgba(255,255,255,.03)">
            <div class="h2">Hotline / Zalo</div>
            <div class="muted">
              Bạn có thể đặt số thật của shop ở đây. (Hiện đang là demo)
            </div>
            <div style="height:10px"></div>
            <div class="badge">SDT & Zalo: <b>0379 62 6666</b></div>
          </div>

          <div class="card pad" style="background: rgba(255,255,255,.03)">
            <div class="h2">FAQ</div>
            <div class="muted">
              • Nạp tiền không vào? → kiểm tra lịch sử nạp<br/>
              • Không mua được? → kiểm tra số dư<br/>
              • Cần đổi mật khẩu? → tab Tài khoản
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btnChat").onclick = () => {
    toast("Chat demo", "Tính năng chat thật cần backend/SDK (Messenger/Zalo).");
  };
}