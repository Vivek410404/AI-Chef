'use client';

import React, { useEffect } from 'react';
import { AlertCircle, ArrowRight, X, Store, Check } from 'lucide-react';

interface RetailerConflictModalProps {
  isOpen: boolean;
  conflictData: {
    currentRetailer: string;
    currentRetailerId: string;
    newRetailer: string;
    newRetailerId: string;
    currentItemCount: number;
    incomingVariantTitle?: string;
  } | null;
  onClose: () => void;
  onConfirmSwitch: () => void;
  isSwitching?: boolean;
}

export function RetailerConflictModal({
  isOpen,
  conflictData,
  onClose,
  onConfirmSwitch,
  isSwitching = false
}: RetailerConflictModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !conflictData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-scrollbar overflow-y-auto overflow-x-hidden max-w-[100vw]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface rounded-2xl shadow-elevated border border-cream-300 p-4 sm:p-6 md:p-7 overflow-y-auto overflow-x-hidden max-h-[90vh] no-scrollbar animate-scale-in my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-forest-900">Switch Delivery Retailer?</h3>
            <p className="text-xs text-stone-500 font-medium">Single-Retailer Checkout Rule</p>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 mb-5 text-sm text-stone-700 leading-relaxed">
          Your active shopping cart already contains{' '}
          <strong className="text-forest-900 font-bold">{conflictData.currentItemCount} item(s)</strong>{' '}
          from <strong className="text-forest-900 font-bold">{conflictData.currentRetailer}</strong>.
          <p className="mt-2 text-xs text-stone-600">
            To ensure fast single-trip doorstep delivery without split orders and double delivery fees, RasoiIQ requires all products in a single checkout to come from one merchant.
          </p>
        </div>

        {/* Transition Comparison */}
        <div className="flex items-center justify-between gap-3 p-3 bg-white border border-cream-300 rounded-xl mb-6">
          <div className="flex-1 text-center p-2 rounded-lg bg-cream-50">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Current Cart</span>
            <span className="text-sm font-bold text-stone-800">{conflictData.currentRetailer}</span>
            <span className="text-[11px] text-stone-500 block">{conflictData.currentItemCount} items</span>
          </div>

          <ArrowRight className="w-5 h-5 text-stone-400 shrink-0" />

          <div className="flex-1 text-center p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Switch To</span>
            <span className="text-sm font-bold text-emerald-900">{conflictData.newRetailer}</span>
            <span className="text-[11px] text-emerald-700 block">Recalculate Basket</span>
          </div>
        </div>

        {/* Notice */}
        <p className="text-xs text-stone-500 text-center mb-6">
          Switching will automatically re-price all cart items using {conflictData.newRetailer}&apos;s catalog and add your chosen item.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-cream-300 text-stone-700 font-semibold text-sm hover:bg-cream-100 transition-colors"
          >
            Keep {conflictData.currentRetailer}
          </button>
          <button
            onClick={onConfirmSwitch}
            disabled={isSwitching}
            className="flex-1 px-4 py-2.5 rounded-xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSwitching ? (
              <span>Switching Retailer...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Switch to {conflictData.newRetailer}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
