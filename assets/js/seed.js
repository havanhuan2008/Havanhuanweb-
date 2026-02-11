// Seed dữ liệu (chạy 1 lần) để có đơn hàng cha-con + ảnh URL
(function(){
  const KEY = "shopacc_state_v2";
  const exist = localStorage.getItem(KEY);
  if(exist) return;

  const now = Date.now();

  const state = {
    session: { userId: null },
    theme: "light",
    users: {},
    products: [
      {
        id:"ff-001",
        game:"Free Fire",
        title:"Nick Free Fire Giá Tết",
        price:50000,
        stock:2495,
        img:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=60",
        desc:"Nick random đồ, phù hợp tân thủ."
      },
      {
        id:"lq-001",
        game:"Liên Quân",
        title:"Nick Liên Quân VIP",
        price:350000,
        stock:121,
        img:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60",
        desc:"Nhiều skin hiếm, rank cao."
      },
      {
        id:"dk-001",
        game:"Đột Kích",
        title:"Acc Đột Kích Full VIP",
        price:199000,
        stock:88,
        img:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=60",
        desc:"VIP + súng xịn, giao nhanh."
      }
    ],

    // ĐƠN HÀNG CHA/CON: mỗi cha có nhiều con khác nhau
    parentOrders: [
      {
        id:"P-1001",
        title:"Combo Free Fire Tết 2026",
        img:"https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1200&q=60",
        note:"Gồm nhiều nick khác nhau, chọn theo nhu cầu.",
        createdAt: now - 86400000 * 2
      },
      {
        id:"P-1002",
        title:"Combo Liên Quân VIP",
        img:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=60",
        note:"Gồm nhiều acc VIP khác nhau.",
        createdAt: now - 86400000 * 5
      }
    ],
    childOrders: {
      "P-1001": [
        {
          id:"C-2001",
          title:"FF - Nick 1 (Kim cương)",
          img:"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=60",
          price:70000,
          desc:"35 skin, rank KC, random súng nâng cấp."
        },
        {
          id:"C-2002",
          title:"FF - Nick 2 (Giá học sinh)",
          img:"https://images.unsplash.com/photo-1580128637423-1f04b3b3d2c3?auto=format&fit=crop&w=1200&q=60",
          price:30000,
          desc:"Phù hợp tân thủ, đồ cơ bản."
        },
        {
          id:"C-2003",
          title:"FF - Nick 3 (VIP hiếm)",
          img:"https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=60",
          price:250000,
          desc:"Đồ hiếm, nhiều set sưu tầm."
        }
      ],
      "P-1002": [
        {
          id:"C-3001",
          title:"LQ - Acc Cao Thủ (SSS)",
          img:"https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=60",
          price:399000,
          desc:"Nhiều skin SSS, tướng đầy đủ."
        },
        {
          id:"C-3002",
          title:"LQ - Acc Rank Cao Thủ",
          img:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=60",
          price:299000,
          desc:"Rank cao, tỉ lệ skin ngon."
        }
      ]
    },

    deposits: [], // đơn nạp ATM/thẻ
    orders: []    // đơn mua sản phẩm (sau login)
  };

  localStorage.setItem(KEY, JSON.stringify(state));
})();
