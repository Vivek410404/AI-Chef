'use client';

import React, { useState } from 'react';
import { Household, HouseholdMember, DietaryPreference } from '@rasoi/shared-types';
import {
  X,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  Heart,
  Sparkles,
  Activity,
  Dumbbell,
  Info,
  UtensilsCrossed,
  Compass,
  Check,
  AlertTriangle,
  Ban,
  Tag
} from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface HouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household | null;
  onSave: (updates: Partial<Household>) => void;
}

const HOUSEHOLD_DIETARY_OPTIONS: { id: DietaryPreference; label: string; desc: string }[] = [
  { id: 'VEGETARIAN', label: 'Vegetarian', desc: 'Plant-based & Dairy (Default)' },
  { id: 'NON_VEGETARIAN', label: 'Non-Vegetarian', desc: 'Chicken, Fish, Meat & Veg' },
  { id: 'EGGETARIAN', label: 'Eggetarian', desc: 'Vegetarian + Whole Eggs' },
  { id: 'VEGAN', label: 'Vegan', desc: '100% Plant-based (No Dairy/Honey)' },
  { id: 'JAIN', label: 'Jain', desc: 'No Onion, Garlic or Root Veg' }
];

const MEMBER_DIETARY_OPTIONS: { id: 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan' | 'jain'; label: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'non-vegetarian', label: 'Non-Veg' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' }
];

const COMMON_ALLERGENS = ['Peanuts', 'Gluten', 'Dairy', 'Soy', 'Tree Nuts', 'Mustard', 'Sesame'];
const COMMON_DISLIKED = ['Baingan (Eggplant)', 'Karela (Bitter Gourd)', 'Mushroom', 'Capsicum', 'Okra'];

const HOUSEHOLD_CUISINE_OPTIONS = [
  { id: 'ALL_INDIAN', label: 'All Indian Cuisines', desc: 'Pan-Indian Variety (Default)' },
  { id: 'North Indian', label: 'North Indian', desc: 'Punjabi, Awadhi & Mughlai' },
  { id: 'South Indian', label: 'South Indian', desc: 'Tamil, Kerala & Karnataka' },
  { id: 'West Indian', label: 'West Indian', desc: 'Gujarati & Maharashtrian' },
  { id: 'East Indian', label: 'East Indian', desc: 'Bengali & Odia Comforts' },
  { id: 'Central Indian', label: 'Central Indian', desc: 'Malwi & Bundelkhandi' }
];

export function HouseholdModal({ isOpen, onClose, household, onSave }: HouseholdModalProps) {
  if (!isOpen || !household) return null;

  const [householdName, setHouseholdName] = useState(household.name || 'Sharma Family');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(household.dietaryPreference || 'VEGETARIAN');
  const [cuisinePreference, setCuisinePreference] = useState<string>(household.cuisinePreference || 'ALL_INDIAN');
  const [budget, setBudget] = useState(household.weeklyBudgetInr || 3500);
  const [spice, setSpice] = useState(household.spiceTolerance || 'Medium');
  const [proteinGoal, setProteinGoal] = useState(household.nutritionGoals?.dailyProteinGrams || 65);
  const [calorieGoal, setCalorieGoal] = useState(household.nutritionGoals?.dailyCalories || 2000);
  const [members, setMembers] = useState<HouseholdMember[]>(household.members || []);

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDiet, setNewMemberDiet] = useState<'vegetarian' | 'non-vegetarian' | 'jain' | 'vegan' | 'eggetarian'>('vegetarian');
  const [newMemberProtein, setNewMemberProtein] = useState<number>(60);
  const [newMemberAllergies, setNewMemberAllergies] = useState<string[]>([]);
  const [newMemberDislikes, setNewMemberDislikes] = useState<string[]>([]);

  // Expanded member card ID for details
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMem: HouseholdMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      ageGroup: 'adult',
      dietaryPreference: newMemberDiet,
      allergies: newMemberAllergies,
      dislikedIngredients: newMemberDislikes,
      nutritionGoals: {
        dailyProteinGrams: newMemberProtein || 60,
        dailyCalories: 1800
      }
    };
    setMembers([...members, newMem]);
    setNewMemberName('');
    setNewMemberAllergies([]);
    setNewMemberDislikes([]);
  };

  const handleToggleNewAllergy = (allergy: string) => {
    setNewMemberAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleToggleNewDislike = (item: string) => {
    setNewMemberDislikes(prev =>
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const handleUpdateMember = (id: string, updates: Partial<HouseholdMember>) => {
    setMembers(members.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleToggleMemberAllergy = (id: string, allergy: string) => {
    const mem = members.find(m => m.id === id);
    if (!mem) return;
    const newAllergies = mem.allergies.includes(allergy)
      ? mem.allergies.filter(a => a !== allergy)
      : [...mem.allergies, allergy];
    handleUpdateMember(id, { allergies: newAllergies });
  };

  const handleToggleMemberDislike = (id: string, item: string) => {
    const mem = members.find(m => m.id === id);
    if (!mem) return;
    const currentDislikes = mem.dislikedIngredients || [];
    const newDislikes = currentDislikes.includes(item)
      ? currentDislikes.filter(d => d !== item)
      : [...currentDislikes, item];
    handleUpdateMember(id, { dislikedIngredients: newDislikes });
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      alert('Household must have at least one member.');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave({
      name: householdName.trim() || 'My Family',
      dietaryPreference,
      cuisinePreference,
      weeklyBudgetInr: budget,
      spiceTolerance: spice as any,
      members,
      nutritionGoals: {
        dailyCalories: calorieGoal,
        dailyProteinGrams: proteinGoal,
        dailyCarbsGrams: 250,
        dailyFatGrams: 65
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-soft">
              <Users className="w-5 h-5 text-terracotta-200" />
            </div>
            <div>
              <h2 className="text-xl font-black text-forest-900">Household Configuration</h2>
              <p className="text-xs text-stone-500">Configure household profile, members, dietary modes, allergies, and nutrition goals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Household Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-forest-700" />
            <span>Household Name:</span>
          </label>
          <input
            type="text"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder="e.g. Sharma Family, Bangalore House"
            className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 bg-cream-50/50 text-sm font-bold text-forest-900"
          />
        </div>

        {/* Default Household Dietary Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-forest-700" />
              <span>Default Household Dietary Mode:</span>
            </label>
            <span className="text-[11px] text-stone-500 italic">Default: Vegetarian</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {HOUSEHOLD_DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDietaryPreference(opt.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  dietaryPreference === opt.id
                    ? 'bg-forest-700 text-white border-forest-800 shadow-sm ring-2 ring-forest-500/20'
                    : 'bg-cream-50 hover:bg-cream-100 text-stone-700 border-cream-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {dietaryPreference === opt.id && <Check className="w-3.5 h-3.5 text-terracotta-300" />}
                </div>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  dietaryPreference === opt.id ? 'text-cream-200' : 'text-stone-500'
                }`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Default Regional Cuisine Preference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Default Cuisine Preference:</span>
            </label>
            <span className="text-[11px] text-stone-500 italic">Default: All Indian</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HOUSEHOLD_CUISINE_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCuisinePreference(c.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  cuisinePreference === c.id
                    ? 'bg-terracotta-600 text-white border-terracotta-700 shadow-sm ring-2 ring-terracotta-500/20'
                    : 'bg-cream-50 hover:bg-cream-100 text-stone-700 border-cream-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{c.label}</span>
                  {cuisinePreference === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  cuisinePreference === c.id ? 'text-cream-100' : 'text-stone-500'
                }`}>
                  {c.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget and Spice Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Budget Slider */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-forest-900">Weekly Grocery Budget</label>
              <span className="text-sm font-black text-forest-700">{formatInr(budget)}</span>
            </div>
            <input
              type="range"
              min="1500"
              max="10000"
              step="250"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-forest-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>₹1,500</span>
              <span>₹5,000</span>
              <span>₹10,000</span>
            </div>
          </div>

          {/* Spice Tolerance */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
            <label className="text-xs font-bold text-forest-900 block">Family Spice Tolerance</label>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['Mild', 'Medium', 'Spicy', 'Desi Teekha'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpice(level)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    spice === level
                      ? 'bg-forest-700 text-white shadow-xs'
                      : 'bg-surface text-stone-600 border border-cream-200 hover:bg-cream-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Household Nutrition Targets */}
        <div className="space-y-3 p-4 rounded-2xl bg-cream-50/70 border border-cream-200">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forest-700" />
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-forest-900">
              Household Nutrition Targets (Optional Guidelines)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Protein Target */}
            <div className="p-3 rounded-xl bg-surface border border-cream-200 space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Daily Household Protein Target</span>
                </label>
                <span className="text-sm font-black text-terracotta-600">{proteinGoal}g / day</span>
              </div>
              <input
                type="range"
                min="40"
                max="130"
                step="5"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>40g (Light)</span>
                <span>65g (Balanced)</span>
                <span>130g (High)</span>
              </div>
            </div>

            {/* Calorie Reference */}
            <div className="p-3 rounded-xl bg-surface border border-cream-200 space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold text-forest-900">Reference Daily Calories</label>
                <span className="text-sm font-black text-forest-700">{calorieGoal} kcal</span>
              </div>
              <input
                type="range"
                min="1400"
                max="3200"
                step="50"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full accent-forest-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>1,400 kcal</span>
                <span>2,000 kcal</span>
                <span>3,200 kcal</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <span>
              Nutritional goals are optional preference guidelines. RasoiIQ does not assume all members share identical targets.
            </span>
          </p>
        </div>

        {/* Family Members List with Individual Allergies & Exclusions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-900">
              Family Members ({members.length})
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">Individual diets, allergies & ingredient exclusions</span>
          </div>

          <div className="space-y-3">
            {members.map((mem) => {
              const isExpanded = editingMemberId === mem.id;
              return (
                <div
                  key={mem.id}
                  className="p-4 rounded-2xl bg-surface border border-cream-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-forest-900 text-sm">{mem.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cream-100 text-stone-700 border border-cream-300">
                        {mem.dietaryPreference}
                      </span>
                      <span className="text-[10px] text-stone-400 capitalize">• {mem.ageGroup}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {mem.nutritionGoals?.dailyProteinGrams || 60}g protein
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(isExpanded ? null : mem.id)}
                        className="text-xs font-bold text-forest-700 hover:text-forest-900 underline"
                      >
                        {isExpanded ? 'Collapse' : 'Edit Constraints'}
                      </button>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(mem.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary badges when collapsed */}
                  {!isExpanded && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {mem.allergies.length > 0 && (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Allergies: {mem.allergies.join(', ')}
                        </span>
                      )}
                      {(mem.dislikedIngredients || []).length > 0 && (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-semibold flex items-center gap-1">
                          <Ban className="w-3 h-3" /> Excluded: {(mem.dislikedIngredients || []).join(', ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded constraint editor */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-cream-200 space-y-3 bg-cream-50/50 p-3 rounded-xl text-xs">
                      {/* Dietary Mode Override */}
                      <div>
                        <span className="font-bold text-forest-900 block mb-1">Personal Dietary Mode:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {MEMBER_DIETARY_OPTIONS.map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleUpdateMember(mem.id, { dietaryPreference: d.id })}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                mem.dietaryPreference.toLowerCase() === d.id.toLowerCase()
                                  ? 'bg-forest-700 text-white'
                                  : 'bg-surface text-stone-600 border border-cream-200 hover:bg-cream-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Food Allergies */}
                      <div>
                        <span className="font-bold text-red-700 flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Food Allergies (Strictly Excluded):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_ALLERGENS.map(allergy => {
                            const hasAllergy = mem.allergies.includes(allergy);
                            return (
                              <button
                                key={allergy}
                                type="button"
                                onClick={() => handleToggleMemberAllergy(mem.id, allergy)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                  hasAllergy
                                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                                    : 'bg-surface text-stone-600 border-cream-300 hover:border-red-300'
                                }`}
                              >
                                {hasAllergy ? `✕ ${allergy}` : `+ ${allergy}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ingredient Exclusions */}
                      <div>
                        <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                          <Ban className="w-3.5 h-3.5" /> Disliked Ingredients (Avoided):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_DISLIKED.map(item => {
                            const hasDislike = (mem.dislikedIngredients || []).includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => handleToggleMemberDislike(mem.id, item)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                  hasDislike
                                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                    : 'bg-surface text-stone-600 border-cream-300 hover:border-amber-300'
                                }`}
                              >
                                {hasDislike ? `✕ ${item}` : `+ ${item}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Protein Goal Presets */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-stone-600">Daily Protein Target:</span>
                        <div className="flex items-center gap-1">
                          {[40, 55, 60, 75, 85].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() =>
                                handleUpdateMember(mem.id, {
                                  nutritionGoals: { ...mem.nutritionGoals, dailyProteinGrams: g }
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (mem.nutritionGoals?.dailyProteinGrams || 60) === g
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
                              }`}
                            >
                              {g}g
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Member Box */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
            <h4 className="text-xs font-bold text-forest-900">Add New Family Member</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Member Name (e.g., Ananya)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-cream-300 text-xs font-bold text-forest-900 focus:outline-none focus:ring-1 focus:ring-forest-500 bg-surface sm:col-span-2"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <select
                value={newMemberDiet}
                onChange={(e) => setNewMemberDiet(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-cream-300 text-xs font-bold text-forest-900 bg-surface"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
              </select>
            </div>

            {/* Quick Allergies for New Member */}
            <div>
              <span className="text-[10px] font-bold text-stone-500 block mb-1">Select Allergies (Optional):</span>
              <div className="flex flex-wrap gap-1">
                {COMMON_ALLERGENS.map(allergy => {
                  const isSel = newMemberAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleToggleNewAllergy(allergy)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        isSel
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-surface text-stone-600 border-cream-200 hover:border-cream-400'
                      }`}
                    >
                      {isSel ? `✓ ${allergy}` : `+ ${allergy}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
                className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-cream-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-cream-300 text-stone-600 text-xs font-bold hover:bg-cream-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
}
