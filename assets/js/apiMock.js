// Mock API: load product list from local JSON
export async function fetchProducts() {
  const res = await fetch("./assets/data/products.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Không tải được sản phẩm");
  return res.json();
}