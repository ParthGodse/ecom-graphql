// components/SaveForLaterButton.js
'use client';
import { useState } from 'react';

/**
 * Saves product to localStorage key 'saved'
 * Stored shape: { productId, name, priceCents, quantity, imageUrl, savedAt }
 */
export default function SaveForLaterButton({ product }) {
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = JSON.parse(localStorage.getItem('saved') || '[]');
      const exists = saved.find((s) => String(s.productId) === String(product.id));
      if (!exists) {
        saved.push({
          productId: String(product.id),
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
          imageUrl: product.imageUrl || null,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('saved', JSON.stringify(saved));
        // notify other components (header / saved page)
        window.dispatchEvent(new Event('storage'));
        // optional toast / UX
        // alert('Saved for later');
      } else {
        // optionally move existing → update timestamp
        // alert('Already saved');
      }
    } catch (err) {
      console.error('Save failed', err);
      alert('Could not save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="btn btn-secondary"
      aria-label={`Save ${product.name} for later`}
      style={{ borderRadius: 999 }}
    >
      {saving ? 'Saving…' : 'Save for later'}
    </button>
  );
}
