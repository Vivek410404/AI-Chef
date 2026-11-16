'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Plus,
  Archive,
  ArchiveRestore,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietaryTag, setDietaryTag] = useState('');
  const [showArchived, setShowArchived] = useState('false');

  // Create recipe modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCuisine, setNewCuisine] = useState('Gujarati');
  const [newDescription, setNewDescription] = useState('');
  const [newDietaryTag, setNewDietaryTag] = useState('PURE_VEGETARIAN');
  const [newIsJain, setNewIsJain] = useState(false);
  const [newPrepTime, setNewPrepTime] = useState('15');
  const [newCookTime, setNewCookTime] = useState('25');
  const [newCalories, setNewCalories] = useState('320');
  const [newIngredientsText, setNewIngredientsText] = useState('Besan, Mustard Seeds, Green Chilli, Curry Leaves');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchRecipes = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getRecipes({
        page,
        limit: 20,
        q: q || undefined,
        cuisine: cuisine || undefined,
        dietaryTag: dietaryTag || undefined,
        isArchived: showArchived === 'all' ? undefined : showArchived === 'true'
      });
      setRecipes(res.recipes || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, [cuisine, dietaryTag, showArchived]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes(1);
  };

  const handleToggleArchive = async (id: string, currentlyArchived: boolean) => {
    try {
      await api.admin.archiveRecipe(id, !currentlyArchived);
      setActionMessage(`Recipe ${currentlyArchived ? 'unarchived' : 'archived'} successfully.`);
      fetchRecipes(pagination.page);
    } catch (err: any) {
      alert(`Archive action failed: ${err.message}`);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    // Client dietary check
    if (newIsJain) {
      const lowerIngs = newIngredientsText.toLowerCase();
      if (lowerIngs.includes('onion') || lowerIngs.includes('garlic') || lowerIngs.includes('potato')) {
        setCreateError('Dietary conflict: Jain recipe cannot include onion, garlic, or root vegetables.');
        return;
      }
    }

    try {
      setCreateLoading(true);
      const ingredients = newIngredientsText.split(',').map((name) => ({ name: name.trim() }));
      await api.admin.createRecipe({
        title: newTitle,
        cuisine: newCuisine,
        description: newDescription,
        dietaryTags: [newDietaryTag],
        isJainFriendly: newIsJain,
        prepTimeMinutes: Number(newPrepTime),
        cookTimeMinutes: Number(newCookTime),
        caloriesPerServing: Number(newCalories),
        ingredients
      });
      setActionMessage(`Recipe "${newTitle}" created successfully!`);
      setIsCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      fetchRecipes(1);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create recipe');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span>Recipe Catalog Administration</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Curate authentic regional recipes, validate dietary rules, and maintain IFCT nutritional integrity
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Recipe</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by recipe name, ingredients, or regional cuisine..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-terracotta-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Cuisines</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Kathiyawadi">Kathiyawadi</option>
            <option value="North Indian">North Indian</option>
            <option value="South Indian">South Indian</option>
            <option value="Maharashtrian">Maharashtrian</option>
          </select>

          <select
            value={showArchived}
            onChange={(e) => setShowArchived(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="false">Active Only</option>
            <option value="true">Archived Only</option>
            <option value="all">All Recipes</option>
          </select>

          <button
            onClick={() => fetchRecipes(1)}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Recipes Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Recipe Title</th>
                <th className="py-3 px-4">Cuisine</th>
                <th className="py-3 px-4">Dietary Tags</th>
                <th className="py-3 px-4">Jain Friendly</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Calories</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading recipe catalog...
                  </td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No recipes found matching current filter.
                  </td>
                </tr>
              ) : (
                recipes.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{rec.title}</div>
                      <div className="text-[11px] text-stone-400 truncate max-w-xs">{rec.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      {rec.cuisine}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(rec.dietaryTags) && rec.dietaryTags.map((tag: string) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-stone-800 text-stone-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.isJainFriendly ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          Jain Yes
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                      {(rec.prepTimeMinutes || 0) + (rec.cookTimeMinutes || 0)}m
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-mono">
                      {rec.caloriesPerServing || 300} kcal
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/recipes/${rec.id}`}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                          title="View / Edit Recipe"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggleArchive(rec.id, rec.isArchived)}
                          className={`p-1.5 rounded-lg transition ${
                            rec.isArchived
                              ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white'
                          }`}
                          title={rec.isArchived ? 'Unarchive Recipe' : 'Archive Recipe'}
                        >
                          {rec.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecipes(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchRecipes(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Recipe Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Create Regional Recipe</span>
            </h3>

            {createError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRecipe} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Recipe Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Kathiyawadi Sev Tameta"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Cuisine *</label>
                  <select
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kathiyawadi">Kathiyawadi</option>
                    <option value="North Indian">North Indian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Maharashtrian">Maharashtrian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Dietary Tag</label>
                  <select
                    value={newDietaryTag}
                    onChange={(e) => setNewDietaryTag(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                  >
                    <option value="PURE_VEGETARIAN">Pure Vegetarian</option>
                    <option value="JAIN">Jain</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Traditional authentic preparation notes..."
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Ingredients List (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newIngredientsText}
                  onChange={(e) => setNewIngredientsText(e.target.value)}
                  placeholder="Tomatoes, Sev, Cumin, Mustard Seeds, Jaggery"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <input
                  type="checkbox"
                  id="jainCheckbox"
                  checked={newIsJain}
                  onChange={(e) => setNewIsJain(e.target.checked)}
                  className="rounded bg-stone-900 border-stone-700 text-purple-600"
                />
                <label htmlFor="jainCheckbox" className="text-xs text-stone-300 font-medium">
                  Strict Jain Friendly (Enforces no onion, garlic, or root vegetables)
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-stone-500 uppercase">Prep (mins)</label>
                  <input
                    type="number"
                    value={newPrepTime}
                    onChange={(e) => setNewPrepTime(e.target.value)}
                    className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 uppercase">Cook (mins)</label>
                  <input
                    type="number"
                    value={newCookTime}
                    onChange={(e) => setNewCookTime(e.target.value)}
                    className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 uppercase">Calories</label>
                  <input
                    type="number"
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    className="w-full p-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition"
                >
                  {createLoading ? 'Saving...' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
