import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESET_RECIPES } from '../data';
import { Leaf, Calendar, Trash2, Check, Cloud, Heart, AlertCircle, Plus, ShoppingBag } from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface MealPlanSectionProps {
  mealPlanIds: string[];
  activeInventory: Ingredient[];
  onRemoveFromMealPlan: (recipeId: string) => void;
  onMarkAsPrepared: (recipeId: string, recipeTitle: string, ingredientsUsed: string[]) => void;
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  isLoggedIn: boolean;
  aiRecipes?: Recipe[];
}

const getDefaultQuantityForStaple = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('oil')) return '1 bottle';
  if (lower.includes('sauce')) return '1 bottle';
  if (lower.includes('pepper') || lower.includes('salt') || lower.includes('powder') || lower.includes('cinnamon') || lower.includes('oregano') || lower.includes('paprika') || lower.includes('herbs')) return 'To taste';
  if (lower.includes('pasta') || lower.includes('oats')) return '1 box';
  if (lower.includes('walnuts') || lower.includes('nuts')) return '1 pouch';
  if (lower.includes('butter')) return '1 pack';
  if (lower.includes('milk')) return '1 carton';
  return '1 pack';
};

export default function MealPlanSection({ 
  mealPlanIds, 
  activeInventory,
  onRemoveFromMealPlan, 
  onMarkAsPrepared,
  onAddIngredient,
  isLoggedIn,
  aiRecipes = []
}: MealPlanSectionProps) {
  const [activeTab, setActiveTab] = useState<'meals' | 'staples'>('meals');
  
  // Find full recipe info for planned recipe IDs across presets and AI recipes
  const allAvailableRecipes = [...aiRecipes, ...PRESET_RECIPES];
  const plannedRecipes = mealPlanIds
    .map(id => allAvailableRecipes.find(r => r.id === id))
    .filter((r): r is Recipe => !!r);

  // 1. Gather all required pantry staples for planned recipes
  const allRequiredPantryStaples = Array.from(
    new Set(
      plannedRecipes.flatMap(recipe => recipe.ingredientsPantry || [])
    )
  );

  // 2. Filter out those that are already in activeInventory (case-insensitive substring match)
  const missingStaples = allRequiredPantryStaples.filter(staple => {
    const isInInventory = activeInventory.some(invItem => {
      const invName = invItem.name.toLowerCase();
      const stapleNameLower = staple.toLowerCase();
      return invName.includes(stapleNameLower) || stapleNameLower.includes(invName);
    });
    return !isInInventory;
  });

  // 3. Map missing staples to the recipes that need them
  const missingStaplesWithRecipes = missingStaples.map(stapleName => {
    const neededByRecipes = plannedRecipes.filter(recipe =>
      recipe.ingredientsPantry.some(item => item.toLowerCase() === stapleName.toLowerCase())
    );
    return {
      name: stapleName,
      recipes: neededByRecipes
    };
  });

  const handleAddStapleToPantry = (stapleName: string) => {
    onAddIngredient({
      name: stapleName,
      category: 'pantry',
      daysLeft: 90,
      isExpiringSoon: false,
      quantity: getDefaultQuantityForStaple(stapleName)
    });
  };

  return (
    <div className="p-5 bg-stone-50 shrink-0 select-none border-b border-stone-200/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest font-mono flex items-center gap-1">
            📅 Active Meal Plan
          </h2>
          <p className="text-[10px] text-stone-500 font-semibold">Your scheduled zero-waste recipes</p>
        </div>
        
        {isLoggedIn ? (
          <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-100 flex items-center gap-1 font-mono shadow-3xs">
            <Cloud className="w-3 h-3 text-emerald-600" /> Synced to Profile
          </span>
        ) : (
          <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-100/50 flex items-center gap-1 font-mono shadow-3xs">
            ⚠️ Local Only (Sign in to sync)
          </span>
        )}
      </div>

      {/* Tabs Switcher - Only display if there are active recipes */}
      {plannedRecipes.length > 0 && (
        <div className="flex bg-stone-200/40 p-1 rounded-2xl mb-4 gap-1 border border-stone-200/40">
          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'meals'
                ? 'bg-white text-stone-800 shadow-3xs border border-stone-200/20'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-3 h-3 text-emerald-600" />
            <span>Scheduled Meals ({plannedRecipes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staples')}
            className={`flex-1 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'staples'
                ? 'bg-white text-stone-800 shadow-3xs border border-stone-200/20'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-amber-600" />
            <span>Missing Staples ({missingStaples.length})</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {plannedRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 bg-white rounded-[2rem] border border-stone-200/80 p-5 shadow-xs flex flex-col items-center justify-center"
          >
            <Calendar className="w-7 h-7 text-stone-300 mb-1.5" />
            <p className="text-xs font-bold text-stone-600">Your Meal Plan is Empty</p>
            <p className="text-[10px] text-stone-400 max-w-[240px] mt-1 font-semibold leading-relaxed">
              Browse recipes under the list below and click <strong className="text-emerald-600">"Add to Meal Plan"</strong> to reserve ingredients!
            </p>
          </motion.div>
        ) : activeTab === 'meals' ? (
          /* SCHEDULED RECIPES VIEW */
          <div className="space-y-3">
            {plannedRecipes.map((recipe, index) => {
              const fridgeIngredients = recipe.ingredientsFridge.map(i => i.name);
              
              return (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350, delay: index * 0.05 }}
                  className="bg-white rounded-[1.5rem] border border-stone-200/80 p-3.5 shadow-3xs hover:shadow-xs transition relative overflow-hidden"
                >
                  {/* Subtle decorative background stripe */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-600" />
                  
                  <div className="flex gap-3 pl-1.5">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-black text-stone-800 leading-tight block truncate pr-1">
                          {recipe.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onRemoveFromMealPlan(recipe.id)}
                            className="p-1 text-stone-300 hover:text-red-500 rounded-lg hover:bg-stone-50 transition cursor-pointer"
                            title="Remove from plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Meta Tags */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold text-stone-500 font-mono">
                          ⏱️ {recipe.prepTime}
                        </span>
                        <span className="text-[9px] font-bold text-stone-500 font-mono">
                          • 📊 {recipe.difficulty}
                        </span>
                      </div>
                      
                      {/* Action buttons row */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => onMarkAsPrepared(recipe.id, recipe.title, fridgeIngredients)}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-extrabold rounded-xl flex items-center gap-1 shadow-3xs cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Mark as Prepared</span>
                        </button>
                        
                        <div className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5 font-mono">
                          <Leaf className="w-2.5 h-2.5 shrink-0" />
                          <span>Rescues {recipe.ingredientsFridge.length} items</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* MISSING STAPLES VIEW */
          <div className="space-y-3">
            {missingStaplesWithRecipes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/75 p-5 shadow-3xs flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-3xs border border-emerald-200/50 animate-bounce">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                </div>
                <p className="text-xs font-extrabold text-emerald-800">All Staples Stocked!</p>
                <p className="text-[10px] text-emerald-600/90 max-w-[240px] mt-1 font-semibold leading-relaxed">
                  You have all the required pantry staples in your current inventory. You're fully set to cook!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[9px] text-stone-400 font-extrabold font-mono uppercase tracking-wider mb-1 pl-1">
                  🛒 Required Pantry Staples
                </p>
                {missingStaplesWithRecipes.map((staple, index) => (
                  <motion.div
                    key={staple.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350, delay: index * 0.04 }}
                    className="bg-white rounded-[1.25rem] border border-stone-200/80 p-3 shadow-3xs hover:shadow-xs transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Cute Jar Icon Indicator */}
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/15">
                        <span className="text-xs">🧂</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-stone-800 block">
                          {staple.name}
                        </span>
                        <span className="text-[9px] text-stone-400 font-semibold block truncate leading-tight mt-0.5">
                          Needed for: <strong className="text-stone-500">{staple.recipes.map(r => r.title).join(', ')}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddStapleToPantry(staple.name)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-xl border border-amber-200 flex items-center gap-1 cursor-pointer transition shadow-3xs shrink-0"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Add to Pantry</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
