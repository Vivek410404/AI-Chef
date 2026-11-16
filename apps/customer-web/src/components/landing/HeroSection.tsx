'use client';

import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Clock, ChefHat, Info } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface HeroSectionProps {
  onStartPlanner: () => void;
  onOpenAiModal: () => void;
}

export function HeroSection({ onStartPlanner, onOpenAiModal }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20">
      {/* Background Decorative Gradient */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-tr from-forest-50 via-cream-200/50 to-terracotta-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Subtle Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>India-First Smart Meal Planning & Grocery Platform</span>
          </div>

          {/* User's Exact Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-forest-900 tracking-tight leading-[1.15]">
            Plan Your Meals. <br className="hidden sm:inline" />
            <span className="text-terracotta-500">Shop Smarter.</span> Eat Better.
          </h1>

          {/* User's Exact Supporting Description */}
          <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Your family&apos;s weekly meal planner and smart grocery companion. Discover recipes, organize meals and build your grocery basket in minutes.
          </p>

          {/* CTA Action Cluster */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartPlanner}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-soft hover:shadow-elevated transition-all flex items-center justify-center gap-2 group"
            >
              <span>Open 7-Day Meal Planner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenAiModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface hover:bg-cream-100 text-forest-900 font-bold text-sm border border-cream-300 shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-terracotta-500" />
              <span>Ask AI Chef (Gemini + Rule Engine)</span>
            </button>
          </div>

          {/* Verified Value Props Row (Honest, Unambiguous Claims) */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-stone-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" />
              <span>Jain & Vegetarian Dietary Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-terracotta-500" />
              <span>Scaled Ingredients & Deduplication</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500">Multi-Grocer Comparison (Demonstration Catalog)</span>
            </div>
          </div>

        </div>

        {/* Hero Interactive Showcase Card */}
        <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-surface p-4 sm:p-6 shadow-xl border border-cream-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-cream-200 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs font-bold text-forest-900">
                Sharma Family Meal Plan Preview • 4 Servings
              </span>
            </div>
            <span className="text-[11px] bg-cream-100 text-stone-600 px-2.5 py-0.5 rounded-full font-semibold border border-cream-200 self-start sm:self-auto">
              Sample Demonstration Data
            </span>
          </div>

          {/* 3-Column Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
            
            {/* Monday Preview */}
            <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-forest-900">Monday</span>
                <span className="text-[10px] font-semibold text-stone-500">Breakfast & Lunch</span>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-surface border border-cream-200 flex items-center gap-2.5">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=150&q=80"
                    alt="Methi Thepla"
                    fallbackTitle="Thepla"
                    fallbackCuisine="Gujarati"
                    className="w-10 h-10 rounded-lg shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-terracotta-600 uppercase">Breakfast</span>
                    <p className="text-xs font-bold text-forest-900 truncate">Methi Thepla with Dahi</p>
                    <span className="text-[9px] text-emerald-700 font-semibold">Jain Friendly</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-surface border border-cream-200 flex items-center gap-2.5">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=150&q=80"
                    alt="Paneer Butter Masala"
                    fallbackTitle="Paneer Masala"
                    fallbackCuisine="North Indian"
                    className="w-10 h-10 rounded-lg shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-forest-600 uppercase">Lunch</span>
                    <p className="text-xs font-bold text-forest-900 truncate">Paneer Butter Masala</p>
                    <span className="text-[9px] text-stone-500 font-medium">300g Paneer scaled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tuesday Preview */}
            <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-forest-900">Tuesday</span>
                <span className="text-[10px] font-semibold text-stone-500">Breakfast & Lunch</span>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-surface border border-cream-200 flex items-center gap-2.5">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=150&q=80"
                    alt="Kanda Poha"
                    fallbackTitle="Poha"
                    fallbackCuisine="Maharashtrian"
                    className="w-10 h-10 rounded-lg shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-terracotta-600 uppercase">Breakfast</span>
                    <p className="text-xs font-bold text-forest-900 truncate">Mumbai Batata Poha</p>
                    <span className="text-[9px] text-stone-500 font-medium">15 mins prep</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-surface border border-cream-200 flex items-center gap-2.5">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=150&q=80"
                    alt="Rajma Chawal"
                    fallbackTitle="Rajma Chawal"
                    fallbackCuisine="Punjabi"
                    className="w-10 h-10 rounded-lg shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-forest-600 uppercase">Lunch</span>
                    <p className="text-xs font-bold text-forest-900 truncate">Kashmiri Rajma Chawal</p>
                    <span className="text-[9px] text-terracotta-600 font-semibold">18g Protein/svg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Calculation Card */}
            <div className="p-3.5 rounded-2xl bg-forest-900 text-white flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold mb-1">
                  <span>GROCERY ENGINE</span>
                  <span>Sample Multi-Grocer Model</span>
                </div>
                <p className="text-base font-extrabold tracking-tight">Auto-Calculated Basket</p>
                <p className="text-[11px] text-cream-200/80 leading-snug">
                  Pantry stock (Atta 2kg, Spices) subtracted automatically from shopping list.
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center bg-forest-800/80 px-2 py-1 rounded">
                  <span className="text-cream-200 text-[11px]">Blinkit (10-15m)</span>
                  <span className="font-bold">₹1,564</span>
                </div>
                <div className="flex justify-between items-center bg-forest-800/80 px-2 py-1 rounded">
                  <span className="text-cream-200 text-[11px]">Zepto (10m)</span>
                  <span className="font-bold">₹1,564</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-800/80 px-2 py-1 rounded border border-emerald-500/40">
                  <span className="text-emerald-300 font-semibold text-[11px]">DMart Ready (Value)</span>
                  <span className="text-emerald-300 font-bold">₹1,410</span>
                </div>
              </div>

              <button
                onClick={onStartPlanner}
                className="w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
              >
                Open Full Interactive Plan
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
