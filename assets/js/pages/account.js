import { getState } from "../store.js";
import { setActiveTab, esc, vnd } from "../ui.js";
import { getUser } from "../apiMock.js";
import { go } from "../router.js";

export function renderAccount(root, tab="profile"){
  setActiveTab("account");
  const s = getState();
  const u = getUser();

  if(!u){
    root.innerHTML = `
      <div class="container">
        <div class="card pad" style="border-radius:var(--r-lg)">
          <div style="font-weight:950;font-size:26px">Bạn chưa đăng nhập</div>
          <div class="muted" style="margin-top:6px">Hãy đăng nhập/đăng ký để mua và nạp tiền.</div>
          <div style="height:12px"></div>
          <button class="btn primary w-full" onclick="location.hash='#/auth?tab=login'">Đi tới Login</button>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Tài khoản</div>
        <div class="muted" style="margin-top:6px">Xin chào <b>${esc(u.name)}</b> • ID <b>${esc(u.publicId)}</b></div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn ${tab==="profile"?"primary":""}" id="t1">Thông tin</button>
          <button class="btn ${tab==="orders"?"primary":""}" id="t2">Lịch sử mua</button>
          <button class="btn ${tab==="deposits"?"primary":""}" id="t3">Lịch sử nạp</button>
        </div>

        <div class="divider"></div>
        <div id="box"></div>
      </div>
    </div>
  `;

  root.querySelector("#t1").onclick = ()=> go("#/account?tab=profile");
  root.querySelector("#t2").onclick = ()=> go("#/account?tab=orders");
  root.querySelector("#t3").onclick = ()=> go("#/account?tab=deposits");

  const box = root.querySelector("#box");

  if(tab==="orders"){
    const list = s.orders.filter(x=>x.userId===s.session.userId);
    box.innerHTML = list.length ? `
      <div style="display:grid;gap:12px">
        ${list.map(o=>`
          <div class="card">
            <div style="height:140px;background:var(--bg2);border-bottom:1px solid var(--line);overflow:hidden">
              <img src="${esc(o.img)}" alt="${esc(o.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
            </div>
            <div class="pad">
              <div style="font-weight:950">${esc(o.title)}</div>
              <div class="muted">Mã: <b>${esc(o.id)}</b></div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                <b style="color:var(--p3)">${vnd(o.price)}</b>
                <span class="btn" style="pointer-events:none">${esc(o.status)}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<div class="muted">Chưa có đơn mua.</div>`;
    return;
  }

  if(tab==="deposits"){
    const list = s.deposits.filter(x=>x.userId===s.session.userId);
    box.innerHTML = list.length ? `
      <div style="display:grid;gap:12px">
        ${list.map(d=>`
          <div class="card pad">
            <div><b>${esc(d.type)}</b> • <span class="muted">${new Date(d.createdAt).toLocaleString("vi-VN")}</span></div>
            <div class="muted">Nội dung: <b>${esc(d.content)}</b></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
              <b style="color:var(--p3)">${vnd(d.amount)}</b>
              <span class="btn" style="pointer-events:none">${esc(d.status)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    ` : `<div class="muted">Chưa có đơn nạp.</div>`;
    return;
  }

  box.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="card pad" style="background:var(--card2)">
        <div class="muted">Số dư</div>
        <div style="font-weight:950;font-size:22px">${vnd(u.wallet.balance)}</div>
      </div>
      <div class="card pad" style="background:var(--card2)">
        <div class="muted">Khuyến mãi</div>
        <div style="font-weight:950;font-size:22px">${vnd(u.wallet.promo)}</div>
      </div>
    </div>
    <div style="height:12px"></div>
    <button class="btn primary w-full" onclick="location.hash='#/topup'">Nạp tiền</button>
  `;
}