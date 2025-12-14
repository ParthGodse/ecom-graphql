// components/ProductCard.js
import Link from 'next/link';
import ImageWithFallback from './ImagewithFallback';
export default function ProductCard({ product }) {
  const price = ((product.priceCents || 0) / 100).toFixed(2);

  // ensure URL uses https (picsum and most providers support https)
  let src = product.imageUrl || `https://picsum.photos/seed/product-${product.id || 'x'}/800/600`;
  if (src.startsWith('http://')) src = src.replace('http://', 'https://');

  return (
    <article className="card flex flex-col h-full">
      <div className="card-image">
        <ImageWithFallback
          src={src}
          alt={product.name}
          className="w-full h-full object-cover"
          placeholder="/placeholder-800x600.png"
        />
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="muted mt-2 line-clamp-2">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="price">${price}</div>
            <div className="price-small">SKU {product.sku ?? '—'}</div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/product/${product.id}`} className="btn btn-view">
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
