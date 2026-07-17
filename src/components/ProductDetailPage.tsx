import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, Star, ShieldCheck, ShoppingCart, 
  Sparkles, CheckCircle, Award, Activity,
  ChevronDown, Scale, Coins, Landmark,
  Tag, Eye, Gem, Heart, Sparkle, Share2,
  Send, MessageSquare, User, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Review } from "../types";
import { products } from "../data";
import ProductCard from "./ProductCard";
import { getReviewsFromDB, addReviewToDB } from "../firebase";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  currentUser?: { name: string; email: string; picture?: string; role: 'user' | 'admin' } | null;
  onTriggerLogin?: () => void;
}

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onAddToCart, 
  onSelectProduct,
  currentUser,
  onTriggerLogin
}: ProductDetailPageProps) {
  // Mobile UI Redesign and Bottom Sheet Support
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("Yellow Gold");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [customOptionError, setCustomOptionError] = useState<boolean>(false);
  const [selectedCustomOption, setSelectedCustomOption] = useState<string>("");
  const [customOptionError2, setCustomOptionError2] = useState<boolean>(false);
  const [selectedCustomOption2, setSelectedCustomOption2] = useState<string>("");
  const [customOptionError3, setCustomOptionError3] = useState<boolean>(false);
  const [selectedCustomOption3, setSelectedCustomOption3] = useState<string>("");

  // Reset customization on product change
  useEffect(() => {
    setSelectedSize("");
    setSelectedCustomOption("");
    setSelectedCustomOption2("");
    setSelectedCustomOption3("");
    setSizeError(false);
    setCustomOptionError(false);
    setCustomOptionError2(false);
    setCustomOptionError3(false);
    setSelectedQuantity(1);
  }, [product.id]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const colorOptions = [
    { name: "Yellow Gold", hex: "#E6B800", bgClass: "bg-[#E6B800]" },
    { name: "Rose Gold", hex: "#E0A899", bgClass: "bg-[#E0A899]" },
    { name: "White Gold", hex: "#EAEAEA", bgClass: "bg-[#EAEAEA]" }
  ];

  const getSizeOptions = () => {
    if (product.category === "rings") {
      return ["10 (S)", "12 (M)", "14 (L)", "16 (XL)"];
    } else if (product.category === "bracelets") {
      return ["6.5 inches", "7.0 inches", "7.5 inches", "8.0 inches"];
    } else if (product.category === "necklaces") {
      return ["16 inches", "18 inches", "20 inches", "22 inches"];
    }
    return ["Standard Fit", "Bespoke Custom"];
  };

  // Customization choices
  const [selectedPurity, setSelectedPurity] = useState<"18K" | "22K" | "24K" | "Platinum 950">("22K");
  const [selectedStoneGrade, setSelectedStoneGrade] = useState<"VVS1" | "VS1" | "SI1">("VS1");
  const [addedNotify, setAddedNotify] = useState<boolean>(false);
  const [sharedNotify, setSharedNotify] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const stored = localStorage.getItem("atulya_cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          const count = parsed.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, [addedNotify]);

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSharedNotify(true);
      setTimeout(() => setSharedNotify(false), 2500);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };
  
  // Custom interactive Accordions
  const [openAccordion, setOpenAccordion] = useState<string | null>("attributes");

  // Colorful Ambient Luster auto-shifting state
  const [activeLighting, setActiveLighting] = useState<"saffron" | "rose" | "emerald">("saffron");
  const [sparklesList, setSparklesList] = useState<{ x: number; y: number; id: number }[]>([]);

  // Thumbnail Carousel state
  const [selectedThumb, setSelectedThumb] = useState<number>(0);

  // Reviews state and DB handlers
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      setIsLoadingReviews(true);
      try {
        const fetched = await getReviewsFromDB(product.id);
        if (active) {
          setReviewsList(fetched);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (active) {
          setIsLoadingReviews(false);
        }
      }
    }
    loadReviews();
    return () => { active = false; };
  }, [product.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);
    
    try {
      const authorName = currentUser?.name || "Guest Patron";
      const authorEmail = currentUser?.email || "guest@atulya.com";
      const authorAvatar = currentUser?.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80";
      
      const payload = {
        productId: product.id,
        name: authorName,
        email: authorEmail,
        rating: newRating,
        text: newComment,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        avatar: authorAvatar
      };
      
      const newReview = await addReviewToDB(payload);
      setReviewsList(prev => [newReview, ...prev]);
      setNewComment("");
      setNewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setReviewError("Failed to publish your review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loupe magnification
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const [showLoupe, setShowLoupe] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState<React.CSSProperties>({ display: "none" });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotating ambient lighting for premium luster feel without cluttering UI
  useEffect(() => {
    const lightings: ("saffron" | "rose" | "emerald")[] = ["saffron", "rose", "emerald"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % lightings.length;
      setActiveLighting(lightings[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Shimmer sparkle loop on the showcase image
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.4) {
        const newSparkle = {
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 80) + 10,
          id: Date.now()
        };
        setSparklesList(prev => [...prev.slice(-4), newSparkle]);
      }
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    if (x < 0 || y < 0 || x > width || y > height) {
      setShowLoupe(false);
      return;
    }

    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    
    setLoupePos({ x, y });
    setMagnifierStyle({
      display: "block",
      left: `${x - 90}px`,
      top: `${y - 90}px`,
      backgroundImage: `url(${thumbnails[selectedThumb].url})`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      backgroundSize: "360% 360%",
    });
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.material === product.material))
    .slice(0, 4);

  const displayRelated = relatedProducts.length >= 3 
    ? relatedProducts 
    : products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCartClick = () => {
    setIsBottomSheetOpen(true);
  };

  const handleConfirmAddToCartMobile = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    let hasErr = false;
    if (product.customOptionLabel && product.customOptionValues && !selectedCustomOption) {
      setCustomOptionError(true);
      hasErr = true;
    }
    if (product.customOptionLabel2 && product.customOptionValues2 && !selectedCustomOption2) {
      setCustomOptionError2(true);
      hasErr = true;
    }
    if (product.customOptionLabel3 && product.customOptionValues3 && !selectedCustomOption3) {
      setCustomOptionError3(true);
      hasErr = true;
    }
    if (hasErr) return;

    let optionSuffix = "";
    if (product.customOptionLabel && selectedCustomOption) {
      optionSuffix += `, ${product.customOptionLabel}: ${selectedCustomOption}`;
    }
    if (product.customOptionLabel2 && selectedCustomOption2) {
      optionSuffix += `, ${product.customOptionLabel2}: ${selectedCustomOption2}`;
    }
    if (product.customOptionLabel3 && selectedCustomOption3) {
      optionSuffix += `, ${product.customOptionLabel3}: ${selectedCustomOption3}`;
    }

    const titleSuffix = `(${selectedPurity}, ${selectedColor}, Size: ${selectedSize}${optionSuffix})`;
    const customizedProduct = {
      ...product,
      title: `${product.title} ${titleSuffix}`,
      price: calculatedPrice,
    };

    // Add based on selectedQuantity
    for (let i = 0; i < selectedQuantity; i++) {
      onAddToCart(customizedProduct);
    }

    setIsBottomSheetOpen(false);
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 2500);
  };

  const baseThumbnails = [
    { name: "Saffron Studio", url: product.image, desc: "Editorial focus lighting setup" },
    ...(product.images || []).map((imgUrl: string, idx: number) => ({
      name: `Artisan View ${idx + 1}`,
      url: imgUrl,
      desc: "Additional premium angle view details"
    })),
    { name: "Facets Zoom 10x", url: product.image, desc: "Luster clarity verification detail", css: "scale-[1.65] origin-center filter contrast-[1.06]" },
    { name: "Packaging Box", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", desc: "Velvet gift box presentation" }
  ];
  const thumbnails = baseThumbnails.filter(t => t.url);

  const rawBaseWeight = parseFloat(product.attributes.find(a => a.label.includes("Weight"))?.value || "6.5g") || 6.5;
  const currentWeight = rawBaseWeight.toFixed(2);

  // Price calculations
  const purityMultiplier = selectedPurity === "24K" ? 1.15 : selectedPurity === "22K" ? 1.0 : selectedPurity === "18K" ? 0.82 : 1.1; 
  const goldRatePerGram = product.material.toLowerCase() === "gold" ? 6450 * purityMultiplier : product.material.toLowerCase() === "platinum" ? 3800 : 95;
  const metalValuation = Math.round(parseFloat(currentWeight) * goldRatePerGram);

  const stoneMultiplier = selectedStoneGrade === "VVS1" ? 1.35 : selectedStoneGrade === "VS1" ? 1.0 : 0.75;
  const stoneBaseVal = product.material.toLowerCase() === "diamond" ? Math.round(product.price * 0.45) : 0;
  const diamondStoneValuation = Math.round(stoneBaseVal * stoneMultiplier);

  const makingCharges = Math.round((metalValuation + diamondStoneValuation) * 0.12);
  const subtotalBeforeTax = metalValuation + diamondStoneValuation + makingCharges;
  const dynamicGst = Math.round(subtotalBeforeTax * 0.03); 

  const calculatedPrice = subtotalBeforeTax + dynamicGst;
  const oldCalculatedPrice = product.originalPrice ? Math.round((product.originalPrice / product.price) * calculatedPrice) : null;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Colorful Background Ring/Sphere based on simulation lighting choice
  const getLightingGlow = () => {
    switch (activeLighting) {
      case "rose":
        return "from-rose-300/35 via-pink-100/10 to-transparent";
      case "emerald":
        return "from-emerald-300/35 via-teal-100/10 to-transparent";
      default:
        return "from-amber-300/35 via-amber-100/10 to-transparent";
    }
  };

  if (isMobile) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen pb-32 font-sans text-neutral-800">
        {/* Full-bleed product image at the top */}
        <div className="relative w-full aspect-square bg-gradient-to-b from-[#F2ECE4]/40 to-[#EAE1D5]/30 flex items-center justify-center overflow-hidden rounded-b-[40px] shadow-sm">
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-11 h-11 bg-white hover:bg-neutral-50 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 z-20 cursor-pointer border border-neutral-100"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-800" />
          </button>

          {/* Right actions: Heart & Share */}
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="w-11 h-11 bg-white hover:bg-neutral-50 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border border-neutral-100"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500 font-bold" : "text-neutral-800"}`} />
            </button>
            <button
              onClick={handleShareClick}
              className="w-11 h-11 bg-white hover:bg-neutral-50 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border border-neutral-100 relative"
            >
              <Share2 className="w-5 h-5 text-neutral-800" />
              {sharedNotify && (
                <span className="absolute -bottom-10 right-0 bg-neutral-900 text-white text-[9px] px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-50">
                  Link Copied!
                </span>
              )}
            </button>
          </div>

          {/* Main Product Image with subtle scale/fade transition */}
          <motion.img
            key={selectedThumb}
            src={thumbnails[selectedThumb]?.url || product.image}
            alt={product.title}
            className={`w-[85%] h-[85%] object-contain ${
              selectedThumb === 1 ? "scale-[1.5] origin-center" : ""
            }`}
            referrerPolicy="no-referrer"
          />

          {/* View in 3D Button floating at bottom right */}
          <button
            onClick={() => {
              alert("Entering High-Definition 3D Karigari Loupe. Simulating jewelry dimensions...");
            }}
            className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md text-neutral-850 font-bold text-[11px] px-4 py-2 rounded-xl shadow-md border border-neutral-100 flex items-center gap-2 tracking-wide cursor-pointer hover:bg-white active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4 text-neutral-800 animate-pulse" />
            <span>View in 3D</span>
          </button>
        </div>

        {/* Content Container (padding and margins matching the screenshot spacing rhythm) */}
        <div className="px-5 pt-5 space-y-5">
          {/* 1. Horizontal Sub-gallery List of Thumbnails */}
          <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none">
            {thumbnails.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThumb(idx)}
                className={`w-[72px] h-[72px] rounded-2xl bg-white border flex items-center justify-center p-1.5 flex-shrink-0 transition-all cursor-pointer relative overflow-hidden ${
                  selectedThumb === idx
                    ? "border-amber-550 ring-2 ring-amber-100"
                    : "border-neutral-200"
                }`}
              >
                <img
                  src={thumb.url}
                  alt={thumb.name}
                  className={`w-full h-full object-contain rounded-lg ${
                    idx === 1 ? "scale-[1.4] origin-center" : ""
                  }`}
                  referrerPolicy="no-referrer"
                />
                {idx === 2 && (
                  <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
                    <span className="text-white text-xs font-black font-mono">+2</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 2. Brand and Title Details */}
          <div className="space-y-1.5 text-left">
            <div className="flex flex-wrap gap-2">
              {product.badge && (
                <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1 shadow-sm">
                  <span>🔥</span>
                  <span>{product.badge}</span>
                </span>
              )}
              <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1 shadow-sm">
                <span>✨</span>
                <span>{product.material === "gold" ? "18K Gold" : product.material}</span>
              </span>
            </div>

            <h2 className="font-serif font-black text-xl text-neutral-900 tracking-tight leading-tight pt-1">
              {product.title}
            </h2>
            <p className="text-[11px] text-neutral-450 font-bold tracking-wide">
              {product.material === "gold" ? "18K Gold Plated" : `${product.material} Quality`} | Premium Quality | Skin Friendly
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex text-amber-400 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-black text-neutral-800">{product.rating || "4.8"}</span>
              <span className="text-[11px] text-neutral-400">({reviewsList.length > 0 ? reviewsList.length : product.ratingCount || "256"} reviews)</span>
            </div>
          </div>

          {/* 3. Pricing Display */}
          <div className="text-left border-t border-neutral-100 pt-4.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-neutral-900 font-sans tracking-tight">
                ₹{calculatedPrice.toLocaleString('en-IN')}
              </span>
              {oldCalculatedPrice && (
                <span className="text-sm font-bold text-neutral-400 line-through font-sans">
                  ₹{oldCalculatedPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-100">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 font-bold tracking-wider mt-1 uppercase">
              Inclusive of all taxes
            </p>
          </div>

          {/* 4. Offers & Discounts Section (Matching green card exactly) */}
          <div className="bg-[#EBF7EE]/60 border border-[#D5EEDB] rounded-[20px] p-4 flex items-center justify-between text-left shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#D5EEDB]/60 text-emerald-800 rounded-xl">
                <Tag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-neutral-900">Offers & Discounts</h4>
                <p className="text-[10px] text-emerald-800 font-black mt-0.5 tracking-tight">Get 10% Instant Discount on UPI Payments</p>
              </div>
            </div>
            <ChevronDown className="w-4.5 h-4.5 text-emerald-800 -rotate-90" />
          </div>

          {/* 7. Trust badges row (Matching the clean grid) */}
          <div className="grid grid-cols-4 gap-2 bg-white border border-neutral-200/60 rounded-[20px] p-4.5 mt-2 text-center shadow-2xs">
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[9px] font-black text-neutral-800 leading-tight">6 Months<br/>Warranty</span>
            </div>
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[9px] font-black text-neutral-800 leading-tight">Premium<br/>Quality</span>
            </div>
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700">
                <CheckCircle className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[9px] font-black text-neutral-800 leading-tight">7 Days<br/>Return</span>
            </div>
            <div className="flex flex-col items-center space-y-1.5">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700">
                <Tag className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-[9px] font-black text-neutral-800 leading-tight">Gift<br/>Packaging</span>
            </div>
          </div>

          {/* 8. Description Section */}
          <div className="text-left bg-white border border-neutral-200/50 rounded-2xl p-5 space-y-2 mt-4 shadow-3xs">
            <h4 className="font-serif font-black text-sm text-neutral-900 tracking-tight">About this Masterpiece</h4>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans font-medium">
              {product.description || "Every jewelry item at Atulya is masterfully crafted, and features laser-etched Govt of India BIS hallmark verification. Ethically hand-assembled by classical Karigars with generations of heritage goldwork experience."}
            </p>
          </div>

          {/* 9. Specifications Section with Accordion */}
          <div className="bg-white border border-neutral-200/50 rounded-2xl overflow-hidden shadow-3xs text-left">
            <button
              onClick={() => setOpenAccordion(openAccordion === "specs" ? null : "specs")}
              className="w-full p-4 flex items-center justify-between font-serif font-black text-sm text-neutral-900 cursor-pointer"
            >
              <span>Authentic Weight & Specifications</span>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${openAccordion === "specs" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "specs" && (
              <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
                <table className="w-full text-xs">
                  <tbody>
                    {product.attributes.map((attr, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 last:border-0">
                        <td className="text-neutral-400 font-extrabold py-2.5 uppercase text-[9px] tracking-wider">{attr.label}</td>
                        <td className="text-neutral-800 font-black py-2.5 text-right font-mono">{idx === 0 ? `${currentWeight} grams` : attr.value}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-neutral-100 last:border-0">
                      <td className="text-neutral-400 font-extrabold py-2.5 uppercase text-[9px] tracking-wider">Conflict Free</td>
                      <td className="text-emerald-700 font-black py-2.5 text-right font-sans">Yes, 100% Certified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 10. Patron Appraisals Summary & Modal trigger */}
          <div className="bg-white border border-neutral-200/50 rounded-2xl p-5 text-left space-y-3.5 shadow-3xs">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-serif font-black text-sm text-neutral-900">Patron Appraisals</h4>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Verifiable ledger values</p>
              </div>
              <button
                onClick={() => setShowReviewsModal(true)}
                className="text-[11px] font-black text-amber-700 uppercase tracking-widest hover:text-amber-800"
              >
                View Ledger
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-xs font-black text-neutral-800">
                {reviewsList.length > 0
                  ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                  : "5.0"}
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold">({reviewsList.length} global patrons)</span>
            </div>

            <button
              onClick={() => setShowReviewsModal(true)}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Read or Write Appraisals</span>
            </button>
          </div>
        </div>

        {/* 11. Similar Masterpieces */}
        <div className="px-5 pt-8 space-y-4 text-left">
          <div className="border-b border-neutral-200 pb-3">
            <h3 className="font-serif font-black text-lg text-neutral-900 tracking-tight">Similar Masterpieces</h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Handcrafted treasure lines</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none">
            {displayRelated.map((prod) => (
              <div key={prod.id} className="w-48 flex-shrink-0">
                <ProductCard
                  product={prod}
                  onOpenDetail={() => {
                    window.scrollTo({ top: 0 });
                    onSelectProduct(prod);
                  }}
                  onOpenQuickView={() => {}}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 12. Floating Success Notifications */}
        <AnimatePresence>
          {addedNotify && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 inset-x-5 z-50 bg-emerald-950 text-emerald-100 text-xs font-bold rounded-xl py-3 px-4 shadow-lg border border-emerald-800 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Added customized creation to your bag!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 13. Fixed Bottom Action Bar (Screenshot Matching) */}
        <div className="fixed bottom-0 inset-x-0 h-[68px] bg-white border-t border-neutral-200 px-4 flex items-center justify-between gap-3.5 z-45 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          {/* Cart Icon button with dynamic badge */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("atulya_navigate", { detail: "cart" }));
            }}
            className="h-11 w-14 bg-neutral-50 active:bg-neutral-100 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative"
          >
            <div className="relative">
              <ShoppingCart className="w-4.5 h-4.5 text-neutral-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-neutral-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[7.5px] font-bold text-neutral-500 mt-0.5 uppercase tracking-wide">Cart</span>
          </button>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCartClick}
            className="flex-1 h-11 bg-[#D4AF37] hover:bg-[#B5942E] text-neutral-950 font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-neutral-950" />
            <span>Add to Cart</span>
          </button>
        </div>

        {/* 14. Reviews Overlay Modal */}
        <AnimatePresence>
          {showReviewsModal && (
            <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-end justify-center z-55 overflow-y-auto">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-h-[92vh] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden text-left border-t border-neutral-150"
              >
                {/* Modal Header */}
                <div className="bg-neutral-950 text-white px-5 py-4 flex justify-between items-center border-b border-neutral-800">
                  <div>
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">Patron Ledger</span>
                    <h3 className="font-serif font-black text-base text-white">Appraisals & Reviews</h3>
                  </div>
                  <button
                    onClick={() => setShowReviewsModal(false)}
                    className="p-1.5 bg-neutral-900 rounded-full text-neutral-400 hover:text-white"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto p-5 space-y-6 flex-1 bg-neutral-50">
                  {/* Stats card */}
                  <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center justify-between shadow-3xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Average Appraisal</span>
                      <span className="text-3xl font-black font-serif text-neutral-900 mt-1 block">
                        {reviewsList.length > 0
                          ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                          : "5.0"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Submit review */}
                  <div className="bg-white border border-neutral-200 p-5 rounded-2xl space-y-4 shadow-3xs">
                    <h4 className="font-serif font-black text-xs text-neutral-900 uppercase tracking-wide">Write Custom Appraisal</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                      <div>
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block mb-1">Select Rating Star</label>
                        <div className="flex gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-6 h-6 ${star <= newRating ? "fill-current" : "text-neutral-200"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block mb-1">Your Honest Review Message</label>
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share detail weights, polish appraisal, karigari feedback..."
                          className="w-full border border-neutral-200 rounded-xl p-3 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingReview || !newComment.trim()}
                        className="w-full py-2.5 bg-neutral-950 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-900 active:scale-98 transition-all disabled:opacity-50"
                      >
                        {isSubmittingReview ? "Registering Appraisal..." : "Submit to Public Ledger"}
                      </button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest text-left">Patron Verifications</h4>
                    {reviewsList.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic text-center py-4">No reviews registered yet. Be the first!</p>
                    ) : (
                      reviewsList.map((rev) => (
                        <div key={rev.id} className="bg-white border border-neutral-200 p-4 rounded-xl space-y-2 shadow-3xs">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full border border-neutral-200" referrerPolicy="no-referrer" />
                              <div>
                                <span className="text-xs font-black text-neutral-800 block">{rev.name}</span>
                                <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase mt-0.5 inline-block">Verified Patron</span>
                              </div>
                            </div>
                            <div className="flex gap-0.5 text-amber-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-150">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? "fill-current" : "text-neutral-200"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium italic">"{rev.text}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer close */}
                <div className="p-4 border-t border-neutral-150 bg-white">
                  <button
                    onClick={() => setShowReviewsModal(false)}
                    className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-wider rounded-xl"
                  >
                    Close Ledger
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 15. Customization Bottom Options Sheet */}
        <AnimatePresence>
          {isBottomSheetOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBottomSheetOpen(false)}
                className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
              />

              {/* Sheet Container */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="relative bg-white w-full max-h-[85vh] rounded-t-[32px] shadow-2xl flex flex-col z-10 overflow-hidden border-t border-neutral-100"
              >
                {/* Swipe/drag close indicator */}
                <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto my-3 flex-shrink-0" />

                {/* Absolute Close button */}
                <button
                  type="button"
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Mini Sheet Header info */}
                <div className="px-5 pb-4 border-b border-neutral-100 flex gap-4 items-center flex-shrink-0 text-left">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-150 flex-shrink-0">
                    <img src={product.image} alt={product.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block">Bespoke Options Customization</span>
                    <h4 className="font-serif font-black text-xs text-neutral-900 truncate leading-snug">{product.title}</h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-mono text-sm font-black text-neutral-950">
                        ₹{calculatedPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Customization Content */}
                <div className="overflow-y-auto px-5 py-4 space-y-5 flex-grow text-left">
                  {/* Metal Color Option */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">1. Select Metal Color</span>
                      <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedColor}</span>
                    </div>
                    <div className="flex gap-3">
                      {colorOptions.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedColor(col.name)}
                          className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                            selectedColor === col.name
                              ? "border-amber-400 bg-amber-50/20 text-amber-950 shadow-xs"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${col.bgClass} border border-neutral-900/10 shadow-xs`} />
                          <span>{col.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gold Purity Selector */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">2. Gold Purity Standard</span>
                      <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedPurity}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "18K", label: "18 Karat", desc: "Everyday durability" },
                        { id: "22K", label: "22 Karat", desc: "Heritage values" },
                        { id: "24K", label: "24 Karat", desc: "Investment bullion" },
                        { id: "Platinum 950", label: "Platinum", desc: "Eternal metal" }
                      ].map((pur) => (
                        <button
                          key={pur.id}
                          type="button"
                          onClick={() => setSelectedPurity(pur.id as any)}
                          className={`p-2 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            selectedPurity === pur.id
                              ? "border-amber-550 bg-amber-50/10 text-neutral-950 shadow-xs"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="font-serif font-black text-xs">{pur.label}</span>
                          <span className="text-[8px] text-neutral-450 mt-0.5 leading-none">{pur.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diamond Clarity Grade (if applicable) */}
                  {(product.material.toLowerCase() === "diamond" || product.material.toLowerCase() === "emerald") && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">3. Diamond Clarity Grade</span>
                        <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedStoneGrade} Cut</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "VVS1", title: "VVS1 Clarity" },
                          { id: "VS1", title: "VS1 Standard" },
                          { id: "SI1", title: "SI1 Value" }
                        ].map((grade) => (
                          <button
                            key={grade.id}
                            type="button"
                            onClick={() => setSelectedStoneGrade(grade.id as any)}
                            className={`py-2 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              selectedStoneGrade === grade.id
                                ? "border-amber-550 bg-amber-50/10 text-neutral-950 shadow-xs"
                                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            }`}
                          >
                            {grade.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Size Selection (Required Selection) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                        {product.category === "rings" ? "4. Select Ring Size (Required)" : product.category === "bracelets" ? "4. Select Wrist Size (Required)" : product.category === "necklaces" ? "4. Select Necklace Length (Required)" : "4. Select Fit Option (Required)"}
                      </span>
                      {selectedSize ? (
                        <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> {selectedSize}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Required</span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {getSizeOptions().map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`py-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            selectedSize === size
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                              : sizeError
                                ? "border-rose-300 bg-rose-50/50 text-rose-700 animate-pulse"
                                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                          }`}
                        >
                          {size.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                    {sizeError && (
                      <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                        <span>⚠️ Please select a required option size before adding!</span>
                      </p>
                    )}
                  </div>

                  {/* Quantity Option */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">5. Selection Quantity</span>
                      <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedQuantity} Unit{selectedQuantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-150 p-1.5 rounded-2xl w-max">
                      <button
                        type="button"
                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-750 font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer shadow-xs active:scale-95"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-xs text-neutral-900 w-6 text-center">{selectedQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-750 font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer shadow-xs active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fixed Bottom CTA inside Sheet */}
                <div className="p-4 border-t border-neutral-100 bg-white flex flex-col gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleConfirmAddToCartMobile}
                    className="w-full py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-[#B5942E] transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-neutral-950" />
                    <span>CONFIRM & ADD • ₹{(calculatedPrice * selectedQuantity).toLocaleString('en-IN')}</span>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-b from-amber-50/20 via-[#fdfdfd] to-neutral-50/50 min-h-screen pb-24 font-sans text-neutral-800"
    >
      {/* Premium Native Mobile App Sticky Header or Desktop Header */}
      {isMobile ? (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-14 px-4 flex items-center justify-between shadow-xs">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-800" />
          </button>
          
          <div className="text-center">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block font-mono">ATULYA ROYAL ARTISAN</span>
            <h1 className="font-serif font-black text-xs text-neutral-900 truncate max-w-[200px] tracking-tight">
              {product.title}
            </h1>
          </div>

          <button
            onClick={handleShareClick}
            className="w-10 h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer relative"
          >
            <Share2 className="w-4.5 h-4.5 text-neutral-700" />
            {sharedNotify && (
              <span className="absolute -bottom-8 right-0 bg-neutral-900 text-white text-[9px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                Link Copied!
              </span>
            )}
          </button>
        </div>
      ) : (
        /* 2. INLINE BACK BUTTON HEADER AREA */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
          <button
            id="back-legacy-catalog"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-black tracking-wider text-neutral-800 hover:text-amber-700 transition-all duration-300 bg-white hover:bg-amber-50/50 px-5 py-2.5 rounded-xl border border-amber-100 shadow-sm group hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO CATALOGUE</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-neutral-150">
            <span className="text-amber-600">Atulya Ateliers</span>
            <span className="text-neutral-300">•</span>
            <span>{product.material} Collection</span>
            <span className="text-neutral-300">•</span>
            <span className="text-amber-700 font-serif lowercase italic">{product.category}</span>
          </div>
        </div>
      )}

      {/* 3. ASYMMETRIC CONTRAST LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: THE SHOWCASE GALERIE (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* The Main High-End Showcase Box with Dynamic Ambient Light */}
            <div className="relative">
              {/* Dynamic shifting colored background halo */}
              <div className={`absolute -inset-2 bg-gradient-to-tr ${getLightingGlow()} rounded-[40px] blur-3xl opacity-90 -z-10 transition-all duration-1000`} />
              
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setShowLoupe(true)}
                onMouseLeave={() => setShowLoupe(false)}
                className="bg-neutral-550/5 rounded-[32px] overflow-hidden border border-amber-100/10 relative aspect-square md:h-[580px] w-full flex items-center justify-center p-6 sm:p-12 cursor-crosshair select-none group"
              >
                {/* Visual Glow Layer */}
                <div className="absolute inset-0 bg-radial-gradient from-amber-50/10 via-white to-white pointer-events-none" />

                {/* Sparkling Luster particles */}
                {sparklesList.map((sparkle) => (
                  <motion.div
                    key={sparkle.id}
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0], rotate: [0, 120, 240] }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                    style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
                    className="absolute pointer-events-none z-10"
                  >
                    <Sparkle className="w-5 h-5 text-amber-500 fill-amber-300" />
                  </motion.div>
                ))}

                <motion.img
                  key={selectedThumb}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  src={thumbnails[selectedThumb].url}
                  alt={product.title}
                  className={`w-full h-full object-contain rounded-2xl transition-all duration-700 group-hover:scale-[1.03] ${
                    thumbnails[selectedThumb].css || ""
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid Brand Tags */}
                <div className="absolute top-6 left-6 flex flex-col gap-2.5 pointer-events-none z-10">
                  {product.badge && (
                    <span className="bg-[#D4AF37] text-neutral-950 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-md border-amber-500/20 self-start">
                      {product.badge}
                    </span>
                  )}
                  <span className="bg-white/95 backdrop-blur-md text-amber-700 text-[9px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl shadow-md border border-amber-100 self-start flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Government BIS Assayed</span>
                  </span>
                </div>

                {/* Magnifier Lens bubble */}
                {showLoupe && (
                  <div 
                    style={magnifierStyle}
                    className="absolute w-52 h-52 rounded-full border-4 border-amber-400 shadow-2xl pointer-events-none z-20 overflow-hidden bg-no-repeat bg-white"
                  />
                )}

                {/* Loupe instruction block */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm text-neutral-800 text-[9px] font-black px-4 py-3 rounded-xl shadow-md border border-neutral-150 flex items-center gap-2 pointer-events-none tracking-wider">
                  <Eye className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>HOVER OVER IMAGE FOR 10X LUSTER LOUPE</span>
                </div>
              </div>
            </div>

            {/* Alternating Angle Views Carousel */}
            <div className="grid grid-cols-3 gap-4">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedThumb(idx)}
                  className={`p-3.5 rounded-2xl bg-white border text-left transition-all duration-300 cursor-pointer flex gap-3.5 items-center group relative overflow-hidden ${
                    selectedThumb === idx
                      ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/25 shadow-md"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 relative border border-neutral-150">
                    <img
                      src={thumb.url}
                      alt={thumb.name}
                      className={`w-full h-full object-contain group-hover:scale-115 transition-transform duration-500 ${thumb.css || ""}`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 pr-1">
                    <h5 className="font-sans font-black text-[11px] text-neutral-800 tracking-tight block truncate uppercase group-hover:text-amber-700 transition-colors">
                      {thumb.name}
                    </h5>
                    <p className="text-[9px] text-neutral-450 font-semibold line-clamp-1 leading-snug mt-0.5">
                      {thumb.desc}
                    </p>
                  </div>
                  {selectedThumb === idx && (
                    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-550" />
                  )}
                </button>
              ))}
            </div>

            {/* COLOR-CODED INTERACTIVE ACCORDIONS */}
            <div className="divide-y divide-neutral-200/40">
              
              {/* ACCORDION 1: SPECIFICATIONS */}
              <div className={`transition-all duration-300 border-l-4 ${openAccordion === "attributes" ? "border-amber-500 bg-amber-50/5" : "border-transparent"}`}>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "attributes" ? null : "attributes")}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-neutral-50/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-sm text-neutral-900 group-hover:text-amber-700 transition-colors">
                        Authentic Specifications & Weight Indices
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold">Detailed assay weights, purity stampings, and sizes</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${openAccordion === "attributes" ? "rotate-180 text-amber-500" : ""}`} />
                </button>

                {openAccordion === "attributes" && (
                  <div className="px-6 pb-6 pt-1 space-y-4">
                    <table className="w-full text-xs">
                      <tbody>
                        {product.attributes.map((attr, index) => (
                          <tr key={index} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 transition-colors">
                            <td className="text-neutral-400 font-extrabold py-3.5 w-1/3 uppercase text-[9px] tracking-widest">{attr.label}</td>
                            <td className="text-neutral-800 font-mono font-black py-3.5 text-right sm:text-left">{index === 0 ? `${currentWeight} grams` : attr.value}</td>
                          </tr>
                        ))}
                        <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 transition-colors">
                          <td className="text-neutral-400 font-extrabold py-3.5 uppercase text-[9px] tracking-widest">Conflict Free</td>
                          <td className="text-emerald-700 font-black py-3.5 text-right sm:text-left">Yes, 100% Certified Conflict-Free</td>
                        </tr>
                        <tr className="hover:bg-neutral-50/30 transition-colors">
                          <td className="text-neutral-400 font-extrabold py-3.5 uppercase text-[9px] tracking-widest">Buy-Back option</td>
                          <td className="text-amber-700 font-black py-3.5 text-right sm:text-left">Lifetime 100% Exchange Standard</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: DETAILED LIVE BILL OF MATERIALS */}
              <div className={`transition-all duration-300 border-l-4 ${openAccordion === "pricing" ? "border-emerald-500 bg-emerald-50/5" : "border-transparent"}`}>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "pricing" ? null : "pricing")}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-neutral-50/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-sm text-neutral-900 group-hover:text-emerald-700 transition-colors">
                        Line-Item Bill of Materials
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold">Interactive dynamic pricing, crafting, and taxes breakdown</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${openAccordion === "pricing" ? "rotate-180 text-emerald-500" : ""}`} />
                </button>

                {openAccordion === "pricing" && (
                  <div className="px-6 pb-6 pt-1 space-y-4">
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-150 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-neutral-500">
                        <span>Purity Gold Weight Valuation ({selectedPurity}):</span>
                        <span className="font-black text-neutral-800">₹{metalValuation.toLocaleString('en-IN')}</span>
                      </div>
                      {diamondStoneValuation > 0 && (
                        <div className="flex justify-between items-center text-neutral-500">
                          <span>IGI Assayed Gemstones ({selectedStoneGrade}):</span>
                          <span className="font-black text-neutral-800">₹{diamondStoneValuation.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-neutral-500">
                        <span>Generational Handcrafting Fees (12%):</span>
                        <span className="font-black text-neutral-800">₹{makingCharges.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-neutral-200/60 pt-2 flex justify-between items-center font-sans text-xs font-bold text-neutral-700">
                        <span>Subtotal before Taxation:</span>
                        <span>₹{subtotalBeforeTax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Government GST Levy (3%):</span>
                        <span>₹{dynamicGst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-amber-300 pt-2.5 flex justify-between items-center font-sans text-sm font-black text-amber-700">
                        <span>Estimated Total Rate:</span>
                        <span className="font-mono text-base">₹{calculatedPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: THE HERITAGE STORY */}
              <div className={`transition-all duration-300 border-l-4 ${openAccordion === "heritage" ? "border-indigo-500 bg-indigo-50/5" : "border-transparent"}`}>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "heritage" ? null : "heritage")}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-neutral-50/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-sm text-neutral-900 group-hover:text-indigo-700 transition-colors">
                        Our Generation Heritage & Karigari
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold">Generational craftsmanship atelier story</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${openAccordion === "heritage" ? "rotate-180 text-indigo-500" : ""}`} />
                </button>

                {openAccordion === "heritage" && (
                  <div className="px-6 pb-6 pt-1 space-y-3.5 text-xs text-neutral-600 leading-relaxed font-medium">
                    <p className="italic font-serif text-neutral-500 text-center py-2.5 px-4 bg-amber-50/40 rounded-xl border border-amber-100">
                      "Each jewelry piece we dispatch carries the dedication of four generations of traditional Indian Karigars (craftsmen) combined with advanced holographic diagnostic checks."
                    </p>
                    <p>
                      Individually designed at our flagship Delhi atelier, our jewelry matches classical architectural geometry with modern comfort. Every diamond facet is analyzed under strict laboratory conditions to secure optimal sparkle index levels.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: REIMAGINED BESPOKE DESIGN CONTROLS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[120px]">
            
            {/* The Majestic White-and-Gold Bespoke Panel */}
            <div className="space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent pointer-events-none" />

              {/* Title & Badge */}
              <div className="space-y-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/50 text-amber-700 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Atulya Royal Handcraft Premium</span>
                </span>

                <h1 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900 leading-snug tracking-tight">
                  {product.title}
                </h1>

                <button 
                  onClick={() => setShowReviewsModal(true)}
                  className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-left cursor-pointer hover:opacity-90 transition-opacity outline-none"
                  title="Open Verifiable Appraisal Ledger"
                >
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < product.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                    ))}
                  </div>
                  <span className="font-extrabold text-neutral-900">{product.rating.toFixed(1)}</span>
                  <span className="text-neutral-250">|</span>
                  <span className="text-amber-800 font-extrabold hover:text-amber-600 hover:underline transition-colors">
                    {reviewsList.length > 0 ? reviewsList.length : product.ratingCount} Patron Reviews
                  </span>
                  <span className="text-neutral-250">|</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{product.sold} Sold</span>
                </button>
              </div>

              {/* VIBRANT PRICING CARD (SOLID PREMIUM DARK GOLD ACCENT) */}
              <div className="bg-neutral-950 border border-neutral-850 text-white p-5.5 rounded-2xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <span className="text-[9px] text-gold-dark font-black block uppercase tracking-[0.18em] mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-gold-dark animate-pulse" />
                    <span>Locked Indian Gold Price</span>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-white">
                      ₹{calculatedPrice.toLocaleString('en-IN')}
                    </span>
                    {oldCalculatedPrice && (
                      <span className="font-mono text-xs sm:text-sm text-neutral-500 line-through">
                        ₹{oldCalculatedPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-neutral-450 block mt-1.5 font-medium">Synced with today's 22K/24K Bullion rates</span>
                </div>

                {discount > 0 && (
                  <div className="absolute right-4 top-4 bg-gold text-neutral-950 font-black text-[10px] px-2.5 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Handcraft Narrative Description */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block border-b border-neutral-100 pb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-450" />
                  <span>Artisan Narrative Description</span>
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans font-medium">
                  {product.description}
                </p>
              </div>

              {/* OPTIONS RADIO SELECTION CARDS WITH BEAUTIFUL LUXURIOUS PASTEL GRADIENTS */}
              {!isMobile && (
                <>
                  <div className="space-y-5 pt-3 border-t border-neutral-150">
                    
                    {/* Gold Purity Grid */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] sm:text-xs font-black text-neutral-800 uppercase tracking-[0.15em] flex items-center gap-1.5">
                          <Gem className="w-3.5 h-3.5 text-amber-600" />
                          <span>Select Option</span>
                        </h4>
                        <span className="text-[9px] font-bold text-amber-700 font-mono uppercase bg-amber-50 px-2 py-0.5 rounded">
                          {selectedPurity} Standard
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "18K", label: "18 Karat", desc: "Everyday solid durability", color: "hover:border-rose-300 hover:bg-rose-50/10", activeColor: "border-rose-450 bg-gradient-to-br from-rose-50/50 via-rose-50/10 to-transparent text-rose-950 shadow-xs ring-1 ring-rose-500/10" },
                          { id: "22K", label: "22 Karat", desc: "Generational traditional value", color: "hover:border-amber-300 hover:bg-amber-50/10", activeColor: "border-amber-450 bg-gradient-to-br from-amber-50/50 via-amber-50/10 to-transparent text-amber-950 shadow-xs ring-1 ring-amber-500/10" },
                          { id: "24K", label: "24 Karat", desc: "Pure investment grade bullion", color: "hover:border-orange-300 hover:bg-orange-50/10", activeColor: "border-orange-450 bg-gradient-to-br from-orange-50/50 via-orange-50/10 to-transparent text-orange-950 shadow-xs ring-1 ring-orange-500/10" },
                          { id: "Platinum 950", label: "Platinum", desc: "Premium rare eternal metal", color: "hover:border-indigo-300 hover:bg-indigo-50/10", activeColor: "border-indigo-450 bg-gradient-to-br from-indigo-50/50 via-indigo-50/10 to-transparent text-indigo-950 shadow-xs ring-1 ring-indigo-500/10" }
                        ].map((pur) => (
                          <button
                            key={pur.id}
                            type="button"
                            onClick={() => setSelectedPurity(pur.id as any)}
                            className={`p-3 text-left rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                              selectedPurity === pur.id
                                ? pur.activeColor
                                : `border-neutral-200 text-neutral-550 bg-white ${pur.color}`
                            }`}
                          >
                            <span className="font-serif font-black text-xs block">
                              {pur.label}
                            </span>
                            <span className="block text-[8px] text-neutral-450 group-hover:text-neutral-600 mt-1 leading-normal font-semibold">
                              {pur.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SGL/IGI Diamond Cut & Clarity Custom Radio Selector */}
                    {(product.material.toLowerCase() === "diamond" || product.material.toLowerCase() === "emerald") && (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] sm:text-xs font-black text-neutral-800 uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            <span>Diamond Assayed Clarity Grade</span>
                          </h4>
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                            {selectedStoneGrade} Elite Cut
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: "VVS1", title: "VVS1 Clarity", desc: "Perfect sparkles", activeColor: "border-indigo-450 bg-indigo-50/30 text-indigo-950 ring-1 ring-indigo-500/10" },
                            { id: "VS1", title: "VS1 Standard", desc: "Brilliant luster", activeColor: "border-emerald-450 bg-emerald-50/30 text-emerald-950 ring-1 ring-emerald-500/10" },
                            { id: "SI1", title: "SI1 Value", desc: "Best pricing option", activeColor: "border-amber-450 bg-amber-50/30 text-amber-950 ring-1 ring-amber-500/10" }
                          ].map((grade) => (
                            <button
                              key={grade.id}
                              type="button"
                              onClick={() => setSelectedStoneGrade(grade.id as any)}
                              className={`p-2.5 text-left rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                selectedStoneGrade === grade.id
                                  ? grade.activeColor
                                  : "border-neutral-200 text-neutral-550 hover:border-neutral-400 bg-white"
                              }`}
                            >
                              <div>
                                <span className="block font-black text-xs">{grade.id}</span>
                                <span className="block text-[8px] text-neutral-450 font-bold truncate mt-0.5">{grade.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Select Options Feature */}
                    {((product.customOptionLabel && product.customOptionValues) ||
                      (product.customOptionLabel2 && product.customOptionValues2) ||
                      (product.customOptionLabel3 && product.customOptionValues3)) && (
                      <div className="space-y-3.5 pt-3 border-t border-neutral-150">
                        {/* Option 1 */}
                        {product.customOptionLabel && product.customOptionValues && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] sm:text-xs font-black text-neutral-800 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                <Gem className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>{product.customOptionLabel}</span>
                              </h4>
                              {selectedCustomOption ? (
                                <span className="text-[9px] font-bold text-emerald-700 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded">
                                  {selectedCustomOption}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-rose-600 font-mono uppercase bg-rose-50 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <select
                                value={selectedCustomOption}
                                onChange={(e) => {
                                  setSelectedCustomOption(e.target.value);
                                  setCustomOptionError(false);
                                }}
                                className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none transition-all cursor-pointer shadow-xs ${
                                  customOptionError 
                                    ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                                    : "border-neutral-200 focus:border-amber-500 text-slate-800"
                                }`}
                              >
                                <option value="">-- Choose {product.customOptionLabel} --</option>
                                {product.customOptionValues.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                            {customOptionError && (
                              <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                                <span>⚠️ Please choose a {product.customOptionLabel} before adding to bag!</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Option 2 */}
                        {product.customOptionLabel2 && product.customOptionValues2 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] sm:text-xs font-black text-neutral-800 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                <Gem className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>{product.customOptionLabel2}</span>
                              </h4>
                              {selectedCustomOption2 ? (
                                <span className="text-[9px] font-bold text-emerald-700 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded">
                                  {selectedCustomOption2}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-rose-600 font-mono uppercase bg-rose-50 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <select
                                value={selectedCustomOption2}
                                onChange={(e) => {
                                  setSelectedCustomOption2(e.target.value);
                                  setCustomOptionError2(false);
                                }}
                                className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none transition-all cursor-pointer shadow-xs ${
                                  customOptionError2 
                                    ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                                    : "border-neutral-200 focus:border-amber-500 text-slate-800"
                                }`}
                              >
                                <option value="">-- Choose {product.customOptionLabel2} --</option>
                                {product.customOptionValues2.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                            {customOptionError2 && (
                              <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                                <span>⚠️ Please choose a {product.customOptionLabel2} before adding to bag!</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Option 3 */}
                        {product.customOptionLabel3 && product.customOptionValues3 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] sm:text-xs font-black text-neutral-800 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                <Gem className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>{product.customOptionLabel3}</span>
                              </h4>
                              {selectedCustomOption3 ? (
                                <span className="text-[9px] font-bold text-emerald-700 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded">
                                  {selectedCustomOption3}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-rose-600 font-mono uppercase bg-rose-50 px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <select
                                value={selectedCustomOption3}
                                onChange={(e) => {
                                  setSelectedCustomOption3(e.target.value);
                                  setCustomOptionError3(false);
                                }}
                                className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none transition-all cursor-pointer shadow-xs ${
                                  customOptionError3 
                                    ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                                    : "border-neutral-200 focus:border-amber-500 text-slate-800"
                                }`}
                              >
                                <option value="">-- Choose {product.customOptionLabel3} --</option>
                                {product.customOptionValues3.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                            {customOptionError3 && (
                              <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                                <span>⚠️ Please choose a {product.customOptionLabel3} before adding to bag!</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active Selection Details Strip */}
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-150 text-[10px] text-neutral-500 leading-normal flex flex-col gap-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Gold/Plat Weight Estimate:</span>
                      <span className="font-bold text-neutral-800">{currentWeight} grams</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected Metal Purity:</span>
                      <span className="font-bold text-neutral-800">{selectedPurity}</span>
                    </div>
                    {(product.material.toLowerCase() === "diamond" || product.material.toLowerCase() === "emerald") && (
                      <div className="flex justify-between">
                        <span>Stone Clarity Stamp:</span>
                        <span className="font-bold text-neutral-800">{selectedStoneGrade} Cut</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Bespoke Action CTA Buttons */}
              <div className="space-y-3 pt-3 border-t border-neutral-150">
                <div className="flex gap-3">
                  <button
                    id="add-bag-premium-page"
                    onClick={handleAddToCartClick}
                    className="flex-1 py-4.5 rounded-xl bg-[#D4AF37] hover:bg-[#B5942E] text-neutral-950 font-black text-xs tracking-wider flex items-center justify-center gap-3 shadow-md transition-all hover:translate-y-[-1px] cursor-pointer group"
                  >
                    <ShoppingCart className="w-4 h-4 text-neutral-950 group-hover:scale-110 transition-transform" />
                    <span>ADD TO SHOPPING BAG</span>
                  </button>
                  
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`px-4.5 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isWishlisted 
                        ? "border-red-500/50 bg-red-50 text-red-500 shadow-inner" 
                        : "border-neutral-200 text-neutral-400 hover:border-red-300 hover:bg-neutral-50"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                  </button>

                  <button
                    onClick={handleShareClick}
                    className={`px-4.5 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      sharedNotify
                        ? "border-emerald-500/50 bg-emerald-50 text-emerald-600 shadow-inner"
                        : "border-neutral-200 text-neutral-400 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                    title="Share Product"
                  >
                    {sharedNotify ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {addedNotify && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex items-center justify-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                      <span className="font-bold">Added customized creation to your luxury bag!</span>
                    </motion.div>
                  )}
                  {sharedNotify && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex items-center justify-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl py-3 px-4 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-amber-600 animate-bounce" />
                      <span className="font-bold">Shareable product link copied to clipboard!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust banner */}
              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.15em] block">Atulya Heritage Guarantee</span>
                  <p className="text-[10px] text-emerald-800/85 leading-normal font-semibold">
                    Fully insured courier transit cases with real-time GPS locks. 100% money-back verification guaranteed.
                  </p>
                </div>
              </div>

              {/* Interactive Reviews Popup Trigger Card */}
              <div 
                onClick={() => setShowReviewsModal(true)}
                className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10 border border-amber-500/20 hover:border-amber-500/35 p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group shadow-xs"
              >
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-white text-gold-dark border border-amber-250 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Verifiable Appraisals</span>
                    <span className="text-xs font-serif font-black text-neutral-900 group-hover:text-amber-850 transition-colors">
                      Open Patron Ledger & Write Review
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500 font-bold">
                      <div className="flex text-amber-500 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span>({reviewsList.length > 0 ? reviewsList.length : product.ratingCount} evaluations)</span>
                    </div>
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-full border border-neutral-100 group-hover:border-amber-300 group-hover:bg-amber-50 text-amber-700 transition-all flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 3.5. ATULYA ROYAL DESIGN ETHICS & CERTIFICATIONS */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-20 pt-16 border-t border-neutral-150/75">
        <div className="space-y-1 pb-8 border-b border-neutral-100 text-center sm:text-left">
          <span className="text-[10px] font-black text-gold-dark uppercase tracking-[0.2em] block">Sovereign Assurances</span>
          <h3 className="font-serif font-black text-2xl md:text-3xl text-neutral-900 tracking-tight">
            Craftsmanship & Verifiably Certified Standards
          </h3>
          <p className="text-xs text-neutral-400 font-semibold font-sans">
            Every creation at Atulya is backed by strict state certification, ethical mining codes, and insured doorstep dispatch.
          </p>
        </div>

        {/* Assurances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <div className="bg-white border border-neutral-150 p-6 rounded-3xl hover:border-amber-300 transition-all duration-300 group shadow-xs">
            <div className="p-3 bg-amber-500/10 text-amber-800 rounded-2xl w-max border border-amber-500/10 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-gold-dark" />
            </div>
            <h4 className="font-serif font-black text-sm text-neutral-900 mt-4">BIS Hallmark Engraved</h4>
            <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
              Every jewelry piece bears a microscopic Govt of India BIS hallmark & laser-etched HUID code. Verify its pure metal alloy purity instantly at any registry.
            </p>
          </div>

          <div className="bg-white border border-neutral-150 p-6 rounded-3xl hover:border-emerald-300 transition-all duration-300 group shadow-xs">
            <div className="p-3 bg-emerald-500/10 text-emerald-800 rounded-2xl w-max border border-emerald-500/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-black text-sm text-neutral-900 mt-4">100% Conflict-Free Alloys</h4>
            <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
              We operate strictly under Kimberley Process requirements. All diamonds, platinum, and gold inputs are ethically sourced and certified conflict-free.
            </p>
          </div>

          <div className="bg-white border border-neutral-150 p-6 rounded-3xl hover:border-indigo-300 transition-all duration-300 group shadow-xs">
            <div className="p-3 bg-indigo-500/10 text-indigo-800 rounded-2xl w-max border border-indigo-500/10 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-black text-sm text-neutral-900 mt-4">Bespoke Karigar Heritage</h4>
            <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
              Hand-designed at our Delhi atelier by 4th-generation master karigars (artisans). Blending classical geometry and filigree styles with modern durability.
            </p>
          </div>

          <div className="bg-white border border-neutral-150 p-6 rounded-3xl hover:border-orange-300 transition-all duration-300 group shadow-xs">
            <div className="p-3 bg-orange-500/10 text-orange-800 rounded-2xl w-max border border-orange-500/10 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-serif font-black text-sm text-neutral-900 mt-4">Insured Doorstep Transit</h4>
            <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
              Secure specialized courier casing with automated GPS transit tracking. Your gold parcel is 100% insured from our vault to your secure doorstep.
            </p>
          </div>
        </div>

        {/* Central reviews summary banner inside the page flow */}
        <div className="bg-[#FAF8F5] border border-neutral-150 rounded-3xl p-6 md:p-8 mt-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="flex justify-center md:justify-start items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs font-black text-neutral-800 ml-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                {reviewsList.length > 0
                  ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                  : "5.0"}{" "}
                / 5.0
              </span>
            </div>
            <h4 className="font-serif font-black text-lg text-neutral-900">
              Sovereign Appraisals Ledger is Fully Public
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              We believe in unvarnished transparency. Explore all unedited, certified reviews, weight verifications, and custom karigari ratings left by our global collectors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setShowReviewsModal(true)}
              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-gold" />
              <span>Read All Appraisals ({reviewsList.length > 0 ? reviewsList.length : product.ratingCount})</span>
            </button>
            <button
              onClick={() => {
                setShowReviewsModal(true);
                // Wait for state to change then focus on review input or form
              }}
              className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-900 font-black text-xs uppercase tracking-wider rounded-xl border border-neutral-200 transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-neutral-500" />
              <span>Submit Your Appraisal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3.5. BOUTIQUE REVIEW SYSTEM MODAL POPUP */}
      <AnimatePresence>
        {showReviewsModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-neutral-950 text-white p-6 flex justify-between items-center relative border-b border-neutral-800">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] block">Verified Customer Voice</span>
                  <h3 className="font-serif font-black text-xl text-white tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold animate-pulse" />
                    <span>Patron Reviews & Royal Appraisals</span>
                  </h3>
                </div>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 bg-neutral-50/50">
                
                {/* Statistics Overview & Write Review Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left block: Statistics */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 text-center space-y-3 shadow-xs">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Average Satisfaction</span>
                      <div className="flex justify-center items-baseline gap-1">
                        <span className="font-serif font-black text-5xl text-neutral-900">
                          {reviewsList.length > 0
                            ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
                            : "5.0"}
                        </span>
                        <span className="text-neutral-400 text-sm font-semibold">/ 5.0</span>
                      </div>
                      <div className="flex justify-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 block">
                        Based on {reviewsList.length} global appraisals
                      </span>
                    </div>

                    {/* Rating distribution */}
                    <div className="space-y-2.5 bg-white border border-neutral-200/80 p-5 rounded-2xl shadow-xs">
                      <h4 className="text-[10px] font-black text-neutral-800 uppercase tracking-wider text-left">Rating Distribution</h4>
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviewsList.filter(r => Number(r.rating) === stars).length;
                          const percentage = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : stars === 5 ? 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2 text-xs">
                              <span className="w-3 font-bold text-neutral-600 text-left">{stars}</span>
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-current flex-shrink-0" />
                              <div className="flex-grow h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gold rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-6 text-right font-mono text-neutral-400 font-semibold">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Form to write a review */}
                  <div className="lg:col-span-7">
                    <div className="bg-neutral-950 border border-neutral-900 text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-md relative overflow-hidden">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] block">
                          Signature Contribution
                        </span>
                        <h4 className="font-serif font-black text-lg text-white tracking-tight">
                          Write Your Appraisal
                        </h4>
                        <p className="text-[11px] text-neutral-450 leading-relaxed">
                          Share your design insights and boutique experience with our global collectors pool.
                        </p>
                      </div>

                      <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
                        {/* Auth banner */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-850">
                          <div className="flex items-center gap-2.5">
                            {currentUser ? (
                              <>
                                <img 
                                  src={currentUser.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} 
                                  alt={currentUser.name} 
                                  className="w-8 h-8 rounded-full border border-gold/30 object-cover"
                                />
                                <div className="text-left">
                                  <span className="text-[11px] font-bold text-white block">{currentUser.name}</span>
                                  <span className="text-[9px] font-mono text-neutral-400 block">{currentUser.email}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <span className="text-[11px] font-bold text-white block">Guest Patron Session</span>
                                  <span className="text-[9px] text-neutral-450 block">Logged as guest contributor</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {!currentUser && onTriggerLogin && (
                            <button
                              type="button"
                              onClick={onTriggerLogin}
                              className="text-[9px] bg-gold/15 hover:bg-gold/25 text-gold font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gold/20 transition-all cursor-pointer w-full sm:w-auto"
                            >
                              Login
                            </button>
                          )}
                        </div>

                        {/* Rating stars select */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-neutral-300 uppercase tracking-widest block">
                            Your Satisfaction Score
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                type="button"
                                onClick={() => setNewRating(stars)}
                                className="text-neutral-600 hover:scale-110 active:scale-95 transition-all outline-none cursor-pointer"
                              >
                                <Star 
                                  className={`w-5 h-5 ${
                                    stars <= newRating 
                                      ? "text-gold fill-gold" 
                                      : "text-neutral-700 hover:text-neutral-500"
                                  }`} 
                                />
                              </button>
                            ))}
                            <span className="text-[10px] font-bold text-gold ml-2 uppercase tracking-wide">
                              {newRating === 5 ? "Majestic Standard" :
                               newRating === 4 ? "Excellent Quality" :
                               newRating === 3 ? "Certified & Beautiful" :
                               newRating === 2 ? "Aesthetic Gap" : "Poor Standard"}
                            </span>
                          </div>
                        </div>

                        {/* Text comment */}
                        <div className="space-y-1">
                          <textarea
                            rows={3}
                            maxLength={1000}
                            required
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Describe the jewelry design luster, hallmarking stamp, and presentation box..."
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold/40 transition-all resize-none font-sans"
                          />
                        </div>

                        {/* Submit button & alerts */}
                        <div className="space-y-2">
                          {reviewError && (
                            <p className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
                              {reviewError}
                            </p>
                          )}
                          {reviewSuccess && (
                            <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Review published successfully!</span>
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={isSubmittingReview || !newComment.trim()}
                            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-neutral-950 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isSubmittingReview ? (
                              <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                                <span>Publishing...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Publish Appraisal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                </div>

                {/* Reviews List Ledger */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-widest border-b border-neutral-200 pb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Active Appraisals Ledger ({reviewsList.length})</span>
                  </h4>

                  {isLoadingReviews ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-white border border-neutral-200/70 rounded-2xl p-5 flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-200" />
                          <div className="flex-grow space-y-2">
                            <div className="h-3 bg-neutral-200 rounded w-1/4" />
                            <div className="h-2 bg-neutral-200 rounded w-1/6" />
                            <div className="h-3 bg-neutral-200 rounded w-5/6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviewsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewsList.map((review) => (
                        <div 
                          key={review.id} 
                          className="bg-white border border-neutral-200 hover:border-gold/30 rounded-2xl p-5 space-y-3 shadow-xs transition-all relative overflow-hidden text-left"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2.5">
                              <img 
                                referrerPolicy="no-referrer"
                                src={review.avatar} 
                                alt={review.name} 
                                className="w-9 h-9 rounded-full object-cover border border-gold/15 bg-neutral-50"
                              />
                              <div className="text-left">
                                <span className="text-xs font-bold text-neutral-800 block">{review.name}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[8px] bg-emerald-50 text-emerald-750 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                    Verified Patron
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-mono font-bold">{review.date}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-0.5 text-amber-500 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-200/55">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star 
                                  key={idx} 
                                  className={`w-2.5 h-2.5 ${idx < Number(review.rating) ? "fill-current" : "text-neutral-200"}`} 
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-neutral-600 text-xs leading-relaxed font-sans font-medium italic">
                            "{review.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-neutral-300 space-y-2">
                      <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-neutral-800">No Appraisals Registered Yet</p>
                      <p className="text-[10px] text-neutral-400 max-w-xs mx-auto">
                        Be the first royal patron to publish a certified review and comment on this masterpiece.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setShowReviewsModal(false)}
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-all active:scale-[0.98]"
                >
                  Dismiss Ledger
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. HORIZONTAL COLLECTION SLIDER */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 border-b border-neutral-200 pb-4 gap-3">
          <div>
            <h3 className="font-serif font-black text-xl text-neutral-900 tracking-tight">Masterpieces of Similar Pedigree</h3>
            <p className="text-xs text-neutral-400 font-semibold">Handcrafted treasures designed to match the same majestic collection standards</p>
          </div>
          <div className="text-xs font-black text-amber-700 tracking-wider uppercase flex items-center gap-2 cursor-pointer hover:text-amber-800 transition-colors">
            <span>Explore All Masterpieces</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-amber-600" />
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-6 overflow-x-auto pb-6 pt-1 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          {displayRelated.map((prod) => (
            <div key={prod.id} className="w-64 flex-shrink-0">
              <ProductCard
                product={prod}
                onOpenDetail={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  onSelectProduct(prod);
                }}
                onOpenQuickView={() => {}}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
    </div>

    {/* MOBILE APP-LIKE FIXED BOTTOM BAR */}
    {isMobile && (
      <div className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-neutral-150 px-4 flex items-center justify-between gap-3 z-45 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isWishlisted 
              ? "border-red-500 bg-red-50 text-red-500 shadow-inner" 
              : "border-neutral-200 bg-white text-neutral-450 hover:bg-neutral-50"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        <button
          type="button"
          onClick={handleAddToCartClick}
          className="flex-grow h-12 bg-neutral-900 text-white font-extrabold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
        >
          <ShoppingCart className="w-4 h-4 text-amber-400" />
          <span>ADD TO SHOPPING BAG</span>
        </button>
      </div>
    )}

    {/* MOBILE & DESKTOP NATIVE APP CUSTOMIZATION SHEET/MODAL */}
    <AnimatePresence>
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBottomSheetOpen(false)}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />

          {/* Sheet/Modal Container */}
          <motion.div
            initial={{ y: isMobile ? "100%" : 20, opacity: isMobile ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isMobile ? "100%" : 20, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="relative bg-white w-full md:max-w-md max-h-[85vh] md:max-h-[90vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden border border-neutral-100"
          >
            {/* Swipe/drag close indicator */}
            <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto my-3 flex-shrink-0 md:hidden" />

            {/* Absolute Close button */}
            <button
              type="button"
              onClick={() => setIsBottomSheetOpen(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mini Sheet Header info */}
            <div className="px-5 pb-4 border-b border-neutral-100 flex gap-4 items-center flex-shrink-0 text-left">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-150 flex-shrink-0">
                <img src={product.image} alt={product.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block">Bespoke Options Customization</span>
                <h4 className="font-serif font-black text-xs text-neutral-900 truncate leading-snug">{product.title}</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono text-sm font-black text-neutral-950">
                    ₹{calculatedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Customization Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-grow text-left">
              {/* Metal Color Option */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">1. Select Metal Color</span>
                  <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {colorOptions.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col.name)}
                      className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                        selectedColor === col.name 
                          ? "border-amber-400 bg-amber-50/20 text-amber-950 shadow-xs" 
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${col.bgClass} border border-neutral-900/10 shadow-xs`} />
                      <span>{col.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gold Purity Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">2. Select Option</span>
                  <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedPurity}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "18K", label: "18 Karat", desc: "Everyday durability" },
                    { id: "22K", label: "22 Karat", desc: "Heritage values" },
                    { id: "24K", label: "24 Karat", desc: "Investment bullion" },
                    { id: "Platinum 950", label: "Platinum", desc: "Eternal metal" }
                  ].map((pur) => (
                    <button
                      key={pur.id}
                      type="button"
                      onClick={() => setSelectedPurity(pur.id as any)}
                      className={`p-2 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedPurity === pur.id
                          ? "border-amber-550 bg-amber-50/10 text-neutral-950 shadow-xs"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="font-serif font-black text-xs">{pur.label}</span>
                      <span className="text-[8px] text-neutral-450 mt-0.5 leading-none">{pur.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diamond Clarity Grade (if applicable) */}
              {(product.material.toLowerCase() === "diamond" || product.material.toLowerCase() === "emerald") && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">3. Diamond Clarity Grade</span>
                    <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedStoneGrade} Cut</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "VVS1", title: "VVS1 Clarity" },
                      { id: "VS1", title: "VS1 Standard" },
                      { id: "SI1", title: "SI1 Value" }
                    ].map((grade) => (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => setSelectedStoneGrade(grade.id as any)}
                        className={`py-2 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          selectedStoneGrade === grade.id
                            ? "border-amber-550 bg-amber-50/10 text-neutral-950 shadow-xs"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {grade.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Size Selection (Required Selection) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                    {product.category === "rings" ? "4. Select Ring Size (Required)" : product.category === "bracelets" ? "4. Select Wrist Size (Required)" : product.category === "necklaces" ? "4. Select Necklace Length (Required)" : "4. Select Fit Option (Required)"}
                  </span>
                  {selectedSize ? (
                    <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> {selectedSize}
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Required</span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {getSizeOptions().map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`py-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                          : sizeError 
                            ? "border-rose-300 bg-rose-50/50 text-rose-700 animate-pulse"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {size.split(" ")[0]}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <span>⚠️ Please select a required option size before adding!</span>
                  </p>
                )}
              </div>

              {/* Custom Selector Steps in Bottom Sheet */}
              {((product.customOptionLabel && product.customOptionValues) ||
                (product.customOptionLabel2 && product.customOptionValues2) ||
                (product.customOptionLabel3 && product.customOptionValues3)) && (
                <div className="space-y-4">
                  {/* Option 1 */}
                  {product.customOptionLabel && product.customOptionValues && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                          {product.customOptionLabel} (Required)
                        </span>
                        {selectedCustomOption ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> {selectedCustomOption}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Required</span>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          value={selectedCustomOption}
                          onChange={(e) => {
                            setSelectedCustomOption(e.target.value);
                            setCustomOptionError(false);
                          }}
                          className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none text-slate-800 transition-all cursor-pointer shadow-xs ${
                            customOptionError 
                              ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                              : "border-neutral-200 focus:border-amber-500"
                          }`}
                        >
                          <option value="">-- Choose {product.customOptionLabel} --</option>
                          {product.customOptionValues.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                      {customOptionError && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                          <span>⚠️ Please choose a {product.customOptionLabel} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Option 2 */}
                  {product.customOptionLabel2 && product.customOptionValues2 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                          {product.customOptionLabel2} (Required)
                        </span>
                        {selectedCustomOption2 ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> {selectedCustomOption2}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Required</span>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          value={selectedCustomOption2}
                          onChange={(e) => {
                            setSelectedCustomOption2(e.target.value);
                            setCustomOptionError2(false);
                          }}
                          className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none text-slate-800 transition-all cursor-pointer shadow-xs ${
                            customOptionError2 
                              ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                              : "border-neutral-200 focus:border-amber-500"
                          }`}
                        >
                          <option value="">-- Choose {product.customOptionLabel2} --</option>
                          {product.customOptionValues2.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                      {customOptionError2 && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                          <span>⚠️ Please choose a {product.customOptionLabel2} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Option 3 */}
                  {product.customOptionLabel3 && product.customOptionValues3 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                          {product.customOptionLabel3} (Required)
                        </span>
                        {selectedCustomOption3 ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> {selectedCustomOption3}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">Required</span>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          value={selectedCustomOption3}
                          onChange={(e) => {
                            setSelectedCustomOption3(e.target.value);
                            setCustomOptionError3(false);
                          }}
                          className={`w-full bg-white border rounded-xl p-3 text-xs font-bold focus:outline-none text-slate-800 transition-all cursor-pointer shadow-xs ${
                            customOptionError3 
                              ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse font-bold" 
                              : "border-neutral-200 focus:border-amber-500"
                          }`}
                        >
                          <option value="">-- Choose {product.customOptionLabel3} --</option>
                          {product.customOptionValues3.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                      {customOptionError3 && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                          <span>⚠️ Please choose a {product.customOptionLabel3} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Option */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">5. Selection Quantity</span>
                  <span className="text-[10px] font-extrabold text-neutral-800 font-mono">{selectedQuantity} Unit{selectedQuantity > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-150 p-1.5 rounded-2xl w-max">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-750 font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer shadow-xs active:scale-95"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-xs text-neutral-900 w-6 text-center">{selectedQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-750 font-bold flex items-center justify-center hover:bg-neutral-100 cursor-pointer shadow-xs active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Fixed Bottom CTA inside Sheet */}
            <div className="p-4 border-t border-neutral-100 bg-white flex flex-col gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleConfirmAddToCartMobile}
                className="w-full py-3.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-[#B5942E] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-neutral-950" />
                <span>CONFIRM & ADD • ₹{(calculatedPrice * selectedQuantity).toLocaleString('en-IN')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </motion.div>
);
}
