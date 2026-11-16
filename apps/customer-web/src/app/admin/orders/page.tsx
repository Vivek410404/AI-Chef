'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [substitutionNotes, setSubstitutionNotes] = useState('');
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getOrders({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined
      });
      setOrders(res.orders || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setActionLoading(true);
      await api.admin.updateOrderStatus(selectedOrder.id, newStatus, {
        statusReason: statusReason || undefined,
        substitutionNotes: substitutionNotes || undefined,
        fulfillmentNotes: fulfillmentNotes || undefined
      });
      setActionMessage(`Order #${selectedOrder.id} status updated to ${newStatus}.`);
      setSelectedOrder(null);
      fetchOrders(pagination.page);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadges: Record<string, string> = {
    PLACED: 'bg-blue-950 text-blue-300 border-blue-800',
    CONFIRMED: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    'DEMO ORDER CONFIRMED': 'bg-emerald-950 text-emerald-300 border-emerald-800',
    PREPARING: 'bg-amber-950 text-amber-300 border-amber-800',
    OUT_FOR_DELIVERY: 'bg-purple-950 text-purple-300 border-purple-800',
    DISPATCHED: 'bg-purple-950 text-purple-300 border-purple-800',
    DELIVERED: 'bg-teal-950 text-teal-300 border-teal-800',
    CANCELLED: 'bg-red-950 text-red-300 border-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-terracotta-400" />
            <span>Order Fulfillment Operations</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Simulated checkout reconciliation, grocery substitution tracking, and merchant status dispatch
          </p>
        </div>
        <div className="text-xs text-stone-400">
          Total Orders: <strong className="text-white">{pagination.total}</strong>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <span className="font-bold uppercase tracking-wider text-amber-300 mr-2">Demo & Simulation Safeguard</span>
          All grocery orders displayed here are generated through the RasoiIQ simulated checkout workflow. No real currency is transferred or bank accounts debited.
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order ID, merchant, customer email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-terracotta-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={() => fetchOrders(1)}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-terracotta-400" />
                    Loading simulated orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No orders matching query.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                        <span>{ord.id.slice(0, 14)}...</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-stone-800 text-amber-300 border border-amber-800/50">
                          Demo
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-200 font-medium">
                      {ord.retailerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-300">{ord.user?.fullName || 'Demo Customer'}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{ord.user?.email || 'sharma@demo'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{ord.totalAmountInr}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadges[ord.status] || 'bg-stone-800 text-stone-300'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px] font-mono">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setNewStatus(ord.status);
                            setSubstitutionNotes(ord.substitutionNotes || '');
                            setFulfillmentNotes(ord.fulfillmentNotes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-terracotta-950/60 hover:bg-terracotta-900 border border-terracotta-800 text-terracotta-300 text-xs font-semibold"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Update Fulfillment Status</h3>
            <p className="text-xs text-stone-300">
              Order: <span className="font-mono text-terracotta-400">#{selectedOrder.id}</span> ({selectedOrder.retailerName})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Status Reason / Note</label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="E.g., Out for delivery via Rider #12"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Substitution Notes</label>
                <input
                  type="text"
                  value={substitutionNotes}
                  onChange={(e) => setSubstitutionNotes(e.target.value)}
                  placeholder="E.g., Organic tomatoes substituted with local vine tomatoes"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Fulfillment Notes</label>
                <input
                  type="text"
                  value={fulfillmentNotes}
                  onChange={(e) => setFulfillmentNotes(e.target.value)}
                  placeholder="E.g., Delivered to security guard at tower B"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-xs font-bold text-white transition"
              >
                {actionLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
