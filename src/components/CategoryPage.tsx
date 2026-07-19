import React, { useState } from "react";
import { 
  ArrowLeft, 
  Grid, 
  List, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Heart,
  HelpCircle,
  Gem,
  Award,
  TrendingUp,
  SlidersHorizontal,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Category } from "../types";
import ProductCard from "./ProductCard";

interface CategoryPageProps {
  category: string;
  categories: Category[];
  products: Product[];
  onBack: () => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  initialBadge?: string;
}

const CATEGORY_DETAILS: Record<string, {
  title: string;
  tagline: string;
  description: string;
  banner: string;
  purityBadge: string;
  trustFactor: string;
}> = {
  all: {
    title: "The Atulya Master Catalog",
    tagline: "Legacy Indian Craftsmanship & Pure Wealth Assets",
    description: "Immerse yourself in our complete certified collection. From 24K pure gold coins to exquisite certified solitaires and heritage bridal necklaces, handcrafted under strict BIS-Hallmark standards.",
    banner: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "100% BIS Hallmarked",
    trustFactor: "Lifetime Buyback & Insured Delivery Guarantee"
  },
  coins: {
    title: "Pure Investment Gold Coins",
    tagline: "99.9% 24K Certified Assay Gold",
    description: "Safeguard your savings with our BIS certified, tamper-proof packed pure gold and silver investment coins. Individually serial numbered and ready for lifelong liquidity with 100% transparent buybacks.",
    banner: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "999 Fine Purest Gold",
    trustFactor: "Individually Assayed & Serialized"
  },
  rings: {
    title: "Engagement & Cocktail Rings",
    tagline: "VVS-VS Clarity Hand-Crafted Diamonds",
    description: "Exquisite traditional and modern designer rings. Made with BIS hallmarked 22K/18K gold and set with certified brilliant-cut diamonds, rubies, and Colombian emeralds to last a lifetime.",
    banner: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "BIS Hallmarked 18K/22K",
    trustFactor: "Hand-set by Elite Artisans"
  },
  pendants: {
    title: "Celestial Pendants & Charms",
    tagline: "Divine & Heritage Designs",
    description: "Express your devotion or custom style. Fine carved religious pooja pendants, modern sleek office wear diamond bail necklaces, and traditional heavy gold temple lockets.",
    banner: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "BIS Certified 22 Karat",
    trustFactor: "Includes Complimentary Chain Bail"
  },
  earrings: {
    title: "Chandbalis, Jhumkas & Studs",
    tagline: "The Crown Jewels of Fine Accent",
    description: "Enhance your face with brilliant luxury. From lightweight modern studs to intricate traditional royal bridal jhumkas and majestic chandbalis finished in hand-placed pearls.",
    banner: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "100% Certified Hallmark",
    trustFactor: "Secure Luxury Back-screws"
  },
  bracelets: {
    title: "Luxury Bracelets & Kadas",
    tagline: "Elegant wrist statement wear",
    description: "Draped in sheer luxury. Lightweight daily diamond tennis bracelets, chunky heavy gold traditional kadas, and flexible elegant standard line-bangles.",
    banner: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "Certified Solid Gold & Platinum",
    trustFactor: "Dynamic Sizing & Safety Clasps"
  },
  necklaces: {
    title: "Bridal Chokers & Rani Haars",
    tagline: "The Ultimate Royal Heirloom Line",
    description: "The epitome of traditional Indian jewelry heritage. Intricate polki, majestic kundan, and brilliant-cut diamond bridal collar necklaces that define high society luxury.",
    banner: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "Certified Heritage Kundan & Polki",
    trustFactor: "GIA/IGI Gem Authenticated"
  }
};

const ALL_CATEGORIES = ["all", "coins", "rings", "pendants", "earrings", "bracelets", "necklaces"];

export default function CategoryPage({
  category,
  categories,
  products,
  onBack,
  onOpenProductDetail,
  onOpenQuickView,
  onAddToCart,
  onSelectCategory,
  initialBadge
}: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMetal, setSelectedMetal] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>(initialBadge || "all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (initialBadge) {
      setSelectedBadge(initialBadge);
    }
  }, [initialBadge]);

  // ==================== EXPLICIT CATEGORY DIRECTORY VIEW (ONLY CATEGORIES, NO PRODUCTS) ====================
  if (category === "directory") {
    return (
      <div className="bg-neutral-50/50 min-h-screen font-sans pb-16">
        {/* Directory Header Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-neutral-100 bg-white shadow-xs">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gold-dark" /> Back to Main
          </button>
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">
            Atulya Department Directory
          </span>
        </div>

        {/* Categories Directory Grid */}
        <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((cat) => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[24px] border border-neutral-150 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-[380px] text-left group cursor-pointer"
                  onClick={() => onSelectCategory(cat.id)}
                >
                  {/* Category Image */}
                  <div className="h-44 bg-neutral-100 relative overflow-hidden">
                    {cat.banner ? (
                      <img
                        src={cat.banner}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-400">
                        <Gem className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
                    
                    {/* Badge and Title */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      {cat.purityBadge && (
                        <span className="text-[8px] bg-amber-500/90 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-block mb-1">
                          {cat.purityBadge}
                        </span>
                      )}
                      <h3 className="font-serif font-black text-lg md:text-xl leading-tight group-hover:text-gold transition-colors">
                        {cat.name}
                      </h3>
                    </div>

                    <div className="absolute top-4 right-5 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider border border-white/15 shadow-xs">
                      {count} {count === 1 ? 'Design' : 'Designs'}
                    </div>
                  </div>

                  {/* Category description & marketing */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      {cat.tagline && (
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                          {cat.tagline}
                        </p>
                      )}
                      {cat.description && (
                        <p className="text-xs text-neutral-500 font-medium leading-normal line-clamp-3">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-neutral-400">
                      {cat.trustFactor ? (
                        <span className="text-[9.5px] font-bold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="line-clamp-1">{cat.trustFactor}</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-bold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                          <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>BIS Hallmarked & Certified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Safety trust banner */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="bg-neutral-950 text-white p-6 sm:p-8 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gold/15 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-1.5 max-w-xl">
              <h3 className="font-serif font-black text-lg sm:text-xl flex items-center justify-center md:justify-start gap-1.5">
                <Award className="w-5 h-5 text-gold" /> Guaranteed Pure Wealth Assets
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
                Atulya Gold stands by absolute purity under legal guidelines. Every precious coin, luxury kada, or bridal haar is tested, certified, and fully hallmarked.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Back to Collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Retrieve current category details
  const dbCat = categories.find(c => c.id === category);
  const details = dbCat ? {
    title: dbCat.title || dbCat.name,
    tagline: dbCat.tagline || "Fine Certified Luxury Designs",
    description: dbCat.description || "Explore our collection of hand-picked jewelry. BIS Hallmarked, verified premium gold and certified brilliant-cut gemstones.",
    banner: dbCat.banner || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    purityBadge: dbCat.purityBadge || "BIS Certified",
    trustFactor: dbCat.trustFactor || "Secure Shipped Transit"
  } : (CATEGORY_DETAILS[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Collections`,
    tagline: "Fine Certified Luxury Designs",
    description: "Explore our collection of hand-picked jewelry. BIS Hallmarked, verified premium gold and certified brilliant-cut gemstones.",
    banner: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    purityBadge: "BIS Certified",
    trustFactor: "Secure Shipped Transit"
  });

  // Extract available metals inside this specific category
  const categoryProducts = category === "all" ? products : products.filter(p => p.category === category);
  const metals = ["all", ...Array.from(new Set(categoryProducts.map(p => p.material)))];

  // Perform filtration
  const filteredProducts = categoryProducts.filter(p => {
    if (selectedMetal !== "all" && p.material !== selectedMetal) return false;
    if (selectedBadge !== "all" && p.badge !== selectedBadge) return false;
    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
        return 0;
    }
  });

  if (isMobile) {
    return (
      <div className="bg-neutral-50 min-h-screen font-sans pb-24 relative">
        {/* Dedicated Native Mobile App Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-14 px-4 flex items-center justify-between shadow-xs">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-800" />
          </button>
          
          <div className="text-center">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block font-mono">ATULYA ROYAL COLLECTIBLE</span>
            <h1 className="font-serif font-black text-xs text-neutral-900 capitalize tracking-tight">
              {category === "all" ? "All Masterpieces" : category}
            </h1>
          </div>

          <div className="relative w-10 h-10 flex items-center justify-center bg-neutral-50 rounded-full font-mono text-[9px] font-bold text-neutral-500">
            {sortedProducts.length}
          </div>
        </div>

        {/* Dynamic Category Hero Card */}
        <div className="p-4">
          <div className="relative bg-neutral-900 rounded-[24px] overflow-hidden p-5 shadow-md flex items-center h-28 text-left">
            <img
              src={details.banner}
              alt={details.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
            
            <div className="relative z-10 space-y-1">
              <span className="text-[7px] bg-gold/20 border border-gold/30 text-gold-light px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-block">
                {details.purityBadge}
              </span>
              <h2 className="font-serif font-black text-xs text-white leading-tight">{details.title}</h2>
              <p className="text-[8px] text-neutral-300 leading-normal line-clamp-2 max-w-xs">{details.description}</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Product Grid */}
        <div className="px-4 pb-12">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-150 space-y-3 max-w-sm mx-auto">
              <Gem className="w-6 h-6 text-neutral-300 mx-auto animate-pulse" />
              <div>
                <h4 className="font-serif font-black text-xs text-neutral-900">Designs Currently Sold Out</h4>
                <p className="text-[9px] text-neutral-500 max-w-[200px] mx-auto mt-1">
                  We currently have no active designs matching these criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMetal("all");
                  setSelectedBadge("all");
                }}
                className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={onOpenProductDetail}
                  onOpenQuickView={onOpenQuickView}
                  onAddToCart={onAddToCart}
                  viewMode="grid"
                />
              ))}
            </div>
          )}
        </div>

        {/* Native-App Floating Bottom Action Pill */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-full shadow-lg border border-white/10 active:scale-95 transition-transform cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>FILTER & SORT {selectedMetal !== "all" || selectedBadge !== "all" ? "• 1" : ""}</span>
          </button>
        </div>

        {/* FILTER & SORT BOTTOM SHEET DRAWER */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
              />

              {/* Sheet Container */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="relative bg-white w-full max-h-[80vh] rounded-t-[32px] shadow-2xl flex flex-col z-10 overflow-hidden border-t border-neutral-100"
              >
                {/* Close handle indicator */}
                <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto my-3 flex-shrink-0" />

                {/* Absolute Close button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Sheet Title */}
                <div className="px-5 pb-3 border-b border-neutral-100 flex-shrink-0 text-left">
                  <h3 className="font-serif font-black text-sm text-neutral-900">Refine Collection</h3>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Custom Filters & Sorting Grid</p>
                </div>

                {/* Scrollable Filters form */}
                <div className="overflow-y-auto px-5 py-4 space-y-5 flex-grow text-left">
                  {/* Sorting Options */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Sort Masterpieces By</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "relevance", label: "Relevance" },
                        { id: "price-low", label: "Price: Low to High" },
                        { id: "price-high", label: "Price: High to Low" },
                        { id: "rating", label: "Top Rated" },
                        { id: "popular", label: "Best Sellers" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSortBy(opt.id)}
                          className={`py-2 px-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            sortBy === opt.id 
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-xs" 
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metal Filter Options */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Select Composition Metal</span>
                    <div className="flex flex-wrap gap-2">
                      {metals.map((metal) => (
                        <button
                          key={metal}
                          type="button"
                          onClick={() => setSelectedMetal(metal)}
                          className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize ${
                            selectedMetal === metal 
                              ? "border-amber-500 bg-amber-50/10 text-neutral-950" 
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          {metal === "all" ? "All Metals" : metal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Product Lines Badges */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Select Curated Line</span>
                    <div className="flex flex-wrap gap-2">
                      {["all", "exclusive", "new", "sale", "trending"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBadge(b)}
                          className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize ${
                            selectedBadge === b 
                              ? "border-indigo-500 bg-indigo-50/10 text-neutral-950" 
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          {b === "all" ? "All Lines" : b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions inside Drawer */}
                <div className="p-4 border-t border-neutral-100 bg-white flex gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMetal("all");
                      setSelectedBadge("all");
                      setSortBy("relevance");
                      setIsMobileFilterOpen(false);
                    }}
                    className="flex-1 py-3 border border-neutral-200 text-neutral-600 font-extrabold text-xs uppercase rounded-xl hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-grow py-3 bg-neutral-950 text-white font-extrabold text-xs uppercase rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-md text-center"
                  >
                    Apply Filter
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50/50 min-h-screen font-sans pb-12">
      
      {/* Category Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 md:px-4 py-2 md:py-3 flex items-center justify-between border-b border-neutral-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold-dark" /> Back to Main
        </button>

        {/* Quick horizontal categories switcher */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Collections:</span>
          <button
            onClick={() => {
              onSelectCategory("directory");
            }}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-all border ${category === "directory" ? "bg-slate-900 text-white border-slate-950 shadow-xs animate-fadeIn" : "bg-white text-neutral-600 border-neutral-150 hover:bg-neutral-50"}`}
          >
            All Categories
          </button>
          <button
            onClick={() => {
              onSelectCategory("all");
              setSelectedMetal("all");
              setSelectedBadge("all");
            }}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-all border ${category === "all" ? "bg-gold text-white border-gold-dark shadow-xs" : "bg-white text-neutral-600 border-neutral-150 hover:bg-neutral-50"}`}
          >
            All Designs
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setSelectedMetal("all");
                setSelectedBadge("all");
              }}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-all border ${category === cat.id ? "bg-gold text-white border-gold-dark shadow-xs" : "bg-white text-neutral-600 border-neutral-150 hover:bg-neutral-50"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          {categoryProducts.length} DESIGNS AVAILABLE
        </div>
      </div>

      {/* Premium Hero Banner Section */}
      <div className="relative h-36 sm:h-52 md:h-80 bg-neutral-950 overflow-hidden shadow-md flex items-center">
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0">
          <img
            src={details.banner}
            alt={details.title}
            className="w-full h-full object-cover opacity-35 filter brightness-90 saturate-75 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 w-full text-center md:text-left space-y-1.5 md:space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 bg-gold/15 border border-gold/30 text-gold-light rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold" />
            <span>{details.purityBadge}</span>
          </div>

          <h1 className="font-serif font-black text-sm sm:text-2xl md:text-4xl text-white leading-tight">
            {details.title}
          </h1>
          
          <p className="text-[10px] md:text-sm text-neutral-300 font-medium max-w-2xl leading-tight md:leading-relaxed line-clamp-2 sm:line-clamp-none">
            {details.description}
          </p>

          <div className="text-[8px] md:text-[10px] text-gold font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Promise: {details.trustFactor}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 md:px-4 mt-3 md:mt-8 space-y-4 md:space-y-6">

        {/* Interactive Filters Panel */}
        <div className="bg-white p-2.5 sm:p-4 rounded-2xl md:rounded-3xl border border-neutral-150 shadow-xs flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer ${showFilters ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"}`}
              >
                <SlidersHorizontal className="w-4 h-4 text-gold-dark" />
                <span>Filters {selectedMetal !== "all" || selectedBadge !== "all" ? "• Active" : ""}</span>
              </button>

              {(selectedMetal !== "all" || selectedBadge !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetal("all");
                    setSelectedBadge("all");
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Sort options */}
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 font-semibold text-neutral-800 text-xs focus:outline-none"
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

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-neutral-100 pt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  
                  {/* Composition filter */}
                  <div className="space-y-2">
                    <span className="font-bold text-neutral-700 block uppercase tracking-wide">Composition Metal</span>
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

                  {/* Curated Badges */}
                  <div className="space-y-2">
                    <span className="font-bold text-neutral-700 block uppercase tracking-wide">Product Line Category</span>
                    <div className="flex flex-wrap gap-2">
                      {["all", "exclusive", "new", "sale", "trending"].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBadge(b)}
                          className={`px-3 py-1.5 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${selectedBadge === b ? "bg-gold border-gold text-white font-bold" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-600"}`}
                        >
                          {b === "all" ? "All Lines" : b}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product listing showcase */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-neutral-500">
              Showing <span className="text-neutral-950 font-black">{sortedProducts.length}</span> luxury pieces of "{category}"
            </span>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-150 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                <Gem className="w-6 h-6 text-neutral-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-black text-neutral-900">Designs Currently Sold Out</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto px-4">
                  We currently have no active pieces matching these filter criteria in stock. Try removing the filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMetal("all");
                  setSelectedBadge("all");
                }}
                className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
            }>
              {sortedProducts.map(product => (
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

        {/* Immersive Trust Banner inside category */}
        <div className="bg-neutral-950 text-white p-4 sm:p-6 rounded-2xl md:rounded-3xl border border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full filter blur-xl pointer-events-none" />
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif font-black text-base flex items-center justify-center md:justify-start gap-1.5">
              <Award className="w-5 h-5 text-gold" /> BIS Hallmarked Authenticity Guarantee
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl">
              Every design from Atulya Gold is legally certified under strict Bureau of Indian Standards procedures. Complete transparency, pure investment assets.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-white text-neutral-950 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-all"
          >
            Explore Other Collections
          </button>
        </div>

      </div>
    </div>
  );
}
