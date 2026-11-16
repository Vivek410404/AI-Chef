'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Package,
  Calendar,
  IndianRupee,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Store,
  ExternalLink,
  ChevronRight
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

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

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
          <span className="text-xs font-semibold text-stone-400">Order History</span>
        </div>

        {/* Page Header */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">My Grocery Orders</h1>
              <p className="text-xs text-stone-600">
                Track and review simulated multi-retailer grocery deliveries for your household.
              </p>
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        {isLoadingOrders ? (
          <div className="py-12 text-center space-y-3 bg-surface rounded-3xl border border-cream-300 p-8">
            <div className="w-8 h-8 border-4 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-semibold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface p-8 sm:p-12 rounded-3xl border border-cream-300 shadow-soft text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cream-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-forest-950">No Orders Yet</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven&apos;t placed any grocery orders yet. Generate your weekly meal plan and build your smart shopping basket to start.
            </p>
            <div className="pt-2">
              <Link
                href="/#planner"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft"
              >
                <span>Go to 7-Day Meal Planner</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isSimulated = order.isDemoOrder || order.paymentStatus === 'SIMULATED';
              const itemsCount = order.items?.length || order.itemsCount || 0;
              const retailerName = order.retailer?.name || order.retailerId || 'Local Supermarket';

              return (
                <div
                  key={order.id}
                  className="bg-surface p-5 sm:p-6 rounded-3xl border border-cream-300 shadow-soft space-y-4 hover:border-forest-400 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                        <span>Placed on {formatDate(order.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED'
                          ? 'bg-forest-50 text-forest-800 border border-forest-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {order.status || 'CONFIRMED'}
                      </span>
                      <span className="text-base font-extrabold text-forest-950">
                        ₹{Number(order.totalAmount || order.totalInr || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

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
                    <div className="p-3 rounded-2xl bg-cream-50/70 border border-cream-200 text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">Delivery Address: </span>
                      <span>{order.deliveryAddress}</span>
                    </div>
                  )}
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
