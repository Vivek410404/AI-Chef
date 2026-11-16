'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Sparkles,
  Archive,
  ArchiveRestore,
  RefreshCw,
  CheckCircle,
  Save
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminRecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.id as string;

  const [recipe, setRecipe] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isJainFriendly, setIsJainFriendly] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(25);
  const [caloriesPerServing, setCaloriesPerServing] = useState(300);
  const [proteinGrams, setProteinGrams] = useState(10);
  const [carbsGrams, setCarbsGrams] = useState(40);
  const [fatGrams, setFatGrams] = useState(8);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getRecipeById(recipeId);
      setRecipe(res);
      setTitle(res.title || '');
      setDescription(res.description || '');
      setCuisine(res.cuisine || '');
      setIsJainFriendly(Boolean(res.isJainFriendly));
      setPrepTimeMinutes(res.prepTimeMinutes || 15);
      setCookTimeMinutes(res.cookTimeMinutes || 25);
      setCaloriesPerServing(res.caloriesPerServing || 300);
      setProteinGrams(res.proteinGrams || 10);
      setCarbsGrams(res.carbsGrams || 40);
      setFatGrams(res.fatGrams || 8);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) fetchRecipe();
  }, [recipeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.admin.updateRecipe(recipeId, {
        title,
        description,
        cuisine,
        isJainFriendly,
        prepTimeMinutes: Number(prepTimeMinutes),
        cookTimeMinutes: Number(cookTimeMinutes),
        caloriesPerServing: Number(caloriesPerServing),
        proteinGrams: Number(proteinGrams),
        carbsGrams: Number(carbsGrams),
        fatGrams: Number(fatGrams)
      });
      setActionMessage('Recipe changes saved successfully.');
      fetchRecipe();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!recipe) return;
    try {
      await api.admin.archiveRecipe(recipe.id, !recipe.isArchived);
      setActionMessage(`Recipe ${recipe.isArchived ? 'unarchived' : 'archived'}.`);
      fetchRecipe();
    } catch (err: any) {
      alert(`Archive action failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
        Loading recipe detail...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200">
        <h3 className="font-bold text-lg mb-2">Recipe Not Found</h3>
        <Link href="/admin/recipes" className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold">
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/recipes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipe Catalog</span>
        </Link>

        <button
          onClick={handleToggleArchive}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            recipe.isArchived
              ? 'bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
          }`}
        >
          {recipe.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          <span>{recipe.isArchived ? 'Unarchive Recipe' : 'Archive Recipe'}</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <h1 className="text-xl font-bold text-white">Edit Recipe: {recipe.title}</h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5">ID: {recipe.id} · Slug: {recipe.slug}</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition shadow-soft"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Updates'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-400 mb-1">Cuisine</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-400 mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Nutritional & Time Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Prep Time (min)</label>
            <input
              type="number"
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Cook Time (min)</label>
            <input
              type="number"
              value={cookTimeMinutes}
              onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Calories (kcal)</label>
            <input
              type="number"
              value={caloriesPerServing}
              onChange={(e) => setCaloriesPerServing(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Protein (g)</label>
            <input
              type="number"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Carbs (g)</label>
            <input
              type="number"
              value={carbsGrams}
              onChange={(e) => setCarbsGrams(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-stone-500 uppercase">Fat (g)</label>
            <input
              type="number"
              value={fatGrams}
              onChange={(e) => setFatGrams(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-950 border border-stone-800">
          <input
            type="checkbox"
            id="jainCheckboxDetail"
            checked={isJainFriendly}
            onChange={(e) => setIsJainFriendly(e.target.checked)}
            className="rounded bg-stone-900 border-stone-700 text-purple-600"
          />
          <label htmlFor="jainCheckboxDetail" className="text-xs text-stone-200 font-medium">
            Jain Friendly Preparation (Strictly compliant: zero onion, garlic, or root vegetables)
          </label>
        </div>
      </form>

      {/* Ingredients List (Read-only view from DB) */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <h3 className="text-base font-bold text-white">Recipe Ingredients ({recipe.ingredients?.length || 0})</h3>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {recipe.ingredients.map((ing: any) => (
              <div key={ing.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{ing.ingredient?.name || 'Essential'}</span>
                <span className="text-stone-400 font-mono">{ing.quantity} {ing.unit}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-3 text-center">No individual ingredient breakdown stored.</p>
        )}
      </div>
    </div>
  );
}
