// components/Header.js
'use client';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function Header() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCount(cart.reduce((s, i) => s + (i.quantity || 0), 0));
      } catch { setCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => {
    const update = () => {
      try {
        const s = JSON.parse(localStorage.getItem('saved') || '[]');
        setSavedCount(s.length);
      } catch { setSavedCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);


  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="logo-circle">MS</div>
            <div>
              <div className="text-lg font-semibold leading-tight">Modern Store</div>
              <div className="text-xs muted -mt-0.5">Curated demo</div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {savedCount > 0 && <span className="ml-1 text-xs bg-brand-600 text-white rounded-full w-5 h-5 flex items-center justify-center">{savedCount}</span>}
          <Link href="/saved" className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50">
            Saved
          </Link>

          <Link href="/cart" className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50">
            <ShoppingCartIcon className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-700">Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{count}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
