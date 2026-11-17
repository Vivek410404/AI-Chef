'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Store,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface RetailerComparison {
  retailerId: string;
  retailerName: string;
  retailerSlug: string;
  deliveryTimeEstimate: string;
  priceInr: number;
  mrpInr: number;
  discountInr: number;
  inStock: boolean;
  isLowestPrice: boolean;
}

interface ProductVariantDetail {
  id: string;
  sku: string;
  title: string;
  packQuantity: number;
  packUnit: string;
  mrpInr: number;
  basePriceInr: number;
  inStock: boolean;
  retailerComparisons: RetailerComparison[];
}

export interface DetailedProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  description?: string;
  tags?: string[];
  status: string;
  isSampleData: boolean;
  variants: ProductVariantDetail[];
  relatedProducts?: Array<{
    id: string;
    slug: string;
    title: string;
    brand: string;
    category: string;
    imageUrl: string;
    startingPriceInr: number;
  }>;
}

interface ProductDetailModalProps {
  product: DetailedProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (variantId: string, quantity: number, retailerId?: string) => void;
  onSelectRelatedProduct?: (slug: string) => void;
  activeRetailerId?: string;
  cartQuantityForVariant?: (variantId: string) => number;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onSelectRelatedProduct,
  activeRetailerId = 'ret-blinkit',
  cartQuantityForVariant
}: ProductDetailModalProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedRetailerId, setSelectedRetailerId] = useState(activeRetailerId);

  useEffect(() => {
    if (product) {
      setSelectedVariantIndex(0);
      setQuantity(1);
      setSelectedRetailerId(activeRetailerId);
    }
  }, [product, activeRetailerId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const comparisons = currentVariant?.retailerComparisons || [];
  const activeComp = comparisons.find(c => c.retailerId === selectedRetailerId) || comparisons[0];
  const displayPrice = activeComp ? activeComp.priceInr : currentVariant?.basePriceInr || 0;
  const mrp = currentVariant ? currentVariant.mrpInr : 0;
  const discountPercent = mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;

  const cartQty = cartQuantityForVariant ? cartQuantityForVariant(currentVariant?.id || '') : 0;

  const handleAddCurrent = () => {
    if (currentVariant) {
      onAddToCart(currentVariant.id, quantity, selectedRetailerId);
    }
  };

  const handleAddWithRetailer = (retailerId: string) => {
    setSelectedRetailerId(retailerId);
    if (currentVariant) {
      onAddToCart(currentVariant.id, quantity, retailerId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-elevated border border-cream-300 overflow-y-auto max-h-[92vh] no-scrollbar animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 text-stone-500 hover:text-stone-800 bg-white/80 hover:bg-white backdrop-blur rounded-full border border-cream-300 shadow-soft transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Sample Data Disclaimer */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>DEMO PRICING &amp; SAMPLE CATALOG DATA — Authoritative 4-Grocer Model</span>
          </div>
          <span className="hidden sm:inline text-[11px] text-amber-700">Single Retailer per Checkout</span>
        </div>

        {/* Main Content Grid */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Image & Highlights */}
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square max-h-72 rounded-2xl overflow-hidden bg-cream-50 border border-cream-200 relative p-4 flex items-center justify-center">
              <ImageWithFallback
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-terracotta-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-soft">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Pack Size Variants Selector */}
            {product.variants.length > 1 && (
              <div className="w-full mt-4">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
                  Select Pack Size / Variant
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedVariantIndex === idx
                          ? 'border-forest-600 bg-forest-50/60 ring-2 ring-forest-500/20 shadow-sm'
                          : 'border-cream-300 bg-white hover:border-cream-400'
                      }`}
                    >
                      <span className="text-xs font-bold text-stone-900 block truncate">{v.title}</span>
                      <span className="text-xs font-semibold text-forest-700 block mt-0.5">
                        ₹{v.basePriceInr}
                        {v.mrpInr > v.basePriceInr && (
                          <span className="ml-1 text-[11px] text-stone-400 line-through">₹{v.mrpInr}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description & Storage notes */}
            {product.description && (
              <div className="w-full mt-4 p-3.5 bg-cream-50/70 border border-cream-200 rounded-xl text-xs text-stone-600 leading-relaxed">
                <span className="font-bold text-stone-800 block mb-1">Product Details &amp; Storage:</span>
                <p>{product.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Title, Active Price & Grocer Comparison */}
          <div className="flex flex-col">
            {/* Category & Brand Pills */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cream-200 text-stone-700">
                {product.category}
              </span>
              <span className="text-[11px] font-semibold text-stone-500">
                Brand: <strong className="text-stone-800">{product.brand}</strong>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-forest-900 leading-tight mb-2">
              {product.title}
            </h2>

            {/* Selected Variant Subtitle */}
            <p className="text-xs text-stone-500 font-medium mb-4">
              Pack Size: <span className="font-semibold text-stone-700">{currentVariant?.packQuantity} {currentVariant?.packUnit}</span>
              {' • '}
              SKU: <span className="font-mono text-stone-600">{currentVariant?.sku}</span>
            </p>

            {/* Price Box */}
            <div className="p-4 bg-white border border-cream-300 rounded-2xl shadow-soft mb-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-extrabold text-forest-900">₹{displayPrice}</span>
                {mrp > displayPrice && (
                  <span className="text-base text-stone-400 line-through font-medium">₹{mrp}</span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Save ₹{mrp - displayPrice} ({discountPercent}%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Store className="w-3.5 h-3.5 text-forest-600" />
                <span>Price via <strong>{activeComp?.retailerName || 'Quick-Commerce Partner'}</strong></span>
                <span>• Estimated delivery: <strong>{activeComp?.deliveryTimeEstimate || '10-15 mins'}</strong></span>
              </div>
            </div>

            {/* Multi-Retailer Price Comparison Matrix */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Compare Retailer Prices
                </span>
                <span className="text-[11px] text-stone-500">Select merchant to add</span>
              </div>

              <div className="space-y-2">
                {comparisons.map(comp => (
                  <div
                    key={comp.retailerId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selectedRetailerId === comp.retailerId
                        ? 'border-forest-600 bg-forest-50/50 shadow-sm'
                        : 'border-cream-300 bg-white hover:border-cream-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center font-bold text-xs text-forest-900">
                        {comp.retailerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900">{comp.retailerName}</span>
                          {comp.isLowestPrice && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                              Lowest Price
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 block">
                          {comp.deliveryTimeEstimate} • {comp.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-stone-900 block">₹{comp.priceInr}</span>
                        {comp.mrpInr > comp.priceInr && (
                          <span className="text-[10px] text-stone-400 line-through">₹{comp.mrpInr}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddWithRetailer(comp.retailerId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedRetailerId === comp.retailerId
                            ? 'bg-forest-900 text-white shadow-soft hover:bg-forest-800'
                            : 'bg-cream-100 text-stone-700 hover:bg-cream-200'
                        }`}
                      >
                        {selectedRetailerId === comp.retailerId ? 'Selected' : 'Choose'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Primary Add-to-Cart Action */}
            <div className="mt-auto pt-4 border-t border-cream-300 flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-cream-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-cream-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-cream-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddCurrent}
                className="flex-1 px-5 py-3 rounded-xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} to Cart (₹{displayPrice * quantity})</span>
              </button>
            </div>

            {cartQty > 0 && (
              <p className="mt-2 text-xs text-center text-emerald-700 font-medium">
                ✓ Currently {cartQty} pack(s) in your basket
              </p>
            )}
          </div>
        </div>

        {/* Related Products Footer */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="bg-cream-50/70 border-t border-cream-200 p-5 sm:p-7">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Related Groceries in {product.category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {product.relatedProducts.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => onSelectRelatedProduct && onSelectRelatedProduct(rp.slug)}
                  className="p-3 bg-white border border-cream-300 rounded-xl hover:border-forest-500 hover:shadow-soft cursor-pointer transition-all flex flex-col"
                >
                  <div className="w-full aspect-square rounded-lg bg-cream-50 overflow-hidden mb-2 p-1 flex items-center justify-center">
                    <ImageWithFallback
                      src={rp.imageUrl}
                      alt={rp.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{rp.brand}</span>
                  <span className="text-xs font-bold text-stone-900 truncate block">{rp.title}</span>
                  <span className="text-xs font-bold text-forest-700 mt-1 block">From ₹{rp.startingPriceInr}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
