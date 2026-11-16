'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, Home, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-soft mx-auto mb-4">
          <ChefHat className="w-8 h-8 text-terracotta-200" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-forest-950">
          Welcome to RasoiIQ
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Let&apos;s set up your Indian household food operating system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Create New Household */}
          <Link
            href="/household/create"
            className="group relative bg-surface p-8 rounded-3xl border border-cream-300 shadow-soft hover:shadow-elevated hover:border-forest-500 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mb-4 group-hover:bg-forest-700 group-hover:text-white transition-all">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-950 group-hover:text-forest-700 transition-colors">
                Create New Household
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Set up your family kitchen, configure regional dietary parameters (Vegetarian, Jain, Eggetarian, Kathiyawadi), and invite family members or domestic cooks.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-forest-700 group-hover:text-forest-800">
              <span>Start Setup</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Option B: Join Existing Household */}
          <Link
            href="/household/invitations"
            className="group relative bg-surface p-8 rounded-3xl border border-cream-300 shadow-soft hover:shadow-elevated hover:border-terracotta-500 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mb-4 group-hover:bg-terracotta-500 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-950 group-hover:text-terracotta-600 transition-colors">
                Join with Invitation
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Received an invitation token from a family member or employer? Accept it to link your account as a household member or domestic cook.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-terracotta-600 group-hover:text-terracotta-700">
              <span>Enter Token</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-forest-900 transition-colors font-medium"
          >
            Skip to demo dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
