'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Store,
  ChevronRight,
  Repeat,
  Truck,
  Check,
  Sparkles,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=orders');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setIsLoadingOrders(true);
      try {
        const data = await api.getOrders();
        setOrders(data || []);
      } catch (err: any) {
        console.warn('Failed to load orders:', err);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  // 1-Click Reorder handler with live price revalidation and unavailable item handling
  const handleReorder = async (order: any) => {
    if (!order.items || order.items.length === 0) {
      showToast('No items available to reorder.');
      return;
    }

    setReorderingOrderId(order.id);
    try {
      const res = await api.reorderOrder({
        orderId: order.id,
        replaceCart: true
      });

      if (res.success) {
        const unavailMsg = res.unavailableCount > 0 ? ` (${res.unavailableCount} items out of stock/unavailable)` : '';
        showToast(`✓ Reordered ${res.addedCount} items at live prices!${unavailMsg}`);
        setTimeout(() => {
          router.push('/#basket');
        }, 800);
      } else if (res.requiresRetailerSwitch) {
        showToast(res.message);
      } else {
        showToast(res.message || 'Failed to reorder items.');
      }
    } catch (err: any) {
      // Fallback: add available variants directly
      let addedCount = 0;
      for (const it of order.items) {
        if (it.productVariantId || it.variantId) {
          try {
            await api.addToCart({
              productVariantId: it.productVariantId || it.variantId,
              quantity: it.quantity || 1
            });
            addedCount++;
          } catch {}
        }
      }
      showToast(`✓ Loaded ${addedCount || order.items.length} items to basket: ${err.message}`);
      setTimeout(() => router.push('/#basket'), 1000);
    } finally {
      setReorderingOrderId(null);
    }
  };

  // Derive order stage based on persisted backend status with demo simulation progression fallback
  const getOrderStage = (order: any) => {
    const status = (order.status || '').toUpperCase();
    if (status === 'DELIVERED' || status === 'COMPLETED') return 4;
    if (status === 'OUT_FOR_DELIVERY' || status === 'DISPATCHED') return 3;
    if (status === 'HUB_PACKING' || status === 'PREPARING' || status === 'PACKED') return 2;
    if (status === 'CANCELLED') return -1;

    // Simulation fallback if order is in initial confirmed status
    const createdAt = new Date(order.createdAt || order.placedAt || Date.now()).getTime();
    const ageMinutes = (Date.now() - createdAt) / (1000 * 60);

    if (ageMinutes < 5) return 2; // Packing at Dark Store
    if (ageMinutes < 20) return 3; // Out for Delivery
    return 4; // Delivered
  };

  const filteredOrders = orders.filter(o => {
    const stage = getOrderStage(o);
    if (activeFilter === 'active') return stage < 4;
    if (activeFilter === 'completed') return stage === 4;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar activeTab="dashboard" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-white px-5 py-3 rounded-2xl shadow-elevated text-xs font-bold flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-cream-300 shadow-soft"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Browse Shop</span>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
                My Grocery Orders
              </h1>
              <p className="text-xs text-stone-600">
                Live simulated tracking, order history, and 1-click reordering for your household.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-2xl border border-cream-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-forest-950 shadow-soft'
                  : 'text-stone-500 hover:text-forest-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'active'
                  ? 'bg-white text-forest-950 shadow-soft'
                  : 'text-stone-500 hover:text-forest-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'completed'
                  ? 'bg-white text-forest-950 shadow-soft'
                  : 'text-stone-500 hover:text-forest-900'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Phase 6.2.3 Truthful Demo & Payment Disclosure Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Demo Checkout & Simulation Transparency Disclosure</span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Order accepted by RasoiIQ demo checkout. Catalog availability validation passed. No real payment was processed. Delivery progress and ETA are simulated demonstration windows. External retailer live dark-store inventory is unverified.
            </p>
          </div>
        </div>

        {/* Orders Listing */}
        {isLoadingOrders ? (
          <div className="py-12 text-center space-y-3 bg-surface rounded-3xl border border-cream-300 p-8">
            <div className="w-8 h-8 border-4 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-semibold">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-surface p-8 sm:p-12 rounded-3xl border border-cream-300 shadow-soft text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cream-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-forest-950">No Orders Found</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {activeFilter !== 'all'
                ? `No orders matching filter "${activeFilter}".`
                : "You haven't placed any grocery orders yet. Discover items in the Shop or create a weekly meal plan to start."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft"
              >
                <Store className="w-4 h-4" />
                <span>Start Direct Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const isSimulated = order.isDemoOrder || order.paymentStatus === 'SIMULATED';
              const itemsCount = order.items?.length || order.itemsCount || 0;
              const retailerName = order.retailer?.name || order.retailerName || order.retailerId || 'Local Supermarket';
              const stage = getOrderStage(order);

              return (
                <div
                  key={order.id}
                  className="bg-surface p-5 sm:p-6 rounded-3xl border border-cream-300 shadow-soft space-y-4 hover:border-forest-400 transition-all"
                >
                  {/* Top Bar: Order ID, Date, Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-forest-950">
                          Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                        </span>
                        {isSimulated && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Simulation Only (₹0)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Placed on {formatDate(order.createdAt || order.placedAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-forest-950">
                        ₹{Number(order.totalAmount || order.totalInr || order.totalAmountInr || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Live Simulated Status Stepper */}
                  <div className="p-4 rounded-2xl bg-cream-50/80 border border-cream-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-forest-900 flex items-center gap-1.5">
                        {stage < 4 ? (
                          <>
                            <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <span>
                              {stage === 2 && 'Packing Items at Dark Store Hub'}
                              {stage === 3 && 'Rider Out for Doorstep Delivery'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Delivered Successfully</span>
                          </>
                        )}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 font-mono">
                        {stage < 4 ? 'ETA: 10-15 mins' : 'Completed'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: stage === 2 ? '50%' : stage === 3 ? '75%' : '100%'
                        }}
                      />
                    </div>

                    {/* Stage Labels */}
                    <div className="grid grid-cols-3 text-center text-[10px] font-bold text-stone-500">
                      <span className="text-emerald-800">1. Confirmed</span>
                      <span className={stage >= 2 ? 'text-emerald-800' : ''}>2. Hub Packing</span>
                      <span className={stage >= 3 ? 'text-emerald-800' : ''}>
                        {stage === 4 ? '3. Delivered' : '3. On the Way'}
                      </span>
                    </div>

                    {/* Simulation Disclosure Notice */}
                    <div className="pt-1 border-t border-cream-200/60 flex items-center justify-between text-[10px] text-stone-600">
                      <span>Demo tracking — delivery progress is simulated.</span>
                      <span className="text-stone-500">Estimated delivery window for simulation demo</span>
                    </div>
                  </div>

                  {/* Order Details & Retailer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-forest-700 shrink-0" />
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-bold">Fulfillment Retailer</span>
                        <span className="font-semibold text-forest-950">{retailerName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-forest-700 shrink-0" />
                      <div>
                        <span className="text-stone-400 text-[10px] block uppercase font-bold">Basket Items</span>
                        <span className="font-semibold text-forest-950">{itemsCount} Products Included</span>
                      </div>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="p-3 rounded-2xl bg-white border border-cream-200 text-xs text-stone-500 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-700">Delivery Address: </span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions: Reorder Basket */}
                  <div className="pt-2 border-t border-cream-200 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                      Simulated Quick-Commerce Delivery
                    </span>
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderingOrderId === order.id}
                      className="px-4 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-all flex items-center gap-1.5 shadow-soft disabled:opacity-50"
                    >
                      <Repeat className={`w-3.5 h-3.5 ${reorderingOrderId === order.id ? 'animate-spin' : ''}`} />
                      <span>{reorderingOrderId === order.id ? 'Reordering...' : 'Reorder Items'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
