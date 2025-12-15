// components/SaveForLaterButton.js
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SaveForLaterButton({ product }) {
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = JSON.parse(localStorage.getItem("saved") || "[]");
      const exists = saved.find((s) => String(s.productId) === String(product.id));

      if (!exists) {
        saved.push({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem("saved", JSON.stringify(saved));
        window.dispatchEvent(new Event("storage"));

        toast.success(`${product.name} saved for later`);
      } else {
        toast("Already saved", { icon: "💾" });
      }
    } catch {
      toast.error("Could not save item");
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
