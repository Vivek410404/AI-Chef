'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  Package,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.admin.getOrderById(orderId)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-terracotta-400" />
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200">
        <h3 className="font-bold text-lg mb-2">Order Not Found</h3>
        <p className="text-sm mb-4">{error || 'Order record could not be retrieved from database.'}</p>
        <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Demo Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-xs text-amber-200">
          <strong>DEMO TRANSACTION:</strong> This order was generated using simulated cart checkout for local demonstration.
        </span>
      </div>

      {/* Order Overview Header */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-white">#{order.id}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()} via {order.retailerName}
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-stone-400">Total Charged:</span>
            <p className="text-2xl font-black text-white font-mono">₹{order.totalAmountInr}</p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[10px] text-stone-500 font-semibold uppercase">Customer</span>
            <p className="text-sm font-bold text-white mt-1">{order.user?.fullName || 'Demo Customer'}</p>
            <p className="text-xs text-stone-400 font-mono">{order.user?.email || 'sharma@demo'}</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[10px] text-stone-500 font-semibold uppercase">Delivery Address</span>
            <p className="text-xs text-stone-200 mt-1">{order.deliveryAddress || 'Sample Address, Ahmedabad'}</p>
          </div>
        </div>

        {/* Operational Notes */}
        {(order.substitutionNotes || order.fulfillmentNotes || order.statusReason) && (
          <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1.5">
            {order.statusReason && (
              <p><strong className="text-stone-400">Status Reason:</strong> <span className="text-stone-200">{order.statusReason}</span></p>
            )}
            {order.substitutionNotes && (
              <p><strong className="text-stone-400">Substitution:</strong> <span className="text-amber-300">{order.substitutionNotes}</span></p>
            )}
            {order.fulfillmentNotes && (
              <p><strong className="text-stone-400">Fulfillment:</strong> <span className="text-stone-200">{order.fulfillmentNotes}</span></p>
            )}
          </div>
        )}
      </div>

      {/* Line Items List */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-terracotta-400" />
          <span>Basket Line Items</span>
        </h3>

        {order.items && order.items.length > 0 ? (
          <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-xl overflow-hidden">
            {order.items.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-3.5 bg-stone-950 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">
                    {item.productVariant?.brand ? `${item.productVariant.brand} - ` : ''}
                    {item.productName || item.ingredientName || 'Ingredient Essential'}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {item.packSize || item.productVariant?.packSize || '1 pack'} · Qty: {item.quantityPacks || item.quantity || 1}
                  </p>
                </div>
                <div className="text-right font-mono text-white font-bold">
                  ₹{item.totalItemPriceInr || item.unitPriceInr || item.priceInr || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-4 text-center">No individual item details recorded.</p>
        )}
      </div>
    </div>
  );
}
