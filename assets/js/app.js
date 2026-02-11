import { $, closeModal, toast, setActiveTab } from "./ui.js";
import { parseHash } from "./router.js";
import { seed, getUser, logout, setTheme } from "./apiMock.js";
import { getState } from "./store.js";

import { renderHome } from "./pages/home.js";
import { renderTopup } from "./pages/topup.js";
import { renderGuide } from "./pages/guide.js";
import { renderSupport } from "./pages/support.js";
import { renderAccount } from "./pages/account.js";
import { renderOrders, renderChildOrders } from "./pages/orders.js";
import { renderProduct } from "./pages/product.js";
import { renderAuth } from "./pages/auth.js";

function renderMini(){
  const u = getUser();
  $("#miniName").textContent = u?.name || "Khách";
  $("#miniBalance").textContent = (u?.wallet?.balance||0).toLocaleString("vi-VN") + "đ";
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

function applyThemeFromState(){
  const s = getState();
  const theme = s.theme || "light";
  document.documentElement.setAttribute("data-theme", theme);
}

async function route(){
  applyThemeFromState();
  renderMini();

  const root = $("#appMain");
  const { parts, query } = parseHash();
  const routeName = parts[0] || "home";

  // active tab mapping
  const tabRoute = ["home","topup","orders","support","account"].includes(routeName) ? routeName : null;
  if(tabRoute) setActiveTab(tabRoute);

  if(routeName === "home") renderHome(root);
  else if(routeName === "topup") renderTopup(root);
  else if(routeName === "guide") renderGuide(root);
  else if(routeName === "support") renderSupport(root);
  else if(routeName === "account") renderAccount(root, query.tab || "profile");
  else if(routeName === "orders"){
    if(parts[1]) renderChildOrders(root, parts[1]);
    else renderOrders(root);
  }
  else if(routeName === "product"){
    renderProduct(root, parts[1] || "");
  }
  else if(routeName === "auth"){
    renderAuth(root, query.tab || "login");
  }
  else renderHome(root);
}

async function main(){
  await seed();
  applyThemeFromState();

  // modal
  $("#modalBackdrop").onclick = closeModal;
  $("#modalClose").onclick = closeModal;

  // drawer
  $("#btnMenu").onclick = openDrawer;
  $("#drawerBackdrop").onclick = closeDrawer;
  $("#btnCloseDrawer").onclick = closeDrawer;

  // theme
  $("#btnTheme").onclick = ()=>{
    const s = getState();
    const next = (s.theme === "dark") ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    toast("Đổi giao diện", next === "dark" ? "Đã bật Dark mode" : "Đã bật Light mode");
  };

  // logout
  $("#btnLogout").onclick = ()=>{
    const u = getUser();
    if(!u){ toast("Chưa đăng nhập","Bạn đang ở chế độ khách"); closeDrawer(); return; }
    logout();
    toast("Đã đăng xuất","Về Trang chủ");
    closeDrawer();
    location.hash = "#/home";
  };

  window.addEventListener("hashchange", route);

  if(!location.hash) location.hash = "#/home";
  route();
}

main();