import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldAlert, BookOpen, Check, HelpCircle, ChevronDown, ChevronUp, Leaf, Sparkles, Filter, Calendar } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { RECIPE_FILTERS } from '../data';

interface RecipeSectionProps {
  recipes: Recipe[];
  aiRecipes?: Recipe[];
  isGeneratingRecipes?: boolean;
  onGenerateRecipes?: () => void;
  activeInventory: Ingredient[];
  isAnalyzing: boolean;
  mealPlanIds: string[];
  onAddToMealPlan: (recipeId: string) => void;
  onRemoveFromMealPlan: (recipeId: string) => void;
}

export default function RecipeSection({ 
  recipes, 
  aiRecipes = [],
  isGeneratingRecipes = false,
  onGenerateRecipes,
  activeInventory, 
  isAnalyzing,
  mealPlanIds,
  onAddToMealPlan,
  onRemoveFromMealPlan
}: RecipeSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const toggleFilter = (filterId: string) => {
    setSelectedFilter(filterId);
    setExpandedRecipeId(null); // Collapse any open steps when filter changes
  };

  const toggleAccordion = (recipeId: string) => {
    setExpandedRecipeId(prev => (prev === recipeId ? null : recipeId));
  };

  // Check if an ingredient in the recipe exists in the fridge inventory (matching either name or approximate substring)
  const isIngredientInInventory = (recipeIngName: string): boolean => {
    return activeInventory.some((invItem) => {
      const invName = invItem.name.toLowerCase();
      const recName = recipeIngName.toLowerCase();
      return (
        invName.includes(recName) ||
        recName.includes(invName) ||
        // special cases for spinach / tomatoes / bananas / chicken
        (recName.includes('spinach') && invName.includes('spinach')) ||
        (recName.includes('tomato') && invName.includes('tomato')) ||
        (recName.includes('banana') && invName.includes('banana')) ||
        (recName.includes('chicken') && invName.includes('chicken')) ||
        (recName.includes('egg') && invName.includes('egg')) ||
        (recName.includes('yogurt') && invName.includes('yogurt')) ||
        (recName.includes('bread') && invName.includes('bread'))
      );
    });
  };

  // Count how many recipe ingredients are owned
  const getMatchCount = (recipe: Recipe) => {
    let match = 0;
    recipe.ingredientsFridge.forEach((ing) => {
      if (isIngredientInInventory(ing.name)) {
        match++;
      }
    });
    return {
      match,
      total: recipe.ingredientsFridge.length,
      percentage: Math.round((match / recipe.ingredientsFridge.length) * 100)
    };
  };

  // Combine preset recipes and AI generated recipes
  const allRecipes = [...aiRecipes, ...recipes];

  // Filter recipes based on toggle chip selection
  const filteredRecipes = allRecipes.filter((recipe) => {
    if (selectedFilter === 'all') return true;
    
    // Find matching tag inside recipe
    const currentFilterConfig = RECIPE_FILTERS.find((f) => f.id === selectedFilter);
    if (!currentFilterConfig || !currentFilterConfig.filterTag) return true;
    
    return recipe.tags.includes(currentFilterConfig.filterTag);
  });

  // Sort recipes: Put recipes with higher ingredient matches at the top! (highly dynamic!)
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    // Put AI-generated recipes first if they are active, then sort by match percentage
    const aIsAi = a.id.startsWith('ai_');
    const bIsAi = b.id.startsWith('ai_');
    if (aIsAi && !bIsAi) return -1;
    if (!aIsAi && bIsAi) return 1;

    const aMatch = getMatchCount(a);
    const bMatch = getMatchCount(b);
    return bMatch.percentage - aMatch.percentage;
  });

  return (
    <div className="p-5 bg-stone-100 border-t border-stone-200/80 shrink-0 select-none">
      
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest font-mono">
            AI Zero-Waste Recipes
          </h2>
          <p className="text-[10px] text-stone-500 font-semibold">Sorted by highest ingredient match</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-bold shadow-3xs">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" /> Eco Mode Active
        </div>
      </div>

      {/* Toggle Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {RECIPE_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md scale-102 border border-emerald-600'
                  : 'bg-white text-stone-600 border border-stone-200/60 hover:border-stone-300'
              }`}
            >
              <span>{filter.emoji || ''}</span>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic AI Generation Banner / Button */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/60 rounded-[2rem] p-4.5 mb-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block font-mono">
              Gemini Chef AI
            </span>
            <span className="text-xs font-bold text-stone-800 block mt-0.5 leading-snug">
              Want recipes tailored *exactly* to your photo?
            </span>
            <p className="text-[10px] text-stone-500 font-semibold leading-relaxed mt-0.5">
              Let Gemini analyze your current fridge inventory and cook up bespoke zero-waste recipes instantly.
            </p>
          </div>
        </div>
        {onGenerateRecipes && (
          <button
            onClick={onGenerateRecipes}
            disabled={isGeneratingRecipes || activeInventory.length === 0}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm select-none shrink-0 flex items-center justify-center gap-1.5 ${
              isGeneratingRecipes
                ? 'bg-stone-100 border border-stone-200 text-stone-400'
                : activeInventory.length === 0
                ? 'bg-stone-50 border border-stone-200 text-stone-300 cursor-not-allowed'
                : 'bg-stone-900 border border-stone-900 text-white hover:bg-stone-800 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGeneratingRecipes ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin text-stone-400" />
                <span>Cooking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Instant Recipes</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Recipes container with dynamic updates */}
      <AnimatePresence mode="popLayout">
        {isAnalyzing || isGeneratingRecipes ? (
          /* Simulated recalculating state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-stone-200 p-6 shadow-xs"
          >
            <Clock className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
            <span className="text-xs font-bold text-stone-600">
              {isGeneratingRecipes ? 'Gemini Chef is crafting bespoke recipes...' : 'Recalculating perfect meals...'}
            </span>
            <p className="text-[10px] text-stone-400 mt-1 font-semibold">
              {isGeneratingRecipes ? 'Applying zero-waste guidelines & current inventory' : 'Cross-referencing vision data against pantry database'}
            </p>
          </motion.div>
        ) : sortedRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border border-stone-200 p-6 shadow-xs"
          >
            <HelpCircle className="w-8 h-8 text-stone-300 mb-2" />
            <span className="text-xs font-bold text-stone-600">No matching recipes found</span>
            <p className="text-[10px] text-stone-400 mt-1 max-w-[200px] font-semibold leading-relaxed">
              Try clearing some active filters or add eggs, spinach, bananas, or chicken to your storage!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedRecipes.map((recipe, index) => {
              const { match, total, percentage } = getMatchCount(recipe);
              const isExpanded = expandedRecipeId === recipe.id;
              const isPlanned = mealPlanIds.includes(recipe.id);
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  key={recipe.id}
                  className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition duration-300"
                >
                  {/* Card Image Banner */}
                  <div className="h-28 w-full relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Floating Info Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1">
                      {recipe.id.startsWith('ai_') ? (
                        <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wide">
                          <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" /> Gemini Custom
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wide">
                          <Sparkles className="w-2.5 h-2.5" /> {percentage}% Match
                        </span>
                      )}
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>

                    {/* Preparation Time float */}
                    <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                      <Clock className="w-3 h-3 text-emerald-400" /> {recipe.prepTime}
                    </div>

                    {/* Card Overlay Title */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-extrabold text-white leading-tight drop-shadow-xs">
                        {recipe.title}
                      </h3>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {recipe.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-bold text-slate-300 bg-white/10 backdrop-blur-xs px-1.5 py-0.5 rounded-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="p-4">
                    
                    {/* 🌱 WHY THIS REDUCES WASTE */}
                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3.5 mb-3.5 flex items-start gap-2.5 relative">
                      <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block font-mono">
                          Why This Reduces Waste
                        </span>
                        <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed mt-0.5">
                          {recipe.whyReducesWaste}
                        </p>
                      </div>
                    </div>

                    {/* INGREDIENTS MATCHER PANELS */}
                    <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                      
                      {/* Fridge Items Used */}
                      <div className="bg-stone-50/60 p-3 rounded-2xl border border-stone-200/60">
                        <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-2 font-mono">
                          Fridge Items ({match}/{total})
                        </span>
                        <div className="space-y-1.5">
                          {recipe.ingredientsFridge.map((ing) => {
                            const owned = isIngredientInInventory(ing.name);
                            return (
                              <div
                                key={ing.name}
                                className={`flex items-center gap-1.5 text-[10px] font-semibold leading-tight ${
                                  owned ? 'text-stone-700' : 'text-stone-400'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
                                  owned 
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                                    : 'bg-stone-100 border-stone-200 text-stone-400'
                                }`}>
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <span className={owned ? 'font-bold text-stone-800' : 'line-through decoration-stone-300/60 font-normal'}>
                                  {ing.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pantry Staples Needed */}
                      <div className="bg-stone-50/60 p-3 rounded-2xl border border-stone-200/60">
                        <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-2 font-mono">
                          Pantry Staples 🧂
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredientsPantry.map((staple) => (
                            <span
                              key={staple}
                              className="px-1.5 py-0.5 bg-white border border-stone-200 text-[9px] text-stone-600 font-bold rounded-md"
                            >
                              {staple}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="flex gap-2">
                      {/* Interactive Accordion Step Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(recipe.id)}
                        className={`flex-1 py-2.5 px-3.5 rounded-2xl border flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all shadow-3xs cursor-pointer ${
                          isExpanded
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>{isExpanded ? 'Hide Steps' : 'View Steps'}</span>
                      </button>

                      {/* Add to Meal Plan Button */}
                      <button
                        type="button"
                        onClick={() => isPlanned ? onRemoveFromMealPlan(recipe.id) : onAddToMealPlan(recipe.id)}
                        className={`flex-1 py-2.5 px-3.5 rounded-2xl border flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all shadow-3xs cursor-pointer ${
                          isPlanned
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/50'
                            : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{isPlanned ? 'Scheduled ✓' : 'Add to Plan'}</span>
                      </button>
                    </div>

                    {/* Expanded Steps with staggering slide-in */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3.5 pb-1 pl-1 space-y-3 border-t border-stone-100 mt-3">
                            {recipe.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-stone-900 text-white font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </div>
                                <p className="text-[11px] text-stone-600 leading-relaxed font-semibold">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Footnote Eco Tracker */}
      <div className="mt-6 text-center bg-emerald-50/60 border-2 border-dashed border-emerald-200/80 rounded-[2rem] p-5.5 flex flex-col items-center justify-center shadow-3xs">
        <Leaf className="w-6 h-6 text-emerald-600 mb-1" />
        <span className="text-xs font-black text-emerald-950">Your Carbon Impact Tracker</span>
        <p className="text-[10px] text-emerald-800/90 max-w-[280px] mt-0.5 leading-normal font-semibold">
          Using these {activeInventory.filter(i => i.isExpiringSoon).length} expiring ingredients saves approx. <span className="font-bold underline decoration-emerald-500 decoration-2">1.2 kg of CO₂ equivalent</span> emissions! Good job! 🌍
        </p>
      </div>

    </div>
  );
}
