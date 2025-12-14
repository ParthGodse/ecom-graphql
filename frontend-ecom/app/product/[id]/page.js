// app/product/[id]/page.js  (server component, styled to match theme)
import Link from 'next/link';
import { graphqlFetch } from '../../../lib/graphqlFetch';
import AddToCartButton from '../../../components/AddToCartButton';
import ImageWithFallback from '../../../components/ImagewithFallback';
import SaveForLaterButton from '../../../components/SaveForLaterButton';

const PRODUCT_QUERY = `
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      description
      priceCents
      inventory
      sku
      imageUrl
    }
  }
`;

export default async function ProductPage(props) {
  const params = await props.params;
  const id = params && params.id ? String(params.id) : null;

  if (!id) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-semibold">Product ID missing from URL.</h2>
      </div>
    );
  }

  let data;
  try {
    data = await graphqlFetch(PRODUCT_QUERY, { id });
  } catch (err) {
    return (
      <div className="py-24 text-center text-red-600">
        <h2 className="text-xl font-semibold">Error loading product</h2>
        <pre className="mt-4 text-sm whitespace-pre-wrap">{String(err.message)}</pre>
      </div>
    );
  }

  const product = data?.product;
  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <p className="text-gray-500 mt-2">We couldn't find that product.</p>
      </div>
    );
  }

  // price formatting
  const price = ((product.priceCents || 0) / 100).toFixed(2);

  // safe image url + https force
  let src = product.imageUrl || `https://picsum.photos/seed/product-${product.id}/1200/900`;
  if (src.startsWith('http://')) src = src.replace('http://', 'https://');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm muted btn-ghost">← Back to products</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: large image card */}
        <div className="card p-0 overflow-hidden">
          <div className="card-image" style={{ height: '28rem' }}>
            <ImageWithFallback
              src={src}
              alt={product.name}
              className="w-full h-full object-cover"
              placeholder="/placeholder-800x600.png"
            />
          </div>
        </div>

        {/* Right: details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-neutralDark">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="price">${price}</div>
            <div className="price-small muted">SKU {product.sku ?? '—'}</div>
            <div className="price-small muted">• {product.inventory} in stock</div>
          </div>

          <div className="text-gray-700">
            <p className="muted">{product.description}</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
            {/* client interactive add-to-cart button */}
            <AddToCartButton product={product} />

            {/* View on store or other secondary CTA */}
            <SaveForLaterButton product={product} />
          </div>

          <div className="mt-6 muted text-sm">
            <p>Free shipping on orders over $50 • 30-day returns • Secure payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
