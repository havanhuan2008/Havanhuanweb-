import { mountRouter } from "./router.js";
import { $, toast, bindModal, renderMiniUser } from "./ui.js";
import { ensureState, setState, getSessionUser } from "./store.js";

import { renderHome } from "./pages/home.js";
import { renderTopup } from "./pages/topup.js";
import { renderGuide } from "./pages/guide.js";
import { renderSupport } from "./pages/support.js";
import { renderAccount } from "./pages/account.js";

function render(route, query) {
  const main = $("#appMain");
  const state = ensureState();
  const u = getSessionUser(state);

  const pages = {
    home: () => renderHome(main, { query }),
    topup: () => renderTopup(main, { query }),
    guide: () => renderGuide(main, { query }),
    support: () => renderSupport(main, { query }),
    account: () => renderAccount(main, { query })
  };

  (pages[route] || pages.home)();
  renderMiniUser();
}

function setupDrawer() {
  const drawer = $("#drawer");
  const open = () => { drawer.classList.add("open"); drawer.setAttribute("aria-hidden","false"); };
  const close = () => { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); };

  $("#btnMenu").addEventListener("click", open);
  $("#drawerBackdrop").addEventListener("click", close);
  $("#btnCloseDrawer").addEventListener("click", close);

  $("#btnAccount").addEventListener("click", () => {
    location.hash = "#/account";
  });

  $("#btnLogout").addEventListener("click", () => {
    const state = ensureState();
    if (!state.session.userId) {
      toast("Chưa đăng nhập", "Bạn đang ở chế độ khách.");
      close();
      return;
    }
    setState(s => {
      s.session.userId = null;
      return s;
    });
    toast("Đã đăng xuất", "Hẹn gặp lại!");
    close();
    location.hash = "#/home";
    renderMiniUser();
  });
}

function init() {
  ensureState();
  bindModal();
  setupDrawer();
  mountRouter(render);
}

init();