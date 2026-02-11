import { escapeHtml, toast } from "../ui.js";
import { ensureState, setState, getSessionUser } from "../store.js";
import { formatVND, uid } from "../validators.js";

function renderTopupCard(user){
  const balance = user?.wallet?.balance ?? 0;
  const promo = user?.wallet?.promo ?? 0;

  return `
    <div class="card pad">
      <div class="h1">Nạp tiền</div>
      <div class="muted">Hệ thống demo: nạp tự động mô phỏng, lưu trên thiết bị.</div>

      <div class="divider"></div>
      <div class="grid" style="gap:10px">
        <div class="badge">Số dư: <b>${formatVND(balance)}</b></div>
        <div class="badge">Khuyến mãi: <b>${formatVND(promo)}</b></div>
      </div>

      <div style="height:12px"></div>

      <div class="card pad" style="background: rgba(255,255,255,.03)">
        <div class="h2">Chọn phương thức</div>
        <div class="row">
          <button class="btn primary" id="btnCard">Nạp qua thẻ điện thoại</button>
          <button class="btn" id="btnAtm">Nạp ATM (tặng 15%)</button>
        </div>

        <div style="height:12px"></div>
        <div id="topupForm"></div>
      </div>

      <div style="height:12px"></div>
      <div class="card pad">
        <div class="h2">Lịch sử nạp</div>
        <div class="muted">Xem chi tiết ở tab Tài khoản → Lịch sử nạp.</div>
        <button class="btn w-full" onclick="location.hash='#/account?tab=deposits'">Mở lịch sử nạp</button>
      </div>
    </div>
  `;
}

function cardForm(){
  return `
    <div class="form">
      <div class="row">
        <div class="field">
          <div class="label">Loại thẻ</div>
          <select class="select" id="cardType">
            <option>Viettel</option>
            <option>Vina</option>
            <option>Mobi</option>
            <option>Thẻ Game</option>
          </select>
        </div>
        <div class="field">
          <div class="label">Mệnh giá</div>
          <select class="select" id="cardValue">
            <option value="10000">10,000đ</option>
            <option value="20000">20,000đ</option>
            <option value="50000">50,000đ</option>
            <option value="100000">100,000đ</option>
            <option value="200000">200,000đ</option>
            <option value="500000">500,000đ</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="label">Mã thẻ</div>
        <input class="input" id="cardCode" placeholder="Nhập mã thẻ..." />
      </div>

      <div class="field">
        <div class="label">Serial thẻ</div>
        <input class="input" id="cardSerial" placeholder="Nhập serial..." />
      </div>

      <button class="btn primary w-full" id="btnSubmitCard">Nạp thẻ ngay</button>
      <div class="muted">Duyệt mô phỏng: 3–5 giây.</div>
    </div>
  `;
}

function atmForm(){
  return `
    <div class="card pad" style="background: rgba(59,130,246,.08); border-color: rgba(59,130,246,.22)">
      <div class="h2">Nạp ATM - Tặng 15%</div>
      <div class="muted">Demo: nhập số tiền → hệ thống cộng số dư + 15% khuyến mãi.</div>
      <div class="divider"></div>

      <div class="grid" style="gap:10px">
        <div class="badge">Ngân hàng: <b>ACB</b></div>
        <div class="badge">Số tài khoản: <b>43409177</b></div>
        <div class="badge">Chủ tài khoản: <b>LÊ THỊ CẨM TÚ</b></div>
      </div>

      <div style="height:12px"></div>

      <div class="field">
        <div class="label">Số tiền muốn nạp</div>
        <input class="input" id="atmAmount" inputmode="numeric" placeholder="Từ 10,000đ đến 10,000,000" />
      </div>

      <button class="btn primary w-full" id="btnSubmitAtm">Tạo lệnh nạp</button>
    </div>
  `;
}

function bindTopup(){
  const formWrap = document.getElementById("topupForm");
  const btnCard = document.getElementById("btnCard");
  const btnAtm  = document.getElementById("btnAtm");

  const showCard = () => { formWrap.innerHTML = cardForm(); bindCard(); };
  const showAtm  = () => { formWrap.innerHTML = atmForm(); bindAtm(); };

  btnCard.onclick = showCard;
  btnAtm.onclick  = showAtm;

  showCard();
}

function requireLogin(){
  const state = ensureState();
  const u = getSessionUser(state);
  if (!u) {
    toast("Cần đăng nhập", "Vào tab Tài khoản để đăng nhập/đăng ký trước khi nạp.");
    location.hash = "#/account";
    return null;
  }
  return { state, u };
}

function bindCard(){
  const ctx = requireLogin();
  if (!ctx) return;

  document.getElementById("btnSubmitCard").onclick = async () => {
    const type = document.getElementById("cardType").value;
    const value = Number(document.getElementById("cardValue").value);
    const code = document.getElementById("cardCode").value.trim();
    const serial = document.getElementById("cardSerial").value.trim();

    if (!code || !serial) {
      toast("Thiếu thông tin", "Vui lòng nhập mã thẻ và serial.");
      return;
    }

    toast("Đang duyệt thẻ", "Vui lòng chờ 3–5 giây...");
    await new Promise(r => setTimeout(r, 3200));

    // Demo fee 0, bonus 0
    setState(s => {
      const uidSession = s.session.userId;
      const user = s.users[uidSession];

      user.wallet.balance += value;

      s.deposits.unshift({
        id: uid("dep"),
        userId: uidSession,
        type: `Thẻ ${type}`,
        amount: value,
        fee: 0,
        bonus: 0,
        time: Date.now(),
        status: "Thành công",
        note: `Serial: ${serial.slice(0,4)}****`
      });
      return s;
    });

    toast("Nạp thành công", `+${formatVND(value)} vào số dư`);
    location.hash = "#/account?tab=deposits";
  };
}

function bindAtm(){
  const ctx = requireLogin();
  if (!ctx) return;

  document.getElementById("btnSubmitAtm").onclick = () => {
    const raw = document.getElementById("atmAmount").value.replace(/[^\d]/g,"");
    const amount = Number(raw || 0);

    if (amount < 10000 || amount > 10000000) {
      toast("Số tiền không hợp lệ", "Nhập trong khoảng 10,000đ đến 10,000,000đ.");
      return;
    }

    const bonus = Math.round(amount * 0.15);

    setState(s => {
      const uidSession = s.session.userId;
      const user = s.users[uidSession];

      user.wallet.balance += amount;
      user.wallet.promo += bonus;

      s.deposits.unshift({
        id: uid("dep"),
        userId: uidSession,
        type: "ATM",
        amount,
        fee: 0,
        bonus,
        time: Date.now(),
        status: "Thành công",
        note: "Tặng 15% khuyến mãi (demo)"
      });
      return s;
    });

    toast("Tạo lệnh nạp", `+${formatVND(amount)} và KM +${formatVND(bonus)}`);
    location.hash = "#/account?tab=deposits";
  };
}

export function renderTopup(root){
  const state = ensureState();
  const u = getSessionUser(state);

  root.innerHTML = `
    <div class="container page">
      ${renderTopupCard(u)}
    </div>
  `;

  bindTopup();
}