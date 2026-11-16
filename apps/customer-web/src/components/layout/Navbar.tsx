'use client';

import React from 'react';
import { Sparkles, Calendar, ShoppingBag, UtensilsCrossed, Package, Users, ChefHat, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Household } from '@rasoi/shared-types';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin') => void;
  onOpenAiPlanner: () => void;
  onOpenHousehold: () => void;
  onSwitchHousehold?: (householdId: string) => void;
  basketCount: number;
  household?: Household | null;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenAiPlanner,
  onOpenHousehold,
  onSwitchHousehold,
  basketCount,
  household
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Customer Dashboard"
        >
          <div className="w-11 h-11 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-soft group-hover:bg-forest-800 transition-all duration-300">
            <ChefHat className="w-6 h-6 text-terracotta-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-forest-900">Rasoi</span>
              <span className="font-extrabold text-2xl tracking-tight text-terracotta-500">IQ</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200 ml-1">
                India
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">AI Meal Planning & Groceries</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-cream-200/80 p-1.5 rounded-2xl border border-cream-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-forest-700" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'planner'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-forest-500" />
            7-Day Planner
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'recipes'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-terracotta-500" />
            Discover Recipes
          </button>

          <button
            onClick={() => setActiveTab('basket')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative ${
              activeTab === 'basket'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            Smart Basket
            {basketCount > 0 && (
              <span className="ml-1 bg-terracotta-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                {basketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pantry')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'pantry'
                ? 'bg-surface text-forest-900 shadow-sm'
                : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            My Pantry
          </button>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Generator CTA button */}
          <button
            onClick={onOpenAiPlanner}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-forest-700 via-forest-500 to-emerald-600 hover:opacity-95 shadow-soft hover:shadow-elevated transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-saffron-500 animate-pulse" />
            <span className="hidden sm:inline">Ask AI Chef</span>
            <span className="sm:hidden">AI Chef</span>
          </button>

          {/* Household Profile Button & Pilot Switcher */}
          <div className="relative group">
            <button
              onClick={onOpenHousehold}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-surface border border-cream-300 text-stone-700 hover:border-forest-500 transition-colors"
              title="Configure Family Preferences"
            >
              <Users className="w-4 h-4 text-forest-700" />
              <span className="text-xs font-semibold hidden lg:inline">
                {household?.name || 'Sharma Family'} ({household?.members?.length || 4})
              </span>
            </button>
            {onSwitchHousehold && (
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-64 bg-surface rounded-2xl shadow-elevated border border-cream-300 p-2 z-50">
                <p className="text-[10px] uppercase font-bold text-stone-500 px-2 py-1 tracking-wider">Pilot Household Accounts</p>
                <button
                  onClick={() => onSwitchHousehold('hh-sharma-family')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    household?.id === 'hh-sharma-family' ? 'bg-forest-50 text-forest-900 font-bold border border-forest-200' : 'hover:bg-cream-100 text-stone-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Sharma Family</p>
                    <p className="text-[10px] text-stone-500">North Indian • Peanut Alert</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Veg</span>
                </button>
                <button
                  onClick={() => onSwitchHousehold('hh-patel-family')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 ${
                    household?.id === 'hh-patel-family' ? 'bg-forest-50 text-forest-900 font-bold border border-forest-200' : 'hover:bg-cream-100 text-stone-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Patel Family</p>
                    <p className="text-[10px] text-stone-500">Gujarati • Kathiyawadi</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Jain</span>
                </button>
                <button
                  onClick={() => onSwitchHousehold('hh-mehta-family')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors mt-1 ${
                    household?.id === 'hh-mehta-family' ? 'bg-forest-50 text-forest-900 font-bold border border-forest-200' : 'hover:bg-cream-100 text-stone-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">Mehta Family</p>
                    <p className="text-[10px] text-stone-500">Mumbai • Strict Zero Root</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">Strict Jain</span>
                </button>
              </div>
            )}
          </div>

          {/* Partner & Admin Switcher */}
          <button
            onClick={() => setActiveTab(activeTab === 'retailer-admin' ? 'dashboard' : 'retailer-admin')}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'retailer-admin'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'border-cream-300 text-stone-600 hover:text-stone-900 hover:bg-cream-100'
            }`}
            title="Retailer & Platform Administration Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-terracotta-500" />
            <span className="hidden sm:inline">Partner View</span>
          </button>
        </div>

      </div>
    </header>
  );
}
