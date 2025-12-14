import ProductListServer from "../components/ProductListClient";

export default function HomePage() {
  return (
    <div>
      <h2 className="section-title">Featured Products</h2>
      <ProductListServer />
    </div>
  );
}
