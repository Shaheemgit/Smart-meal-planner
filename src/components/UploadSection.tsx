import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, RefreshCw, Layers, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { DEMO_PRESETS } from '../data';
import { Ingredient, DemoPhotoPreset } from '../types';

interface UploadSectionProps {
  onIngredientsLoaded: (ingredients: Omit<Ingredient, 'id'>[], sourceName: string, imageUrl: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function UploadSection({ onIngredientsLoaded, isAnalyzing, setIsAnalyzing }: UploadSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activePreset, setActivePreset] = useState<DemoPhotoPreset | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [showCameraMock, setShowCameraMock] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanSubtitles = [
    'Initializing deep vision food classifier...',
    'Locating individual items on shelves...',
    'Analyzing skin texture & browning spots...',
    'Predicting remaining shelf life...',
    'Matching recipes to active ingredients...'
  ];

  // Start the simulated scan process
  const startScanning = (imageUrl: string, ingredients: Omit<Ingredient, 'id'>[], name: string) => {
    setIsAnalyzing(true);
    setSelectedImage(imageUrl);
    setScanStep(0);

    // Increment subtitle step for loading realism
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < scanSubtitles.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 550);

    // Complete the process after 2.8 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsAnalyzing(false);
      onIngredientsLoaded(ingredients, name, imageUrl);
    }, 2800);
  };

  // Handle Preset Click
  const handlePresetSelect = (preset: DemoPhotoPreset) => {
    if (isAnalyzing) return;
    setActivePreset(preset);
    startScanning(preset.thumbnail, preset.ingredients, preset.name);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isAnalyzing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      // Generate some interesting custom ingredients representing what they uploaded
      const mysteryIngredients: Omit<Ingredient, 'id'>[] = [
        { name: 'Soft Avocado', category: 'produce', daysLeft: 1, isExpiringSoon: true, quantity: '1 whole' },
        { name: 'Stale Tortillas', category: 'bakery', daysLeft: 2, isExpiringSoon: true, quantity: '3 wraps' },
        { name: 'Fresh Cilantro', category: 'produce', daysLeft: 5, isExpiringSoon: false, quantity: '1 bunch' },
        { name: 'Fresh Eggs', category: 'protein', daysLeft: 8, isExpiringSoon: false, quantity: '4 items' },
        { name: 'Cheddar Cheese', category: 'dairy', daysLeft: 10, isExpiringSoon: false, quantity: '100g' }
      ];
      startScanning(url, mysteryIngredients, 'Your Uploaded Fridge');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSearch = () => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  };

  // Simulation of Live Camera Viewfinder
  const handleMockSnap = () => {
    setShowCameraMock(true);
  };

  const captureMockPhoto = () => {
    setShowCameraMock(false);
    // Use first demo preset as the snapped output for visual consistency
    const snapImage = 'https://images.unsplash.com/photo-1571175432240-5e366a7bca9c?auto=format&fit=crop&q=80&w=600';
    const snapIngredients: Omit<Ingredient, 'id'>[] = [
      { name: 'Soft Tomatoes', category: 'produce', daysLeft: 1, isExpiringSoon: true, quantity: '4 items' },
      { name: 'Wilting Spinach', category: 'produce', daysLeft: 2, isExpiringSoon: true, quantity: 'Half bag' },
      { name: 'Onions', category: 'produce', daysLeft: 12, isExpiringSoon: false, quantity: '2 medium' },
      { name: 'Greek Yogurt', category: 'dairy', daysLeft: 2, isExpiringSoon: true, quantity: '1 tub' }
    ];
    startScanning(snapImage, snapIngredients, 'Snapped Live Photo');
  };

  return (
    <div className="px-5 py-5 shrink-0 bg-white border-b border-stone-200/60 shadow-xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-stone-800">Analyze Fridge Photo</h2>
          <p className="text-[11px] text-stone-500">Detect expiring items & generate recipes instantly</p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main interactive Dropzone / Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSearch}
        className={`relative h-44 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-all duration-300 overflow-hidden shadow-2xs ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
            : 'border-stone-200 hover:border-emerald-400 bg-stone-50/20 hover:bg-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            /* Visual Scanning overlay and simulation progress */
            <motion.div
              key="scanning-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 text-white z-20"
              onClick={(e) => e.stopPropagation()} // prevent double trigger
            >
              {/* Slotted Backed image being scanned */}
              {selectedImage && (
                <div className="absolute inset-0 opacity-40">
                  <img
                    src={selectedImage}
                    alt="Scanning target"
                    className="w-full h-full object-cover filter blur-[2px]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
                </div>
              )}

              {/* Glowing horizontal laser line animation */}
              <motion.div
                animate={{ 
                  top: ['10%', '90%', '10%']
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_3px_rgba(52,211,153,0.8)] z-30"
              />

              {/* Smart mock detected brackets / bounding boxes */}
              <div className="absolute top-[25%] left-[20%] border-2 border-emerald-400/80 w-16 h-12 rounded-xs flex items-start justify-start p-0.5 pointer-events-none">
                <span className="text-[7px] bg-emerald-500 text-white font-mono scale-[0.8] origin-left px-0.5 rounded-2xs">Tomato 98%</span>
              </div>
              <div className="absolute bottom-[30%] right-[25%] border-2 border-emerald-400/80 w-20 h-16 rounded-xs flex items-start justify-start p-0.5 pointer-events-none">
                <span className="text-[7px] bg-emerald-500 text-white font-mono scale-[0.8] origin-left px-0.5 rounded-2xs">Spinach 92%</span>
              </div>

              {/* Loading circle spinner */}
              <div className="relative w-12 h-12 mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent"
                />
                <Layers className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <h3 className="text-sm font-semibold tracking-wide text-emerald-400">AI VISION CLASSIFIER</h3>
              
              <div className="h-4 mt-2">
                <motion.p
                  key={scanStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-slate-300 text-center font-mono"
                >
                  {scanSubtitles[scanStep]}
                </motion.p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 mt-3">
                {scanSubtitles.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      i <= scanStep ? 'bg-emerald-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Idle Drag Drop area */
            <motion.div
              key="idle-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-3 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2.5 shadow-3xs group-hover:scale-105 transition-transform duration-200">
                <Camera className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-stone-800">
                📸 Snap or Upload Your Fridge/Pantry Photo
              </span>
              <p className="text-[10px] text-stone-400 mt-1 max-w-[280px] font-medium leading-normal">
                Drag & drop, click to browse your storage, or use our mock camera snap.
              </p>

              {/* File action buttons */}
              <div className="flex items-center gap-2 mt-3.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={triggerFileSearch}
                  className="px-3 py-1.5 text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 border border-emerald-600 shadow-3xs transition-colors"
                >
                  <Upload className="w-3 h-3" /> Browse File
                </button>
                <button
                  type="button"
                  onClick={handleMockSnap}
                  className="px-3 py-1.5 text-[11px] font-bold bg-stone-900 text-white hover:bg-stone-800 rounded-xl flex items-center gap-1.5 shadow-3xs transition-colors"
                >
                  <Camera className="w-3 h-3" /> Live Camera
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Demo Preset Slider Panel */}
      <div className="mt-4">
        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-2 font-mono">
          ⚡ Quick Demo: Choose a storage photo to analyze
        </span>
        
        <div className="grid grid-cols-3 gap-2">
          {DEMO_PRESETS.map((preset) => {
            const isSelected = activePreset?.id === preset.id && !isAnalyzing;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                disabled={isAnalyzing}
                className={`group flex flex-col text-left rounded-2xl border p-1.5 transition-all duration-300 relative focus:outline-hidden shadow-3xs ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                    : 'border-stone-200/60 bg-white hover:bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-full h-14 rounded-xl overflow-hidden relative mb-1.5">
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay icon */}
                  <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-xs p-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-slate-300'}`} />
                  </div>
                </div>

                {/* Name */}
                <span className="text-[10px] font-bold text-stone-800 leading-tight block truncate">
                  {preset.name}
                </span>
                <span className="text-[8px] text-stone-400 leading-normal block truncate font-semibold">
                  {preset.ingredients.filter(i => i.isExpiringSoon).length} expiring soon
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Camera Viewfinder Simulation Popup */}
      <AnimatePresence>
        {showCameraMock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/40">
                <div className="flex items-center gap-1.5 text-zinc-100">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold">Active Device Camera</span>
                </div>
                <button
                  onClick={() => setShowCameraMock(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold px-2 py-1 rounded-md"
                >
                  Cancel
                </button>
              </div>

              {/* Viewfinder Screen */}
              <div className="aspect-square bg-zinc-900 relative flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571175432240-5e366a7bca9c?auto=format&fit=crop&q=80&w=600"
                  alt="Live Camera Simulation"
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />

                {/* Grid guidelines */}
                <div className="absolute inset-0 border-[3px] border-emerald-400/20 m-10 rounded-xl" />
                <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/25" />
                <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/25" />
                <div className="absolute inset-y-0 left-1/3 border-l border-dashed border-white/25" />
                <div className="absolute inset-y-0 left-2/3 border-l border-dashed border-white/25" />

                {/* Target marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 animate-pulse">
                  <div className="w-12 h-12 border-2 border-emerald-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  </div>
                </div>

                {/* Toast status */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-[10px] text-zinc-300 px-3 py-1 rounded-full border border-white/10">
                  💡 Align veggies on shelves inside lines
                </div>
              </div>

              {/* Trigger panel */}
              <div className="p-6 flex flex-col items-center justify-center bg-zinc-900/60">
                <button
                  onClick={captureMockPhoto}
                  className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center shadow-lg active:scale-95 hover:bg-emerald-400 transition-all duration-150 relative"
                >
                  <div className="w-11 h-11 bg-white rounded-full animate-pulse opacity-20 absolute" />
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <span className="text-[10px] text-zinc-500 mt-2.5">Tap to Capture & Analyze</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
