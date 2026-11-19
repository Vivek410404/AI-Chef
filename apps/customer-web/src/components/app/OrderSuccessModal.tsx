'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  X,
  ShieldCheck,
  Tag,
  Check,
  Truck,
  PackageCheck,
  Store
} from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToDashboard?: () => void;
  orderData: any;
}

export function OrderSuccessModal({ isOpen, onClose, onReturnToDashboard, orderData }: OrderSuccessModalProps) {
  const [deliveryStage, setDeliveryStage] = useState(1); // 1: Confirmed, 2: Packing, 3: Out for delivery

  useEffect(() => {
    if (!isOpen) return;

    // Simulate real-time dark store progression
    setDeliveryStage(1);
    const timer1 = setTimeout(() => setDeliveryStage(2), 2500);
    const timer2 = setTimeout(() => setDeliveryStage(3), 8000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !orderData) return null;

  const handleReturn = () => {
    if (onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-scrollbar overflow-y-auto overflow-x-hidden max-w-[100vw]"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar border border-cream-300 shadow-2xl p-4 sm:p-6 md:p-8 space-y-5 text-center relative my-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
              {orderData.status || 'DEMO ORDER CONFIRMED'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-forest-900 pt-1">Grocery Basket Placed!</h2>
          <p className="text-xs text-stone-500">
            Order Reference: <strong className="text-forest-900">{orderData.orderNumber || orderData.id}</strong>
          </p>
        </div>

        {/* Live Delivery Status Tracker */}
        <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-soft text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-forest-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>
                {deliveryStage === 1 && 'Order Confirmed & Sent to Dark Store'}
                {deliveryStage === 2 && 'Packing Items at Hub'}
                {deliveryStage === 3 && 'Rider Assigned & On the Way'}
              </span>
            </span>
            <span className="text-[11px] font-bold text-stone-500 font-mono">
              ETA: ~{orderData.deliveryTimeEstimate || '10-15 mins'}
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: deliveryStage === 1 ? '25%' : deliveryStage === 2 ? '55%' : '80%'
              }}
            />
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-3 text-center text-[10px] font-bold text-stone-500">
            <span className={deliveryStage >= 1 ? 'text-emerald-700' : ''}>1. Confirmed</span>
            <span className={deliveryStage >= 2 ? 'text-emerald-700' : ''}>2. Packing</span>
            <span className={deliveryStage >= 3 ? 'text-emerald-700' : ''}>3. On the Way</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-cream-200">
            <span className="text-stone-500 font-medium">Retailer Partner</span>
            <span className="font-extrabold text-forest-900">{orderData.retailerName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-cream-200">
            <span className="text-stone-500 font-medium">Estimated Delivery</span>
            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {orderData.deliveryTimeEstimate || '10-15 mins'}
            </span>
          </div>

          {/* Itemized breakdown if available */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b border-cream-200">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">
                Ordered Items ({orderData.items.length})
              </span>
              <div
                className="max-h-36 overflow-y-auto no-scrollbar space-y-1 pr-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] py-0.5 gap-2">
                    <span className="text-stone-700 font-medium truncate flex-1 min-w-0">
                      {item.productName || item.brand || 'Item'} ({item.packSize || 'pack'}) × {item.quantity}
                    </span>
                    <span className="font-bold text-forest-900 shrink-0">
                      {formatInr(item.totalItemPriceInr || item.priceInr || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financials: Subtotal, Delivery, Total */}
          <div className="space-y-1.5 pb-2 border-b border-cream-200">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatInr(orderData.subtotalInr || orderData.totalAmountInr)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee:</span>
              <span className="font-bold">
                {orderData.deliveryFeeInr ? formatInr(orderData.deliveryFeeInr) : 'FREE'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div>
              <span className="text-stone-600 font-semibold block">Total Demo Amount:</span>
              <span className="text-[10px] text-amber-700 font-bold">Demo Order Accepted · No Payment Processed</span>
            </div>
            <span className="font-black text-xl text-forest-900">{formatInr(orderData.totalAmountInr)}</span>
          </div>

          <div className="space-y-1 pt-1 border-t border-cream-200">
            <span className="text-[10px] font-bold uppercase text-stone-400">Delivering to:</span>
            <p className="text-stone-700 font-medium leading-relaxed">
              {orderData.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Phase 6.2.3 Truthful Demo Order & Payment Transparency Notice */}
        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 text-left space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Demo Checkout & Simulation Disclosure</span>
          </p>
          <p className="text-[10px] text-stone-600 leading-relaxed">
            Order accepted by RasoiIQ demo checkout. Catalog availability validation passed. No real payment was processed. Delivery progress and ETA are simulated demonstration windows. External retailer live dark-store inventory is unverified.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-200 text-[11px] text-forest-800 text-left flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
          <p>
            <strong>Recipe Continuity:</strong> Your weekly meal planner and nutrition dashboard remain active and scheduled. You can return anytime to view cooking steps, recipes, and pantry inventory.
          </p>
        </div>

        <button
          onClick={handleReturn}
          className="w-full py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

      </div>
    </div>
  );
}
