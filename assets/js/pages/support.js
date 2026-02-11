import { setActiveTab, toast } from "../ui.js";

export function renderSupport(root){
  setActiveTab("support");
  root.innerHTML = `
    <div class="container">
      <div class="card pad" style="border-radius:var(--r-lg)">
        <div style="font-weight:950;font-size:26px">Hỗ trợ</div>
        <div class="muted" style="margin-top:6px">Demo UI hỗ trợ (sau này gắn Zalo/Messenger).</div>
        <div class="divider"></div>
        <button class="btn primary w-full" id="chat">Chat demo</button>
      </div>
    </div>
  `;
  root.querySelector("#chat").onclick = ()=> toast("Chat demo","Muốn chat thật cần SDK/Backend.");
}