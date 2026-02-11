import { $, toast, escapeHtml } from "../ui.js";
import { ensureState, setState, getSessionUser } from "../store.js";
import { isEmail, isStrongPass, formatVND, uid } from "../validators.js";

function publicId6(){
  return String(Math.floor(100000 + Math.random()*900000));
}

function renderAuth(){
  return `
    <div class="card pad">
      <div class="h1">Tài khoản</div>
      <div class="muted">Đăng nhập/Đăng ký (demo frontend-only)</div>

      <div class="divider"></div>

      <div class="row">
        <div class="card pad" style="background: rgba(255,255,255,.03)">
          <div class="h2">Đăng nhập</div>
          <div class="form">
            <div class="field">
              <div class="label">Email</div>
              <input class="input" id="loginEmail" placeholder="name@email.com" />
            </div>
            <div class="field">
              <div class="label">Mật khẩu</div>
              <input class="input" id="loginPass" type="password" placeholder="Tối thiểu 6 ký tự" />
            </div>
            <button class="btn primary w-full" id="btnLogin">Đăng nhập</button>
            <div class="muted">Tip: đăng ký mới ở cột bên phải.</div>
          </div>
        </div>

        <div class="card pad" style="background: rgba(255,255,255,.03)">
          <div class="h2">Đăng ký</div>
          <div class="form">
            <div class="field">
              <div class="label">Họ tên</div>
              <input class="input" id="regName" placeholder="Ví dụ: Lê Hà Huấn" />
            </div>
            <div class="field">
              <div class="label">Email</div>
              <input class="input" id="regEmail" placeholder="name@email.com" />
            </div>
            <div class="field">
              <div class="label">Mật khẩu</div>
              <input class="input" id="regPass" type="password" placeholder="Tối thiểu 6 ký tự" />
            </div>
            <button class="btn primary w-full" id="btnRegister">Tạo tài khoản</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfile(user, tab, state){
  const balance = user.wallet?.balance ?? 0;
  const promo = user.wallet?.promo ?? 0;

  const tabs = [
    {k:"profile", t:"Thông tin"},
    {k:"orders", t:"Lịch sử mua nick"},
    {k:"deposits", t:"Lịch sử nạp"}
  ];

  const tabButtons = tabs.map(x => `
    <button class="pill ${tab===x.k ? "active":""}" data-tab="${x.k}">${x.t}</button>
  `).join("");

  const content = tab === "orders"
    ? renderOrders(state)
    : tab === "deposits"
      ? renderDeposits(state)
      : renderInfo(user);

  return `
    <div class="card pad">
      <div class="h1">Tài khoản</div>
      <div class="muted">Quản lý ví, lịch sử giao dịch (demo)</div>

      <div class="divider"></div>

      <div class="card pad" style="background: rgba(255,255,255,.03)">
        <div class="row">
          <div>
            <div class="badge">Xin chào, <b>${escapeHtml(user.name)}</b></div>
            <div style="height:10px"></div>
            <div class="grid" style="gap:10px">
              <div class="badge">ID: <b>${escapeHtml(user.publicId)}</b></div>
              <div class="badge">Số dư: <b>${formatVND(balance)}</b></div>
              <div class="badge">Khuyến mãi: <b>${formatVND(promo)}</b></div>
            </div>
          </div>
          <div>
            <button class="btn primary w-full" onclick="location.hash='#/topup'">Nạp tiền</button>
            <div style="height:10px"></div>
            <button class="btn w-full" id="btnResetDemo">Reset dữ liệu demo</button>
          </div>
        </div>
      </div>

      <div style="height:12px"></div>
      <div class="pills" id="acctTabs">${tabButtons}</div>

      <div style="height:12px"></div>
      ${content}
    </div>
  `;
}

function renderInfo(user){
  return `
    <div class="card pad">
      <div class="h2">Thông tin</div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>Trường</th><th>Giá trị</th></tr>
          </thead>
          <tbody>
            <tr><td>Họ tên</td><td><b>${escapeHtml(user.name)}</b></td></tr>
            <tr><td>Email</td><td>${escapeHtml(user.email)}</td></tr>
            <tr><td>Trạng thái</td><td><span class="badge">Đã xác thực (demo)</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOrders(state){
  const uidSession = state.session.userId;
  const list = state.orders.filter(x => x.userId === uidSession);

  if (!list.length) {
    return `
      <div class="card pad">
        <div class="h2">Lịch sử mua nick</div>
        <div class="muted">Bạn chưa có đơn hàng nào.</div>
        <div style="height:10px"></div>
        <button class="btn primary w-full" onclick="location.hash='#/home'">Mua ngay</button>
      </div>
    `;
  }

  const rows = list.map(x => `
    <tr>
      <td>${new Date(x.time).toLocaleString("vi-VN")}</td>
      <td><b>${escapeHtml(x.productTitle)}</b><div class="muted">${escapeHtml(x.productId)}</div></td>
      <td><b style="color:rgba(245,158,11,1)">${formatVND(x.price)}</b></td>
      <td>${escapeHtml(x.status)}</td>
    </tr>
  `).join("");

  return `
    <div class="card pad">
      <div class="h2">Lịch sử mua nick</div>
      <table class="table">
        <thead>
          <tr><th>Thời gian</th><th>Sản phẩm</th><th>Giá</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDeposits(state){
  const uidSession = state.session.userId;
  const list = state.deposits.filter(x => x.userId === uidSession);

  if (!list.length) {
    return `
      <div class="card pad">
        <div class="h2">Lịch sử nạp</div>
        <div class="muted">Chưa có giao dịch nạp nào.</div>
        <div style="height:10px"></div>
        <button class="btn primary w-full" onclick="location.hash='#/topup'">Nạp tiền</button>
      </div>
    `;
  }

  const rows = list.map(x => `
    <tr>
      <td>${new Date(x.time).toLocaleString("vi-VN")}</td>
      <td><b>${escapeHtml(x.type)}</b><div class="muted">${escapeHtml(x.note || "")}</div></td>
      <td>${formatVND(x.amount)}</td>
      <td>KM: <b>${formatVND(x.bonus)}</b></td>
      <td>${escapeHtml(x.status)}</td>
    </tr>
  `).join("");

  return `
    <div class="card pad">
      <div class="h2">Lịch sử nạp</div>
      <table class="table">
        <thead>
          <tr><th>Thời gian</th><th>Phương thức</th><th>Số tiền</th><th>Khuyến mãi</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function bindAuth(){
  $("#btnLogin").onclick = () => {
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pass  = $("#loginPass").value;

    if (!isEmail(email) || !isStrongPass(pass)) {
      toast("Sai thông tin", "Email hợp lệ và mật khẩu >= 6 ký tự.");
      return;
    }

    const state = ensureState();
    const found = Object.entries(state.users).find(([,u]) => u.email === email && u.pass === pass);
    if (!found) {
      toast("Không đăng nhập được", "Tài khoản không tồn tại hoặc sai mật khẩu.");
      return;
    }

    const [userId] = found;
    setState(s => { s.session.userId = userId; return s; });
    toast("Đăng nhập thành công", "Chào mừng bạn quay lại!");
    location.hash = "#/account";
  };

  $("#btnRegister").onclick = () => {
    const name = $("#regName").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const pass  = $("#regPass").value;

    if (!name || !isEmail(email) || !isStrongPass(pass)) {
      toast("Thiếu/ sai thông tin", "Nhập tên, email hợp lệ, mật khẩu >= 6.");
      return;
    }

    setState(s => {
      const exists = Object.values(s.users).some(u => u.email === email);
      if (exists) {
        throw new Error("Email đã được dùng");
      }
      const userId = uid("user");
      s.users[userId] = {
        id: userId,
        publicId: publicId6(),
        name,
        email,
        pass,
        wallet: { balance: 0, promo: 0 }
      };
      s.session.userId = userId;
      return s;
    });

    toast("Tạo tài khoản xong", "Bạn đã đăng nhập.");
    location.hash = "#/account";
  };
}

function bindProfile(){
  const state = ensureState();
  const u = getSessionUser(state);
  if (!u) return;

  const tabWrap = document.getElementById("acctTabs");
  tabWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    const tab = btn.dataset.tab;
    location.hash = `#/account?tab=${encodeURIComponent(tab)}`;
  });

  const btnReset = document.getElementById("btnResetDemo");
  btnReset?.addEventListener("click", () => {
    if (!confirm("Reset toàn bộ dữ liệu demo trên thiết bị?")) return;
    localStorage.removeItem("shopacc_state_v1");
    toast("Đã reset", "Dữ liệu demo đã được xóa.");
    location.hash = "#/home";
    location.reload();
  });
}

export function renderAccount(root, { query }){
  const state = ensureState();
  const user = getSessionUser(state);
  const tab = (query?.tab || "profile");

  root.innerHTML = `
    <div class="container page">
      ${user ? renderProfile(user, tab, state) : renderAuth()}
    </div>
  `;

  if (!user) bindAuth();
  else bindProfile();
}