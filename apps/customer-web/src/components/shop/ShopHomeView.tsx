'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Store,
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Check,
  Calendar,
  Apple,
  Carrot,
  Milk,
  Wheat,
  CircleDot,
  Flame,
  Droplets,
  Cookie,
  Coffee,
  Sun,
  Snowflake,
  Heart,
  SprayCan,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ProductDetailModal, DetailedProduct } from './ProductDetailModal';
import { RetailerConflictModal } from './RetailerConflictModal';

// Icon map for 14 categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fruits: <Apple className="w-5 h-5 text-red-500" />,
  vegetables: <Carrot className="w-5 h-5 text-emerald-600" />,
  'dairy-bakery': <Milk className="w-5 h-5 text-blue-500" />,
  'rice-atta-grains': <Wheat className="w-5 h-5 text-amber-600" />,
  'pulses-lentils': <CircleDot className="w-5 h-5 text-yellow-600" />,
  'spices-masalas': <Flame className="w-5 h-5 text-orange-600" />,
  'oil-ghee': <Droplets className="w-5 h-5 text-amber-500" />,
  'snacks-biscuits': <Cookie className="w-5 h-5 text-stone-600" />,
  beverages: <Coffee className="w-5 h-5 text-amber-800" />,
  'breakfast-cereals': <Sun className="w-5 h-5 text-amber-500" />,
  'frozen-packaged-foods': <Snowflake className="w-5 h-5 text-sky-500" />,
  'personal-care': <Sparkles className="w-5 h-5 text-purple-500" />,
  'household-cleaning': <SprayCan className="w-5 h-5 text-teal-600" />,
  'baby-care': <Heart className="w-5 h-5 text-pink-500" />
};

interface ShopHomeViewProps {
  onNavigateToBasket?: () => void;
  onNavigateToPlanner?: () => void;
  cartItemCount?: number;
  initialCategory?: string;
}

export function ShopHomeView({
  onNavigateToBasket,
  onNavigateToPlanner,
  cartItemCount = 0,
  initialCategory
}: ShopHomeViewProps) {
  // Retailers list
  const [retailers] = useState([
    { id: 'ret-blinkit', name: 'Blinkit', estimate: '10-15 mins', tag: 'Fast Delivery' },
    { id: 'ret-zepto', name: 'Zepto', estimate: '10 mins', tag: '10-Min Rush' },
    { id: 'ret-dmart', name: 'DMart Ready', estimate: 'Tomorrow Morning', tag: 'Lowest Wholesale' },
    { id: 'ret-bigbasket', name: 'BigBasket', estimate: 'Same Day (2-4 hrs)', tag: 'Fresh Produce' }
  ]);
  const [activeRetailerId, setActiveRetailerId] = useState('ret-blinkit');

  // Categories & Products state
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 16, totalPages: 1 });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [isLoading, setIsLoading] = useState(true);

  // Search & Autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Product detail modal state
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [detailedProduct, setDetailedProduct] = useState<DetailedProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Retailer Conflict modal state
  const [conflictData, setConflictData] = useState<any>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingAddAction, setPendingAddAction] = useState<{ variantId: string; quantity: number; retailerId: string } | null>(null);

  // Local cart map for instant UI quantity feedback: variantId -> quantity
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [lowStockPantryItems, setLowStockPantryItems] = useState<any[]>([]);

  // 1. Fetch Categories & Pantry Restock Alerts
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cats, restockRes, pantry] = await Promise.all([
          api.getGroceryCategories().catch(() => []),
          api.getPantryRestockSuggestions().catch(() => null),
          api.getPantry().catch(() => [])
        ]);
        if (Array.isArray(cats)) setCategories(cats);
        if (restockRes && Array.isArray(restockRes.suggestions)) {
          setLowStockPantryItems(restockRes.suggestions);
        } else if (Array.isArray(pantry)) {
          const low = pantry.filter(p => p.isLowStock || (p.lowStockThreshold && p.currentQuantity <= p.lowStockThreshold));
          setLowStockPantryItems(low);
        }
      } catch (err) {
        console.error('Failed to load initial shop data:', err);
      }
    }
    loadInitialData();
  }, []);

  // 2. Fetch Basket Quantities to keep UI buttons in sync
  const refreshCartState = useCallback(async () => {
    try {
      const basket = await api.getBasket();
      if (basket && Array.isArray(basket.items)) {
        const map: Record<string, number> = {};
        for (const item of basket.items) {
          if (item.isSelectedForPurchase && item.quantityPacks > 0) {
            map[item.productVariantId] = item.quantityPacks;
          }
        }
        setCartQuantities(map);
        if (basket.selectedRetailerId) {
          setActiveRetailerId(basket.selectedRetailerId);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshCartState();
  }, [refreshCartState]);

  // 3. Fetch Products when filters change
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getGroceryProducts({
        q: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
        retailerId: activeRetailerId,
        sort: sortBy,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res && res.products) {
        setProducts(res.products);
        setPagination(res.pagination || { total: res.products.length, page: 1, limit: 16, totalPages: 1 });
        if (res.availableBrands) setAvailableBrands(res.availableBrands);
      }
    } catch (err) {
      console.error('Error fetching grocery products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, activeRetailerId, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 4. Autocomplete Suggestions Debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const list = await api.getSearchSuggestions(searchTerm);
        setSuggestions(list || []);
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchTerm);
    setPagination(p => ({ ...p, page: 1 }));
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setPagination(p => ({ ...p, page: 1 }));
  };

  // Add to Cart / Conflict Handling
  const handleAddToCart = async (variantId: string, quantity = 1, retailerId?: string) => {
    const targetRetailerId = retailerId || activeRetailerId;
    try {
      const res = await api.addToCart({
        productVariantId: variantId,
        quantity,
        retailerId: targetRetailerId
      });

      if (res.conflict) {
        // Retailer conflict detected!
        setConflictData({
          currentRetailer: res.currentRetailer,
          currentRetailerId: res.currentRetailerId,
          newRetailer: res.newRetailer,
          newRetailerId: res.newRetailerId,
          currentItemCount: res.currentItemCount
        });
        setPendingAddAction({ variantId, quantity, retailerId: targetRetailerId });
        setIsConflictModalOpen(true);
        return;
      }

      if (res.success) {
        setCartQuantities(prev => ({
          ...prev,
          [variantId]: (prev[variantId] || 0) + quantity
        }));
        showToast(`✓ Added to cart (${retailers.find(r => r.id === targetRetailerId)?.name || 'Retailer'})`);
        refreshCartState();
      }
    } catch (err: any) {
      showToast(`Error adding to cart: ${err.message}`);
    }
  };

  // Update pack count directly
  const handleUpdateQuantity = async (variantId: string, newQty: number) => {
    try {
      await api.updateCartItem(variantId, newQty);
      setCartQuantities(prev => {
        const next = { ...prev };
        if (newQty <= 0) delete next[variantId];
        else next[variantId] = newQty;
        return next;
      });
      refreshCartState();
    } catch (err: any) {
      showToast(`Error updating quantity: ${err.message}`);
    }
  };

  // Confirm Switch Retailer
  const handleConfirmRetailerSwitch = async () => {
    if (!conflictData || !pendingAddAction) return;
    try {
      await api.switchRetailer(conflictData.newRetailerId);
      setActiveRetailerId(conflictData.newRetailerId);
      setIsConflictModalOpen(false);

      // Now complete the pending add
      await api.addToCart({
        productVariantId: pendingAddAction.variantId,
        quantity: pendingAddAction.quantity,
        retailerId: conflictData.newRetailerId
      });

      showToast(`✓ Switched cart to ${conflictData.newRetailer} and added item`);
      setPendingAddAction(null);
      setConflictData(null);
      refreshCartState();
    } catch (err: any) {
      showToast(`Error switching retailer: ${err.message}`);
    }
  };

  // Open Product Detail
  const handleOpenProductDetail = async (slug: string) => {
    try {
      const data = await api.getProductBySlug(slug);
      if (data) {
        setDetailedProduct(data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-white px-5 py-3 rounded-2xl shadow-elevated text-xs font-bold flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Disclosure */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white px-4 py-8 sm:py-12 border-b border-forest-700/50">
        <div className="max-w-7xl mx-auto">
          {/* Sample Data Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-forest-600/40 text-[11px] font-semibold text-emerald-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
            <span>DIRECT SHOPPING &amp; MARKETPLACE • PHASE 6.1</span>
            <span className="hidden sm:inline opacity-60">•</span>
            <span className="hidden sm:inline text-stone-300">Sample Catalog &amp; Quick-Commerce Simulation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Quick Indian Groceries, <span className="text-saffron-400">Delivered Smart</span>
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Discover everyday staples, fresh produce, and regional specialties. Shop directly or merge with your weekly household meal plan.
              </p>
            </div>

            {/* Quick Link to Cart / Smart Basket */}
            {onNavigateToBasket && (
              <button
                onClick={onNavigateToBasket}
                className="self-start md:self-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-forest-950 font-bold text-xs sm:text-sm shadow-soft transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>View Cart &amp; Checkout</span>
                {cartItemCount > 0 && (
                  <span className="bg-forest-950 text-white px-2 py-0.5 rounded-full text-xs font-black">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Prominent Search Bar with Regional Synonym Intelligence */}
          <div className="relative max-w-3xl" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search groceries (e.g. Atta, Toor Dal, Haldi, Amul Milk, Sing Tel, Surti Papdi)..."
                  className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white text-stone-900 placeholder:text-stone-400 text-sm font-medium border-2 border-transparent focus:border-saffron-400 shadow-elevated focus:outline-none transition-all"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-cream-100 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-surface rounded-2xl shadow-elevated border border-cream-300 overflow-hidden divide-y divide-cream-100 animate-fade-in">
                {suggestions.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (sug.slug) {
                        handleOpenProductDetail(sug.slug);
                      } else if (sug.type === 'category') {
                        setSelectedCategory(sug.slug || sug.label);
                        setSearchTerm('');
                        setSearchQuery('');
                      } else {
                        setSearchTerm(sug.label);
                        setSearchQuery(sug.label);
                      }
                      setShowSuggestions(false);
                    }}
                    className="p-3 hover:bg-cream-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cream-200 text-stone-600">
                        {sug.type}
                      </span>
                      <span className="font-semibold text-stone-900">{sug.label}</span>
                    </div>
                    {sug.category && (
                      <span className="text-[11px] text-stone-400">{sug.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Popular Search Suggestions Pills */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-forest-200">
              <span className="font-medium text-[11px] text-forest-300">Quick Searches:</span>
              {['Atta', 'Toor Dal', 'Amul Milk', 'Paneer', 'Haldi', 'Sing Tel', 'Surti Papdi', 'Basmati Rice'].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchTerm(q);
                    setSearchQuery(q);
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className="px-2.5 py-1 rounded-full bg-forest-800/60 hover:bg-forest-700/80 text-white text-[11px] font-semibold border border-forest-600/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* 2. Authoritative Retailer Selector Strip */}
        <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-cream-300 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Select Active Delivery Partner
              </span>
              <p className="text-xs text-stone-600">
                Compare catalog prices and delivery windows. <strong>One retailer per checkout</strong> rule applies.
              </p>
            </div>
            <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200 self-start sm:self-auto">
              Simulated 4-Grocer Engine
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {retailers.map(r => {
              const currentCount = cartItemCount > 0 ? cartItemCount : Object.values(cartQuantities).reduce((a, b) => a + b, 0);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (currentCount > 0 && r.id !== activeRetailerId) {
                      setConflictData({
                        currentRetailer: retailers.find(ret => ret.id === activeRetailerId)?.name || 'Current Retailer',
                        currentRetailerId: activeRetailerId,
                        newRetailer: r.name,
                        newRetailerId: r.id,
                        currentItemCount: currentCount
                      });
                      setPendingAddAction(null);
                      setIsConflictModalOpen(true);
                    } else {
                      setActiveRetailerId(r.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeRetailerId === r.id
                      ? 'border-forest-600 bg-forest-50/70 ring-2 ring-forest-500/20 shadow-sm'
                      : 'border-cream-300 bg-white hover:border-cream-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-forest-900">{r.name}</span>
                    {activeRetailerId === r.id && (
                      <span className="w-2 h-2 rounded-full bg-forest-600"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500 block">{r.estimate}</span>
                  <span className="text-[10px] font-semibold text-terracotta-600 mt-0.5 block">{r.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.5 Kitchen Pantry Low-Stock Restock Bar */}
        {lowStockPantryItems.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  Kitchen Pantry Low-Stock Alert ({lowStockPantryItems.length} items)
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Running low on: <strong className="text-forest-900">{lowStockPantryItems.map(p => p.ingredient?.name || p.ingredientId).slice(0, 3).join(', ')}</strong>. Keep your household essentials stocked.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                const term = lowStockPantryItems[0]?.ingredient?.name || 'Dal';
                setSearchTerm(term);
                setSearchQuery(term);
              }}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-soft transition-all"
            >
              Find Restock Options
            </button>
          </div>
        )}

        {/* 3. 14 Categories Navigation Carousel / Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-forest-900">Explore by Category</h2>
              <p className="text-xs text-stone-500 font-medium">Browse fresh produce, pantry essentials and household care</p>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : cat.slug);
                    setPagination(p => ({ ...p, page: 1 }));
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[96px] ${
                    isSelected
                      ? 'border-forest-600 bg-forest-100/70 ring-2 ring-forest-500/20 shadow-soft'
                      : 'border-cream-300 bg-surface hover:border-forest-300 hover:bg-cream-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center mb-1.5 shadow-soft">
                    {CATEGORY_ICONS[cat.slug] || <Store className="w-5 h-5 text-forest-600" />}
                  </div>
                  <span className="text-xs font-bold text-forest-900 leading-tight block truncate w-full">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                    {cat.productCount} items
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Meal Planner Bridge Card */}
        {onNavigateToPlanner && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cream-100 via-surface to-emerald-50/50 border border-cream-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center shrink-0 shadow-soft">
                <Calendar className="w-6 h-6 text-saffron-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-forest-900">
                  Planning meals for the week?
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Let AI Chef generate recipes and automatically aggregate the exact grocery requirements into your cart.
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToPlanner}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 shadow-soft transition-all flex items-center gap-2"
            >
              <span>Open Weekly Meal Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5. Filters & Controls Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-cream-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <select
                value={selectedBrand}
                onChange={e => {
                  setSelectedBrand(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-cream-300 text-xs font-semibold text-stone-800 focus:outline-none focus:border-forest-500"
              >
                <option value="all">All Brands</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}

            {/* Active search filter chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold">
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                <button onClick={handleClearSearch}><X className="w-3 h-3" /></button>
              </span>
            )}

            {/* Active category filter chip */}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-stone-800 text-xs font-bold">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-stone-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-cream-300 text-xs font-semibold text-stone-800 focus:outline-none focus:border-forest-500"
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 6. Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 bg-surface rounded-2xl border border-cream-200 animate-pulse space-y-3">
                <div className="w-full aspect-square bg-cream-100 rounded-xl" />
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-100 rounded w-1/2" />
                <div className="h-8 bg-cream-200 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-3xl border border-cream-300 max-w-lg mx-auto my-8">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-forest-900 mb-1">No groceries found</h3>
            <p className="text-xs text-stone-500 mb-4">
              We couldn&apos;t find matching items for your search or filter. Try a broader term like &ldquo;Atta&rdquo;, &ldquo;Dal&rdquo;, or &ldquo;Milk&rdquo;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                handleClearSearch();
              }}
              className="px-4 py-2 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map(prod => {
              const primaryVariant = prod.primaryVariant;
              const price = prod.retailerInfo?.priceInr || primaryVariant?.sellingPriceInr || 0;
              const mrp = prod.retailerInfo?.mrpInr || primaryVariant?.mrpInr || 0;
              const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const cartQty = primaryVariant ? cartQuantities[primaryVariant.id] || 0 : 0;

              return (
                <div
                  key={prod.id}
                  className="group bg-surface rounded-2xl border border-cream-300 p-3.5 sm:p-4 hover:border-forest-500 hover:shadow-soft transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Discount Badge */}
                    <div
                      onClick={() => handleOpenProductDetail(prod.slug)}
                      className="w-full aspect-square rounded-xl bg-cream-50 overflow-hidden relative p-3 flex items-center justify-center cursor-pointer mb-3"
                    >
                      <ImageWithFallback
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-terracotta-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-soft">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Brand & Category */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">
                        {prod.brand}
                      </span>
                      <span className="text-[10px] text-stone-300">•</span>
                      <span className="text-[10px] text-stone-500 truncate">
                        {prod.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => handleOpenProductDetail(prod.slug)}
                      className="text-xs sm:text-sm font-bold text-forest-900 line-clamp-2 hover:text-forest-700 cursor-pointer transition-colors leading-snug mb-1"
                    >
                      {prod.title}
                    </h3>

                    {/* Pack size pill */}
                    {primaryVariant && (
                      <span className="inline-block text-[11px] font-medium text-stone-500 mb-2">
                        {primaryVariant.packQuantity} {primaryVariant.packUnit}
                      </span>
                    )}
                  </div>

                  {/* Pricing and Add to Cart Section */}
                  <div className="pt-2 border-t border-cream-200 mt-2">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-extrabold text-forest-900">₹{price}</span>
                        {mrp > price && (
                          <span className="text-xs text-stone-400 line-through">₹{mrp}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenProductDetail(prod.slug)}
                        className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 underline decoration-cream-300"
                      >
                        Compare
                      </button>
                    </div>

                    {/* Add / Quantity Buttons */}
                    {cartQty > 0 ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1 text-emerald-900 font-bold text-xs">
                        <button
                          onClick={() => handleUpdateQuantity(primaryVariant.id, cartQty - 1)}
                          className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-cream-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-black">{cartQty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(primaryVariant.id, cartQty + 1)}
                          className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-soft hover:bg-cream-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => primaryVariant && handleAddToCart(primaryVariant.id, 1)}
                        className="w-full py-2 px-3 rounded-xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 shadow-soft transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 7. Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-cream-300 bg-white text-stone-600 disabled:opacity-40 hover:bg-cream-50 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-stone-700 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-cream-300 bg-white text-stone-600 disabled:opacity-40 hover:bg-cream-50 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={handleAddToCart}
        onSelectRelatedProduct={handleOpenProductDetail}
        activeRetailerId={activeRetailerId}
        cartQuantityForVariant={id => cartQuantities[id] || 0}
      />

      {/* Retailer Conflict Modal */}
      <RetailerConflictModal
        isOpen={isConflictModalOpen}
        conflictData={conflictData}
        onClose={() => {
          setIsConflictModalOpen(false);
          setPendingAddAction(null);
        }}
        onConfirmSwitch={handleConfirmRetailerSwitch}
      />
    </div>
  );
}
