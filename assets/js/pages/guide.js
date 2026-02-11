export function renderGuide(root){
  root.innerHTML = `
    <div class="container page">
      <div class="card pad">
        <div class="h1">Hướng dẫn</div>
        <div class="muted">Quy trình mua acc (demo frontend-only)</div>

        <div class="divider"></div>

        <div class="card pad" style="background: rgba(255,255,255,.03)">
          <div class="h2">1) Đăng nhập / Đăng ký</div>
          <div class="muted">
            Vào tab <b>Tài khoản</b> → tạo tài khoản hoặc đăng nhập. Dữ liệu lưu trên thiết bị.
          </div>
        </div>

        <div style="height:10px"></div>

        <div class="card pad" style="background: rgba(255,255,255,.03)">
          <div class="h2">2) Nạp tiền</div>
          <div class="muted">
            Vào tab <b>Nạp tiền</b> → nạp thẻ hoặc ATM (tặng 15% demo).
          </div>
        </div>

        <div style="height:10px"></div>

        <div class="card pad" style="background: rgba(255,255,255,.03)">
          <div class="h2">3) Chọn sản phẩm & mua</div>
          <div class="muted">
            Tab <b>Trang chủ</b> → lọc game → mở chi tiết → bấm <b>Mua ngay</b>.
            Hệ thống sẽ trừ số dư và ghi lịch sử đơn hàng.
          </div>
        </div>

        <div style="height:12px"></div>
        <button class="btn primary w-full" onclick="location.hash='#/home'">Bắt đầu mua</button>
      </div>
    </div>
  `;
}