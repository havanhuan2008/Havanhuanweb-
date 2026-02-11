(function(){
  const KEY = "shopacc_state_v2";

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const clone = (x)=> (structuredClone ? structuredClone(x) : JSON.parse(JSON.stringify(x)));

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "null"); }catch{ return null; }
  }
  function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function state(){
    let s = load();
    if(!s){ s = {session:{userId:null}, theme:"light", users:{}, products:[], parentOrders:[], childOrders:{}, deposits:[], orders:[]}; save(s); }
    return s;
  }
  function setState(updater){
    const s = state();
    const next = updater(clone(s));
    save(next);
    return next;
  }
  function getUser(s){
    const id = s.session?.userId;
    return id ? (s.users?.[id] || null) : null;
  }

  function esc(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function vnd(n){
    return Number(n||0).toLocaleString("vi-VN") + "đ";
  }
  function uid(prefix="id"){
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
  function toast(title,msg){
    const wrap = $("#toasts");
    const el = document.createElement("div");
    el.className="toast";
    el.innerHTML = `<b>${esc(title)}</b><div class="muted" style="margin-top:4px">${esc(msg)}</div>`;
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity="0"; el.style.transform="translateY(6px)"; }, 2600);
    setTimeout(()=> el.remove(), 3100);
  }

  // ===== Modal =====
  function openModal(title, bodyHtml, footHtml=""){
    $("#modalTitle").textContent = title || "Chi tiết";
    $("#modalBody").innerHTML = bodyHtml || "";
    $("#modalFoot").innerHTML = footHtml || "";
    $("#modal").classList.add("open");
    $("#modal").setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }
  function closeModal(){
    $("#modal").classList.remove("open");
    $("#modal").setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }

  // ===== Theme =====
  function applyTheme(theme){
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    setState(s => { s.theme = theme; return s; });
  }
  function toggleTheme(){
    const s = state();
    const next = (s.theme === "dark") ? "light" : "dark";
    applyTheme(next);
    toast("Đổi giao diện", next === "dark" ? "Đã bật Dark mode" : "Đã bật Light mode");
  }

  // ===== Drawer =====
  function renderMiniUser(){
    const s = state();
    const u = getUser(s);
    $("#miniName").textContent = u?.name || "Khách";
    $("#miniBalance").textContent = vnd(u?.wallet?.balance || 0);
    $("#miniId").textContent = u?.publicId || "—";
  }
  function openDrawer(){
    $("#drawer").classList.add("open");
    $("#drawer").setAttribute("aria-hidden","false");
  }
  function closeDrawer(){
    $("#drawer").classList.remove("open");
    $("#drawer").setAttribute("aria-hidden","true");
  }

  // ===== Router =====
  function parseHash(){
    const hash = location.hash || "#/home";
    const raw = hash.slice(1); // /home?x=1
    const [path, qs] = raw.split("?");
    const parts = path.replace(/^\//,"").split("/").filter(Boolean);
    const query = {};
    if(qs){
      qs.split("&").forEach(p=>{
        const [k,v] = p.split("=");
        query[decodeURIComponent(k)] = decodeURIComponent(v||"");
      });
    }
    return { parts, query };
  }
  function setActiveTab(name){
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.route === name));
  }

  // ===== Pages UI builders =====
  function pageShell(html){
    return `<div class="container">${html}</div>`;
  }

  function productCard(p){
    return `
      <div class="card product" data-id="${esc(p.id)}">
        <div class="thumb">
          <img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy"/>
        </div>
        <div class="pad">
          <div class="muted" style="font-size:12px">${esc(p.game)} • Kho: <b>${esc(p.stock)}</b></div>
          <div class="h2" style="margin-top:8px">${esc(p.title)}</div>
          <div class="muted">${esc(p.desc || "")}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
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

  // ===== HOME =====
  function renderHome(){
    const s = state();
    const products = s.products;

    const games = ["Tất cả", ...Array.from(new Set(products.map(x=>x.game)))];

    $("#appMain").innerHTML = pageShell(`
      <div class="hero">
        <div class="h1">Shop Acc Game • Giao diện trắng</div>
        <div class="muted">Có Dark mode • sản phẩm có ảnh URL • tab chi tiết riêng</div>
        <div style="height:10px"></div>

        <div class="pills" id="pills">
          ${games.map((g,i)=>`<button class="pill ${i===0?"active":""}" data-game="${esc(g)}">${esc(g)}</button>`).join("")}
        </div>

        <div style="height:12px"></div>

        <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px">
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

        <div style="height:10px"></div>
        <button class="btn primary" id="apply">Áp dụng</button>
      </div>

      <div style="height:14px"></div>
      <div class="grid products" id="grid"></div>
    `);

    let currentGame="Tất cả";

    function sortList(list, mode){
      const a=[...list];
      if(mode==="price_asc") a.sort((x,y)=>x.price-y.price);
      if(mode==="price_desc") a.sort((x,y)=>y.price-x.price);
      if(mode==="stock_desc") a.sort((x,y)=>y.stock-x.stock);
      return a;
    }
    function apply(){
      const q = $("#q").value.trim().toLowerCase();
      const sort = $("#sort").value;

      let list = products.filter(p => currentGame==="Tất cả" ? true : p.game===currentGame);
      if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
      list = sortList(list, sort);

      $("#grid").innerHTML = list.map(productCard).join("");
    }

    $("#pills").addEventListener("click",(e)=>{
      const btn = e.target.closest(".pill"); if(!btn) return;
      $$(".pill").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      currentGame = btn.dataset.game;
      apply();
    });

    $("#apply").onclick = apply;
    $("#q").addEventListener("input", ()=>{ clearTimeout(window.__t); window.__t=setTimeout(apply,120); });

    $("#grid").addEventListener("click",(e)=>{
      const card = e.target.closest(".product"); if(!card) return;
      const id = card.dataset.id;
      const p = products.find(x=>x.id===id);
      if(!p) return;

      const act = e.target.closest("button")?.dataset?.act;
      if(act==="detail"){
        location.hash = `#/product/${encodeURIComponent(p.id)}`;
      }
      if(act==="buy"){
        buyProduct(p.id);
      }
    });

    apply();
  }

  // ===== PRODUCT DETAIL TAB (route riêng) =====
  function renderProductDetail(productId){
    const s = state();
    const p = s.products.find(x=>x.id===productId);
    if(!p){
      $("#appMain").innerHTML = pageShell(`<div class="card pad"><div class="h1">Không tìm thấy</div></div>`);
      return;
    }

    $("#appMain").innerHTML = pageShell(`
      <div class="card">
        <div class="thumb" style="height:220px">
          <img src="${esc(p.img)}" alt="${esc(p.title)}" />
        </div>
        <div class="pad">
          <div class="muted">${esc(p.game)} • Mã: <b>${esc(p.id)}</b></div>
          <div class="h1" style="margin-top:8px">${esc(p.title)}</div>
          <div class="muted">${esc(p.desc)}</div>

          <div class="divider"></div>

          <div class="grid" style="grid-template-columns:1fr 1fr">
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Giá</div>
              <div style="font-weight:950;color:var(--p3);font-size:22px">${vnd(p.price)}</div>
            </div>
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Kho</div>
              <div style="font-weight:950;font-size:22px">${esc(p.stock)}</div>
            </div>
          </div>

          <div style="height:12px"></div>
          <div style="display:flex;gap:10px">
            <button class="btn" onclick="history.back()">Quay lại</button>
            <button class="btn wood" id="buyNow">Mua ngay</button>
          </div>
        </div>
      </div>
    `);

    $("#buyNow").onclick = ()=> buyProduct(p.id);
  }

  // ===== BUY (mock backend) =====
  function buyProduct(productId){
    const s = state();
    const u = getUser(s);
    const p = s.products.find(x=>x.id===productId);

    if(!u){
      toast("Cần đăng nhập","Chuyển sang trang Login/Register");
      location.hash = "#/auth?tab=login";
      return;
    }

    const bal = u.wallet?.balance || 0;
    if(bal < p.price){
      toast("Không đủ số dư", `Thiếu ${vnd(p.price - bal)}. Hãy nạp tiền.`);
      location.hash = "#/topup";
      return;
    }

    setState(st=>{
      const user = st.users[st.session.userId];
      user.wallet.balance -= p.price;

      st.orders.unshift({
        id: uid("OD"),
        userId: st.session.userId,
        productId: p.id,
        title: p.title,
        img: p.img,
        price: p.price,
        status: "Thành công",
        createdAt: Date.now()
      });
      return st;
    });

    toast("Mua thành công", p.title);
    renderMiniUser();
  }

  // ===== ORDERS (đơn cha -> tab con) =====
  function renderOrders(){
    const s = state();
    const list = s.parentOrders;

    $("#appMain").innerHTML = pageShell(`
      <div class="h1">Danh mục đơn hàng (Đơn cha)</div>
      <div class="muted">Bấm vào một đơn cha để xem đơn con (mỗi đơn con ảnh/mô tả khác nhau)</div>
      <div style="height:12px"></div>

      <div class="grid" id="parentGrid"></div>

      <div style="height:14px"></div>
      <div class="card pad">
        <div class="h2">Đơn bạn đã mua (sau login)</div>
        <div class="muted">Đây là lịch sử mua sản phẩm.</div>
        <div style="height:10px"></div>
        <button class="btn" onclick="location.hash='#/account?tab=orders'">Xem lịch sử mua</button>
      </div>
    `);

    const html = list.map(p=>`
      <div class="card product" data-pid="${esc(p.id)}">
        <div class="thumb">
          <img src="${esc(p.img)}" alt="${esc(p.title)}"/>
        </div>
        <div class="pad">
          <div class="h2">${esc(p.title)}</div>
          <div class="muted">${esc(p.note)}</div>
          <div style="height:10px"></div>
          <button class="btn primary">Xem đơn con</button>
        </div>
      </div>
    `).join("");

    $("#parentGrid").innerHTML = html;

    $("#parentGrid").addEventListener("click",(e)=>{
      const card = e.target.closest("[data-pid]"); if(!card) return;
      const pid = card.dataset.pid;
      location.hash = `#/orders/${encodeURIComponent(pid)}`;
    });
  }

  function renderChildOrders(parentId){
    const s = state();
    const parent = s.parentOrders.find(x=>x.id===parentId);
    const childs = s.childOrders?.[parentId] || [];

    if(!parent){
      $("#appMain").innerHTML = pageShell(`<div class="card pad"><div class="h1">Không tìm thấy đơn cha</div></div>`);
      return;
    }

    $("#appMain").innerHTML = pageShell(`
      <div class="card">
        <div class="thumb" style="height:220px">
          <img src="${esc(parent.img)}" alt="${esc(parent.title)}"/>
        </div>
        <div class="pad">
          <div class="muted">Đơn cha: <b>${esc(parent.id)}</b></div>
          <div class="h1" style="margin-top:6px">${esc(parent.title)}</div>
          <div class="muted">${esc(parent.note)}</div>

          <div style="height:12px"></div>
          <button class="btn" onclick="location.hash='#/orders'">← Quay lại danh sách</button>
        </div>
      </div>

      <div style="height:12px"></div>
      <div class="h2">Đơn con</div>
      <div class="grid products" id="childGrid"></div>
    `);

    $("#childGrid").innerHTML = childs.map(c=>`
      <div class="card product">
        <div class="thumb">
          <img src="${esc(c.img)}" alt="${esc(c.title)}"/>
        </div>
        <div class="pad">
          <div class="h2">${esc(c.title)}</div>
          <div class="muted">${esc(c.desc)}</div>
          <div style="height:10px;display:flex;justify-content:space-between;align-items:center">
            <b style="color:var(--p3)">${vnd(c.price)}</b>
            <button class="btn primary" onclick="alert('Demo: đơn con chỉ xem, muốn mua hãy tạo sản phẩm riêng!')">Chọn</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  // ===== TOPUP (ATM tạo lệnh -> hiển thị đơn + trạng thái đang xử lí) =====
  function renderTopup(){
    const s = state();
    const u = getUser(s);

    $("#appMain").innerHTML = pageShell(`
      <div class="h1">Nạp tiền</div>
      <div class="card pad">
        <div class="muted">ATM sẽ tạo “Đơn nạp” với trạng thái mặc định <b>Đang xử lí</b>.</div>
        <div class="divider"></div>

        <div class="grid" style="grid-template-columns:1fr 1fr">
          <div class="card pad" style="background:var(--card2)">
            <div class="muted">Số dư</div>
            <div style="font-weight:950;font-size:22px">${vnd(u?.wallet?.balance || 0)}</div>
          </div>
          <div class="card pad" style="background:var(--card2)">
            <div class="muted">Khuyến mãi</div>
            <div style="font-weight:950;font-size:22px">${vnd(u?.wallet?.promo || 0)}</div>
          </div>
        </div>

        <div style="height:12px"></div>

        <div class="card pad" style="background:var(--card2)">
          <div class="h2">Tạo lệnh nạp ATM</div>
          <div class="muted">Ngân hàng: <b>ACB</b> • STK: <b>43409177</b> • Chủ TK: <b>LÊ THỊ CẨM TÚ</b></div>

          <div style="height:12px"></div>

          <div class="field">
            <div class="label">Số tiền muốn nạp</div>
            <input class="input" id="atmAmount" inputmode="numeric" placeholder="10,000 - 10,000,000" />
          </div>

          <div class="field" style="margin-top:10px">
            <div class="label">Nội dung chuyển khoản</div>
            <input class="input" id="atmContent" placeholder="VD: NAP ODxxxx (tự tạo)" />
          </div>

          <div style="height:10px"></div>
          <button class="btn primary" id="createAtm">Tạo đơn nạp</button>
        </div>

        <div style="height:14px"></div>
        <div class="h2">Đơn nạp gần đây</div>
        <div class="grid" id="depGrid"></div>
      </div>
    `);

    $("#createAtm").onclick = ()=>{
      const s0 = state();
      const user = getUser(s0);
      if(!user){
        toast("Cần đăng nhập","Chuyển sang Login/Register");
        location.hash = "#/auth?tab=login";
        return;
      }

      const raw = $("#atmAmount").value.replace(/[^\d]/g,"");
      const amount = Number(raw||0);
      if(amount < 10000 || amount > 10000000){
        toast("Sai số tiền","Nhập trong khoảng 10,000 - 10,000,000");
        return;
      }

      const defaultContent = `NAP_${uid("ATM").slice(-8).toUpperCase()}`;
      const content = ($("#atmContent").value.trim() || defaultContent);

      const depId = uid("DEP");
      setState(st=>{
        st.deposits.unshift({
          id: depId,
          userId: st.session.userId,
          type: "ATM",
          amount,
          content,
          status: "Đang xử lí",
          createdAt: Date.now()
        });
        return st;
      });

      toast("Tạo đơn nạp", `Đã tạo: ${content} • ${vnd(amount)} • Đang xử lí`);
      renderDepositsList();
      renderMiniUser();
    };

    function renderDepositsList(){
      const s1 = state();
      const user = getUser(s1);
      const list = s1.deposits
        .filter(x => user ? x.userId === s1.session.userId : true)
        .slice(0,6);

      $("#depGrid").innerHTML = list.map(d=>`
        <div class="card pad">
          <div class="muted">Mã đơn: <b>${esc(d.id)}</b></div>
          <div class="muted">Nội dung: <b>${esc(d.content)}</b></div>
          <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center">
            <b style="color:var(--p3)">${vnd(d.amount)}</b>
            <span class="pill active" style="cursor:default">${esc(d.status)}</span>
          </div>
          <div class="muted" style="margin-top:6px;font-size:12px">${new Date(d.createdAt).toLocaleString("vi-VN")}</div>

          <div style="height:10px"></div>
          <button class="btn" data-dep="${esc(d.id)}">Xem chi tiết</button>
        </div>
      `).join("");

      $("#depGrid").onclick = (e)=>{
        const id = e.target.closest("button")?.dataset?.dep;
        if(!id) return;
        const dep = s1.deposits.find(x=>x.id===id);
        if(!dep) return;

        openModal("Chi tiết đơn nạp",
          `
            <div class="card pad" style="background:var(--card2)">
              <div><b>Mã đơn:</b> ${esc(dep.id)}</div>
              <div><b>Phương thức:</b> ${esc(dep.type)}</div>
              <div><b>Nội dung CK:</b> ${esc(dep.content)}</div>
              <div><b>Số tiền:</b> <span style="color:var(--p3);font-weight:900">${vnd(dep.amount)}</span></div>
              <div><b>Trạng thái:</b> ${esc(dep.status)}</div>
              <div class="muted" style="margin-top:8px">* Demo: trạng thái mặc định “Đang xử lí”. Muốn auto đổi “Thành công” có thể thêm timer.</div>
            </div>
          `,
          `<button class="btn primary" id="mClose">Đóng</button>`
        );
        $("#mClose").onclick = closeModal;
      };
    }

    renderDepositsList();
  }

  // ===== AUTH (tab riêng login/register) =====
  function renderAuth(tab){
    const t = (tab==="register") ? "register" : "login";

    $("#appMain").innerHTML = pageShell(`
      <div class="h1">Tài khoản</div>

      <div class="pills">
        <button class="pill ${t==="login"?"active":""}" id="tabLogin">Đăng nhập</button>
        <button class="pill ${t==="register"?"active":""}" id="tabReg">Đăng ký</button>
      </div>

      <div style="height:12px"></div>

      <div class="card pad" id="authBox"></div>
    `);

    $("#tabLogin").onclick = ()=> location.hash="#/auth?tab=login";
    $("#tabReg").onclick = ()=> location.hash="#/auth?tab=register";

    const authBox = $("#authBox");

    if(t==="login"){
      authBox.innerHTML = `
        <div class="h2">Đăng nhập</div>
        <div class="muted">Đăng nhập xong sẽ về Trang chủ</div>
        <div class="divider"></div>

        <div class="field">
          <div class="label">Email</div>
          <input class="input" id="le" placeholder="name@email.com">
        </div>
        <div class="field" style="margin-top:10px">
          <div class="label">Mật khẩu</div>
          <input class="input" id="lp" type="password" placeholder=">= 6 ký tự">
        </div>

        <div style="height:10px"></div>
        <button class="btn primary" id="doLogin">Đăng nhập</button>
      `;

      $("#doLogin").onclick = ()=>{
        const email = $("#le").value.trim().toLowerCase();
        const pass = $("#lp").value;

        if(!email.includes("@") || pass.length < 6){
          toast("Sai thông tin","Email hợp lệ + mật khẩu >= 6");
          return;
        }

        const s = state();
        const found = Object.entries(s.users).find(([,u])=>u.email===email && u.pass===pass);
        if(!found){
          toast("Không đăng nhập được","Sai tài khoản hoặc mật khẩu");
          return;
        }

        const [uidUser] = found;
        setState(st=>{ st.session.userId = uidUser; return st; });
        toast("Đăng nhập thành công","Chuyển về Trang chủ");
        renderMiniUser();
        location.hash="#/home";
      };
    }else{
      authBox.innerHTML = `
        <div class="h2">Đăng ký</div>
        <div class="muted">Tạo tài khoản đẹp mắt, lưu localStorage</div>
        <div class="divider"></div>

        <div class="field">
          <div class="label">Họ tên</div>
          <input class="input" id="rn" placeholder="Ví dụ: Lê Hà Huấn">
        </div>
        <div class="field" style="margin-top:10px">
          <div class="label">Email</div>
          <input class="input" id="re" placeholder="name@email.com">
        </div>
        <div class="field" style="margin-top:10px">
          <div class="label">Mật khẩu</div>
          <input class="input" id="rp" type="password" placeholder=">= 6 ký tự">
        </div>

        <div style="height:10px"></div>
        <button class="btn primary" id="doReg">Tạo tài khoản</button>
      `;

      $("#doReg").onclick = ()=>{
        const name = $("#rn").value.trim();
        const email = $("#re").value.trim().toLowerCase();
        const pass = $("#rp").value;

        if(!name || !email.includes("@") || pass.length < 6){
          toast("Thiếu/sai","Tên + email hợp lệ + mật khẩu >= 6");
          return;
        }

        try{
          setState(st=>{
            const exists = Object.values(st.users).some(u=>u.email===email);
            if(exists) throw new Error("Email đã được sử dụng");

            const id = uid("USER");
            st.users[id] = {
              id,
              publicId: String(Math.floor(100000 + Math.random()*900000)),
              name,
              email,
              pass,
              wallet: { balance: 0, promo: 0 }
            };
            st.session.userId = id;
            return st;
          });
        }catch(e){
          toast("Lỗi", e.message || "Không tạo được");
          return;
        }

        toast("Đăng ký thành công","Chuyển về Trang chủ");
        renderMiniUser();
        location.hash="#/home";
      };
    }
  }

  // ===== ACCOUNT (tab xem lịch sử mua) =====
  function renderAccount(tab){
    const s = state();
    const u = getUser(s);

    if(!u){
      $("#appMain").innerHTML = pageShell(`
        <div class="card pad">
          <div class="h1">Bạn chưa đăng nhập</div>
          <button class="btn primary" onclick="location.hash='#/auth?tab=login'">Đi tới Login</button>
        </div>
      `);
      return;
    }

    const t = tab || "profile";

    const tabs = `
      <div class="pills">
        <button class="pill ${t==="profile"?"active":""}" onclick="location.hash='#/account?tab=profile'">Thông tin</button>
        <button class="pill ${t==="orders"?"active":""}" onclick="location.hash='#/account?tab=orders'">Lịch sử mua</button>
        <button class="pill ${t==="deposits"?"active":""}" onclick="location.hash='#/account?tab=deposits'">Lịch sử nạp</button>
      </div>
    `;

    let content = "";
    if(t==="orders"){
      const list = s.orders.filter(x=>x.userId===s.session.userId);
      content = list.length ? `
        <div class="grid">
          ${list.map(o=>`
            <div class="card product">
              <div class="thumb"><img src="${esc(o.img)}" alt="${esc(o.title)}"/></div>
              <div class="pad">
                <div class="h2">${esc(o.title)}</div>
                <div class="muted">Mã: <b>${esc(o.id)}</b> • ${new Date(o.createdAt).toLocaleString("vi-VN")}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <b style="color:var(--p3)">${vnd(o.price)}</b>
                  <span class="pill active" style="cursor:default">${esc(o.status)}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="card pad muted">Chưa có đơn mua nào.</div>`;
    } else if(t==="deposits"){
      const list = s.deposits.filter(x=>x.userId===s.session.userId);
      content = list.length ? `
        <div class="grid">
          ${list.map(d=>`
            <div class="card pad">
              <div><b>${esc(d.type)}</b> • ${new Date(d.createdAt).toLocaleString("vi-VN")}</div>
              <div class="muted">Nội dung: <b>${esc(d.content)}</b></div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                <b style="color:var(--p3)">${vnd(d.amount)}</b>
                <span class="pill active" style="cursor:default">${esc(d.status)}</span>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="card pad muted">Chưa có đơn nạp nào.</div>`;
    } else {
      content = `
        <div class="card pad">
          <div class="h2">Thông tin</div>
          <div class="muted">Xin chào <b>${esc(u.name)}</b> • ID <b>${esc(u.publicId)}</b></div>
          <div class="divider"></div>
          <div class="grid" style="grid-template-columns:1fr 1fr">
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Số dư</div>
              <div style="font-size:22px;font-weight:950">${vnd(u.wallet.balance)}</div>
            </div>
            <div class="card pad" style="background:var(--card2)">
              <div class="muted">Khuyến mãi</div>
              <div style="font-size:22px;font-weight:950">${vnd(u.wallet.promo)}</div>
            </div>
          </div>
          <div style="height:12px"></div>
          <button class="btn primary" onclick="location.hash='#/topup'">Nạp tiền</button>
        </div>
      `;
    }

    $("#appMain").innerHTML = pageShell(`
      <div class="h1">Tài khoản</div>
      ${tabs}
      <div style="height:12px"></div>
      ${content}
    `);
  }

  // ===== SUPPORT =====
  function renderSupport(){
    $("#appMain").innerHTML = pageShell(`
      <div class="card pad">
        <div class="h1">Hỗ trợ</div>
        <div class="muted">Demo UI hỗ trợ, bạn có thể gắn Messenger/Zalo sau.</div>
        <div class="divider"></div>
        <button class="btn primary" id="chat">Chat demo</button>
      </div>
    `);
    $("#chat").onclick = ()=> toast("Chat", "Muốn chat thật cần SDK/Backend.");
  }

  // ===== MAIN RENDER =====
  function render(){
    const s = state();
    applyTheme(s.theme || "light");
    renderMiniUser();

    const {parts, query} = parseHash();
    const route = parts[0] || "home";

    setActiveTab(route);

    if(route==="home") renderHome();
    else if(route==="product") renderProductDetail(parts[1] || "");
    else if(route==="orders"){
      if(parts[1]) renderChildOrders(parts[1]);
      else renderOrders();
    }
    else if(route==="topup") renderTopup();
    else if(route==="auth") renderAuth(query.tab);
    else if(route==="account") renderAccount(query.tab);
    else if(route==="support") renderSupport();
    else renderHome();
  }

  // ===== Bind global =====
  function init(){
    // modal
    $("#modalBackdrop").onclick = closeModal;
    $("#modalClose").onclick = closeModal;

    // drawer
    $("#btnMenu").onclick = openDrawer;
    $("#drawerBackdrop").onclick = closeDrawer;
    $("#btnCloseDrawer").onclick = closeDrawer;

    // theme toggle
    $("#btnTheme").onclick = toggleTheme;

    // logout
    $("#btnLogout").onclick = ()=>{
      const s = state();
      if(!s.session.userId){
        toast("Chưa đăng nhập","Bạn đang là khách.");
        closeDrawer();
        return;
      }
      setState(st=>{ st.session.userId=null; return st; });
      toast("Đã đăng xuất","Về Trang chủ");
      closeDrawer();
      renderMiniUser();
      location.hash="#/home";
    };

    window.addEventListener("hashchange", render);
    render();

    // Fix nếu người dùng mở index.html không có hash
    if(!location.hash) location.hash = "#/home";
  }

  init();
})();
