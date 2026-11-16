import React from 'react';
import { ArrowRight, Sparkles, ChefHat } from 'lucide-react';

interface CtaSectionProps {
  onStartPlanner: () => void;
  onOpenAiPlanner: () => void;
}

export function CtaSection({ onStartPlanner, onOpenAiPlanner }: CtaSectionProps) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-gradient-to-br from-forest-800 via-forest-700 to-emerald-900 p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-900/60 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ChefHat className="w-3.5 h-3.5 text-terracotta-300" />
              <span>Ready for Dinner Peace of Mind?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Planning Delicious Indian Meals Today
            </h2>

            <p className="text-sm sm:text-base text-cream-200/90 max-w-xl mx-auto leading-relaxed">
              No credit card required. Experience live meal planning, automatic grocery aggregation, and instant grocer price comparisons in demo mode.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartPlanner}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Launch 7-Day Meal Planner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAiPlanner}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-forest-900/80 hover:bg-forest-900 text-cream-100 font-bold text-sm border border-forest-600 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-saffron-500" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
