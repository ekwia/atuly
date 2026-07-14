import React, { useState, useEffect } from "react";
import { 
  Search, 
  Mic, 
  ArrowLeft, 
  X, 
  Grid, 
  List, 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  ArrowUpDown, 
  History, 
  Compass,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface SearchPageProps {
  products: Product[];
  onBack: () => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  initialQuery?: string;
}

const TRENDING_SEARCHES = [
  "Solitaire Ring",
  "Gold Coin 10g",
  "Pendant Set",
  "Bridal Necklace",
  "Emerald Earrings",
  "Platinum Bracelet"
];

const POPULAR_SUGGESTIONS = [
  { term: "24K Gold Coin", category: "coins" },
  { term: "Diamond Ring", category: "rings" },
  { term: "Ruby Pendant", category: "pendants" },
  { term: "Pooja Coin", category: "coins" },
  { term: "Wedding Necklace", category: "necklaces" }
];

export default function SearchPage({
  products,
  onBack,
  onOpenProductDetail,
  onOpenQuickView,
  onAddToCart,
  initialQuery = ""
}: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_search_history");
      return stored ? JSON.parse(stored) : ["gold ring", "diamond necklace"];
    } catch {
      return [];
    }
  });

  const [selectedMetal, setSelectedMetal] = useState<string>("all");
  const [selectedGemstone, setSelectedGemstone] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number>(300000); // Max budget
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem("atulya_search_history", JSON.stringify(history));
  }, [history]);

  // Handle addition of query to search history
  const addToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const cleanTerm = searchTerm.trim().toLowerCase();
    setHistory(prev => {
      const filtered = prev.filter(item => item !== cleanTerm);
      return [cleanTerm, ...filtered].slice(0, 8); // Keep last 8 searches
    });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    addToHistory(query);
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    addToHistory(term);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Simulate Voice Search
  const triggerVoiceSearch = () => {
    setIsListening(true);
    // Mimic hearing voice commands in jewelry
    const simulatedPhrases = [
      "certified 22k gold coins",
      "bridal gemstone necklace set",
      "exclusive solitaire engagement ring",
      "traditional floral diamond earrings"
    ];
    setTimeout(() => {
      const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setQuery(randomPhrase);
      addToHistory(randomPhrase);
      setIsListening(false);
    }, 2800);
  };

  // Fuzzy spelling check/did you mean
  useEffect(() => {
    if (!query) {
      setDidYouMean(null);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Check for common typos
    if (lowerQuery.includes("rng") || lowerQuery.includes("riing")) {
      setDidYouMean("ring");
    } else if (lowerQuery.includes("nec") || lowerQuery.includes("naklace")) {
      setDidYouMean("necklace");
    } else if (lowerQuery.includes("con") || lowerQuery.includes("coine")) {
      setDidYouMean("coins");
    } else if (lowerQuery.includes("erring") || lowerQuery.includes("earing")) {
      setDidYouMean("earrings");
    } else {
      setDidYouMean(null);
    }
  }, [query]);

  // Extract metadata values dynamically
  const metals = ["all", ...Array.from(new Set(products.map(p => p.material)))];
  const gemstones = ["all", "diamond", "ruby", "emerald", "pearl", "plain"];

  // Filtered and sorted products computation
  const searchResults = products.filter(product => {
    // Search query match (title, desc, material, category, tags)
    const q = query.toLowerCase().trim();
    if (q) {
      const matchesTitle = product.title.toLowerCase().includes(q);
      const matchesDesc = product.description.toLowerCase().includes(q);
      const matchesMat = product.material.toLowerCase().includes(q);
      const matchesCat = product.category.toLowerCase().includes(q);
      const matchesAttr = product.attributes.some(attr => 
        attr.value.toLowerCase().includes(q) || attr.label.toLowerCase().includes(q)
      );
      if (!matchesTitle && !matchesDesc && !matchesMat && !matchesCat && !matchesAttr) {
        return false;
      }
    }

    // Metal Filter
    if (selectedMetal !== "all" && product.material !== selectedMetal) return false;

    // Gemstone Filter
    if (selectedGemstone !== "all") {
      const desc = product.description.toLowerCase();
      const title = product.title.toLowerCase();
      const hasGem = desc.includes(selectedGemstone) || title.includes(selectedGemstone);
      if (selectedGemstone === "plain") {
        const isPlain = !desc.includes("diamond") && !desc.includes("ruby") && !desc.includes("emerald") && !desc.includes("sapphire");
        if (!isPlain) return false;
      } else if (!hasGem) {
        return false;
      }
    }

    // Price range Filter
    if (product.price > priceRange) return false;

    return true;
  });

  // Apply sorting
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
        return b.sold - a.sold;
      case "relevance":
      default:
        return 0; // Default order
    }
  });

  return (
    <div className="bg-neutral-50/50 min-h-screen py-3 md:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-2.5 md:px-4 space-y-4 md:space-y-6">
        
        {/* Top bar with back navigation and voice */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between border-b border-neutral-100 pb-3 md:pb-5">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-full hover:bg-neutral-100 bg-white border border-neutral-200 text-neutral-800 cursor-pointer transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[9px] font-bold text-gold-dark uppercase tracking-widest block">Atulya Premium Search</span>
              <h2 className="font-serif font-black text-xl md:text-2xl text-neutral-950 flex items-center gap-1.5">
                Luxury Discovery <Compass className="w-5 h-5 text-gold animate-spin-slow" />
              </h2>
            </div>
          </div>

          {/* Form container */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gold-dark" />
              <input
                type="text"
                placeholder="Search coins, solitaire rings, bridal necklaces, polki..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white rounded-2xl border border-neutral-200 focus:border-gold focus:outline-none text-xs font-semibold text-neutral-900 placeholder-neutral-400 shadow-xs focus:ring-1 focus:ring-gold transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={triggerVoiceSearch}
              className={`p-3 rounded-2xl text-white cursor-pointer transition-all shadow-sm flex items-center justify-center ${isListening ? "bg-rose-600 animate-pulse" : "bg-neutral-950 hover:bg-neutral-900"}`}
              title="Voice search jewelry"
            >
              <Mic className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

        {/* Suggestion & History Panels - Only shown if query is short or empty */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white p-3 sm:p-6 rounded-2xl md:rounded-3xl border border-neutral-150 shadow-xs">
            {/* Search history */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-sm text-neutral-950 flex items-center gap-2">
                  <History className="w-4 h-4 text-neutral-400" /> Recent Inquiries
                </h3>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider"
                  >
                    Clear History
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No recent inquiries found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {history.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(term)}
                      className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold border border-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trending / Recommended searches */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-neutral-950 flex items-center gap-2">
                <Flame className="w-4 h-4 text-gold" /> Trending Collections
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(term)}
                    className="px-3 py-1.5 bg-gold/5 hover:bg-gold/10 text-gold-dark rounded-xl text-xs font-bold border border-gold/15 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-gold inline mr-1" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Quick Category Jumps:</span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s.term)}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      {s.term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spelling correction banner */}
        {didYouMean && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-800">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              Showing results for "{query}". Did you mean: 
              <button 
                onClick={() => handleSelectSuggestion(didYouMean)}
                className="font-black text-gold-dark underline hover:text-gold cursor-pointer"
              >
                {didYouMean}
              </button>?
            </span>
          </div>
        )}

        {/* Filter and Sorting Options Bar */}
        {query && (
          <div className="bg-white p-2.5 sm:p-4 rounded-2xl md:rounded-3xl border border-neutral-150 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${showFilters ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"}`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-gold-dark" />
                  <span>Filters {selectedMetal !== "all" || selectedGemstone !== "all" ? "• Active" : ""}</span>
                </button>
                
                {/* Clear all active filters */}
                {(selectedMetal !== "all" || selectedGemstone !== "all" || priceRange < 300000) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMetal("all");
                      setSelectedGemstone("all");
                      setPriceRange(300000);
                    }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Sort & layout selectors */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 font-semibold text-neutral-800 text-xs focus:outline-none focus:border-gold"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Best Sellers</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${viewMode === 'grid' ? "bg-neutral-100 text-neutral-950 border-neutral-300" : "text-neutral-400 hover:text-neutral-600 border-neutral-200"}`}
                    title="Grid layout"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${viewMode === 'list' ? "bg-neutral-100 text-neutral-950 border-neutral-300" : "text-neutral-400 hover:text-neutral-600 border-neutral-200"}`}
                    title="List layout"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter expansion */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-neutral-100 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    
                    {/* Metal selector */}
                    <div className="space-y-2">
                      <span className="font-bold text-neutral-700 block uppercase tracking-wide">Metal Composition</span>
                      <div className="flex flex-wrap gap-2">
                        {metals.map(metal => (
                          <button
                            key={metal}
                            type="button"
                            onClick={() => setSelectedMetal(metal)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${selectedMetal === metal ? "bg-neutral-950 border-neutral-950 text-white font-bold" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-600"}`}
                          >
                            {metal === "all" ? "All Metals" : metal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gemstone selector */}
                    <div className="space-y-2">
                      <span className="font-bold text-neutral-700 block uppercase tracking-wide">Gemstone Setting</span>
                      <div className="flex flex-wrap gap-2">
                        {gemstones.map(gem => (
                          <button
                            key={gem}
                            type="button"
                            onClick={() => setSelectedGemstone(gem)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${selectedGemstone === gem ? "bg-gold border-gold text-white font-bold" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-600"}`}
                          >
                            {gem === "all" ? "All Gems" : gem === "plain" ? "No Gemstone" : gem}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-neutral-700 block uppercase tracking-wide">
                        <span>Max Price Limit</span>
                        <span className="text-gold-dark font-mono font-bold">₹{priceRange.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="300000"
                        step="5000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                        <span>₹5,000</span>
                        <span>₹3,00,000+</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Results Showcase Section */}
        {query && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-neutral-500">
                Found <span className="font-mono text-neutral-900 font-black">{sortedResults.length}</span> luxury matches for "{query}"
              </span>
            </div>

            {sortedResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-150 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-neutral-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-neutral-900">No Masterpieces Found</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto px-4">
                    We couldn't match your criteria. Try adjusting filters or typing items like "ring", "necklace", or "pure gold coins".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedMetal("all");
                    setSelectedGemstone("all");
                    setPriceRange(300000);
                  }}
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Reset Discovery
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
              }>
                {sortedResults.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={onOpenProductDetail}
                    onOpenQuickView={onOpenQuickView}
                    onAddToCart={onAddToCart}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* High-fidelity Voice listening overlay */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white p-6"
            >
              <div className="space-y-8 text-center max-w-sm">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping duration-1000" />
                  <div className="absolute inset-2 rounded-full bg-gold/20 animate-ping duration-700" />
                  <div className="absolute inset-4 rounded-full bg-gold/30 animate-ping duration-500" />
                  <div className="relative w-16 h-16 bg-gold text-white rounded-full flex items-center justify-center shadow-lg shadow-gold/35">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">AI AUDIO TRANSLATOR</span>
                  <h3 className="font-serif font-bold text-lg">Listening for Luxury requests...</h3>
                  <p className="text-xs text-neutral-400">
                    Try speaking: "gold coin 10g", "bridal polki jewelry set", or "solitaire emerald ring"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsListening(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
