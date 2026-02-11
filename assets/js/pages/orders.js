import { getState } from "../store.js";
import { esc, vnd, setActiveTab } from "../ui.js";
import { go } from "../router.js";

export function renderOrders(root){
  setActiveTab("orders");
  const s = getState();

  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Đơn hàng (Đơn cha)</div>
        <div class="muted" style="margin-top:6px">Bấm vào đơn cha để xem nhiều đơn con (mỗi đơn con khác nhau, ảnh khác).</div>
      </div>

      <div style="height:12px"></div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px" id="grid"></div>
    </div>
  `;

  root.querySelector("#grid").innerHTML = (s.parentOrders||[]).map(p=>`
    <div class="card product" data-pid="${esc(p.id)}">
      <div style="height:130px;background:var(--bg2);border-bottom:1px solid var(--line);overflow:hidden">
        <img src="${esc(p.img)}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
      </div>
      <div class="pad">
        <div style="font-weight:950">${esc(p.title)}</div>
        <div class="muted" style="margin-top:4px">${esc(p.note)}</div>
        <div style="height:10px"></div>
        <button class="btn primary w-full">Xem đơn con</button>
      </div>
    </div>
  `).join("");

  root.querySelector("#grid").addEventListener("click",(e)=>{
    const el = e.target.closest("[data-pid]"); if(!el) return;
    go(`#/orders/${encodeURIComponent(el.dataset.pid)}`);
  });
}

export function renderChildOrders(root, parentId){
  setActiveTab("orders");
  const s = getState();
  const parent = (s.parentOrders||[]).find(x=>x.id===parentId);
  const childs = (s.childOrders||{})[parentId] || [];

  if(!parent){
    root.innerHTML = `<div class="container"><div class="card pad"><b>Không tìm thấy đơn cha</b></div></div>`;
    return;
  }

  root.innerHTML = `
    <div class="container">
      <div class="card" style="overflow:hidden;border-radius:var(--r-lg)">
        <div style="height:220px;background:var(--bg2);border-bottom:1px solid var(--line);overflow:hidden">
          <img src="${esc(parent.img)}" alt="${esc(parent.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
        </div>
        <div class="pad">
          <div class="muted">Đơn cha: <b>${esc(parent.id)}</b></div>
          <div style="font-weight:950;font-size:26px;margin-top:6px">${esc(parent.title)}</div>
          <div class="muted" style="margin-top:6px">${esc(parent.note)}</div>

          <div style="height:10px"></div>
          <button class="btn" id="back">← Quay lại</button>
        </div>
      </div>

      <div style="height:12px"></div>
      <div style="font-weight:950;font-size:18px">Danh sách đơn con</div>

      <div style="height:10px"></div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px" id="childGrid"></div>
    </div>
  `;

  root.querySelector("#back").onclick = ()=> go("#/orders");

  root.querySelector("#childGrid").innerHTML = childs.map(c=>`
    <div class="card">
      <div style="height:130px;background:var(--bg2);border-bottom:1px solid var(--line);overflow:hidden">
        <img src="${esc(c.img)}" alt="${esc(c.title)}" style="width:100%;height:100%;object-fit:cover;display:block"/>
      </div>
      <div class="pad">
        <div style="font-weight:950">${esc(c.title)}</div>
        <div class="muted" style="margin-top:4px">${esc(c.desc)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
          <b style="color:var(--p3)">${vnd(c.price)}</b>
          <button class="btn primary">Chọn</button>
        </div>
      </div>
    </div>
  `).join("");
}