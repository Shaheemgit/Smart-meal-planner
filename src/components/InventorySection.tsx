import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, PlusCircle, AlertCircle, Calendar, ToggleLeft, ToggleRight, Sparkles, Check } from 'lucide-react';
import { Ingredient, Category } from '../types';
import { CATEGORY_THEMES } from '../data';

interface InventorySectionProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onRemoveIngredient: (id: string) => void;
  onToggleExpiry: (id: string) => void;
  sourceName: string;
}

export default function InventorySection({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onToggleExpiry,
  sourceName
}: InventorySectionProps) {
  // Input states for adding new ingredient
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('produce');
  const [daysLeft, setDaysLeft] = useState<number>(3);
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddIngredient({
      name: name.trim(),
      category,
      daysLeft: Number(daysLeft),
      isExpiringSoon: Number(daysLeft) <= 2,
      quantity: quantity.trim() || '1 unit'
    });

    // Reset form states
    setName('');
    setQuantity('');
    setDaysLeft(3);
    setIsAdding(false);
  };

  const expiringSoonItems = ingredients.filter((item) => item.isExpiringSoon || item.daysLeft <= 2);

  return (
    <div className="p-5 flex-1 flex flex-col bg-stone-50 select-none">
      
      {/* Active Source indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">
          Kitchen Inventory
        </span>
        {sourceName && (
          <span className="text-[10px] bg-stone-200/80 text-stone-600 px-2.5 py-0.5 rounded-full font-bold border border-stone-300/40">
            📡 Source: {sourceName}
          </span>
        )}
      </div>

      {/* 🚨 ALERT BANNER: Expiring Soon */}
      <AnimatePresence>
        {expiringSoonItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-5 rounded-[2rem] bg-orange-50 border-2 border-orange-200 p-4.5 shadow-sm relative overflow-hidden"
          >
            {/* Pulsing light effect inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full filter blur-xl pointer-events-none animate-pulse" />

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black text-orange-950 tracking-tight flex items-center gap-1">
                  🚨 Expiring Soon - Use Immediately!
                </h3>
                <p className="text-[10px] text-orange-700 font-semibold leading-relaxed mt-0.5">
                  These items are spoiling fast. Your generated recipes prioritize using these ingredients first.
                </p>

                {/* Horizontal list of items in distress */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {expiringSoonItems.map((item) => (
                    <motion.div
                      layoutId={`expiring-badge-${item.id}`}
                      key={item.id}
                      className="px-2 py-1 bg-white border border-orange-200 text-[10px] font-bold text-orange-800 rounded-xl flex items-center gap-1 shadow-3xs"
                    >
                      <span>{CATEGORY_THEMES[item.category]?.emoji}</span>
                      <span>{item.name}</span>
                      <span className="text-[9px] bg-orange-100 text-orange-900 px-1 rounded-sm font-mono font-black">
                        {item.daysLeft <= 0 ? 'Today!' : `${item.daysLeft}d`}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Add Trigger Button */}
      <div className="mb-4">
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-3xs"
          >
            <PlusCircle className="w-4 h-4" /> Add Item Manually
          </button>
        ) : (
          /* High-Contrast Interactive Add Form */
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-[2rem] border border-stone-200 p-5 shadow-xs"
          >
            <h3 className="text-xs font-black text-stone-800 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> New Ingredient Details
            </h3>

            <div className="space-y-3.5">
              {/* Name input */}
              <div>
                <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Browning Bananas, Soft Tomatoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-stone-800 font-semibold"
                />
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 gap-2">
                {/* Category */}
                <div>
                  <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-2 py-1.5 text-xs border border-stone-200 bg-stone-50 rounded-xl focus:outline-hidden text-stone-700 font-semibold"
                  >
                    {Object.entries(CATEGORY_THEMES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.emoji} {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 medium, 1 cup"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-200 bg-stone-50 rounded-xl focus:outline-hidden focus:bg-white text-stone-800 font-semibold"
                  />
                </div>
              </div>

              {/* Expiry / Days Left Slider */}
              <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-stone-500">Shelf Life (Days Left)</span>
                  <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-sm ${daysLeft <= 2 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={daysLeft}
                  onChange={(e) => setDaysLeft(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[8px] text-stone-400 block mt-1 font-semibold">
                  {daysLeft <= 2 ? '⚠️ Marking as EXPIRING SOON! Will trigger alerts.' : '✅ Fresh. Stable.'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-extrabold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs"
                >
                  Save & Add
                </button>
              </div>

            </div>
          </motion.form>
        )}
      </div>

      {/* Main Grid List of active fridge ingredients */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-[2rem] border border-stone-200/80 p-6 shadow-xs flex flex-col items-center justify-center">
          <Calendar className="w-8 h-8 text-stone-300 mb-2" />
          <p className="text-xs font-bold text-stone-500">Your Storage is Empty</p>
          <p className="text-[10px] text-stone-400 max-w-[200px] mt-1 font-semibold leading-normal">
            Snap a storage photo above or click 'Add Item Manually' to stock your fridge!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((item) => {
            const theme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.other;
            const isCritical = item.isExpiringSoon || item.daysLeft <= 2;
            
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center justify-between p-3 rounded-[1.5rem] border bg-white transition-all shadow-3xs ${
                  isCritical ? 'border-orange-200 hover:border-orange-300 bg-orange-50/10' : 'border-stone-200/60 hover:border-stone-300'
                }`}
              >
                {/* Left details */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Category icon tag */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-base font-bold ${theme.bg}`}>
                    {theme.emoji}
                  </div>
                  
                  {/* Text details */}
                  <div className="min-w-0">
                    <span className={`text-xs font-bold text-stone-800 block truncate ${isCritical ? 'text-stone-900 font-extrabold' : ''}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-semibold truncate">
                      Qty: {item.quantity} • <span className="capitalize">{theme.label}</span>
                    </span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Expiring Toggle Badge */}
                  <button
                    type="button"
                    onClick={() => onToggleExpiry(item.id)}
                    title={isCritical ? "Mark as fresh" : "Mark as expiring soon"}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all ${
                      isCritical
                        ? 'bg-orange-50 text-orange-700 border border-orange-200/60 animate-pulse'
                        : 'bg-stone-50 text-stone-400 border border-stone-100 hover:bg-stone-100 hover:text-stone-500'
                    }`}
                  >
                    <span>🚨</span>
                    <span>{isCritical ? 'Expiring' : 'Fresh'}</span>
                  </button>

                  {/* Days pill badge */}
                  <div className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold ${
                    isCritical ? 'bg-orange-100 text-orange-900' : 'bg-emerald-50 text-emerald-800 border border-emerald-100/40'
                  }`}>
                    {item.daysLeft <= 0 ? '0d left' : `${item.daysLeft}d`}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onRemoveIngredient(item.id)}
                    className="p-1 text-stone-300 hover:text-red-500 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Remove ingredient"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
