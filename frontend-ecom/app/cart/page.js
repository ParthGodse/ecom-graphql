// app/cart/page.js
'use client';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import client from '../../lib/apollo';

// keep your existing mutation
const CHECKOUT_MUTATION = gql`
  mutation Checkout($userId: ID!) {
    checkout(userId: $userId) {
      id
      totalCents
      items { name quantity priceCents }
    }
  }
`;

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkout] = useMutation(CHECKOUT_MUTATION, { client });

  useEffect(() => {
    const load = () => {
      const c = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(Array.isArray(c) ? c : []);
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  // subtotal in cents
  const subtotalCents = cart.reduce((s, i) => s + (Number(i.priceCents || 0) * Number(i.quantity || 0)), 0);

  // Shipping policy:
  // - Free shipping for orders $50.00 (5000 cents) and above
  // - Otherwise shipping = max( $5.00, 5% of subtotal ) — chosen as a reasonable hybrid
  const SHIPPING_FREE_THRESHOLD_CENTS = 5000;
  const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS
    ? 0
    : Math.max(500, Math.round(subtotalCents * 0.05));

  const totalCents = subtotalCents + shippingCents;

  const handleCheckout = async () => {
    if (cart.length === 0) { alert('Cart empty'); return; }
    setLoadingCheckout(true);
    try {
      const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID || '1';
      const res = await checkout({ variables: { userId: String(userId) } });
      alert('Checkout success! Order id: ' + res.data.checkout.id);
      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      alert('Error during checkout: ' + (e.message || e));
    } finally {
      setLoadingCheckout(false);
    }
  };

  const removeItemAt = (index) => {
    const next = cart.filter((_, i) => i !== index);
    localStorage.setItem('cart', JSON.stringify(next));
    setCart(next);
    window.dispatchEvent(new Event('storage'));
  };

  const saveForLater = (index) => {
    try {
      const item = cart[index];
      const saved = JSON.parse(localStorage.getItem('saved') || '[]');
      const exists = saved.find((s) => String(s.productId) === String(item.productId));
      if (!exists) {
        saved.push({
          productId: String(item.productId),
          name: item.name,
          priceCents: item.priceCents,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || null,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('saved', JSON.stringify(saved));
      }
      // then remove from cart
      removeItemAt(index);
      // notify header
      window.dispatchEvent(new Event('saved-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      alert('Could not save item for later');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Your cart</h2>

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <p className="muted">Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="card flex items-center justify-between p-4 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={item.imageUrl || '/placeholder-800x600.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/placeholder-800x600.png'; }}
                    />
                  </div>

                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="muted mt-1">${(item.priceCents / 100).toFixed(2)} × {item.quantity}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right font-semibold text-gray-900">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Save for later */}
                    <button
                      onClick={() => saveForLater(idx)}
                      className="btn btn-secondary"
                      title="Save for later"
                      aria-label={`Save ${item.name} for later`}
                      style={{ borderRadius: 999 }}
                    >
                      Save
                    </button>

                    {/* Remove (more visual) */}
                    <button
                      onClick={() => removeItemAt(idx)}
                      className="btn btn-secondary remove-btn"
                      title="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-6">
            <div className="text-sm muted">Order summary</div>
            <div className="text-lg mt-2">
              <div className="flex items-center justify-between">
                <div className="muted">Subtotal</div>
                <div className="font-semibold">${(subtotalCents / 100).toFixed(2)}</div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="muted">Shipping</div>
                <div className="font-semibold">
                  {shippingCents === 0 ? 'Free' : `$${(shippingCents / 100).toFixed(2)}`}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="text-sm muted">Order total</div>
                <div className="text-2xl font-bold">${(totalCents / 100).toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="btn btn-view btn-full"
                aria-label="Place order"
              >
                {loadingCheckout ? 'Processing…' : 'Place order'}
              </button>
            </div>

            <div className="mt-4 muted text-sm">
              <p>
                Free shipping on orders over $50 • 30-day returns • Secure payment
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
