import React, { useState, useEffect } from 'react';
import PhoneFrame from './components/PhoneFrame';
import UploadSection from './components/UploadSection';
import InventorySection from './components/InventorySection';
import RecipeSection from './components/RecipeSection';
import { DEMO_PRESETS, PRESET_RECIPES } from './data';
import { Ingredient } from './types';
import { Leaf, Sparkles, Trophy, Info, Heart, Share2, HelpCircle, Trash2 } from 'lucide-react';

// Firebase Authentication & Firestore Imports
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import AuthModal from './components/AuthModal';
import MealPlanSection from './components/MealPlanSection';

export default function App() {
  // Initialize inventory with the first demo preset (Veggies & Eggs) so the user is greeted with vivid, interactive content immediately
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [sourceName, setSourceName] = useState('Fresh Veggies & Eggs preset');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showWelcomeInfo, setShowWelcomeInfo] = useState(true);

  // Dynamic AI-Generated Recipes State
  const [aiRecipes, setAiRecipes] = useState<any[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  // Authentication & Meal Plan State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mealPlan, setMealPlan] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadingCloudData, setLoadingCloudData] = useState(false);

  // Auth state observer & Firestore loader
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setLoadingCloudData(true);
        try {
          const userDocRef = doc(db, 'users', user.uid, 'data', 'appState');
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.ingredients) {
              setIngredients(data.ingredients);
            }
            if (data.mealPlan) {
              setMealPlan(data.mealPlan);
            }
            triggerToast("Pantry and meal plan synced from cloud!");
          } else {
            // Initialize user doc with default data on first sign-up
            const initialList = DEMO_PRESETS[0].ingredients.map((ing, idx) => ({
              ...ing,
              id: `initial_${idx}_${Date.now()}`
            }));
            await setDoc(userDocRef, {
              ingredients: initialList,
              mealPlan: [],
              updatedAt: Date.now()
            });
            setIngredients(initialList);
            setMealPlan([]);
            triggerToast("Cloud profile initialized!");
          }
        } catch (err) {
          console.error("Error fetching cloud data:", err);
          triggerToast("Failed to load cloud backup.");
        } finally {
          setLoadingCloudData(false);
        }
      } else {
        // Guest mode / Logged out state: set default ingredients list
        const initialList = DEMO_PRESETS[0].ingredients.map((ing, idx) => ({
          ...ing,
          id: `initial_${idx}_${Date.now()}`
        }));
        setIngredients(initialList);
        setSourceName('Fresh Veggies & Eggs preset');
        setMealPlan([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced cloud synchronization effect
  useEffect(() => {
    if (!currentUser || loadingCloudData) return;

    const timer = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid, 'data', 'appState');
        await setDoc(userDocRef, {
          ingredients,
          mealPlan,
          updatedAt: Date.now()
        });
        console.log("Successfully synced state to Firestore!");
      } catch (err) {
        console.error("Error syncing state to cloud:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [ingredients, mealPlan, currentUser, loadingCloudData]);

  // Show interactive temporary feedback toast notifications
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  // Generate recipes dynamically from current inventory using Gemini on the server
  const generateRecipes = async (currentIngredients: Ingredient[]) => {
    if (currentIngredients.length === 0) return;
    setIsGeneratingRecipes(true);
    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: currentIngredients }),
      });
      const data = await response.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setAiRecipes(data.recipes);
        triggerToast(`✨ Gemini generated ${data.recipes.length} custom recipes!`);
      } else if (data.error) {
        console.error("Recipe generation error:", data.error);
        triggerToast(`Could not generate recipes: ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to generate recipes:", err);
      triggerToast("Failed to connect to recipe generation service.");
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Callback when a new image/preset has finished analyzing
  const handleIngredientsLoaded = (
    newIngredients: Omit<Ingredient, 'id'>[],
    source: string,
    imageUrl: string
  ) => {
    const listWithIds = newIngredients.map((ing, idx) => ({
      ...ing,
      id: `detected_${idx}_${Date.now()}`
    }));
    setIngredients(listWithIds);
    setSourceName(source);
    triggerToast(`Successfully identified ${newIngredients.length} ingredients from vision scan!`);

    // Auto-generate instant zero-waste recipes using Gemini Chef AI
    generateRecipes(listWithIds);
  };

  // Add custom manual ingredient
  const handleAddIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const item: Ingredient = {
      ...newIng,
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    setIngredients((prev) => [item, ...prev]);
    triggerToast(`Added "${item.name}" to inventory.`);
  };

  // Remove individual ingredient
  const handleRemoveIngredient = (id: string) => {
    const target = ingredients.find(i => i.id === id);
    if (target) {
      setIngredients((prev) => prev.filter((item) => item.id !== id));
      triggerToast(`Removed "${target.name}".`);
    }
  };

  // Toggle Expiry critical state
  const handleToggleExpiry = (id: string) => {
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedIsExpiring = !item.isExpiringSoon;
          // if marking as expiring, set daysLeft to 1, else restore to 5
          return {
            ...item,
            isExpiringSoon: updatedIsExpiring,
            daysLeft: updatedIsExpiring ? 1 : 5
          };
        }
        return item;
      })
    );
  };

  // Add recipe to active meal plan
  const handleAddToMealPlan = (recipeId: string) => {
    if (mealPlan.includes(recipeId)) return;
    setMealPlan((prev) => [...prev, recipeId]);
    const recipe = PRESET_RECIPES.find(r => r.id === recipeId);
    triggerToast(`Added "${recipe?.title || 'Recipe'}" to your Meal Plan.`);
  };

  // Remove recipe from active meal plan
  const handleRemoveFromMealPlan = (recipeId: string) => {
    setMealPlan((prev) => prev.filter(id => id !== recipeId));
    const recipe = PRESET_RECIPES.find(r => r.id === recipeId);
    triggerToast(`Removed "${recipe?.title || 'Recipe'}" from your Meal Plan.`);
  };

  // Mark a meal plan recipe as prepared/completed
  const handleMarkAsPrepared = (recipeId: string, recipeTitle: string, ingredientsUsed: string[]) => {
    // 1. Remove from active meal plan
    setMealPlan((prev) => prev.filter(id => id !== recipeId));
    
    // 2. Remove used ingredients from active inventory
    setIngredients((prev) => {
      let updated = [...prev];
      ingredientsUsed.forEach((usedName) => {
        // Find best match in current inventory
        const index = updated.findIndex((invItem) => {
          const invName = invItem.name.toLowerCase();
          const recName = usedName.toLowerCase();
          return (
            invName.includes(recName) ||
            recName.includes(invName)
          );
        });
        if (index !== -1) {
          updated.splice(index, 1);
        }
      });
      return updated;
    });

    triggerToast(`🎉 Cooked "${recipeTitle}"! Used ingredients removed from inventory.`);
  };
  
  // Clear all data (pantry inventory, meal plan, and AI recipes)
  const handleClearAllData = async () => {
    setIngredients([]);
    setMealPlan([]);
    setAiRecipes([]);
    setSourceName('Cleared Storage');
    
    // If logged in, update Firestore immediately to clear cloud profile as well
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid, 'data', 'appState');
        await setDoc(userDocRef, {
          ingredients: [],
          mealPlan: [],
          updatedAt: Date.now()
        });
        triggerToast("Pantry and meal plan cleared from cloud profile!");
      } catch (err) {
        console.error("Error clearing cloud data:", err);
        triggerToast("Cleared locally; cloud sync failed.");
      }
    } else {
      triggerToast("Pantry and meal plan cleared!");
    }
  };

  // Calculate dynamic Eco score based on how many expiring items are currently tracked
  const calculateEcoScore = () => {
    if (ingredients.length === 0) return 100;
    const expiringCount = ingredients.filter(i => i.isExpiringSoon || i.daysLeft <= 2).length;
    // more expiring items that are tracked means we are actively planning to rescue them
    const score = Math.max(50, Math.min(100, 70 + (expiringCount * 10) - (ingredients.length - expiringCount)));
    return score;
  };

  const ecoScore = calculateEcoScore();

  return (
    <PhoneFrame>
      {/* Absolute floating toast notifier */}
      {showToast && (
        <div className="absolute top-14 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg z-50 flex items-center gap-2 border border-emerald-500/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Main App Layout */}
      <div id="smart-meal-planner-root" className="flex flex-col min-h-full">
        
        {/* BRAND HEADER */}
        <header className="bg-white border-b border-emerald-100 px-5 pt-5 pb-5 shrink-0 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
          {/* Subtle ambient green glow backgrounds */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-lime-400/5 rounded-full filter blur-xl pointer-events-none" />

          {/* Top Row: Brand & Badge */}
          <div className="flex items-center justify-between mb-3.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                🥗
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-emerald-950 flex items-center gap-1">
                  ReFresh <span className="text-emerald-500 font-light italic text-xs">Kitchen</span>
                </h1>
                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest block -mt-1 font-mono">
                  Waste Reducer
                </span>
              </div>
            </div>

            {/* Premium Badges */}
            <div className="flex items-center gap-1.5">
              <div className="bg-emerald-50 border border-emerald-100/80 text-[10px] font-bold text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-3xs">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Score: {ecoScore}</span>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <p className="text-[11px] text-stone-600 leading-relaxed font-medium mb-3.5 relative z-10">
            Welcome to <span className="text-emerald-900 font-bold underline decoration-emerald-400 decoration-2">Smart Meal Planner</span>. Upload photo of your storage below to rescue your food!
          </p>

          {/* Interactive Sustainability Stats Row */}
          <div className="grid grid-cols-3 gap-2 bg-emerald-50/40 rounded-2xl p-2.5 text-center border border-emerald-100/60 relative z-10 shadow-3xs">
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">Rescued</span>
              <span className="text-xs font-black text-emerald-950">{ingredients.filter(i => i.isExpiringSoon).length} Items</span>
            </div>
            <div className="border-x border-emerald-100/50">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">Carbon Saved</span>
              <span className="text-xs font-black text-emerald-950">{(ingredients.filter(i => i.isExpiringSoon).length * 1.2).toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">Level</span>
              <span className="text-xs font-black text-emerald-600">Eco-Hero 🍃</span>
            </div>
          </div>
        </header>

        {/* USER PROFILE AUTH BAR */}
        <div className="px-5 pt-4 shrink-0">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between shadow-3xs">
            {currentUser ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-700">👤</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-stone-400 block uppercase tracking-wider font-mono">
                    Chef Account
                  </span>
                  <p className="text-xs font-bold text-stone-800 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-stone-500">👤</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-stone-400 block uppercase tracking-wider font-mono">
                    Guest Mode
                  </span>
                  <p className="text-xs font-semibold text-stone-500">
                    Sign in to save progress
                  </p>
                </div>
              </div>
            )}
            
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer font-sans"
                  title="Clear all cloud & local data"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => {
                    signOut(auth);
                    triggerToast("Logged out successfully.");
                  }}
                  className="px-3 py-1.5 border border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer font-sans"
                  title="Clear all local data"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs font-sans"
                >
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WELCOME INSTRUCTIONS DISMISSABLE BOX */}
        {showWelcomeInfo && (
          <div className="px-5 pt-4 shrink-0">
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 relative shadow-3xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 pr-4">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  💡 High-Fidelity Prototype Guide
                </span>
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed mt-0.5">
                  Try selecting a <strong>Quick Demo Storage Photo</strong> under the upload block to experience the real-time AI food detection and recipe ranking features.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWelcomeInfo(false)}
                className="absolute top-2 right-2 text-amber-400 hover:text-amber-600 text-xs font-extrabold p-1"
                title="Dismiss tip"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 📸 HERO & UPLOAD/CAMERA AREA */}
        <section id="upload-panel-container">
          <UploadSection
            onIngredientsLoaded={handleIngredientsLoaded}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </section>

        {/* 🚨 ACTIVE INVENTORY DISPLAY */}
        <section id="inventory-panel-container" className="flex-1 flex flex-col">
          <InventorySection
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onToggleExpiry={handleToggleExpiry}
            sourceName={sourceName}
          />
        </section>

        {/* 📅 ACTIVE MEAL PLAN SECTION */}
        <section id="meal-plan-panel-container">
          <MealPlanSection
            mealPlanIds={mealPlan}
            activeInventory={ingredients}
            onRemoveFromMealPlan={handleRemoveFromMealPlan}
            onMarkAsPrepared={handleMarkAsPrepared}
            onAddIngredient={handleAddIngredient}
            isLoggedIn={!!currentUser}
            aiRecipes={aiRecipes}
          />
        </section>

        {/* 🍲 DYNAMIC ZERO-WASTE RECIPE GENERATION */}
        <section id="recipes-panel-container">
          <RecipeSection
            recipes={PRESET_RECIPES}
            aiRecipes={aiRecipes}
            isGeneratingRecipes={isGeneratingRecipes}
            onGenerateRecipes={() => generateRecipes(ingredients)}
            activeInventory={ingredients}
            isAnalyzing={isAnalyzing}
            mealPlanIds={mealPlan}
            onAddToMealPlan={handleAddToMealPlan}
            onRemoveFromMealPlan={handleRemoveFromMealPlan}
          />
        </section>

        {/* ECO FOOTER METADATA */}
        <footer className="bg-emerald-950 text-emerald-200 py-5 px-5 text-center text-[10px] shrink-0 border-t border-emerald-900">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span className="font-bold text-white">Smart Meal Planner & Waste Reducer</span>
          </div>
          <p className="font-medium text-emerald-300/80">
            Powered by EcoVision AI • Helping you save money and the environment.
          </p>
          <div className="flex justify-center gap-4 mt-3 font-bold text-emerald-400">
            <button onClick={() => triggerToast("Copied promo link to share!")} className="hover:text-white flex items-center gap-1">
              <Share2 className="w-2.5 h-2.5" /> Share App
            </button>
            <span>•</span>
            <button onClick={() => triggerToast("Opening visual privacy policy...")} className="hover:text-white flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5" /> FAQ
            </button>
          </div>
        </footer>

      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onToast={triggerToast}
      />
    </PhoneFrame>
  );
}
