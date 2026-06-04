/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AIAssistanceConfig, AIAssistanceResponse, OrderItem } from "../types";
import { Sparkles, Calendar, Users, Layers, Palette, Wand2, Plus, Info } from "lucide-react";

interface AICustomizerProps {
  onAddCustomCakeToCart: (item: OrderItem) => void;
  onNavigateToCart: () => void;
}

export default function AICustomizer({ onAddCustomCakeToCart, onNavigateToCart }: AICustomizerProps) {
  const [config, setConfig] = useState<AIAssistanceConfig>({
    guestCount: 30,
    shapes: "round",
    themeColor: "",
    eventDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAssistanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [addedNotify, setAddedNotify] = useState(false);

  async function handleGenerateCake() {
    if (!config.themeColor.trim()) {
      setError("Please specify a theme color or color palette.");
      return;
    }
    if (!config.eventDescription.trim() || config.eventDescription.length < 10) {
      setError("Please add details about your celebration (minimum 10 characters).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAddedNotify(false);

    try {
      const response = await fetch("/api/ai/plan-cake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("AI custom service responded with an error.");
      }

      const data: AIAssistanceResponse = await response.json();
      setResult(data);
      if (data.suggestedFlavors && data.suggestedFlavors.length > 0) {
        setSelectedFlavor(data.suggestedFlavors[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Our gourmet AI assistant is taking a breather. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddCakeToCart() {
    if (!result) return;

    const customOrderItem: OrderItem = {
      menuItemId: `custom-ai-${Date.now()}`,
      title: `Custom Cake: ${result.cakeConceptName}`,
      quantity: 1,
      size: result.suggestedSize,
      flavor: selectedFlavor || result.suggestedFlavors[0] || "Chef's Velvet Blend",
      customMessage: `Theme: ${config.themeColor}. Slices: ${result.estimatedSlices}. Details: ${config.eventDescription}`,
      price: result.suggestedPriceInNaira,
    };

    onAddCustomCakeToCart(customOrderItem);
    setAddedNotify(true);
    setTimeout(() => {
      setAddedNotify(false);
    }, 4000);
  }

  return (
    <div id="ai-customizer-container" className="mx-auto max-w-4xl px-4 py-8">
      <div id="ai-header-card" className="text-center mb-8">
        <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-widest">
          <Sparkles className="h-3 w.5" />
          <span>Interactive Co-Design</span>
        </span>
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-amber-950 mt-2">
          AI Custom Cake Planner
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-650 leading-relaxed">
          Co-design your dream celebration cake in real-time. Share your guest count and party themes, and our artificial intelligence sous-chef will craft a personalized recommendation and estimated quote immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Parameters Form */}
        <div id="ai-planner-form" className="rounded-2xl border border-amber-100 bg-white p-6 shadow-md shadow-amber-50">
          <h2 className="text-lg font-bold text-amber-950 mb-4 flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-amber-600" />
            <span>Plan Your Cake Concept</span>
          </h2>

          <div className="space-y-4">
            {/* Guest Count */}
            <div>
              <label htmlFor="ai-guest-count" className="block text-xs font-semibold text-amber-950 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span>Estimated Guests Count</span>
                <span className="text-amber-600 lowercase bg-amber-50 px-2 py-0.5 rounded font-mono font-medium">{config.guestCount} guests</span>
              </label>
              <div className="flex items-center space-x-4">
                <Users className="h-5 w-5 text-amber-600 shrink-0" />
                <input
                  id="ai-guest-count"
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={config.guestCount}
                  onChange={(e) => setConfig({ ...config, guestCount: Number(e.target.value) })}
                  className="w-full accent-amber-650 h-2 bg-amber-50 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Cake Tiers / Shapes */}
            <div>
              <label htmlFor="ai-cake-shape" className="block text-xs font-semibold text-amber-950 uppercase tracking-wide mb-1.5 flex items-center space-x-1">
                <Layers className="h-3.5 w-3.5 text-amber-600" />
                <span>Structural Shape Style</span>
              </label>
              <div id="ai-cake-shape" className="grid grid-cols-4 gap-2">
                {(["round", "square", "heart", "tiered"] as const).map((s) => (
                  <button
                    key={s}
                    id={`shape-${s}`}
                    type="button"
                    onClick={() => setConfig({ ...config, shapes: s })}
                    className={`rounded-xl py-2 px-1 text-center text-xs font-semibold uppercase tracking-wider border-2 transition-all capitalize ${
                      config.shapes === s
                        ? "border-amber-600 bg-amber-50 text-amber-900"
                        : "border-gray-100 hover:border-amber-200 text-gray-400 bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Theme */}
            <div>
              <label htmlFor="ai-theme-color" className="block text-xs font-semibold text-amber-950 uppercase tracking-wide mb-1 flex items-center space-x-1">
                <Palette className="h-3.5 w-3.5 text-amber-600" />
                <span>Theme Colors & Styling</span>
              </label>
              <input
                id="ai-theme-color"
                type="text"
                placeholder="E.g., Sky Blue and Rose Gold, Velvet Peach & Sage Green"
                value={config.themeColor}
                onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Event Description */}
            <div>
              <label htmlFor="ai-event-desc" className="block text-xs font-semibold text-amber-950 uppercase tracking-wide mb-1 flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                <span>Celebration Details</span>
              </label>
              <textarea
                id="ai-event-desc"
                rows={3}
                placeholder="E.g., 25th anniversary backyard wedding, likes fresh live flowers, drip styling and cream texture, elegant but minimalist..."
                value={config.eventDescription}
                onChange={(e) => setConfig({ ...config, eventDescription: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            {error && (
              <p className="text-xs text-red-500 font-medium" id="ai-planner-error">
                {error}
              </p>
            )}

            <button
              id="ai-generate-btn"
              type="button"
              disabled={loading}
              onClick={handleGenerateCake}
              className="w-full relative flex items-center justify-center space-x-2 rounded-xl bg-amber-650 py-3 text-sm font-bold text-white shadow-md shadow-orange-100 transition-all hover:bg-amber-700 active:scale-95 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Chef Rakis is designing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-1 flex animate-bounce" />
                  <span>Interactive AI Design & Estimator</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: AI Generated Response */}
        <div id="ai-planner-result" className="flex flex-col justify-center">
          {loading ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-8 text-center animate-pulse flex flex-col items-center justify-center min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6 text-amber-600 animate-spin" />
              </div>
              <h3 className="font-sans font-bold text-amber-900 text-lg">Whipping up blueprints</h3>
              <p className="text-xs text-amber-780 max-w-[250px] mt-2 leading-relaxed">
                Calculating servings structure, pairing flavor profiles, and formulating Naira pricing...
              </p>
            </div>
          ) : result ? (
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-lg relative overflow-hidden">
              <span className="absolute -top-3 -right-3 h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center rotate-12">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </span>

              <p className="font-mono text-[10px] text-amber-600 uppercase tracking-widest font-bold">
                Chef's Recommendation
              </p>
              <h3 className="font-sans text-xl font-black text-amber-950 mt-1 leading-snug">
                {result.cakeConceptName}
              </h3>

              <div id="ai-pricing-badge" className="mt-4 flex items-baseline space-x-1">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Est. Price:</span>
                <span className="font-sans text-2xl font-black text-amber-700">
                  ₦{(result.suggestedPriceInNaira || 45000).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">NGN base *</span>
              </div>

              <div className="mt-4 border-t border-amber-100/60 pt-4 space-y-3">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {result.recommendationText}
                </div>

                {/* Sizing Details */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-white border border-amber-100/50 p-2 text-center shadow-xs">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Dimensions</span>
                    <span className="font-mono text-xs text-amber-950 font-bold">{result.suggestedSize}</span>
                  </div>
                  <div className="rounded-xl bg-white border border-amber-100/50 p-2 text-center shadow-xs">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">suggested Tiers</span>
                    <span className="font-mono text-xs text-amber-950 font-bold">
                      {result.suggestedTiers} Tier{result.suggestedTiers > 1 ? "s" : ""} ({result.estimatedSlices} servings)
                    </span>
                  </div>
                </div>

                {/* Flavor suggestion dropdown selector */}
                <div className="mt-4">
                  <label htmlFor="ai-flavor" className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Select Suggestion Flavor
                  </label>
                  <select
                    id="ai-flavor"
                    value={selectedFlavor}
                    onChange={(e) => setSelectedFlavor(e.target.value)}
                    className="w-full rounded-xl border border-amber-100 bg-white px-3 py-1.5 text-xs text-amber-950 font-medium focus:border-amber-500 focus:outline-none"
                  >
                    {result.suggestedFlavors?.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="add-ai-cake-btn"
                  onClick={handleAddCakeToCart}
                  className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-amber-950 py-3 text-xs font-bold text-white tracking-wider uppercase transition-all hover:bg-black active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Reserve Design & Add to Order</span>
                </button>

                {addedNotify && (
                  <div id="ai-added-toast" className="mt-2 text-center bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 text-xs font-bold animate-bounce flex items-center justify-center space-x-1">
                    <span>🍰 Added Concept Design to Shopping Bag successfully!</span>
                    <button onClick={onNavigateToCart} className="underline text-emerald-900 ml-1">
                      Check Bag
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-250 bg-amber-50/10 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="h-12 w-12 rounded-full border border-amber-100 bg-amber-50 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
              <h3 className="font-sans font-bold text-amber-900 text-base">Your Cake Concept Space</h3>
              <p className="text-xs text-gray-400 max-w-[260px] mt-1.5 leading-relaxed">
                Set guest limits, coordinate styling guides, and input custom wedding or anniversary themes. Tap generate to populate.
              </p>
              <div className="mt-4 flex items-center space-x-1 text-[10px] text-amber-700 bg-amber-50/60 p-2 rounded-lg">
                <Info className="h-3.5 w-3.5" />
                <span>Base price is evaluated securely on NGN delivery ranges.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
