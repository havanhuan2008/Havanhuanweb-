import { getState } from "../store.js";
import { setActiveTab, toast, esc, vnd } from "../ui.js";
import { createAtmDeposit, getUser, uid } from "../apiMock.js";
import { go } from "../router.js";

export function renderTopup(root){
  setActiveTab("topup");
  const s = getState();
  const u = getUser();

  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Nạp tiền</div>
        <div class="muted" style="margin-top:6px">Tạo đơn ATM sẽ có: nội dung, số tiền, trạng thái mặc định <b>Đang xử lí</b>.</div>

        <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="card pad" style="background:var(--card2)">
            <div class="muted">Số dư</div>
            <div style="font-weight:950;font-size:22px">${vnd(u?.wallet?.balance||0)}</div>
          </div>
          <div class="card pad" style="background:var(--card2)">
            <div class="muted">Khuyến mãi</div>
            <div style="font-weight:950;font-size:22px">${vnd(u?.wallet?.promo||0)}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="card pad" style="background:var(--card2)">
          <div style="font-weight:950;font-size:18px">ATM - Thông tin chuyển khoản</div>
          <div class="muted" style="margin-top:6px">Ngân hàng: <b>ACB</b> • STK: <b>43409177</b> • Chủ TK: <b>LÊ THỊ CẨM TÚ</b></div>

          <div style="height:12px"></div>

          <div class="field">
            <div class="label">Số tiền muốn nạp</div>
            <input class="input" id="amt" inputmode="numeric" placeholder="10,000 - 10,000,000" />
          </div>

          <div class="field" style="margin-top:10px">
            <div class="label">Nội dung chuyển khoản</div>
            <input class="input" id="content" placeholder="VD: NAP_${uid("ATM").slice(-6)}" />
          </div>

          <div style="height:10px"></div>
          <button class="btn primary w-full" id="create">Tạo lệnh nạp</button>
        </div>

        <div style="height:14px"></div>
        <div style="font-weight:950;font-size:18px">Đơn nạp gần đây</div>
        <div style="height:10px"></div>
        <div style="display:grid;gap:12px" id="depGrid"></div>
      </div>
    </div>
  `;

  function renderList(){
    const ss = getState();
    const user = getUser();
    const list = user
      ? ss.deposits.filter(d=>d.userId===ss.session.userId).slice(0,6)
      : ss.deposits.slice(0,6);

    root.querySelector("#depGrid").innerHTML = list.length ? list.map(d=>`
      <div class="card pad">
        <div class="muted">Mã đơn: <b>${esc(d.id)}</b></div>
        <div class="muted">Nội dung: <b>${esc(d.content)}</b></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <b style="color:var(--p3)">${vnd(d.amount)}</b>
          <span class="btn" style="pointer-events:none;opacity:.9">${esc(d.status)}</span>
        </div>
      </div>
    `).join("") : `<div class="muted">Chưa có đơn nạp nào.</div>`;
  }

  root.querySelector("#create").onclick = ()=>{
    const user = getUser();
    if(!user){
      toast("Cần đăng nhập", "Chuyển sang Login/Register");
      go("#/auth?tab=login");
      return;
    }

    const raw = root.querySelector("#amt").value.replace(/[^\d]/g,"");
    const amount = Number(raw||0);
    if(amount < 10000 || amount > 10000000){
      toast("Sai số tiền", "Nhập trong khoảng 10,000 - 10,000,000");
      return;
    }

    const content = root.querySelector("#content").value.trim() || `NAP_${uid("ATM").slice(-8)}`;

    try{
      createAtmDeposit({ amount, content });
      toast("Tạo đơn nạp", `${content} • ${vnd(amount)} • Đang xử lí`);
      renderList();
      go("#/account?tab=deposits");
    }catch(err){
      toast("Lỗi", String(err.message||err));
    }
  };

  renderList();
}