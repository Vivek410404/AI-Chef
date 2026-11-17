'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShopHomeView } from '@/components/shop/ShopHomeView';
import { api } from '@/lib/api';

export default function ShopPage() {
  const router = useRouter();
  const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    api.getBasket().then(b => {
      if (b && Array.isArray(b.items)) {
        setBasketCount(b.items.filter(i => i.isSelectedForPurchase).length);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        activeTab="shop"
        basketCount={basketCount}
        setActiveTab={tab => {
          if (tab === 'shop') return;
          router.push(`/#${tab}`);
        }}
      />
      <main className="flex-1">
        <ShopHomeView
          onNavigateToBasket={() => router.push('/#basket')}
          onNavigateToPlanner={() => router.push('/#planner')}
          cartItemCount={basketCount}
        />
      </main>
      <Footer />
    </div>
  );
}
