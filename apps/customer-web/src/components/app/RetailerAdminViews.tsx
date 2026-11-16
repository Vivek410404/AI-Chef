'use client';

import React, { useState } from 'react';
import { Store, ShieldCheck, ShoppingBag, Users, Utensils, TrendingUp, Package, ArrowUpRight } from 'lucide-react';
import { SEED_RETAILERS, SEED_PRODUCT_VARIANTS, SEED_RECIPES } from '@rasoi/database';
import { formatInr } from '@/lib/utils';

export function RetailerAdminViews() {
  const [subView, setSubView] = useState<'retailer' | 'admin'>('retailer');
  const [selectedRetailer, setSelectedRetailer] = useState(SEED_RETAILERS[0].id);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Switcher Navigation */}
      <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Enterprise Portals</span>
          <h1 className="text-2xl font-black text-forest-900">Partner & Platform Controls</h1>
        </div>

        <div className="flex items-center gap-2 bg-cream-100 p-1 rounded-2xl border border-cream-200">
          <button
            onClick={() => setSubView('retailer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subView === 'retailer'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900'
            }`}
          >
            <Store className="w-4 h-4 text-forest-700" />
            <span>Retailer Dashboard</span>
          </button>

          <button
            onClick={() => setSubView('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subView === 'admin'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-terracotta-500" />
            <span>Super Admin</span>
          </button>
        </div>
      </div>

      {subView === 'retailer' ? (
        /* Retailer Dashboard */
        <div className="space-y-6">
          
          {/* Retailer Selector & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Managing Store</span>
              <select
                value={selectedRetailer}
                onChange={(e) => setSelectedRetailer(e.target.value)}
                className="w-full text-base font-extrabold text-forest-900 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {SEED_RETAILERS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Bengaluru Hub)</option>
                ))}
              </select>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Today's Meal Orders</span>
              <p className="text-2xl font-black text-forest-900">42 Orders</p>
              <span className="text-[10px] text-emerald-600 font-bold">+18% vs yesterday</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Basket GMV</span>
              <p className="text-2xl font-black text-forest-900">₹52,480</p>
              <span className="text-[10px] text-stone-500 font-medium">Avg Basket ₹1,249</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Stock Health</span>
              <p className="text-2xl font-black text-emerald-600">98.4%</p>
              <span className="text-[10px] text-stone-500 font-medium">1 item low stock</span>
            </div>
          </div>

          {/* Product Catalog Management */}
          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div>
                <h3 className="text-lg font-black text-forest-900">Store SKU Catalog & Live Pricing</h3>
                <p className="text-xs text-stone-500">Connected to RasoiIQ's recipe ingredient mapper</p>
              </div>
              <span className="text-xs font-bold text-forest-700 bg-forest-50 px-3 py-1 rounded-xl border border-forest-200">
                {SEED_PRODUCT_VARIANTS.length} SKUs Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-200 text-stone-400 uppercase text-[10px] font-extrabold">
                    <th className="pb-3">Product Name & Brand</th>
                    <th className="pb-3">SKU Code</th>
                    <th className="pb-3">Pack Size</th>
                    <th className="pb-3">MRP</th>
                    <th className="pb-3">Store Price</th>
                    <th className="pb-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {SEED_PRODUCT_VARIANTS.map((v) => (
                    <tr key={v.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3 font-bold text-forest-900 flex items-center gap-2">
                        <img src={v.imageUrl} alt={v.title} className="w-8 h-8 rounded-lg object-cover bg-cream-100" />
                        <div>
                          <p>{v.title}</p>
                          <span className="text-[10px] text-stone-400 font-semibold">{v.brand}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-stone-500">{v.sku}</td>
                      <td className="py-3 text-stone-600">{v.packQuantity} {v.packUnit}</td>
                      <td className="py-3 line-through text-stone-400">{formatInr(v.mrpInr)}</td>
                      <td className="py-3 font-black text-forest-900">{formatInr(v.sellingPriceInr)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          In Stock (50+)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Super Admin Dashboard */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold uppercase">
                <Users className="w-4 h-4" />
                <span>Households</span>
              </div>
              <p className="text-3xl font-black text-forest-900">1,482</p>
              <span className="text-[10px] text-emerald-600 font-bold">+120 this week</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold uppercase">
                <Utensils className="w-4 h-4" />
                <span>Indian Recipes</span>
              </div>
              <p className="text-3xl font-black text-forest-900">{SEED_RECIPES.length}</p>
              <span className="text-[10px] text-stone-500 font-semibold">100% Homestyle Tested</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold uppercase">
                <Store className="w-4 h-4" />
                <span>Active Grocers</span>
              </div>
              <p className="text-3xl font-black text-forest-900">{SEED_RETAILERS.length}</p>
              <span className="text-[10px] text-stone-500 font-semibold">Blinkit, Zepto, DMart, BB</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-cream-300 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold uppercase">
                <TrendingUp className="w-4 h-4" />
                <span>AI Accuracy</span>
              </div>
              <p className="text-3xl font-black text-emerald-600">99.2%</p>
              <span className="text-[10px] text-stone-500 font-semibold">Deterministic verification</span>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-4">
            <h3 className="text-lg font-black text-forest-900">System Architecture Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <span className="font-extrabold text-forest-900 block">AI Layer</span>
                <p className="text-stone-600 leading-relaxed">
                  Google Gemini API free tier active via backend proxy with deterministic rule-engine failover. Zero API cost incurred.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                <span className="font-extrabold text-forest-900 block">Grocery Calculation Engine</span>
                <p className="text-stone-600 leading-relaxed">
                  Strictly separate recipe ingredient requirements from basket purchase toggles. Scaled serving and pantry stock deductions verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
