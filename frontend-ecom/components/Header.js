// components/Header.js
'use client';
import Link from 'next/link';
import { ShoppingCartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const readCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const saved = JSON.parse(localStorage.getItem('saved') || '[]');

      const cartQty = Array.isArray(cart)
        ? cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
        : 0;

      const savedQty = Array.isArray(saved) ? saved.length : 0;

      setCartCount(cartQty);
      setSavedCount(savedQty);
    } catch {
      setCartCount(0);
      setSavedCount(0);
    }
  };

  useEffect(() => {
    readCounts();

    const onStorage = () => readCounts();
    window.addEventListener('storage', onStorage);

    // Optional custom events for instant update
    const onCustom = () => readCounts();
    window.addEventListener('cart-updated', onCustom);
    window.addEventListener('saved-updated', onCustom);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCustom);
      window.removeEventListener('saved-updated', onCustom);
    };
  }, []);

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="logo-circle">MS</div>
          <div>
            <div className="text-lg font-semibold leading-tight">Modern Store</div>
            <div className="text-xs muted -mt-0.5">Curated demo</div>
          </div>
        </Link>

        {/* Right: Nav */}
        <nav className="flex items-center gap-6">

          {/* Saved */}
          <Link href="/saved" className="relative hover:bg-gray-50 px-3 py-2 rounded-md no-underline">
            <div className="relative w-fit">
              <BookmarkIcon className="w-6 h-6 text-gray-700" />
              {savedCount > 0 && (
                <span className="badge-icon">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </div>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative hover:bg-gray-50 px-3 py-2 rounded-md no-underline">
            <div className="relative w-fit">
              <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="badge-icon">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
          </Link>

        </nav>
      </div>
    </header>
  );
}
