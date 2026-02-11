import { fetchProducts } from "../apiMock.js";
import { $, $$, toast, openModal, escapeHtml, skeletonCards } from "../ui.js";
import { ensureState, setState, getSessionUser } from "../store.js";
import { formatVND, uid } from "../validators.js";

let cached = null;

function productCard(p){
  return `
    <div class="card product" data-id="${escapeHtml(p.id)}">
      <div class="thumb"></div>
      <div class="product-body">
        <div class="badge">${escapeHtml(p.game)}</div>
        <div class="product-title" style="margin-top:8px">${escapeHtml(p.title)}</div>
        <div class="product-meta">
          <span>Kho: <b>${escapeHtml(p.stock)}</b></span>
          <span>Rank: <b>${escapeHtml(p.rank)}</b></span>
          <span>Skin: <b>${escapeHtml(p.skins)}</b></span>
        </div>
        <div class="product-price">${formatVND(p.price)}</div>
        <div class="product-actions">
          <button class="btn w-full" data-action="detail">Chi tiết</button>
          <button class="btn primary w-full" data-action="buy">Mua ngay</button>
        </div>
      </div>
    </div>
  `;
}

function modalDetail(p){
  const body = `
    <div class="card pad">
      <div class="badge">${escapeHtml(p.game)} • ${escapeHtml(p.id)}</div>
      <div class="h2" style="margin-top:10px">${escapeHtml(p.title)}</div>
      <div class="muted">${escapeHtml(p.notes || "—")}</div>
      <div class="divider"></div>

      <div class="grid" style="gap:10px">
        <div class="badge">Kho hiện có: <b>${escapeHtml(p.stock)}</b></div>
        <div class="badge">Rank: <b>${escapeHtml(p.rank)}</b></div>
        <div class="badge">Số skin: <b>${escapeHtml(p.skins)}</b></div>
        <div class="badge">Giá: <b style="color:rgba(245,158,11,1)">${formatVND(p.price)}</b></div>
      </div>

      <div class="divider"></div>
      <div class="muted">
        * Demo: “Mua” sẽ trừ ví trong localStorage và ghi lịch sử đơn hàng.
      </div>
    </div>
  `;

  const foot = `
    <button class="btn w-full" id="btnCloseM">Đóng</button>
    <button class="btn primary w-full" id="btnBuyM">Mua ngay</button>
  `;

  openModal({ title: "Chi tiết sản phẩm", bodyHtml: body, footHtml: foot });

  document.getElementById("btnCloseM").onclick = () => document.getElementById("modalClose").click();
  document.getElementById("btnBuyM").onclick = () => buyNow(p);
}

function buyNow(p){
  const state = ensureState();
  const u = getSessionUser(state);

  if (!u) {
    toast("Cần đăng nhập", "Vào tab Tài khoản để đăng nhập/đăng ký.");
    return;
  }
  const balance = u.wallet?.balance ?? 0;
  if (balance < p.price) {
    toast("Không đủ số dư", `Bạn cần thêm ${formatVND(p.price - balance)}. Hãy nạp tiền.`);
    location.hash = "#/topup";
    return;
  }

  setState(s => {
    const user = s.users[s.session.userId];
    user.wallet.balance -= p.price;

    s.orders.unshift({
      id: uid("order"),
      userId: s.session.userId,
      productId: p.id,
      productTitle: p.title,
      price: p.price,
      time: Date.now(),
      status: "Thành công"
    });
    return s;
  });

  toast("Mua thành công", `Bạn đã mua: ${p.title}`);
}

function renderFilters(products){
  const games = ["Tất cả", ...Array.from(new Set(products.map(x => x.game)))];
  const pills = games.map((g, idx) => `
    <button class="pill ${idx===0 ? "active":""}" data-game="${escapeHtml(g)}">${escapeHtml(g)}</button>
  `).join("");

  return `
    <div class="card hero">
      <div class="hero-row">
        <div>
          <div class="hero-title">Shop Acc Game • Giao diện mượt</div>
          <div class="hero-sub">
            Lọc game, xem chi tiết, mua ngay, nạp thẻ/ATM (demo). Hiệu ứng UI mượt + toast + modal.
          </div>
          <div class="pills" id="pills">${pills}</div>
        </div>

        <div class="card pad" style="min-width:260px">
          <div class="badge">Tìm kiếm</div>
          <div class="field" style="margin-top:10px">
            <input class="input" id="q" placeholder="Nhập tên sản phẩm / mã..." />
          </div>
          <div class="row" style="margin-top:10px">
            <select class="select" id="sort">
              <option value="hot">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="stock_desc">Kho nhiều</option>
            </select>
            <button class="btn primary" id="btnApply">Áp dụng</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function sortProducts(list, mode){
  const a = [...list];
  if (mode === "price_asc") a.sort((x,y)=>x.price-y.price);
  if (mode === "price_desc") a.sort((x,y)=>y.price-x.price);
  if (mode === "stock_desc") a.sort((x,y)=>y.stock-x.stock);
  return a;
}

function bindInteractions(products){
  const main = document.getElementById("appMain");

  let currentGame = "Tất cả";

  const apply = () => {
    const q = document.getElementById("q").value.trim().toLowerCase();
    const sort = document.getElementById("sort").value;

    let list = products.filter(p => currentGame === "Tất cả" ? true : p.game === currentGame);
    if (q) list = list.filter(p =>
      p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
    list = sortProducts(list, sort);

    const grid = document.getElementById("productGrid");
    grid.innerHTML = list.map(productCard).join("");
  };

  document.getElementById("pills").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    $$(".pill").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    currentGame = btn.dataset.game;
    apply();
  });

  document.getElementById("btnApply").addEventListener("click", apply);
  document.getElementById("q").addEventListener("input", () => {
    // debounce nhẹ
    clearTimeout(window.__qT);
    window.__qT = setTimeout(apply, 120);
  });

  main.addEventListener("click", (e) => {
    const card = e.target.closest(".product");
    if (!card) return;
    const id = card.dataset.id;
    const p = products.find(x => x.id === id);
    if (!p) return;

    const actionBtn = e.target.closest("button");
    const action = actionBtn?.dataset?.action;
    if (action === "detail") modalDetail(p);
    if (action === "buy") buyNow(p);
  });
}

export async function renderHome(root){
  root.innerHTML = `
    <div class="container page">
      ${skeletonCards(6)}
    </div>
  `;

  try {
    cached = cached || await fetchProducts();
    root.innerHTML = `
      <div class="container page">
        ${renderFilters(cached)}
        <div style="height:12px"></div>
        <div class="grid products" id="productGrid">
          ${cached.map(productCard).join("")}
        </div>
      </div>
    `;
    bindInteractions(cached);
  } catch (err) {
    root.innerHTML = `
      <div class="container page">
        <div class="card pad">
          <div class="h1">Lỗi tải dữ liệu</div>
          <div class="muted">${escapeHtml(err.message || "Không xác định")}</div>
          <div style="height:10px"></div>
          <button class="btn primary" onclick="location.reload()">Tải lại</button>
        </div>
      </div>
    `;
  }
}