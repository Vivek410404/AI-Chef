'use client';

import React, { useState, useEffect } from 'react';
import {
  GroceryBasket,
  ScaledIngredientRequirement,
  BasketItem,
  Retailer,
  ProductVariant,
  DeliveryAddress
} from '@rasoi/shared-types';
import {
  ShoppingBag,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  TrendingDown,
  Info,
  Package,
  Layers,
  ArrowRight,
  ShieldAlert,
  Repeat,
  Trash2,
  MapPin,
  Edit3,
  Plus,
  Check,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface GroceryBasketViewProps {
  basket: GroceryBasket | null;
  requirements: ScaledIngredientRequirement[];
  availableVariants?: ProductVariant[];
  onToggleItem: (ingredientId: string, isSelected: boolean) => void;
  onUpdatePacks: (ingredientId: string, packs: number) => void;
  onSwapVariant: (ingredientId: string, variantId: string) => void;
  onRemoveItem: (ingredientId: string) => void;
  onSelectRetailer: (retailerId: string) => void;
  onCheckout: (address?: DeliveryAddress) => void;
  onOpenPantry: () => void;
  deliveryAddresses: DeliveryAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
  onSaveAddress: (address: DeliveryAddress) => void;
  onDeleteAddress?: (addressId: string) => void;
  isCheckingOut?: boolean;
}

export function GroceryBasketView({
  basket,
  requirements,
  availableVariants = [],
  onToggleItem,
  onUpdatePacks,
  onSwapVariant,
  onRemoveItem,
  onSelectRetailer,
  onCheckout,
  onOpenPantry,
  deliveryAddresses,
  selectedAddressId,
  onSelectAddress,
  onSaveAddress,
  onDeleteAddress,
  isCheckingOut = false
}: GroceryBasketViewProps) {
  const [activeTab, setActiveTab] = useState<'basket' | 'requirements'>('basket');
  
  // Substitution Modal State
  const [substitutingItem, setSubstitutingItem] = useState<BasketItem | null>(null);

  // Address Modal & Feedback State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [pincodeError, setPincodeError] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Body scroll locking and Escape key dismiss for Delivery Address Modal
  useEffect(() => {
    if (isAddressModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsAddressModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAddressModalOpen]);

  if (!basket) {
    return (
      <div className="text-center py-20 bg-surface rounded-3xl border border-cream-300 p-8 space-y-4">
        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
        <h3 className="text-lg font-bold text-forest-900">Your basket is calculating...</h3>
      </div>
    );
  }

  const selectedAddress = (selectedAddressId ? deliveryAddresses.find(a => a.id === selectedAddressId) : null) || deliveryAddresses[0] || null;

  const selectedItems = basket.items.filter(i => i.isSelectedForPurchase);
  const unselectedItems = basket.items.filter(i => !i.isSelectedForPurchase);

  // Get active retailer comparison object
  const activeRetailerComp = basket.comparisons.find(c => c.retailer.id === basket.selectedRetailerId) || basket.comparisons[0];

  // Candidates for the currently substituting ingredient
  const substitutionCandidates = substitutingItem
    ? availableVariants.filter(v => v.ingredientId === substitutingItem.ingredientId)
    : [];

  const handleOpenEditAddress = (addr?: DeliveryAddress) => {
    if (addr) {
      setEditingAddress({ ...addr });
    } else {
      setEditingAddress({
        id: `addr-${Date.now()}`,
        label: deliveryAddresses.length === 0 ? 'Home' : 'Other',
        flat: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
    setPincodeError('');
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    // PIN code validation: 6 numeric digits starting with 1-9
    const cleanPin = editingAddress.pincode.replace(/\D/g, '').trim();
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanPin)) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code (e.g. 400001, 380015, 110001)');
      return;
    }

    if (!editingAddress.flat.trim() || !editingAddress.street.trim() || !editingAddress.city.trim() || !editingAddress.state.trim()) {
      setPincodeError('Please fill in Flat/House, Street/Area, City, and State.');
      return;
    }

    const finalizedAddress: DeliveryAddress = {
      ...editingAddress,
      pincode: cleanPin,
      flat: editingAddress.flat.trim(),
      street: editingAddress.street.trim(),
      city: editingAddress.city.trim(),
      state: editingAddress.state.trim()
    };

    onSaveAddress(finalizedAddress);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setSavedFeedback(`Delivery address (${finalizedAddress.label}) updated & saved!`);
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Multi-Retailer Price Discovery */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                Authoritative Multi-Retailer Pricing Engine
              </span>
              <span className="text-xs font-semibold text-stone-500">• 4 Sample Grocers Mapped</span>
              <span className="text-[11px] font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                Sample Catalog Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-900 tracking-tight">
              Smart Grocery Basket & Multi-Retailer Checkout
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Ingredients are aggregated automatically from your weekly meal plan, adjusted for pantry stock, and dynamically calculated across retail catalogs.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-cream-50 p-2.5 rounded-2xl border border-cream-200">
            <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Delivery Location</span>
              {selectedAddress ? (
                <span className="font-extrabold text-forest-900">{selectedAddress.city} ({selectedAddress.pincode})</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenEditAddress()}
                  className="font-extrabold text-terracotta-600 hover:text-terracotta-700 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Set Address</span>
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Retailer Selector Cards - Fully Synchronized */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-forest-900">Compare Quick-Commerce Retailers</span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-cream-200 text-stone-600 px-2 py-0.5 rounded border border-cream-300">
            DEMO PRICING & SAMPLE CATALOG DATA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {basket.comparisons.map((comp) => {
            const isSelected = comp.retailer.id === basket.selectedRetailerId;

            return (
              <div
                key={comp.retailer.id}
                onClick={() => onSelectRetailer(comp.retailer.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? 'border-forest-700 bg-forest-50/70 shadow-md ring-2 ring-forest-700/20'
                    : 'border-cream-300 bg-surface hover:border-forest-300 hover:bg-cream-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-forest-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                    Selected
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5 pr-14">
                    <span className="font-black text-sm text-forest-900">{comp.retailer.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 bg-cream-100 px-1.5 py-0.2 rounded">
                      Sample
                    </span>
                  </div>

                  {comp.isLowestPrice && (
                    <span className="inline-block text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full mb-2">
                      Lowest Basket Price
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-forest-600" />
                    <span>{comp.retailer.deliveryTimeEstimate}</span>
                  </div>

                  {comp.priceComparisonNote && (
                    <p className="text-[10px] text-stone-500 mt-1 line-clamp-1 italic">
                      {comp.priceComparisonNote}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-cream-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-forest-900 tracking-tight">
                      {formatInr(comp.estimatedTotalInr)}
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold">
                      Delivery: {comp.deliveryFeeInr === 0 ? <strong className="text-emerald-700 font-black">FREE</strong> : formatInr(comp.deliveryFeeInr)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-stone-400 font-medium">
                      Items ({comp.totalItems})
                    </span>
                    {comp.estimatedSavingsInr > 0 ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save {formatInr(comp.estimatedSavingsInr)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Baseline</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Price Transparency Notice:</strong> All retailer prices, availability, and delivery charges displayed are calculated using our standardized sample catalog engine for demonstration. Live store sync is not simulated. Selecting a grocer applies its authoritative price model to your active checkout summary.
          </p>
        </div>
      </div>

      {/* Mode Switcher: Basket Items vs Underlying Recipe Requirements */}
      <div className="flex items-center gap-2 border-b border-cream-300 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('basket')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'basket'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-cream-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Cart Items to Purchase ({selectedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requirements'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-cream-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Raw Scaled Recipe Requirements ({requirements.length})</span>
        </button>

        <button
          onClick={onOpenPantry}
          className="ml-auto px-3.5 py-1.5 rounded-xl border border-cream-300 bg-surface text-stone-700 text-xs font-bold hover:border-forest-500 transition-colors flex items-center gap-1.5"
        >
          <Package className="w-3.5 h-3.5 text-amber-600" />
          <span>Pantry Sync</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'basket' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Basket Items List (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selected Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-900">
                  Items in Your Active Basket ({selectedItems.length})
                </h3>
                <span className="text-[11px] text-stone-500">
                  Billed at {activeRetailerComp?.retailer.name || 'Selected Retailer'} rate
                </span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface border border-cream-300 text-center space-y-2">
                  <p className="text-sm font-bold text-stone-600">All items are currently deselected.</p>
                  <p className="text-xs text-stone-400">Select items below to include them in your checkout order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => {
                    const candidateVariants = availableVariants.filter(v => v.ingredientId === item.ingredientId);
                    const hasSubstitutions = candidateVariants.length > 1;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-surface border border-cream-200 shadow-sm hover:border-forest-200 transition-all flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Checkbox and Product Details */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onToggleItem(item.ingredientId, false)}
                              className="text-forest-700 hover:text-stone-400 transition-colors shrink-0"
                              title="Deselect from cart (keeps recipe requirements)"
                            >
                              <CheckCircle2 className="w-5 h-5 text-forest-700 fill-forest-50" />
                            </button>

                            <ImageWithFallback
                              src={item.productVariant.imageUrl}
                              alt={item.productVariant.title}
                              fallbackTitle={item.productVariant.title}
                              fallbackCuisine={item.productVariant.brand}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-cream-100 border border-cream-200"
                            />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wide bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                                  {item.productVariant.brand}
                                </span>
                                {hasSubstitutions && (
                                  <span className="text-[10px] text-stone-400 font-semibold">
                                    {candidateVariants.length} brands/packs
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs sm:text-sm font-extrabold text-forest-900 mt-0.5">
                                {item.productVariant.title}
                              </h4>

                              <span className="text-[11px] text-stone-500 block">
                                Pack: {item.productVariant.packQuantity} {item.productVariant.packUnit} • Total needed: {item.totalQuantity} {item.productVariant.packUnit}
                              </span>

                              {/* Associated Recipe Badges */}
                              {item.associatedRecipeNames && item.associatedRecipeNames.length > 0 && (
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold text-stone-400">Used in:</span>
                                  {item.associatedRecipeNames.map((rTitle, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] font-semibold bg-cream-100 text-stone-700 px-1.5 py-0.5 rounded border border-cream-200"
                                    >
                                      {rTitle}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quantity Packs Counter & Price */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 pl-8 sm:pl-0">
                            {/* Packs Counter */}
                            <div className="flex items-center gap-2 bg-cream-100 px-2.5 py-1 rounded-xl border border-cream-200">
                              <button
                                onClick={() => {
                                  if (item.quantityPacks <= 1) {
                                    onToggleItem(item.ingredientId, false);
                                  } else {
                                    onUpdatePacks(item.ingredientId, item.quantityPacks - 1);
                                  }
                                }}
                                className="text-stone-600 hover:text-forest-900 font-bold px-1.5 py-0.5 text-xs hover:bg-cream-200 rounded transition-colors"
                                title="Decrease pack quantity"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-forest-900 min-w-12 text-center">
                                {item.quantityPacks} pack{item.quantityPacks > 1 ? 's' : ''}
                              </span>
                              <button
                                onClick={() => onUpdatePacks(item.ingredientId, item.quantityPacks + 1)}
                                className="text-stone-600 hover:text-forest-900 font-bold px-1.5 py-0.5 text-xs hover:bg-cream-200 rounded transition-colors"
                                title="Increase pack quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Item Total Price */}
                            <div className="text-right min-w-20">
                              <span className="text-sm font-black text-forest-900 block">
                                {formatInr(item.totalPriceInr)}
                              </span>
                              <span className="text-[10px] text-stone-400 block font-medium">
                                {formatInr(item.effectivePricePerPackInr || item.productVariant.sellingPriceInr)}/pack
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Controls: Swap Brand/Size & Remove */}
                        <div className="flex items-center justify-between pt-2 border-t border-cream-100 text-xs">
                          {hasSubstitutions ? (
                            <button
                              onClick={() => setSubstitutingItem(item)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest-700 hover:text-forest-900 hover:underline"
                            >
                              <Repeat className="w-3.5 h-3.5 text-terracotta-600" />
                              <span>Swap Brand or Pack Size</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Single catalog variant</span>
                          )}

                          <button
                            onClick={() => onRemoveItem(item.ingredientId)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-red-600 transition-colors"
                            title="Exclude from purchase basket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Exclude</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unchecked Items: Strict Business Rule Visualizer */}
            {unselectedItems.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-cream-200">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Already Available at Home or Excluded from Purchase ({unselectedItems.length})
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1 text-amber-900">
                  <span className="font-bold block">Strict Business Rule Protected:</span>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Deselecting an ingredient excludes it from your purchase basket to save money, but your scheduled recipes <strong>still require it</strong>. Recipe requirements remain 100% intact!
                  </p>
                </div>

                <div className="space-y-2">
                  {unselectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-cream-50/80 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleItem(item.ingredientId, true)}
                          className="text-stone-400 hover:text-forest-700 transition-colors shrink-0"
                          title="Add back to purchase basket"
                        >
                          <Circle className="w-5 h-5 text-stone-300" />
                        </button>

                        <div>
                          <span className="text-xs font-bold text-stone-700 line-through">
                            {item.productVariant.title}
                          </span>
                          
                          {item.associatedRecipeNames && item.associatedRecipeNames.length > 0 && (
                            <span className="text-[10px] text-stone-500 block">
                              Still needed for: <strong className="text-forest-800">{item.associatedRecipeNames.join(', ')}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-8 sm:pl-0">
                        <span className="text-xs font-semibold text-stone-400">
                          {formatInr(item.totalPriceInr)}
                        </span>
                        <button
                          onClick={() => onToggleItem(item.ingredientId, true)}
                          className="text-xs font-extrabold text-forest-700 hover:text-forest-900 bg-white px-3 py-1 rounded-xl border border-cream-300 shadow-xs hover:border-forest-400 transition-all"
                        >
                          + Add back to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Checkout Summary Card (1 Col) */}
          <div className="space-y-4">
            <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-6 sticky top-24">
              <div className="pb-3 border-b border-cream-200 flex items-center justify-between">
                <h3 className="text-base font-black text-forest-900">
                  Order Summary
                </h3>
                <span className="text-[10px] font-bold bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200">
                  Authoritative Sync
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-stone-600">
                  <span>Selected Grocer</span>
                  <div className="flex items-center gap-1.5 font-black text-forest-900">
                    <span>{activeRetailerComp?.retailer.name || 'Blinkit'}</span>
                    <span className="text-[10px] font-bold text-stone-400">
                      ({activeRetailerComp?.retailer.deliveryTimeEstimate})
                    </span>
                  </div>
                </div>

                {basket.mrpTotalInr && basket.mrpTotalInr > basket.subtotalInr && (
                  <div className="flex justify-between text-stone-500">
                    <span>MRP Total</span>
                    <span className="line-through">{formatInr(basket.mrpTotalInr)}</span>
                  </div>
                )}

                {basket.discountInr && basket.discountInr > 0 ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Grocer Discount & Savings</span>
                    <span>-{formatInr(basket.discountInr)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({selectedItems.length} items)</span>
                  <span className="font-bold text-forest-900">{formatInr(basket.subtotalInr)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">
                    {basket.deliveryFeeInr === 0 ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black text-[10px]">
                        FREE DELIVERY
                      </span>
                    ) : (
                      formatInr(basket.deliveryFeeInr)
                    )}
                  </span>
                </div>

                {/* Total Payable matching Selected Retailer Card */}
                <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline text-sm font-black text-forest-900">
                  <div>
                    <span>Total Payable</span>
                    <span className="text-[10px] text-stone-400 font-normal block">
                      Matches {activeRetailerComp?.retailer.name} Card exactly
                    </span>
                  </div>
                  <span className="text-2xl text-forest-900 font-black tracking-tight">
                    {formatInr(basket.totalInr)}
                  </span>
                </div>
              </div>

              {/* Delivery Address Section */}
              {selectedAddress ? (
                <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-forest-800">
                      <MapPin className="w-3.5 h-3.5 text-forest-700" />
                      <span>Delivering to ({selectedAddress.label}):</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(selectedAddress)}
                        className="text-[11px] font-extrabold text-forest-700 hover:text-forest-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                      {onDeleteAddress && (
                        <button
                          type="button"
                          onClick={() => onDeleteAddress(selectedAddress.id)}
                          className="text-[11px] font-bold text-stone-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                          title="Delete this address"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-stone-700 leading-snug font-medium">
                    {selectedAddress.flat ? `${selectedAddress.flat}, ` : ''}{selectedAddress.street}, {selectedAddress.city} {selectedAddress.pincode}
                  </p>

                  {/* Saved Address Quick Pills */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {deliveryAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => onSelectAddress(addr.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          addr.id === selectedAddressId
                            ? 'bg-forest-700 text-white border-forest-700'
                            : 'bg-surface text-stone-600 border-cream-300 hover:border-forest-400'
                        }`}
                      >
                        {addr.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress()}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-dashed border-stone-300 text-stone-500 hover:text-forest-700 hover:border-forest-500 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>New</span>
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-cream-200/80 flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Retailer Serviceability:</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Serviceable ({activeRetailerComp?.retailer.deliveryTimeEstimate})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <span>No Delivery Address Added</span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Please add your delivery address to see local grocer serviceability and proceed with checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenEditAddress()}
                    className="w-full py-2.5 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-soft transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              )}

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => {
                  if (!selectedAddress) {
                    handleOpenEditAddress();
                    return;
                  }
                  onCheckout(selectedAddress);
                }}
                disabled={selectedItems.length === 0 || isCheckingOut}
                className="w-full py-4 rounded-2xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-black text-sm shadow-soft transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Simulated Order...</span>
                  </>
                ) : !selectedAddress ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Add Address to Checkout</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Simulated 1-Click Order</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-stone-500 font-semibold">
                  Zero-cost demonstration checkout.
                </p>
                <p className="text-[10px] text-stone-400">
                  No real retailer orders are placed or payment credentials taken.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Requirements Breakdown View - Strict Separation Guarantee */
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-forest-900">Raw Scaled Recipe Requirements</h3>
              <p className="text-xs text-stone-500">
                Aggregated from your weekly planned breakfast, lunch, and dinner recipes.
              </p>
            </div>
            <div className="bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-xl text-xs text-forest-800 font-bold">
              Total Ingredients: {requirements.length}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-stone-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <p>
              <strong>Mathematical Separation Rule:</strong> Deselecting items in the basket tab does <em>not</em> modify these raw recipe requirements. Your recipes will always calculate exactly what ingredients your family requires regardless of shopping cart adjustments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requirements.map((req, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-forest-900">{req.ingredientName}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400">{req.category}</span>
                </div>
                
                <div className="space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Total Required:</span>
                    <span className="font-bold text-forest-900">{req.totalRequiredQuantity} {req.standardUnit}</span>
                  </div>
                  {req.availableInPantryQuantity > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Available in Pantry:</span>
                      <span className="font-bold">-{req.availableInPantryQuantity} {req.standardUnit}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-terracotta-600 pt-1 border-t border-cream-200">
                    <span>Net to Buy:</span>
                    <span>{req.netShoppingQuantity} {req.standardUnit}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-stone-400">
                  <span>Used in: </span>
                  <span className="italic text-stone-600 font-medium">
                    {req.recipeSources.map(s => s.recipeTitle).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Substitution Modal */}
      {substitutingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl w-full max-w-lg border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                  Product Variant Selector
                </span>
                <h3 className="text-lg font-black text-forest-900 mt-1">
                  Choose Brand or Pack Size
                </h3>
              </div>
              <button
                onClick={() => setSubstitutingItem(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {substitutionCandidates.map((candidate) => {
                const isCurrent = candidate.id === substitutingItem.productVariantId;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => {
                      onSwapVariant(substitutingItem.ingredientId, candidate.id);
                      setSubstitutingItem(null);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isCurrent
                        ? 'border-forest-700 bg-forest-50/60 shadow-sm'
                        : 'border-cream-200 hover:border-forest-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={candidate.imageUrl}
                        alt={candidate.title}
                        fallbackTitle={candidate.title}
                        className="w-12 h-12 rounded-xl object-cover bg-cream-100 border border-cream-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-forest-700 uppercase">
                          {candidate.brand}
                        </span>
                        <h4 className="text-xs font-extrabold text-forest-900">
                          {candidate.title}
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          Pack: {candidate.packQuantity} {candidate.packUnit} • MRP: {formatInr(candidate.mrpInr)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-forest-900 block">
                        {formatInr(candidate.sellingPriceInr)}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-extrabold text-forest-700 bg-forest-100 px-2 py-0.5 rounded-full">
                          Current Choice
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 hover:underline">
                          Select Variant
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSubstitutingItem(null)}
              className="w-full py-3 rounded-2xl bg-cream-200 hover:bg-cream-300 text-stone-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delivery Address Modal */}
      {isAddressModalOpen && editingAddress && (
        <div
          onClick={() => setIsAddressModalOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-scrollbar overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-3xl w-full max-w-md border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div>
                <h3 className="text-lg font-black text-forest-900">
                  Delivery Address
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  Set grocery drop-off destination & quick commerce serviceability
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddressForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Address Label</label>
                <div className="flex items-center gap-2">
                  {(['Home', 'Office', 'Parents', 'Other'] as const).map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setEditingAddress({ ...editingAddress, label: lbl })}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                        editingAddress.label === lbl
                          ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                          : 'bg-white text-stone-600 border-cream-300 hover:border-forest-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Flat / House / Apartment</label>
                <input
                  type="text"
                  required
                  value={editingAddress.flat}
                  onChange={(e) => setEditingAddress({ ...editingAddress, flat: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. Flat 101, Sunshine Heights"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-medium text-forest-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Street / Area / Landmark</label>
                <input
                  type="text"
                  required
                  value={editingAddress.street}
                  onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. MG Road, Near City Mall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-medium text-forest-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editingAddress.city}
                    onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. Mumbai, Ahmedabad, Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-medium text-forest-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editingAddress.state}
                    onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. Maharashtra, Gujarat, Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-medium text-forest-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">6-Digit PIN Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={editingAddress.pincode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setEditingAddress({ ...editingAddress, pincode: clean });
                    if (pincodeError) setPincodeError('');
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g. 400001, 380015, 110001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white font-bold text-forest-900 tracking-wider focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                />
                {pincodeError && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{pincodeError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-cream-200 hover:bg-cream-300 text-stone-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold shadow-soft hover:shadow-elevated transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Save Confirmation Notification */}
      {savedFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-forest-700 flex items-center gap-2.5 animate-slide-up text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

    </div>
  );
}
