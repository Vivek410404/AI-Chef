import React from 'react';
import { ChefHat, ShieldCheck, Heart, Sparkles, ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-forest-900 text-cream-100 pt-16 pb-12 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-800/60">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-700 flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5 text-terracotta-200" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">Rasoi</span>
                <span className="font-extrabold text-2xl tracking-tight text-terracotta-500">IQ</span>
              </div>
            </div>
            <p className="text-sm text-cream-300/80 leading-relaxed">
              India's first AI-powered meal planning and multi-grocer marketplace. Designed for diverse Indian households, regional tastes, and smart savings.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free-tier Gemini + Deterministic Engine</span>
            </div>
          </div>

          {/* Regional Cuisines */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-terracotta-200 mb-4">Supported Cuisines</h4>
            <ul className="space-y-2.5 text-sm text-cream-300/80">
              <li className="hover:text-white transition-colors cursor-pointer">Gujarati (Kathiyawadi & Surati)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Punjabi & North Indian Delicacies</li>
              <li className="hover:text-white transition-colors cursor-pointer">South Indian (Tamil, Kerala, Andhra)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Maharashtrian & Konkani Dishes</li>
              <li className="hover:text-white transition-colors cursor-pointer">Bengali & East Indian Specials</li>
            </ul>
          </div>

          {/* Dietary Flexibility */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-terracotta-200 mb-4">Dietary Standards</h4>
            <ul className="space-y-2.5 text-sm text-cream-300/80">
              <li className="hover:text-white transition-colors cursor-pointer">Jain Friendly (No Onion, No Garlic)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Pure Vegetarian & Sattvic</li>
              <li className="hover:text-white transition-colors cursor-pointer">High-Protein Vegetarian Menus</li>
              <li className="hover:text-white transition-colors cursor-pointer">Eggetarian & Non-Vegetarian Options</li>
              <li className="hover:text-white transition-colors cursor-pointer">Diabetic & Kid-Friendly Filters</li>
            </ul>
          </div>

          {/* Marketplace Grocers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-terracotta-200 mb-4">Partner Grocers</h4>
            <ul className="space-y-2.5 text-sm text-cream-300/80">
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-yellow-400" />
                <span>Blinkit (10-15 min quick commerce)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                <span>Zepto (10 min rapid delivery)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                <span>DMart Ready (Value hypermarket)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
                <span>BigBasket (Pantry & slot delivery)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-400/60 gap-4">
          <p>© 2026 RasoiIQ Technologies Pvt. Ltd. Made with ❤️ for Indian Kitchens.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Zero-Cost Local Architecture
            </span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
