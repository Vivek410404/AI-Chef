'use client';

import React from 'react';
import { Clock, Tag, ArrowRight, Info } from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface MarketplaceComparisonSectionProps {
  onGoToBasket: () => void;
}

export function MarketplaceComparisonSection({ onGoToBasket }: MarketplaceComparisonSectionProps) {
  const sampleGrocers = [
    {
      name: 'DMart Ready',
      type: 'Hypermarket Value',
      delivery: 'Next Morning',
      price: 1410,
      savings: 154,
      tag: 'Best Value Model',
      tagColor: 'bg-emerald-600 text-white',
      accent: 'border-emerald-500'
    },
    {
      name: 'Blinkit',
      type: 'Quick Commerce',
      delivery: '10-15 mins',
      price: 1564,
      savings: 0,
      tag: 'Popular Quick Grocer',
      tagColor: 'bg-yellow-400 text-stone-900',
      accent: 'border-yellow-400'
    },
    {
      name: 'Zepto',
      type: 'Instant Commerce',
      delivery: '10 mins',
      price: 1564,
      savings: 0,
      tag: 'Fastest 10m Model',
      tagColor: 'bg-purple-600 text-white',
      accent: 'border-purple-400'
    },
    {
      name: 'BigBasket',
      type: 'Full Grocery Catalog',
      delivery: 'Same Day Slot',
      price: 1472,
      savings: 92,
      tag: 'Broad Catalog Model',
      tagColor: 'bg-red-500 text-white',
      accent: 'border-red-400'
    }
  ];

  return (
    <section className="py-16 bg-cream-100 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-700 text-xs font-bold border border-terracotta-200">
            <Tag className="w-3.5 h-3.5" />
            <span>Multi-Retailer Price Discovery Model</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-forest-900 tracking-tight">
            Compare Basket Estimates Across Grocers
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
            Evaluate estimated basket totals for quick-commerce vs. value hypermarkets before you order.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 bg-cream-200/80 px-3 py-1 rounded-full border border-cream-300">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Demonstration sample catalog data shown for product evaluation.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleGrocers.map((grocer, idx) => (
            <div
              key={idx}
              className={`bg-surface rounded-3xl p-5 border-2 ${grocer.accent} shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${grocer.tagColor}`}>
                    {grocer.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{grocer.delivery}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-forest-900">{grocer.name}</h3>
                <p className="text-xs text-stone-500">{grocer.type}</p>

                <div className="mt-4 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Demonstration Basket</p>
                  <p className="text-xl font-black text-forest-900 tracking-tight">{formatInr(grocer.price)}</p>
                  {grocer.savings > 0 && (
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      Estimated ~{formatInr(grocer.savings)} variation
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onGoToBasket}
                className="w-full py-2.5 rounded-xl bg-forest-50 hover:bg-forest-700 hover:text-white text-forest-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Select in Smart Basket</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-3xl bg-forest-900 text-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-extrabold text-white">Recipe Requirement Protection Rule</h4>
            <p className="text-xs text-cream-200/80">
              Desearched or unchecked an item from your cart? RasoiIQ preserves the recipe ingredient requirements so you never forget what your dishes need.
            </p>
          </div>
          <button
            onClick={onGoToBasket}
            className="shrink-0 px-5 py-2.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Review Smart Basket
          </button>
        </div>

      </div>
    </section>
  );
}
