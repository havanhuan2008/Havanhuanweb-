import { getState } from "../store.js";
import { esc, vnd, toast, setActiveTab } from "../ui.js";
import { buyProduct } from "../apiMock.js";
import { go } from "../router.js";

function card(p){
  return `
    <div class="card product" data-id="${esc(p.id)}">
      <div class="thumb" style="height:130px;background:var(--bg2);border-bottom:1px solid var(--line);overflow:hidden">
        <img src="${esc(p.img)}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
      </div>
      <div class="pad">
        <div class="muted" style="font-size:12px">${esc(p.game)} • Kho: <b>${p.stock}</b></div>
        <div style="font-weight:950;font-size:16px;margin-top:6px">${esc(p.title)}</div>
        <div class="muted" style="margin-top:4px">${esc(p.desc||"")}</div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:10px">
          <b style="color:var(--p3)">${vnd(p.price)}</b>
          <div style="display:flex;gap:10px">
            <button class="btn" data-act="detail">Chi tiết</button>
            <button class="btn wood" data-act="buy">Mua ngay</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderHome(root){
  setActiveTab("home");
  const s = getState();
  const products = s.products || [];
  const games = ["Tất cả", ...Array.from(new Set(products.map(x=>x.game)))];

  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius: var(--r-lg)">
        <div style="font-weight:950;font-size:26px;line-height:1.1">Shop Acc Game • Giao diện trắng</div>
        <div class="muted" style="margin-top:6px">Nút gỗ mục • Dark mode • tab chi tiết • mua • nạp ATM (đơn xử lí)</div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap" id="pills">
          ${games.map((g,i)=>`<button class="btn ${i===0?"primary":""}" data-game="${esc(g)}">${esc(g)}</button>`).join("")}
        </div>

        <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="field">
            <div class="label">Tìm kiếm</div>
            <input class="input" id="q" placeholder="Nhập tên sản phẩm / mã..." />
          </div>
          <div class="field">
            <div class="label">Sắp xếp</div>
            <select class="select" id="sort">
              <option value="hot">Mặc định</option>
              <option value="price_asc">Giá tăng</option>
              <option value="price_desc">Giá giảm</option>
              <option value="stock_desc">Kho nhiều</option>
            </select>
          </div>
        </div>

        <div style="margin-top:10px">
          <button class="btn primary" id="apply">Áp dụng</button>
        </div>
      </div>

      <div style="height:14px"></div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px" id="grid"></div>
    </div>
  `;

  let currentGame = "Tất cả";

  function sortList(list, mode){
    const a=[...list];
    if(mode==="price_asc") a.sort((x,y)=>x.price-y.price);
    if(mode==="price_desc") a.sort((x,y)=>y.price-x.price);
    if(mode==="stock_desc") a.sort((x,y)=>y.stock-x.stock);
    return a;
  }

  function apply(){
    const ss = getState();
    const q = root.querySelector("#q").value.trim().toLowerCase();
    const sort = root.querySelector("#sort").value;

    let list = ss.products;
    if(currentGame!=="Tất cả") list = list.filter(p=>p.game===currentGame);
    if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    list = sortList(list, sort);

    root.querySelector("#grid").innerHTML = list.map(card).join("");
  }

  root.querySelector("#pills").addEventListener("click",(e)=>{
    const b = e.target.closest("button"); if(!b) return;
    currentGame = b.dataset.game;
    [...root.querySelectorAll("#pills button")].forEach(x=>x.classList.remove("primary"));
    b.classList.add("primary");
    apply();
  });

  root.querySelector("#apply").onclick = apply;
  root.querySelector("#q").addEventListener("input", ()=>{ clearTimeout(window.__t); window.__t=setTimeout(apply,120); });

  root.querySelector("#grid").addEventListener("click",(e)=>{
    const cardEl = e.target.closest(".product"); if(!cardEl) return;
    const id = cardEl.dataset.id;
    const act = e.target.closest("button")?.dataset?.act;

    if(act==="detail") go(`#/product/${encodeURIComponent(id)}`);

    if(act==="buy"){
      try{
        buyProduct(id);
        toast("Mua thành công","Đã trừ số dư và lưu lịch sử.");
      }catch(err){
        if(err.message==="NEED_LOGIN"){ toast("Cần đăng nhập","Chuyển sang Login/Register"); go("#/auth?tab=login"); return; }
        if(err.message==="NO_BALANCE"){ toast("Không đủ số dư","Hãy nạp tiền trước"); go("#/topup"); return; }
        toast("Lỗi", String(err.message||err));
      }
    }
  });

  apply();
}