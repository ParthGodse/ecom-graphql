// app/cart/page.js
'use client';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import client from '../../lib/apollo';
import ImageWithFallback from '../../components/ImagewithFallback';

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
    const c = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(c);
  }, []);

  const total = cart.reduce((s, i) => s + (i.priceCents * i.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) { alert('Cart empty'); return; }
    setLoadingCheckout(true);
    try {
      const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID || '1';
      const res = await checkout({ variables: { userId: String(userId) } });
      alert('Checkout success! Order id: ' + res.data.checkout.id);
      localStorage.removeItem('cart');
      setCart([]);
    } catch (e) {
      alert('Error during checkout: ' + (e.message || e));
    } finally {
      setLoadingCheckout(false);
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
          {/* Left: items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {/* thumbnail */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {/* if you have images you can show a tiny <img src=... /> here */}
                    <ImageWithFallback
                      src={item.imageUrl || `https://picsum.photos/seed/product-${item.productId}/80/80`}
                      alt={item.name}
                      ></ImageWithFallback>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="muted mt-1">${(item.priceCents/100).toFixed(2)} × {item.quantity}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-gray-900">${((item.priceCents*item.quantity)/100).toFixed(2)}</div>
                  {/* optional small remove button */}
                  <button
                    onClick={() => {
                      const next = cart.filter((_, i) => i !== idx);
                      localStorage.setItem('cart', JSON.stringify(next));
                      setCart(next);
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className="mt-2 btn btn-secondary"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: summary */}
          <div className="card p-6">
            <div className="text-sm muted">Order summary</div>
            <div className="text-2xl font-bold mt-2">${(total/100).toFixed(2)}</div>

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
              <p>Free shipping on orders over $50 • 30-day returns • Secure payment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
