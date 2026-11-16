'use client';

import React, { useState, useEffect } from 'react';
import {
  Recipe,
  Household,
  MealPlanItem,
  ScaledIngredientRequirement,
  GroceryBasket,
  PantryItem,
  AIPlanGenerationResponse,
  DayOfWeek,
  MealCategory,
  StandardUnit,
  DeliveryAddress
} from '@rasoi/shared-types';
import { api } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturedRecipesSection } from '@/components/landing/FeaturedRecipesSection';
import { MarketplaceComparisonSection } from '@/components/landing/MarketplaceComparisonSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { CustomerDashboardView } from '@/components/app/CustomerDashboardView';
import { MealPlannerView } from '@/components/app/MealPlannerView';
import { RecipeDiscoveryView } from '@/components/app/RecipeDiscoveryView';
import { GroceryBasketView } from '@/components/app/GroceryBasketView';
import { RecipeDetailModal } from '@/components/app/RecipeDetailModal';
import { AiPlannerModal } from '@/components/app/AiPlannerModal';
import { HouseholdModal } from '@/components/app/HouseholdModal';
import { PantryManagerModal } from '@/components/app/PantryManagerModal';
import { OrderSuccessModal } from '@/components/app/OrderSuccessModal';
import { RetailerAdminViews } from '@/components/app/RetailerAdminViews';
import { RecipePickerModal } from '@/components/app/RecipePickerModal';
import { SEED_RECIPES, SEED_DEMO_HOUSEHOLD, SEED_PANTRY_ITEMS, SEED_RETAILERS, SEED_PRODUCT_VARIANTS } from '@rasoi/database';
import { calculateMealPlanRequirements, buildGroceryBasket } from '@rasoi/grocery-engine';

type ActiveTab = 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Synchronize tab changes to URL hash and localStorage so reloads and deep links preserve the active view
  const changeTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasoi_active_tab', tab);
      const newUrl = tab === 'landing' ? window.location.pathname : `${window.location.pathname}#${tab}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Restore saved tab on initial page load / refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const validTabs: ActiveTab[] = [
        'landing', 'dashboard', 'planner', 'recipes', 'basket', 'pantry', 'retailer-admin'
      ];
      
      // 1. Check URL hash first (e.g. #dashboard, #planner, #basket)
      const hash = window.location.hash.replace('#', '') as any;
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
        return;
      }

      // 2. Check search params (e.g. ?tab=dashboard)
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get('tab') as any;
      if (validTabs.includes(queryTab)) {
        setActiveTab(queryTab);
        return;
      }

      // 3. Check persistent localStorage
      const saved = localStorage.getItem('rasoi_active_tab') as any;
      if (validTabs.includes(saved) && saved !== 'landing') {
        setActiveTab(saved);
        window.history.replaceState(null, '', `${window.location.pathname}#${saved}`);
      } else if (!window.location.hash && !params.get('tab')) {
        setActiveTab('dashboard');
      }
    }
  }, []);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as any;
      const validTabs: ActiveTab[] = [
        'landing', 'dashboard', 'planner', 'recipes', 'basket', 'pantry', 'retailer-admin'
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!window.location.hash) {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Application State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [basket, setBasket] = useState<GroceryBasket | null>(null);
  const [requirements, setRequirements] = useState<ScaledIngredientRequirement[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [pickerTarget, setPickerTarget] = useState<{ day: DayOfWeek; meal: MealCategory } | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Delivery Addresses State (Multiple locations supported)
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr-home',
      label: 'Home',
      flat: 'Flat 402, Green Glen Layout',
      street: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: true
    },
    {
      id: 'addr-office',
      label: 'Office',
      flat: 'Tower B, 7th Floor, Mindspace Tech Park',
      street: 'Link Road, Malad West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400064',
      isDefault: false
    },
    {
      id: 'addr-parents',
      label: 'Parents',
      flat: 'House No. 42',
      street: 'Sector 15, Near City Center',
      city: 'New Delhi',
      state: 'Delhi-NCR',
      pincode: '110085',
      isDefault: false
    }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-home');

  const handleSaveAddress = (address: DeliveryAddress) => {
    setDeliveryAddresses(prev => {
      const idx = prev.findIndex(a => a.id === address.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = address;
        return next;
      }
      return [...prev, address];
    });
    setSelectedAddressId(address.id);
  };

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Try fetching from backend API
        const [recs, plan, hh, pnt, ords] = await Promise.all([
          api.getRecipes(),
          api.getCurrentPlan(),
          api.getHousehold(),
          api.getPantry(),
          api.getOrders().catch(() => [])
        ]);
        setRecipes(recs);
        setMealPlanItems(plan);
        setHousehold(hh);
        setPantryItems(pnt);
        setOrders(ords || []);

        const bkt = await api.getBasket();
        setBasket(bkt);
        const reqs = await api.getRequirements();
        setRequirements(reqs);
      } catch (err) {
        console.warn('Backend loading or in progress; initializing local state seamlessly:', err);
        // Fallback to rich local seed state
        const initialRecipes: Recipe[] = SEED_RECIPES.map(r => ({
          ...r,
          ingredients: r.ingredients.map((ing, idx) => ({
            id: `rec-ing-${r.id}-${idx}`,
            recipeId: r.id,
            ingredientId: ing.ingredientId,
            ingredient: {
              id: ing.ingredientId,
              name: ing.ingredientId.replace('ing-', '').replace('-', ' '),
              category: 'Produce',
              standardUnit: ing.unit,
              isJainPermissible: true
            },
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes
          })),
          instructions: r.steps,
          rating: 4.8,
          ratingCount: 120
        }));
        setRecipes(initialRecipes);

        const initialHousehold: Household = {
          id: SEED_DEMO_HOUSEHOLD.id,
          userId: SEED_DEMO_HOUSEHOLD.userId,
          name: SEED_DEMO_HOUSEHOLD.name,
          primaryCuisines: ['North Indian', 'Gujarati'],
          spiceTolerance: 'Medium',
          weeklyBudgetInr: SEED_DEMO_HOUSEHOLD.weeklyBudgetInr,
          cookingFrequency: 'Daily Fresh',
          members: SEED_DEMO_HOUSEHOLD.members.map(m => ({
            ...m,
            ageGroup: m.ageGroup as any,
            dietaryPreference: m.dietaryPreference as any
          }))
        };
        setHousehold(initialHousehold);

        const initialPlan: MealPlanItem[] = [
          {
            id: 'plan-item-1',
            mealPlanId: 'mp-week-1',
            dayOfWeek: 'monday',
            mealCategory: 'breakfast',
            recipeId: 'recipe-methi-thepla',
            recipe: initialRecipes.find(r => r.id === 'recipe-methi-thepla')!,
            servings: 4
          },
          {
            id: 'plan-item-2',
            mealPlanId: 'mp-week-1',
            dayOfWeek: 'monday',
            mealCategory: 'lunch',
            recipeId: 'recipe-paneer-butter-masala',
            recipe: initialRecipes.find(r => r.id === 'recipe-paneer-butter-masala')!,
            servings: 4
          },
          {
            id: 'plan-item-3',
            mealPlanId: 'mp-week-1',
            dayOfWeek: 'tuesday',
            mealCategory: 'breakfast',
            recipeId: 'recipe-kanda-poha',
            recipe: initialRecipes.find(r => r.id === 'recipe-kanda-poha')!,
            servings: 4
          },
          {
            id: 'plan-item-4',
            mealPlanId: 'mp-week-1',
            dayOfWeek: 'tuesday',
            mealCategory: 'lunch',
            recipeId: 'recipe-rajma-chawal',
            recipe: initialRecipes.find(r => r.id === 'recipe-rajma-chawal')!,
            servings: 4
          }
        ];
        setMealPlanItems(initialPlan);

        const initialPantry: PantryItem[] = SEED_PANTRY_ITEMS.map((p, idx) => ({
          id: `pantry-${idx}`,
          householdId: initialHousehold.id,
          ingredientId: p.ingredientId,
          ingredient: {
            id: p.ingredientId,
            name: p.ingredientId.replace('ing-', '').replace('-', ' '),
            category: 'Pantry Staples',
            standardUnit: p.unit as any,
            isJainPermissible: true
          },
          currentQuantity: p.currentQuantity,
          unit: p.unit as any,
          isLowStock: p.isLowStock,
          updatedAt: new Date().toISOString()
        }));
        setPantryItems(initialPantry);

        // Run Grocery Engine locally
        const reqs = calculateMealPlanRequirements(initialPlan, initialPantry);
        setRequirements(reqs);

        const variants = SEED_PRODUCT_VARIANTS.map(v => ({
          ...v,
          productId: `prod-${v.brand}`
        }));
        const bResult = buildGroceryBasket(reqs, variants, SEED_RETAILERS, SEED_RETAILERS[0].id);
        setBasket({
          id: 'basket-local',
          householdId: initialHousehold.id,
          selectedRetailerId: SEED_RETAILERS[0].id,
          items: bResult.items,
          subtotalInr: bResult.subtotalInr,
          deliveryFeeInr: bResult.deliveryFeeInr,
          totalInr: bResult.totalInr,
          comparisons: bResult.comparisons
        });
      }
    }
    loadData();
  }, []);

  // Recalculate grocery basket whenever meal plan or pantry items change
  const refreshBasket = async () => {
    try {
      const [reqs, bkt] = await Promise.all([
        api.getRequirements(),
        api.getBasket()
      ]);
      setRequirements(reqs);
      setBasket(bkt);
    } catch {
      const reqs = calculateMealPlanRequirements(mealPlanItems, pantryItems);
      setRequirements(reqs);
      const variants = SEED_PRODUCT_VARIANTS.map(v => ({
        ...v,
        productId: `prod-${v.brand}`
      }));
      const bResult = buildGroceryBasket(
        reqs,
        variants,
        SEED_RETAILERS,
        basket?.selectedRetailerId || SEED_RETAILERS[0].id,
        basket?.items || []
      );
      setBasket({
        id: 'basket-local',
        householdId: household?.id || 'hh-sharma-family',
        selectedRetailerId: basket?.selectedRetailerId || SEED_RETAILERS[0].id,
        items: bResult.items,
        subtotalInr: bResult.subtotalInr,
        deliveryFeeInr: bResult.deliveryFeeInr,
        totalInr: bResult.totalInr,
        comparisons: bResult.comparisons
      });
    }
  };

  // Meal Plan Handlers
  const handleAddMealFromSlot = (day: DayOfWeek, meal: MealCategory) => {
    setPickerTarget({ day, meal });
  };

  const handleAddMealFromRecipe = async (recipe: Recipe, day: DayOfWeek, meal: MealCategory, servings: number) => {
    try {
      await api.addMealItem({
        dayOfWeek: day,
        mealCategory: meal,
        recipeId: recipe.id,
        servings
      });
      const updatedPlan = await api.getCurrentPlan();
      setMealPlanItems(updatedPlan);
      await refreshBasket();
    } catch {
      // Local fallback
      const newItem: MealPlanItem = {
        id: `plan-item-${Date.now()}`,
        mealPlanId: 'mp-current',
        dayOfWeek: day,
        mealCategory: meal,
        recipeId: recipe.id,
        recipe,
        servings
      };
      const filtered = mealPlanItems.filter(i => !(i.dayOfWeek === day && i.mealCategory === meal));
      const updated = [...filtered, newItem];
      setMealPlanItems(updated);
      const reqs = calculateMealPlanRequirements(updated, pantryItems);
      setRequirements(reqs);
      const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));
      const bResult = buildGroceryBasket(reqs, variants, SEED_RETAILERS, basket?.selectedRetailerId || SEED_RETAILERS[0].id, basket?.items || []);
      setBasket(prev => prev ? { ...prev, items: bResult.items, totalInr: bResult.totalInr, comparisons: bResult.comparisons } : null);
    }
  };

  const handleRemoveMeal = async (id: string) => {
    try {
      await api.removeMealItem(id);
      const updated = await api.getCurrentPlan();
      setMealPlanItems(updated);
      await refreshBasket();
    } catch {
      const updated = mealPlanItems.filter(i => i.id !== id);
      setMealPlanItems(updated);
      const reqs = calculateMealPlanRequirements(updated, pantryItems);
      setRequirements(reqs);
    }
  };

  const handleUpdateServings = async (id: string, delta: number) => {
    const item = mealPlanItems.find(i => i.id === id);
    if (!item) return;
    const newServings = Math.max(1, item.servings + delta);

    try {
      await api.updateMealItem(id, { servings: newServings });
      const updated = await api.getCurrentPlan();
      setMealPlanItems(updated);
      await refreshBasket();
    } catch {
      const updated = mealPlanItems.map(i => i.id === id ? { ...i, servings: newServings } : i);
      setMealPlanItems(updated);
      const reqs = calculateMealPlanRequirements(updated, pantryItems);
      setRequirements(reqs);
    }
  };

  const handleClearPlan = async () => {
    try {
      await api.clearPlan();
      setMealPlanItems([]);
      await refreshBasket();
    } catch {
      setMealPlanItems([]);
      setRequirements([]);
    }
  };

  const handleApplyAiPlan = async (aiResponse: AIPlanGenerationResponse) => {
    try {
      await api.applyAiPlan(aiResponse.meals);
      const updated = await api.getCurrentPlan();
      setMealPlanItems(updated);
      await refreshBasket();
      changeTab('planner');
    } catch {
      const newItems: MealPlanItem[] = aiResponse.meals.map(m => {
        const r = recipes.find(rec => rec.id === m.recipeId) || recipes[0];
        return {
          id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          mealPlanId: 'mp-current',
          dayOfWeek: m.dayOfWeek,
          mealCategory: m.mealCategory,
          recipeId: r.id,
          recipe: r,
          servings: m.servings || 4,
          notes: m.reason
        };
      });
      setMealPlanItems(newItems);
      const reqs = calculateMealPlanRequirements(newItems, pantryItems);
      setRequirements(reqs);
      changeTab('planner');
    }
  };

  const handleRegenerateMeal = async (day: DayOfWeek, meal: MealCategory) => {
    const existing = mealPlanItems.find(i => i.dayOfWeek === day && i.mealCategory === meal);
    const householdDiet = household?.members?.[0]?.dietaryPreference || 'VEGETARIAN';
    const candidateRecipes = recipes.filter(r => {
      if (r.id === existing?.recipeId) return false;
      const catMatch = r.mealTypes && r.mealTypes.length > 0 ? r.mealTypes.includes(meal) : true;
      if (!catMatch) return false;
      if (householdDiet === 'VEGAN') return r.dietaryTags.includes('Vegan');
      if (householdDiet === 'JAIN') return r.dietaryTags.includes('Jain Friendly') || r.isJainFriendly;
      if (householdDiet === 'VEGETARIAN' || householdDiet === 'EGGETARIAN') {
        return r.dietaryTags.includes('Vegetarian') || r.dietaryTags.includes('Pure Vegetarian') || r.dietaryTags.includes('Vegan') || r.isJainFriendly;
      }
      return true;
    });

    const pool = candidateRecipes.length > 0 ? candidateRecipes : recipes.filter(r => r.id !== existing?.recipeId);
    if (pool.length === 0) return;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    if (existing) {
      try {
        await api.updateMealItem(existing.id, {
          recipeId: chosen.id,
          servings: existing.servings
        });
        const updated = await api.getCurrentPlan();
        setMealPlanItems(updated);
        await refreshBasket();
      } catch {
        const updated = mealPlanItems.map(item => item.id === existing.id ? {
          ...item,
          recipeId: chosen.id,
          recipe: chosen
        } : item);
        setMealPlanItems(updated);
        const reqs = calculateMealPlanRequirements(updated, pantryItems);
        setRequirements(reqs);
      }
    } else {
      await handleAddMealFromRecipe(chosen, day, meal, 4);
    }
  };

  // Basket Handlers
  const handleToggleBasketItem = async (ingredientId: string, isSelected: boolean) => {
    try {
      const updated = await api.toggleBasketItem(ingredientId, isSelected);
      setBasket(updated);
    } catch {
      if (basket) {
        const updatedItems = basket.items.map(i =>
          i.ingredientId === ingredientId ? { ...i, isSelectedForPurchase: isSelected } : i
        );
        const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));
        const bResult = buildGroceryBasket(
          requirements,
          variants,
          SEED_RETAILERS,
          basket.selectedRetailerId,
          updatedItems
        );
        setBasket({
          ...basket,
          items: bResult.items,
          subtotalInr: bResult.subtotalInr,
          deliveryFeeInr: bResult.deliveryFeeInr,
          totalInr: bResult.totalInr,
          mrpTotalInr: bResult.mrpTotalInr,
          discountInr: bResult.discountInr,
          comparisons: bResult.comparisons
        });
      }
    }
  };

  const handleUpdatePacks = async (ingredientId: string, packs: number) => {
    try {
      const updated = await api.updateBasketPacks(ingredientId, packs);
      setBasket(updated);
    } catch {
      if (basket) {
        const updatedItems = basket.items.map(i =>
          i.ingredientId === ingredientId ? { ...i, quantityPacks: Math.max(0, packs) } : i
        );
        const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));
        const bResult = buildGroceryBasket(
          requirements,
          variants,
          SEED_RETAILERS,
          basket.selectedRetailerId,
          updatedItems
        );
        setBasket({
          ...basket,
          items: bResult.items,
          subtotalInr: bResult.subtotalInr,
          deliveryFeeInr: bResult.deliveryFeeInr,
          totalInr: bResult.totalInr,
          mrpTotalInr: bResult.mrpTotalInr,
          discountInr: bResult.discountInr,
          comparisons: bResult.comparisons
        });
      }
    }
  };

  const handleSwapVariant = async (ingredientId: string, variantId: string) => {
    try {
      const updated = await api.swapBasketVariant(ingredientId, variantId);
      setBasket(updated);
    } catch {
      if (basket) {
        const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));
        const newVariant = variants.find(v => v.id === variantId);
        if (newVariant) {
          const updatedItems = basket.items.map(item => {
            if (item.ingredientId === ingredientId) {
              return {
                ...item,
                productVariantId: newVariant.id,
                productVariant: newVariant
              };
            }
            return item;
          });
          const bResult = buildGroceryBasket(
            requirements,
            variants,
            SEED_RETAILERS,
            basket.selectedRetailerId,
            updatedItems
          );
          setBasket({
            ...basket,
            items: bResult.items,
            subtotalInr: bResult.subtotalInr,
            deliveryFeeInr: bResult.deliveryFeeInr,
            totalInr: bResult.totalInr,
            mrpTotalInr: bResult.mrpTotalInr,
            discountInr: bResult.discountInr,
            comparisons: bResult.comparisons
          });
        }
      }
    }
  };

  const handleRemoveBasketItem = async (ingredientId: string) => {
    await handleToggleBasketItem(ingredientId, false);
  };

  const handleSelectRetailer = async (retailerId: string) => {
    try {
      const updated = await api.getBasket(retailerId);
      setBasket(updated);
    } catch {
      if (basket) {
        const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));
        const bResult = buildGroceryBasket(
          requirements,
          variants,
          SEED_RETAILERS,
          retailerId,
          basket.items
        );
        setBasket({
          ...basket,
          selectedRetailerId: retailerId,
          items: bResult.items,
          subtotalInr: bResult.subtotalInr,
          deliveryFeeInr: bResult.deliveryFeeInr,
          totalInr: bResult.totalInr,
          mrpTotalInr: bResult.mrpTotalInr,
          discountInr: bResult.discountInr,
          comparisons: bResult.comparisons
        });
      }
    }
  };

  const handleCheckout = async (address?: DeliveryAddress) => {
    if (!basket || isCheckingOut) return;
    setIsCheckingOut(true);
    const activeAddr = address || deliveryAddresses.find(a => a.id === selectedAddressId) || deliveryAddresses[0];
    const formattedAddress = `${activeAddr.flat}, ${activeAddr.street}, ${activeAddr.city} ${activeAddr.pincode} (${activeAddr.state})`;
    const selectedItems = basket.items.filter(i => i.isSelectedForPurchase);

    try {
      const order = await api.checkout({
        retailerId: basket.selectedRetailerId,
        items: selectedItems,
        totalInr: basket.totalInr,
        deliveryAddress: formattedAddress
      });
      setPlacedOrder({
        ...order,
        itemsCount: selectedItems.length
      });
      setOrders(prev => [order, ...prev]);
    } catch {
      const ret = SEED_RETAILERS.find(r => r.id === basket.selectedRetailerId) || SEED_RETAILERS[0];
      const fallbackOrder = {
        id: `ord-local-${Date.now()}`,
        orderNumber: `RASOI-${Math.floor(100000 + Math.random() * 900000)}`,
        retailerId: ret.id,
        retailerName: ret.name,
        deliveryTimeEstimate: ret.deliveryTimeEstimate,
        status: 'DEMO ORDER CONFIRMED',
        itemsCount: selectedItems.length,
        items: selectedItems,
        totalAmountInr: basket.totalInr,
        subtotalInr: basket.subtotalInr,
        deliveryFeeInr: basket.deliveryFeeInr,
        deliveryAddress: formattedAddress,
        createdAt: new Date().toISOString()
      };
      setPlacedOrder(fallbackOrder);
      setOrders(prev => [fallbackOrder, ...prev]);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Pantry Handlers
  const handleUpdatePantry = async (ingredientId: string, quantity: number, unit: StandardUnit) => {
    try {
      await api.updatePantryItem({ ingredientId, quantity, unit });
      const updatedPantry = await api.getPantry();
      setPantryItems(updatedPantry);
      await refreshBasket();
    } catch {
      const updated = [...pantryItems];
      const existing = updated.find(p => p.ingredientId === ingredientId);
      if (existing) {
        existing.currentQuantity = quantity;
        existing.unit = unit;
      } else {
        const ing = recipes.flatMap(r => r.ingredients).find(i => i.ingredientId === ingredientId)?.ingredient || {
          id: ingredientId,
          name: ingredientId,
          category: 'Produce',
          standardUnit: unit,
          isJainPermissible: true
        };
        updated.push({
          id: `pantry-${Date.now()}`,
          householdId: household?.id || 'hh-sharma-family',
          ingredientId,
          ingredient: ing as any,
          currentQuantity: quantity,
          unit,
          isLowStock: false,
          updatedAt: new Date().toISOString()
        });
      }
      setPantryItems(updated);
      const reqs = calculateMealPlanRequirements(mealPlanItems, updated);
      setRequirements(reqs);
    }
  };

  const handleRemovePantryItem = async (id: string) => {
    try {
      await api.removePantryItem(id);
      const updatedPantry = await api.getPantry();
      setPantryItems(updatedPantry);
      await refreshBasket();
    } catch {
      const updated = pantryItems.filter(p => p.id !== id);
      setPantryItems(updated);
      const reqs = calculateMealPlanRequirements(mealPlanItems, updated);
      setRequirements(reqs);
    }
  };

  const handleUpdateHousehold = async (updates: Partial<Household>) => {
    try {
      const updated = await api.updateHousehold(updates);
      setHousehold(updated);
    } catch {
      if (household) {
        setHousehold({ ...household, ...updates });
      }
    }
  };

  const handleSwitchHousehold = async (targetHouseholdId: string) => {
    try {
      const email = targetHouseholdId === 'hh-patel-family'
        ? 'ramesh@patel.in'
        : targetHouseholdId === 'hh-mehta-family'
        ? 'kirit@mehta.in'
        : 'pooja@sharma.in';
      await api.login(email);
      const [recs, plan, hh, pnt, ords] = await Promise.all([
        api.getRecipes(),
        api.getCurrentPlan(),
        api.getHousehold(),
        api.getPantry(),
        api.getOrders().catch(() => [])
      ]);
      setRecipes(recs);
      setMealPlanItems(plan);
      setHousehold(hh);
      setPantryItems(pnt);
      setOrders(ords || []);
      const bkt = await api.getBasket();
      setBasket(bkt);
      const reqs = await api.getRequirements();
      setRequirements(reqs);
    } catch (e: any) {
      console.error('Failed to switch household session:', e);
    }
  };

  const basketCount = basket ? basket.items.filter(i => i.isSelectedForPurchase).length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        onOpenAiPlanner={() => setIsAiModalOpen(true)}
        onOpenHousehold={() => setIsHouseholdModalOpen(true)}
        onSwitchHousehold={handleSwitchHousehold}
        basketCount={basketCount}
        household={household}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <div>
            <HeroSection
              onStartPlanner={() => changeTab('planner')}
              onOpenAiModal={() => setIsAiModalOpen(true)}
            />
            <HowItWorksSection />
            <FeaturedRecipesSection
              recipes={recipes}
              onSelectRecipe={(r) => setSelectedRecipe(r)}
              onViewAll={() => changeTab('recipes')}
            />
            <MarketplaceComparisonSection onGoToBasket={() => changeTab('basket')} />
            <CtaSection
              onStartPlanner={() => changeTab('planner')}
              onOpenAiPlanner={() => setIsAiModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <CustomerDashboardView
              household={household}
              mealPlanItems={mealPlanItems}
              requirements={requirements}
              basket={basket}
              orders={orders}
              onOpenHousehold={() => setIsHouseholdModalOpen(true)}
              onOpenAiPlanner={() => setIsAiModalOpen(true)}
              onGoToPlanner={() => changeTab('planner')}
              onGoToBasket={() => changeTab('basket')}
              onGoToPantry={() => changeTab('pantry')}
              onSelectRecipe={(r) => setSelectedRecipe(r)}
              onAddMeal={handleAddMealFromSlot}
            />
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <MealPlannerView
              planItems={mealPlanItems}
              household={household}
              requirements={requirements}
              onAddMeal={handleAddMealFromSlot}
              onRegenerateMeal={handleRegenerateMeal}
              onRemoveMeal={handleRemoveMeal}
              onUpdateServings={handleUpdateServings}
              onOpenAiPlanner={() => setIsAiModalOpen(true)}
              onGoToBasket={() => changeTab('basket')}
              onClearPlan={handleClearPlan}
              onSelectRecipe={(r) => setSelectedRecipe(r)}
              onOpenHousehold={() => setIsHouseholdModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <RecipeDiscoveryView
              recipes={recipes}
              onSelectRecipe={(r) => setSelectedRecipe(r)}
            />
          </div>
        )}

        {activeTab === 'basket' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <GroceryBasketView
              basket={basket}
              requirements={requirements}
              availableVariants={SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }))}
              onToggleItem={handleToggleBasketItem}
              onUpdatePacks={handleUpdatePacks}
              onSwapVariant={handleSwapVariant}
              onRemoveItem={handleRemoveBasketItem}
              onSelectRetailer={handleSelectRetailer}
              onCheckout={handleCheckout}
              onOpenPantry={() => setIsPantryModalOpen(true)}
              deliveryAddresses={deliveryAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onSaveAddress={handleSaveAddress}
              isCheckingOut={isCheckingOut}
            />
          </div>
        )}

        {activeTab === 'pantry' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-forest-900">Household Kitchen Pantry</h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Ingredients logged here are automatically subtracted from your grocery shopping list.
                  </p>
                </div>
                <button
                  onClick={() => setIsPantryModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs"
                >
                  Manage Pantry Items
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {pantryItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                    <span className="text-xs font-extrabold text-forest-900 block truncate">
                      {item.ingredient?.name || item.ingredientId}
                    </span>
                    <p className="text-xl font-black text-forest-700">
                      {item.currentQuantity} {item.unit}
                    </p>
                    {item.isLowStock && (
                      <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Stock Running Low
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retailer-admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <RetailerAdminViews />
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipePickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        recipes={recipes}
        targetDay={pickerTarget?.day || null}
        targetMeal={pickerTarget?.meal || null}
        onSelectRecipe={handleAddMealFromRecipe}
        onViewRecipeDetails={(r) => setSelectedRecipe(r)}
      />

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onAddToPlan={handleAddMealFromRecipe}
      />

      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyPlan={handleApplyAiPlan}
      />

      <HouseholdModal
        isOpen={isHouseholdModalOpen}
        onClose={() => setIsHouseholdModalOpen(false)}
        household={household}
        onSave={handleUpdateHousehold}
      />

      <PantryManagerModal
        isOpen={isPantryModalOpen}
        onClose={() => setIsPantryModalOpen(false)}
        pantryItems={pantryItems}
        onUpdatePantry={handleUpdatePantry}
        onRemoveItem={handleRemovePantryItem}
      />

      <OrderSuccessModal
        isOpen={placedOrder !== null}
        onClose={() => setPlacedOrder(null)}
        onReturnToDashboard={() => {
          setPlacedOrder(null);
          changeTab('dashboard');
        }}
        orderData={placedOrder}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
