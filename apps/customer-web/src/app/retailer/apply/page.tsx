'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChefHat, ShoppingBag, Store, CheckCircle2, Clock, AlertCircle, ArrowLeft, ArrowRight, Building } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function RetailerApplyPage() {
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState(user?.fullName || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [operatingCities, setOperatingCities] = useState('Ahmedabad, Gandhinagar');
  const [catalogSize, setCatalogSize] = useState(250);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingApp, setExistingApp] = useState<any | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.getRetailerApplicationStatus();
        if (res.hasApplication && res.application) {
          setExistingApp(res.application);
        }
      } catch {}
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cities = operatingCities.split(',').map(c => c.trim()).filter(Boolean);

    try {
      const res = await api.applyRetailer({
        businessName: businessName.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        operatingCities: cities,
        catalogSizeEstimate: Number(catalogSize)
      });
      setSuccess(true);
      setExistingApp(res.application);
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Application submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to marketplace</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </div>

        <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-soft">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-forest-950">Partner With RasoiIQ</h2>
            <p className="mt-1 text-xs text-stone-600">
              Apply to join RasoiIQ&apos;s smart multi-grocer comparison marketplace
            </p>
          </div>

          {existingApp ? (
            <div className="py-6 space-y-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                existingApp.status === 'APPROVED' ? 'bg-forest-50 border-forest-200 text-forest-700' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {existingApp.status === 'APPROVED' ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
              </div>

              <div>
                <h3 className="text-xl font-bold text-forest-950">
                  Application Status: <span className="uppercase text-forest-700">{existingApp.status}</span>
                </h3>
                <p className="mt-1 text-xs text-stone-600 max-w-sm mx-auto">
                  Business: <span className="font-bold text-forest-900">{existingApp.businessName}</span>
                </p>
              </div>

              {existingApp.status === 'PENDING' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
                  <p className="font-bold">Under Administrative Review</p>
                  <p>
                    Your merchant application is queued for administrative verification. Once approved, your account will be granted access to the Retailer Inventory Portal.
                  </p>
                </div>
              )}

              {existingApp.status === 'APPROVED' && (
                <div className="pt-2">
                  <Link
                    href="/#retailer-admin"
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft"
                  >
                    <span>Open Retailer Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Grocery Store / Business Name
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Blinkit Ahmedabad Bodakdev Hub"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Retail Partner Manager"
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Contact Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Operating Cities (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={operatingCities}
                  onChange={(e) => setOperatingCities(e.target.value)}
                  placeholder="Ahmedabad, Gandhinagar, Surat"
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Estimated SKU Catalog Size
                </label>
                <input
                  type="number"
                  min={10}
                  step={50}
                  value={catalogSize}
                  onChange={(e) => setCatalogSize(Number(e.target.value))}
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Retailer Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
