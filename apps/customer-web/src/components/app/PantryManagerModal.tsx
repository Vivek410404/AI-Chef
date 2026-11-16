'use client';

import React, { useState } from 'react';
import { PantryItem, StandardUnit } from '@rasoi/shared-types';
import { X, Plus, Trash2, Package, AlertCircle, Check } from 'lucide-react';
import { SEED_INGREDIENTS } from '@rasoi/database';

interface PantryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: PantryItem[];
  onUpdatePantry: (ingredientId: string, quantity: number, unit: StandardUnit) => void;
  onRemoveItem: (id: string) => void;
}

export function PantryManagerModal({
  isOpen,
  onClose,
  pantryItems,
  onUpdatePantry,
  onRemoveItem
}: PantryManagerModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState(SEED_INGREDIENTS[0].id);
  const [quantity, setQuantity] = useState(1000);
  const [unit, setUnit] = useState<StandardUnit>('g');

  if (!isOpen) return null;

  const handleAdd = () => {
    onUpdatePantry(selectedIngredientId, quantity, unit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-soft">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-forest-900">Kitchen Pantry Manager</h2>
              <p className="text-xs text-stone-500">Track staples at home to avoid buying duplicate ingredients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Item Row */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
          <span className="text-xs font-bold text-forest-900 block">Add or Update Stock at Home:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-cream-300 bg-surface text-xs font-semibold text-forest-900 focus:outline-none"
            >
              {SEED_INGREDIENTS.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.hindiName})
                </option>
              ))}
            </select>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantity"
              className="px-3 py-2 rounded-xl border border-cream-300 bg-surface text-xs font-semibold text-forest-900 focus:outline-none"
            />

            <div className="flex gap-2">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as StandardUnit)}
                className="px-3 py-2 rounded-xl border border-cream-300 bg-surface text-xs font-semibold text-forest-900 focus:outline-none"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="piece">piece</option>
              </select>

              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Current Stock in Pantry ({pantryItems.length} items)
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {pantryItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-surface border border-cream-200 flex items-center justify-between text-xs hover:border-forest-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-stone-400" />
                  <div>
                    <span className="font-extrabold text-forest-900">{item.ingredient?.name || item.ingredientId}</span>
                    {item.isLowStock && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Running Low
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-forest-900">
                    {item.currentQuantity} {item.unit}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
