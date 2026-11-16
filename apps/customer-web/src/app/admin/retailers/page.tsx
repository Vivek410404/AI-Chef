'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  FileCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Building,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminRetailersPage() {
  const [tab, setTab] = useState<'merchants' | 'applications'>('merchants');
  const [retailers, setRetailers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for application review
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rets, appsRes] = await Promise.all([
        api.admin.getRetailers(),
        api.admin.getRetailerApplications()
      ]);
      setRetailers(rets || []);
      setApplications(appsRes.applications || []);
    } catch (err: any) {
      console.error('Failed to fetch retailer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRetailerStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const reason = nextStatus === 'SUSPENDED' ? prompt('Reason for suspending merchant:') : undefined;
    if (nextStatus === 'SUSPENDED' && !reason) return;

    try {
      await api.admin.updateRetailerStatus(id, nextStatus, reason || undefined);
      setActionMessage(`Merchant status updated to ${nextStatus}.`);
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReviewApplication = async () => {
    if (!selectedApp || !reviewAction) return;
    if (reviewAction === 'REJECTED' && !rejectReason.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }

    try {
      setActionLoading(true);
      await api.admin.reviewRetailerApplication(selectedApp.id, reviewAction, rejectReason || undefined);
      setActionMessage(`Application ${reviewAction.toLowerCase()} successfully.`);
      setSelectedApp(null);
      setReviewAction(null);
      setRejectReason('');
      fetchData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-400" />
            <span>Retailers & Merchant Console</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Manage partner integrations, catalog status, and review merchant onboarding submissions
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setTab('merchants')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'merchants' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            Active Merchants ({retailers.length})
          </button>
          <button
            onClick={() => setTab('applications')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              tab === 'applications' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Applications ({applications.filter(a => a.applicationStatus === 'PENDING').length})</span>
            {applications.some(a => a.applicationStatus === 'PENDING') && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-stone-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
          Loading retailer records...
        </div>
      ) : tab === 'merchants' ? (
        /* Merchants Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retailers.map((r) => {
            const isSuspended = r.status === 'SUSPENDED';
            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{r.name}</h3>
                      <p className="text-xs text-stone-400 font-mono">ID: {r.id}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      isSuspended ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {r.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-stone-950 border border-stone-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase">Delivery</span>
                      <p className="text-xs font-bold text-stone-200 mt-0.5">{r.deliveryTimeEstimate || '30m'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase">Fee</span>
                      <p className="text-xs font-bold text-stone-200 mt-0.5">₹{r.deliveryFeeInr || 29}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase">Min Order</span>
                      <p className="text-xs font-bold text-stone-200 mt-0.5">₹{r.minOrderValueInr || 99}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                  <span className="text-xs text-stone-500">Rating: {r.rating || 4.7} ★</span>
                  <button
                    onClick={() => handleToggleRetailerStatus(r.id, r.status || 'ACTIVE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSuspended
                        ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800'
                    }`}
                  >
                    {isSuspended ? 'Reactivate Merchant' : 'Suspend Merchant'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Applications Tab */
        <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      No merchant onboarding applications recorded.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{app.businessName}</div>
                        <div className="text-[11px] text-stone-400">ID: {app.id.slice(0, 12)}...</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-stone-300">{app.user?.fullName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{app.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          app.applicationStatus === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : app.applicationStatus === 'REJECTED'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {app.applicationStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setReviewAction('APPROVED');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setReviewAction('REJECTED');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-500">
                            Reviewed by {app.reviewedBy || 'Admin'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && reviewAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {reviewAction === 'APPROVED' ? 'Approve Retailer Application' : 'Reject Retailer Application'}
            </h3>
            <p className="text-xs text-stone-300">
              Merchant: <strong className="text-white">{selectedApp.businessName}</strong> ({selectedApp.user?.email})
            </p>

            {reviewAction === 'APPROVED' ? (
              <p className="text-xs text-stone-400">
                Approving will elevate the applicant account to <strong className="text-amber-400 font-mono">RETAILER</strong> role and provision a partner merchant record.
              </p>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Rejection Reason (Required):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Incomplete trade license, out of service geography..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewApplication}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                  reviewAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
