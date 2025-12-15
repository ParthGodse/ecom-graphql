// components/AddToCartButton.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AddToCartButton({ product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // defensive: ensure qty at least 1 and not more than inventory (if provided)
    if (!Number.isInteger(qty) || qty < 1) setQty(1);
  }, [qty]);

  const changeQty = (newQty) => {
    // clamp between 1 and inventory if inventory provided
    const max = product?.inventory ? Number(product.inventory) : 9999;
    const n = Math.max(1, Math.min(max, Number(newQty) || 1));
    setQty(n);
  };

  const handleDecrement = () => changeQty(qty - 1);
  const handleIncrement = () => changeQty(qty + 1);

  const add = () => {
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((i) => String(i.productId) === String(product.id));

      if (existing) existing.quantity += qty;
      else {
        cart.push({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity: qty,
          imageUrl: product.imageUrl,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      toast.success(`${qty} × ${product.name} added to cart`);
    } catch (err) {
      toast.error("Could not add to cart");
    } finally {
      setLoading(false);
    }
  };

  // keyboard-accessible handler for +/- when focus on capsule
  const onKey = (e) => {
    if (e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault(); handleIncrement();
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      e.preventDefault(); handleDecrement();
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Quantity capsule */}
      <div
        className="inline-flex items-center bg-white border border-gray-200 rounded-full shadow-sm"
        role="group"
        aria-label="Quantity selector"
      >
        <button
          type="button"
          onClick={handleDecrement}
          className="btn btn-secondary px-3 py-2 rounded-l-full"
          aria-label="Decrease quantity"
          disabled={loading || (product?.inventory ? qty <= 1 : false)}
        >
          −
        </button>

        <div
          tabIndex={0}
          onKeyDown={onKey}
          className="px-4 py-2 min-w-14 text-center font-medium select-none"
          aria-live="polite"
          aria-atomic="true"
          role="spinbutton"
          aria-valuemin={1}
          aria-valuemax={product?.inventory ?? undefined}
          aria-valuenow={qty}
        >
          {qty}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="btn btn-secondary px-3 py-2 rounded-r-full"
          aria-label="Increase quantity"
          disabled={loading || (product?.inventory ? qty >= product.inventory : false)}
        >
          +
        </button>
      </div>

      {/* Add to cart primary button */}
      <button
        onClick={add}
        disabled={loading}
        className="btn btn-view"
        style={{ borderRadius: 999 }}
        aria-label={`Add ${qty} ${product.name} to cart`}
      >
        {loading ? 'Adding…' : `Add ${qty}`}
      </button>
    </div>
  );
}
