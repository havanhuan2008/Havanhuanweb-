import { getState } from "../store.js";
import { esc, vnd, setActiveTab, toast } from "../ui.js";
import { buyProduct } from "../apiMock.js";
import { go } from "../router.js";

export function renderProduct(root, productId){
  setActiveTab(null);
  const s = getState();
  const p = s.products.find(x=>x.id===productId);

  if(!p){
    root.innerHTML = `<div class="container"><div class="card pad"><b>Không tìm thấy sản phẩm</b></div></div>`;
    return;
  }

  root.innerHTML = `
    <div class="container">
      <div class="card" style="overflow:hidden;border-radius:var(--r-lg)">
        <div style="height:240px;background:var(--bg2);border-bottom:1px solid var(--line)">
          <img src="${esc(p.img)}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
        </div>
        <div class="pad">
          <div class="muted">${esc(p.game)} • Mã: <b>${esc(p.id)}</b></div>
          <div style="font-weight:950;font-size:28px;margin-top:6px">${esc(p.title)}</div>
          <div class="muted" style="margin-top:6px">${esc(p.desc||"")}</div>

          <div class="divider"></div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Giá</div>
              <div style="font-weight:950;font-size:22px;color:var(--p3)">${vnd(p.price)}</div>
            </div>
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Kho</div>
              <div style="font-weight:950;font-size:22px">${p.stock}</div>
            </div>
          </div>

          <div style="height:12px;display:flex;gap:10px">
            <button class="btn" id="back">Quay lại</button>
            <button class="btn wood" id="buy">Mua ngay</button>
          </div>
        </div>
      </div>
    </div>
  `;

  root.querySelector("#back").onclick = ()=> history.back();
  root.querySelector("#buy").onclick = ()=>{
    try{
      buyProduct(p.id);
      toast("Mua thành công", p.title);
      go("#/account?tab=orders");
    }catch(err){
      if(err.message==="NEED_LOGIN"){ toast("Cần đăng nhập","Chuyển sang Login/Register"); go("#/auth?tab=login"); return; }
      if(err.message==="NO_BALANCE"){ toast("Không đủ số dư","Hãy nạp tiền trước"); go("#/topup"); return; }
      toast("Lỗi", String(err.message||err));
    }
  };
}