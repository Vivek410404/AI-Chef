import React from 'react';
import { Users, Sparkles, Scale, ShoppingBag, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Users,
      title: 'Set Household Tastes',
      description: 'Configure dietary tags for each family member: vegetarian in-laws, eggetarian kids, or Jain requirements (no onion/garlic).',
      badge: 'Multi-Member Diets'
    },
    {
      step: '02',
      icon: Sparkles,
      title: 'Plan or Ask AI Chef',
      description: 'Choose from 1,200+ authentic Indian recipes or type prompts like "Gujarati comfort week under ₹3,000" using free-tier Gemini.',
      badge: 'Zero-Cost AI'
    },
    {
      step: '03',
      icon: Scale,
      title: 'Deterministic Grocery Sync',
      description: 'The engine scales quantities to family servings, merges duplicate ingredients, and deducts spices & atta already in your kitchen pantry.',
      badge: 'Zero Waste'
    },
    {
      step: '04',
      icon: ShoppingBag,
      title: 'Compare & Order',
      description: 'See live basket price comparisons between Blinkit, Zepto, DMart Ready, and BigBasket. Choose the fastest or cheapest grocer.',
      badge: 'Multi-Retailer'
    }
  ];

  return (
    <section className="py-20 bg-cream-100 border-y border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-terracotta-600">The RasoiIQ Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-black text-forest-900 tracking-tight">
            How Weekly Meal Planning & Grocery Shopping Works
          </h2>
          <p className="text-sm text-stone-600">
            From picking what to cook to doorstep delivery in 4 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-forest-200 group-hover:text-terracotta-300 transition-colors">
                  {item.step}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-100">
                  {item.badge}
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 group-hover:scale-105 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-forest-900 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
