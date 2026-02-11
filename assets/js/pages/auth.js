import { setActiveTab, toast } from "../ui.js";
import { isEmail, isStrongPass } from "../validators.js";
import { login, register } from "../apiMock.js";
import { go } from "../router.js";

export function renderAuth(root, tab){
  setActiveTab("account");
  const t = (tab === "register") ? "register" : "login";

  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Tài khoản</div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn ${t==="login"?"primary":""}" id="tLogin">Đăng nhập</button>
          <button class="btn ${t==="register"?"primary":""}" id="tReg">Đăng ký</button>
        </div>

        <div class="divider"></div>
        <div id="box"></div>
      </div>
    </div>
  `;

  root.querySelector("#tLogin").onclick = ()=> go("#/auth?tab=login");
  root.querySelector("#tReg").onclick = ()=> go("#/auth?tab=register");

  const box = root.querySelector("#box");

  if(t==="login"){
    box.innerHTML = `
      <div class="field">
        <div class="label">Email</div>
        <input class="input" id="le" placeholder="name@email.com" />
      </div>
      <div class="field" style="margin-top:10px">
        <div class="label">Mật khẩu</div>
        <input class="input" id="lp" type="password" placeholder=">= 6 ký tự" />
      </div>
      <div style="height:10px"></div>
      <button class="btn primary w-full" id="doLogin">Đăng nhập</button>
    `;

    root.querySelector("#doLogin").onclick = ()=>{
      const email = root.querySelector("#le").value.trim().toLowerCase();
      const pass = root.querySelector("#lp").value;
      if(!isEmail(email) || !isStrongPass(pass)){
        toast("Sai thông tin","Email hợp lệ + mật khẩu >= 6");
        return;
      }
      try{
        login({ email, pass });
        toast("Đăng nhập thành công","Chuyển về Trang chủ");
        go("#/home");
      }catch(err){
        toast("Lỗi", String(err.message||err));
      }
    };
  }else{
    box.innerHTML = `
      <div class="field">
        <div class="label">Họ tên</div>
        <input class="input" id="rn" placeholder="Ví dụ: Lê Hà Huấn" />
      </div>
      <div class="field" style="margin-top:10px">
        <div class="label">Email</div>
        <input class="input" id="re" placeholder="name@email.com" />
      </div>
      <div class="field" style="margin-top:10px">
        <div class="label">Mật khẩu</div>
        <input class="input" id="rp" type="password" placeholder=">= 6 ký tự" />
      </div>
      <div style="height:10px"></div>
      <button class="btn primary w-full" id="doReg">Tạo tài khoản</button>
    `;

    root.querySelector("#doReg").onclick = ()=>{
      const name = root.querySelector("#rn").value.trim();
      const email = root.querySelector("#re").value.trim().toLowerCase();
      const pass = root.querySelector("#rp").value;

      if(!name || !isEmail(email) || !isStrongPass(pass)){
        toast("Thiếu/sai","Tên + email hợp lệ + pass >= 6");
        return;
      }
      try{
        register({ name, email, pass });
        toast("Đăng ký thành công","Chuyển về Trang chủ");
        go("#/home");
      }catch(err){
        toast("Lỗi", String(err.message||err));
      }
    };
  }
}