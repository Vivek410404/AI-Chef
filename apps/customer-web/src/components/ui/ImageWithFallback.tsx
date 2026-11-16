'use client';

import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackCuisine?: string;
}

export function ImageWithFallback({
  src,
  alt = 'Recipe',
  className = '',
  fallbackTitle,
  fallbackCuisine,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-cream-200 via-cream-100 to-forest-50/50 text-forest-800 border border-cream-300 p-2 text-center select-none ${className}`}
      >
        <ChefHat className="w-5 h-5 text-forest-700/60 mb-1" />
        {fallbackTitle && (
          <span className="text-[10px] font-bold text-forest-900 line-clamp-1 leading-tight px-1">
            {fallbackTitle}
          </span>
        )}
        {fallbackCuisine && (
          <span className="text-[9px] font-semibold text-terracotta-600 uppercase tracking-wider">
            {fallbackCuisine}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-cream-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}
