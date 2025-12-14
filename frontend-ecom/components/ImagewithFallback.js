// components/ImageWithFallback.js
'use client';
import { useState } from 'react';

export default function ImageWithFallback({ src: initialSrc, alt = '', className = '', placeholder = '/placeholder-800x600.png' }) {
  const [src, setSrc] = useState(initialSrc || placeholder);
  const [errored, setErrored] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (!errored) {
          setErrored(true);
          setSrc(placeholder);
        }
      }}
    />
  );
}
