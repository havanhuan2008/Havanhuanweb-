import { initStateIfNeeded, getState, setState } from "./store.js";

export function uid(prefix="ID"){
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function seed(){
  // load products.json
  const products = await fetch("./assets/data/products.json").then(r=>r.json());

  initStateIfNeeded(() => ({
    theme: "light",
    session: { userId: null },
    users: {},
    products,
    wallet: {},

    // đơn hàng cha–con
    parentOrders: [
      {
        id:"P-1001",
        title:"Combo Free Fire Tết 2026",
        img:"https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1200&q=60",
        note:"Gồm nhiều nick khác nhau, bấm vào để xem đơn con.",
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id:"P-1002",
        title:"Combo Liên Quân VIP",
        img:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=60",
        note:"Gồm nhiều acc VIP khác nhau, mỗi acc có ảnh/mô tả riêng.",
        createdAt: Date.now() - 86400000 * 5
      }
    ],
    childOrders: {
      "P-1001": [
        { id:"C-2001", title:"FF - Nick 1 (Kim cương)", img:"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=60", price:70000, desc:"35 skin, rank KC, random súng nâng cấp." },
        { id:"C-2002", title:"FF - Nick 2 (Giá học sinh)", img:"https://images.unsplash.com/photo-1580128637423-1f04b3b3d2c3?auto=format&fit=crop&w=1200&q=60", price:30000, desc:"Phù hợp tân thủ, đồ cơ bản." },
        { id:"C-2003", title:"FF - Nick 3 (VIP hiếm)", img:"https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=60", price:250000, desc:"Đồ hiếm, nhiều set sưu tầm." }
      ],
      "P-1002": [
        { id:"C-3001", title:"LQ - Acc Cao Thủ (SSS)", img:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=60", price:399000, desc:"Nhiều skin SSS, tướng đầy đủ." },
        { id:"C-3002", title:"LQ - Acc Rank Cao Thủ", img:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=60", price:299000, desc:"Rank cao, tỉ lệ skin ngon." }
      ]
    },

    // lịch sử
    orders: [],
    deposits: []
  }));
}

export function getUser(){
  const s = getState();
  const id = s.session.userId;
  return id ? s.users[id] : null;
}

export function setTheme(theme){
  return setState(s => { s.theme = theme; return s; });
}

export function logout(){
  return setState(s => { s.session.userId = null; return s; });
}

export function register({name, email, pass}){
  return setState(s=>{
    const exists = Object.values(s.users).some(u=>u.email===email);
    if(exists) throw new Error("Email đã được sử dụng");
    const id = uid("USER");
    s.users[id] = {
      id,
      publicId: String(Math.floor(100000 + Math.random()*900000)),
      name, email, pass,
      wallet: { balance: 0, promo: 0 }
    };
    s.session.userId = id;
    return s;
  });
}

export function login({email, pass}){
  const s = getState();
  const found = Object.entries(s.users).find(([,u]) => u.email===email && u.pass===pass);
  if(!found) throw new Error("Sai tài khoản hoặc mật khẩu");
  const [id] = found;
  return setState(st=>{ st.session.userId=id; return st; });
}

export function buyProduct(productId){
  const s = getState();
  const u = getUser();
  if(!u) throw new Error("NEED_LOGIN");
  const p = s.products.find(x=>x.id===productId);
  if(!p) throw new Error("NOT_FOUND");
  if(u.wallet.balance < p.price) throw new Error("NO_BALANCE");

  return setState(st=>{
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
}

export function createAtmDeposit({amount, content}){
  const u = getUser();
  if(!u) throw new Error("NEED_LOGIN");

  return setState(st=>{
    st.deposits.unshift({
      id: uid("DEP"),
      userId: st.session.userId,
      type: "ATM",
      amount,
      content,
      status: "Đang xử lí",
      createdAt: Date.now()
    });
    return st;
  });
}