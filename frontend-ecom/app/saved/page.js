// app/saved/page.js
'use client';
import { useEffect, useState } from 'react';
import ImageWithFallback from '../../components/ImagewithFallback';
/**
 * Saved page (client) — reads localStorage 'saved' and shows items.
 * Move to cart copies item into 'cart' localStorage and removes from 'saved'.
 */
export default function SavedPage() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const s = JSON.parse(localStorage.getItem('saved') || '[]');
        setSaved(s);
      } catch {
        setSaved([]);
      }
    };
    load();
    // update on storage events (other tabs/components)
    const onStorage = () => load();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const removeItem = (productId) => {
    const next = saved.filter((s) => String(s.productId) !== String(productId));
    localStorage.setItem('saved', JSON.stringify(next));
    setSaved(next);
    window.dispatchEvent(new Event('storage'));
  };

  const moveToCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((c) => String(c.productId) === String(item.productId));
      if (existing) {
        existing.quantity = existing.quantity + (item.quantity || 1);
      } else {
        cart.push({
          productId: item.productId,
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || null,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));

      // remove from saved
      removeItem(item.productId);

      // notify other UI
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      alert('Could not move to cart');
    }
  };

  if (!saved || saved.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Saved for later</h2>
        <p className="muted">You haven't saved any items yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Saved for later</h2>

      <div className="space-y-4">
        {saved.map((item, idx) => (
          <div key={idx} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {item.imageUrl ? (
                    <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    />

                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center muted">No image</div>
                )}
              </div>

              <div>
                <div className="font-medium">{item.name}</div>
                <div className="muted mt-1">${((item.priceCents||0)/100).toFixed(2)}</div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button onClick={() => moveToCart(item)} className="btn btn-view" style={{ borderRadius: 999 }}>
                  Move to cart
                </button>
                <button onClick={() => removeItem(item.productId)} className="btn btn-secondary">
                  Remove
                </button>
              </div>

              <div className="muted text-sm">Saved {new Date(item.savedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
