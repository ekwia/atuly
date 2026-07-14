import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Sparkles,
  Calculator,
  ChevronRight,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Grid,
  List,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  Package,
  LogOut,
  Home,
  ArrowLeft,
  Crown,
  Gem
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { products, reviews } from "./data";
import { Product, CartItem, GoldRate, User, Order } from "./types";
import { 
  getProductsFromDB, 
  getOrdersFromDB, 
  saveProductToDB, 
  deleteProductFromDB, 
  addOrderToDB, 
  updateOrderStatusInDB, 
  updateOrderPaymentStatusInDB,
  auth
} from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import ProductCard from "./components/ProductCard";
import GoldCalculator from "./components/GoldCalculator";
import AIConsultant from "./components/AIConsultant";
import ProductDetailModal from "./components/ProductDetailModal";
import ProductDetailPage from "./components/ProductDetailPage";
import CheckoutPage from "./components/CheckoutPage";
import SearchPage from "./components/SearchPage";
import CategoryPage from "./components/CategoryPage";
import CartPage from "./components/CartPage";
import UserProfilePage from "./components/UserProfilePage";
import LoginModal from "./components/LoginModal";
import AdminPage from "./components/AdminPage";
import OrderTracker from "./components/OrderTracker";

const categoryMetadata: Record<string, { image: string; displayName: string }> = {
  all: {
    displayName: "All Masterpieces",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=150&h=150&q=80"
  },
  coins: {
    displayName: "Pure Coins",
    image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=150&h=150&q=80"
  },
  rings: {
    displayName: "Deluxe Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  pendants: {
    displayName: "Royal Pendants",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&h=150&q=80"
  },
  earrings: {
    displayName: "Fine Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=150&h=150&q=80"
  },
  bracelets: {
    displayName: "Luxury Bracelets",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=150&h=150&q=80"
  },
  necklaces: {
    displayName: "Bridal Necklaces",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=150&h=150&q=80"
  }
};

export default function App() {
  // Navigation & Page views
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'search' | 'category' | 'cart' | 'admin' | 'calculator' | 'consultant' | 'profile'>('home');
  const [selectedCategoryPage, setSelectedCategoryPage] = useState<string>("coins");
  const [selectedCategoryBadge, setSelectedCategoryBadge] = useState<string>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBanner, setActiveBanner] = useState<'sale' | 'trending' | 'new'>('sale');
  
  // Modals & States
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [consultantOpen, setConsultantOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [trackOrdersOpen, setTrackOrdersOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("atulya_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || "").toLowerCase().trim();
        const isAtulyaDomain = email.endsWith("@atulyagold.com");
        const isAdminEmail = email === "vaidwanprince@gmail.com" || email === "videads@gmail.com" || email === "atulygold333@gmail.com";
        const isAdmin = isAtulyaDomain || isAdminEmail;

        try {
          const { getUserProfileFromDB, saveUserProfileToDB } = await import("./firebase");
          let userProfile = await getUserProfileFromDB(firebaseUser.uid);
          
          if (!userProfile) {
            userProfile = {
              name: firebaseUser.displayName || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
              email: email,
              picture: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
              role: isAdmin ? "admin" : "user"
            };
            await saveUserProfileToDB(firebaseUser.uid, userProfile);
          }
          
          setCurrentUser(userProfile);
          localStorage.setItem("atulya_user", JSON.stringify(userProfile));
        } catch (err) {
          console.error("Error synchronizing user profile with DB:", err);
          const user: User = {
            name: firebaseUser.displayName || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
            email: email,
            picture: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            role: isAdmin ? "admin" : "user"
          };
          setCurrentUser(user);
          localStorage.setItem("atulya_user", JSON.stringify(user));
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("atulya_user");
      }
    });
    return () => unsubscribe();
  }, []);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_orders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Dynamic products state (to support administrative add/delete)
  const [productsState, setProductsState] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_products");
      return stored ? JSON.parse(stored) : products;
    } catch {
      return products;
    }
  });

  // Load products from Firestore on mount with background sync
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      try {
        const dbProducts = await getProductsFromDB();
        if (active && dbProducts && dbProducts.length > 0) {
          setProductsState(dbProducts);
        }
      } catch (err) {
        console.error("Failed to load products from Firestore on startup:", err);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  // Sync selectedProduct with URL parameter and handle back/forward browser navigation
  useEffect(() => {
    const parseUrlProduct = () => {
      const params = new URLSearchParams(window.location.search);
      const productIdParam = params.get("product");
      if (productIdParam) {
        const pId = parseInt(productIdParam, 10);
        const found = productsState.find(p => p.id === pId);
        if (found) {
          setSelectedProduct(found);
        } else {
          setSelectedProduct(null);
        }
      } else {
        setSelectedProduct(null);
      }
    };

    // Parse on initial load or whenever productsState completes loading
    parseUrlProduct();

    window.addEventListener("popstate", parseUrlProduct);
    return () => {
      window.removeEventListener("popstate", parseUrlProduct);
    };
  }, [productsState]);

  // Global navigation listener for applet-wide navigation
  useEffect(() => {
    const handleNav = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) {
        setActiveTab(tab as any);
        setSelectedProduct(null);
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener("atulya_navigate", handleNav);
    return () => {
      window.removeEventListener("atulya_navigate", handleNav);
    };
  }, []);

  // Push URL parameter updates dynamically when selectedProduct changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productIdParam = params.get("product");
    
    if (selectedProduct) {
      if (productIdParam !== String(selectedProduct.id)) {
        params.set("product", String(selectedProduct.id));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ productId: selectedProduct.id }, "", newUrl);
      }
    } else {
      if (productIdParam) {
        params.delete("product");
        const searchStr = params.toString();
        const newUrl = searchStr ? `${window.location.pathname}?${searchStr}` : window.location.pathname;
        window.history.pushState({}, "", newUrl);
      }
    }
  }, [selectedProduct]);

  // Load orders from Firestore when current user logs in, changes, or updates
  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        if (currentUser) {
          const isUserAdmin = currentUser.role === 'admin' || currentUser.email === "vaidwanprince@gmail.com" || currentUser.email === "videads@gmail.com" || currentUser.email === "atulygold333@gmail.com";
          const dbOrders = await getOrdersFromDB(isUserAdmin ? undefined : currentUser.email);
          if (active) {
            setOrders(dbOrders);
          }
        } else {
          if (active) {
            setOrders([]);
          }
        }
      } catch (err) {
        console.error("Failed to load orders from Firestore:", err);
      }
    };
    fetchOrders();
    return () => {
      active = false;
    };
  }, [currentUser]);

  // Persist user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("atulya_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("atulya_user");
    }
  }, [currentUser]);

  // Persist orders as local cache
  useEffect(() => {
    localStorage.setItem("atulya_orders", JSON.stringify(orders));
  }, [orders]);

  // Persist products as local cache
  useEffect(() => {
    localStorage.setItem("atulya_products", JSON.stringify(productsState));
  }, [productsState]);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter conditions
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Simulated real-time Gold Rates with localStorage persistence
  const [goldRates, setGoldRates] = useState<GoldRate>(() => {
    try {
      const stored = localStorage.getItem("atulya_gold_rates");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      "24K": 6850,
      "22K": 6280,
      "18K": 5140,
      Silver: 85,
      Platinum: 3450
    };
  });

  // Store settings with localStorage persistence
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("atulya_store_settings");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      storeName: "ATULYA GOLD",
      announcementText: "Premium Solitaire Rings & Polki. Flat 10% Extra Off subtotal!",
      announcementCode: "ATULYA10",
      announcementDiscount: "10%",
      contactAddress: "12/4 Karol Bagh, Main Jewelers Lane, New Delhi, India 110005",
      contactPhone: "+91 98765 43210",
      contactEmail: "concierge@atulyagold.com",
      showroomHours: "Tue - Sun: 11:00 AM - 08:30 PM",
      aboutStory: "Founded in 1985 as a single workstation in Delhi, Atulya Jewelers has spent over three decades crafting masterfully finished traditional and contemporary Indian jewelry. Every coin, pendant, and ring is created with absolute precision under the strict supervision of our master goldsmiths."
    };
  });

  // Persist store settings
  useEffect(() => {
    localStorage.setItem("atulya_store_settings", JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Persist gold rates
  useEffect(() => {
    localStorage.setItem("atulya_gold_rates", JSON.stringify(goldRates));
  }, [goldRates]);

  // Countdown timer for luxury flash offers
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 12 });
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Live ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours: Math.max(0, hours), minutes: Math.max(0, minutes), seconds: Math.max(0, seconds) });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // Fluctuating Gold rate simulation (disabled if user has disabled via admin setting)
  useEffect(() => {
    const timer = setInterval(() => {
      const disableFluc = localStorage.getItem("atulya_disable_fluctuations") === "true";
      if (disableFluc) return;

      setGoldRates(prev => ({
        "24K": prev["24K"] + Math.round((Math.random() - 0.5) * 8),
        "22K": prev["22K"] + Math.round((Math.random() - 0.5) * 6),
        "18K": prev["18K"] + Math.round((Math.random() - 0.5) * 4),
        Silver: Math.max(70, prev.Silver + Math.round((Math.random() - 0.5) * 2)),
        Platinum: prev.Platinum + Math.round((Math.random() - 0.5) * 10)
      }));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem("atulya_cart", JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    // Check if the product title/price is customized compared to its original catalog definition
    let productId = product.id;
    const baseProduct = productsState.find(p => p.id === product.id);
    
    if (baseProduct && (product.title !== baseProduct.title || product.price !== baseProduct.price)) {
      // Check if we already registered this customized variant in productsState
      const existingCustom = productsState.find(p => p.title === product.title && p.price === product.price);
      if (existingCustom) {
        productId = existingCustom.id;
      } else {
        // Create a temporary clone in our runtime productsState
        const customId = 200000 + Math.floor(Math.random() * 800000);
        const newCustomProduct: Product = {
          ...product,
          id: customId,
        };
        setProductsState(prev => [newCustomProduct, ...prev]);
        productId = customId;
      }
    }

    setCart(prev => {
      const exists = prev.find(item => item.id === productId);
      if (exists) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const p = productsState.find(prod => prod.id === item.id);
    return total + (p ? p.price * item.quantity : 0);
  }, 0);

  // Filtered Products computation
  const filteredProducts = productsState.filter(product => {
    // Category match
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    // Material match
    if (selectedMaterial !== "all" && product.material !== selectedMaterial) return false;
    // Badge match
    if (selectedBadge !== "all" && product.badge !== selectedBadge) return false;
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(q);
      const matchesDesc = product.description.toLowerCase().includes(q);
      const matchesMat = product.material.toLowerCase().includes(q);
      const matchesCat = product.category.toLowerCase().includes(q);
      return matchesTitle || matchesDesc || matchesMat || matchesCat;
    }
    return true;
  });

  const handleAddProduct = async (p: Product) => {
    try {
      await saveProductToDB(p);
      setProductsState(prev => [p, ...prev]);
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleUpdateProduct = async (p: Product) => {
    try {
      await saveProductToDB(p);
      setProductsState(prev => prev.map(prod => prod.id === p.id ? p : prod));
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProductFromDB(id);
      setProductsState(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusInDB(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      await updateOrderPaymentStatusInDB(orderId, paymentStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
    } catch (err) {
      console.error("Failed to update order payment status:", err);
    }
  };

  const categories = Array.from(new Set(productsState.map(p => p.category as string)));
  const materials = Array.from(new Set(productsState.map(p => p.material as string)));

  if (activeTab === 'admin') {
    return (
      <AdminPage
        products={productsState}
        orders={orders}
        goldRates={goldRates}
        onUpdateGoldRates={setGoldRates}
        storeSettings={storeSettings}
        onUpdateStoreSettings={setStoreSettings}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProduct={handleUpdateProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderPayment={handleUpdateOrderPayment}
        onBack={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-neutral-800 flex flex-col font-sans selection:bg-gold/30 selection:text-neutral-900 relative overflow-x-hidden">
      {/* Decorative ambient gold glow spots */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-100/20 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[40vh] -left-[150px] w-[300px] h-[300px] bg-gradient-radial from-gold-light/10 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Premium Android-style Mobile Header */}
      <header className="block md:hidden sticky top-0 bg-neutral-950 text-white z-30 transition-all shadow-md border-b border-gold/15">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          {/* Left Section: Back button and elegant premium brand logo */}
          <div className="flex items-center gap-2.5">
            {(selectedProduct || activeTab !== 'home') && (
              <button
                id="mobile-header-back"
                onClick={() => {
                  if (selectedProduct) {
                    setSelectedProduct(null);
                  } else {
                    setActiveTab('home');
                  }
                }}
                className="p-1.5 -ml-1 rounded-full hover:bg-neutral-900 text-gold transition-colors cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
              onClick={() => {
                setActiveTab('home');
                setSelectedProduct(null);
                window.scrollTo({ top: 0 });
              }}
            >
              {/* Luxury Crown Monogram Icon */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-950 border border-gold/30 shadow-sm shadow-gold/5">
                <Crown className="w-4 h-4 text-gold" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-serif font-extrabold text-sm tracking-[0.08em] text-white leading-none">
                    ATULYA
                  </span>
                  <span className="text-[7px] font-black uppercase tracking-widest bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/20">
                    GOLD
                  </span>
                </div>
                <span className="text-[7.5px] font-sans tracking-[0.12em] text-neutral-400 font-bold uppercase mt-0.5 leading-none">
                  {selectedProduct
                    ? "EXQUISITE DETAILS"
                    : activeTab === 'home'
                    ? "ROYAL HERITAGE"
                    : activeTab === 'category'
                    ? "COLLECTION VAULT"
                    : activeTab === 'cart'
                    ? "YOUR SHOPPING BAG"
                    : activeTab === 'search'
                    ? "SEARCH DESK"
                    : activeTab === 'profile'
                    ? "ROYAL LOUNGE"
                    : activeTab === 'calculator'
                    ? "VALUATION STUDIO"
                    : activeTab === 'consultant'
                    ? "AI CONCIERGE"
                    : "BOUTIQUE STORY"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Only Live Valuation Studio is kept */}
          <div className="flex items-center gap-1">
            <button
              id="mobile-header-calc"
              onClick={() => { setActiveTab('calculator'); setSelectedProduct(null); }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${activeTab === 'calculator' ? "bg-gold text-neutral-950" : "text-neutral-300 hover:text-white hover:bg-neutral-900"}`}
              title="Gold Calculator"
            >
              <Calculator className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>
 
      {/* Main Luxury Header */}
      <div className="hidden md:block sticky top-0 z-35 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gold/10 shadow-xs transition-all duration-300">
        <header className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            {/* Upgraded Premium Crown + Serif Logo */}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); setSelectedCategory('all'); setSelectedMaterial('all'); setSelectedProduct(null); }} 
              className="flex items-center gap-3.5 group"
            >
              {/* Crown Emblem Monogram */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-950 border border-gold/40 shadow-md shadow-gold/5 group-hover:border-gold transition-all duration-300">
                <div className="absolute inset-[2.5px] rounded-[9px] border border-gold/15 bg-gradient-to-br from-neutral-900 to-neutral-950" />
                <div className="relative flex flex-col items-center justify-center">
                  <Crown className="w-5 h-5 text-gold animate-pulse" style={{ animationDuration: '3.5s' }} />
                  <div className="w-1 h-1 rounded-full bg-gold absolute -bottom-1 shadow-[0_0_6px_#d4af37]" />
                </div>
              </div>
 
              {/* Royal Typography */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-xl md:text-2xl tracking-[0.08em] text-neutral-950 leading-none group-hover:text-gold-dark transition-colors duration-300">
                    ATULYA
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-gold/10 text-gold-dark rounded border border-gold/25">
                    GOLD
                  </span>
                </div>
                <span className="text-[8px] font-mono tracking-[0.14em] text-neutral-400 font-bold uppercase mt-1 flex items-center gap-1.5 leading-none">
                  <span>EST. 1985</span>
                  <span className="text-gold font-normal">•</span>
                  <span>BIS HALLMARKED</span>
                </span>
              </div>
            </a>
 
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
              <button
                id="nav-home"
                onClick={() => { setActiveTab('home'); setSelectedCategory('all'); setSelectedMaterial('all'); setSelectedProduct(null); }}
                className={`relative py-2.5 transition-all duration-300 hover:text-neutral-900 cursor-pointer flex flex-col items-center gap-1 ${activeTab === 'home' ? "text-gold-dark font-extrabold" : ""}`}
              >
                <span>Collections</span>
                {activeTab === 'home' && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                )}
              </button>
              <button
                id="nav-search"
                onClick={() => { setActiveTab('search'); setSelectedProduct(null); }}
                className={`relative py-2.5 transition-all duration-300 hover:text-neutral-900 cursor-pointer flex flex-col items-center gap-1 ${activeTab === 'search' ? "text-gold-dark font-extrabold" : ""}`}
              >
                <span>Search</span>
                {activeTab === 'search' && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                )}
              </button>
              <button
                id="nav-calculator"
                onClick={() => { setActiveTab('calculator'); setSelectedProduct(null); }}
                className={`relative py-2.5 transition-all duration-300 hover:text-neutral-900 cursor-pointer flex flex-col items-center gap-1 ${activeTab === 'calculator' ? "text-gold-dark font-extrabold" : ""}`}
              >
                <span>Valuation Studio</span>
                {activeTab === 'calculator' && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                )}
              </button>
              <button
                id="nav-consultant"
                onClick={() => { setActiveTab('consultant'); setSelectedProduct(null); }}
                className={`relative py-2.5 transition-all duration-300 hover:text-neutral-900 cursor-pointer flex flex-col items-center gap-1 ${activeTab === 'consultant' ? "text-gold-dark font-extrabold" : ""}`}
              >
                <span>AI Concierge</span>
                {activeTab === 'consultant' && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                )}
              </button>
              <button
                id="nav-about"
                onClick={() => { setActiveTab('about'); setSelectedProduct(null); }}
                className={`relative py-2.5 transition-all duration-300 hover:text-neutral-900 cursor-pointer flex flex-col items-center gap-1 ${activeTab === 'about' ? "text-gold-dark font-extrabold" : ""}`}
              >
                <span>Heritage Story</span>
                {activeTab === 'about' && (
                  <motion.div layoutId="activeNav" className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gold-dark" />
                )}
              </button>
            </nav>
          </div>
 
          {/* Header Action Elements */}
          <div className="flex items-center gap-2.5 md:gap-3.5">
            {/* Live Gold Calculator Trigger */}
            <button
              id="calc-header-trigger"
              onClick={() => { setActiveTab('calculator'); setSelectedProduct(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 shadow-xs cursor-pointer ${activeTab === 'calculator' ? "bg-gold text-neutral-950 border-gold shadow-md shadow-gold/10 font-black" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 hover:translate-y-[-1px]"}`}
            >
              <Calculator className="w-3.5 h-3.5 text-gold-dark" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
 
            {/* Search Interactive Trigger */}
            <div className="relative">
              <button
                id="search-header-trigger"
                onClick={() => { setActiveTab('search'); setSelectedProduct(null); }}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer ${activeTab === 'search' ? "bg-gold text-neutral-950 border-gold shadow-md shadow-gold/10" : "hover:bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:translate-y-[-1px]"}`}
                title="Advanced Search Page"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
 
            {/* Shopping Cart Bag */}
            <button
              id="cart-header-trigger"
              onClick={() => { setActiveTab('cart'); setSelectedProduct(null); }}
              className={`p-2.5 px-4.5 rounded-xl flex items-center gap-2 transition-all duration-300 relative shadow-md cursor-pointer ${activeTab === 'cart' ? "bg-gold text-neutral-950 shadow-md shadow-gold/10 font-extrabold" : "bg-neutral-950 hover:bg-neutral-900 text-white hover:translate-y-[-1px]"}`}
              title="Shopping Bag Page"
            >
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span className="text-xs font-black font-mono">{cartCount}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / SSO login block */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="profile-dropdown-trigger"
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-neutral-150 hover:bg-neutral-50 cursor-pointer transition-all outline-none"
                >
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full border border-neutral-200 bg-neutral-50 flex-shrink-0"
                  />
                  <span className="text-xs font-bold text-neutral-800 hidden lg:inline truncate max-w-[100px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  {currentUser.role === 'admin' && (
                    <span className="text-[8px] bg-gold/15 text-gold-dark font-black px-1.5 py-0.5 rounded uppercase tracking-wider hidden md:inline">
                      Admin
                    </span>
                  )}
                </button>

                {/* Dropdown list */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      {/* Click outside backdrop overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-2xl shadow-xl p-2.5 z-50 space-y-1.5"
                      >
                        <div className="px-2.5 py-2 border-b border-neutral-100 mb-1">
                          <span className="font-bold text-xs text-neutral-800 block truncate">{currentUser.name}</span>
                          <span className="text-[10px] text-neutral-400 block font-mono truncate">{currentUser.email}</span>
                        </div>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setActiveTab('admin');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gold-dark hover:bg-gold/5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-gold" />
                            <span>✦ Admin Control Room</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setSelectedProduct(null);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-gold-dark" />
                          <span>👤 My Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setTrackOrdersOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-gold-dark" />
                          <span>📦 Track My Orders</span>
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              await signOut(auth);
                            } catch (err) {
                              console.error("Sign-out error:", err);
                            }
                            setCurrentUser(null);
                            setProfileDropdownOpen(false);
                            setActiveTab('home');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-t border-neutral-100 pt-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                id="header-login-trigger"
                onClick={() => setLoginOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-150 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-gold-dark" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Hero Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-neutral-150 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search for flawless gold coins, certified diamonds, rubies, sterling silver pooja items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none text-xs font-medium placeholder-neutral-400 transition-all"
                />
              </div>
              <button
                id="clear-search"
                onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-800"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Content */}
      {selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            window.scrollTo({ top: 0 });
          }}
          onAddToCart={handleAddToCart}
          onSelectProduct={setSelectedProduct}
          currentUser={currentUser}
          onTriggerLogin={() => setLoginOpen(true)}
        />
      ) : (
        <main className="flex-grow max-w-7xl w-full mx-auto px-2.5 md:px-4 py-3 md:py-6 pb-20 md:pb-8 flex flex-col gap-4 md:gap-8 relative">
          {activeTab === 'admin' ? null : activeTab === 'search' ? (
          <SearchPage
            products={productsState}
            onBack={() => setActiveTab('home')}
            onOpenProductDetail={setSelectedProduct}
            onOpenQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            initialQuery={searchQuery}
          />
        ) : activeTab === 'category' ? (
          <CategoryPage
            category={selectedCategoryPage}
            products={productsState}
            onBack={() => setActiveTab('home')}
            onOpenProductDetail={setSelectedProduct}
            onOpenQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onSelectCategory={setSelectedCategoryPage}
            initialBadge={selectedCategoryBadge}
          />
        ) : activeTab === 'cart' ? (
          <CartPage
            cart={cart}
            products={productsState}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onGoBack={() => setActiveTab('home')}
            onProceedToCheckout={() => setCheckoutOpen(true)}
          />
        ) : activeTab === 'calculator' ? (
          <GoldCalculator
            goldRates={goldRates}
            isPage={true}
            onBackToHome={() => setActiveTab('home')}
          />
        ) : activeTab === 'consultant' ? (
          <AIConsultant
            isPage={true}
            onBackToHome={() => setActiveTab('home')}
          />
        ) : activeTab === 'profile' ? (
          <UserProfilePage
            currentUser={currentUser}
            orders={orders}
            onLogout={async () => {
              try {
                await signOut(auth);
              } catch (err) {
                console.error("Sign-out error:", err);
              }
              setCurrentUser(null);
              localStorage.removeItem("atulya_user");
              setActiveTab('home');
            }}
            onUpdateUser={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem("atulya_user", JSON.stringify(updatedUser));
            }}
          />
        ) : activeTab === 'home' ? (
          <>



            {/* Live Countdown Flash Sale Banner */}
            <div className="bg-neutral-950 rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-800 p-4 sm:p-6 md:p-8 relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-2xl">
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="space-y-2 md:space-y-3 max-w-lg relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 md:px-3 md:py-1 bg-amber-500/15 border border-amber-500/30 text-gold rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Limited Midnight Flash Valuation</span>
                </div>
                <h2 className="font-serif font-black text-sm sm:text-xl md:text-2xl text-white leading-tight">
                  {storeSettings.announcementText}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-tight">
                  Certified BIS Hallmarked gold and brilliant cut diamond lines. Promo discount applied dynamically in your shopping bag.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start items-center">
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Use Voucher Code:</span>
                  <button
                    onClick={() => copyCoupon(storeSettings.announcementCode)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white rounded-lg text-[10px] sm:text-xs font-mono font-black tracking-wider shadow-sm transition-all"
                  >
                    <span>{storeSettings.announcementCode}</span>
                    <span className="text-[8px] sm:text-[9px] text-gold uppercase tracking-wider font-sans">
                      ({copiedCoupon === storeSettings.announcementCode ? "Copied ✓" : "Copy"})
                    </span>
                  </button>
                </div>
              </div>

              {/* Ticking timer cards */}
              <div className="flex gap-1.5 sm:gap-2 relative z-10 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-white text-base sm:text-xl md:text-2xl shadow-inner relative overflow-hidden">
                    <span className="absolute top-0 left-0 w-full h-[50%] bg-white/5" />
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider mt-1 sm:mt-1.5">Hours</span>
                </div>
                <span className="text-white text-base sm:text-2xl font-black self-center mb-3.5 sm:mb-5">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-white text-base sm:text-xl md:text-2xl shadow-inner relative overflow-hidden">
                    <span className="absolute top-0 left-0 w-full h-[50%] bg-white/5" />
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider mt-1 sm:mt-1.5">Mins</span>
                </div>
                <span className="text-white text-base sm:text-2xl font-black self-center mb-3.5 sm:mb-5">:</span>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-white text-base sm:text-xl md:text-2xl shadow-inner relative overflow-hidden text-gold">
                    <span className="absolute top-0 left-0 w-full h-[50%] bg-white/5" />
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider mt-1 sm:mt-1.5 animate-pulse">Secs</span>
                </div>
              </div>
            </div>

            {/* Scroll Type Segment 1: Newly Unveiled Masterpieces */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-serif font-black text-lg text-neutral-900">✨ Contemporary Additions</h3>
                  <p className="text-[10px] text-neutral-400">The newest certified creations from our Delhi artisans</p>
                </div>
                <button
                  id="view-all-new"
                  onClick={() => { setSelectedBadge("new"); setSelectedCategory("all"); }}
                  className="text-xs font-semibold text-gold-dark flex items-center gap-0.5 hover:text-gold"
                >
                  <span>View All New</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Scroll Containers with lovely styling */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {products.filter(p => p.badge === 'new' || p.badge === 'exclusive').map(product => (
                  <div key={product.id} className="w-56 flex-shrink-0">
                    <ProductCard
                      product={product}
                      onOpenDetail={setSelectedProduct}
                      onOpenQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Multi-Type Banners Switcher (Sale, Trending, New) */}
            <div className="space-y-4">
              {/* Luxury Banner Tabs */}
              <div className="flex gap-2 p-1.5 bg-neutral-100 rounded-2xl max-w-md">
                <button
                  id="banner-tab-sale"
                  onClick={() => setActiveBanner('sale')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeBanner === 'sale'
                      ? "bg-white text-rose-600 shadow-xs animate-pulse"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  % Limited Offers
                </button>
                <button
                  id="banner-tab-trending"
                  onClick={() => setActiveBanner('trending')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeBanner === 'trending'
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  ★ Most Admired
                </button>
                <button
                  id="banner-tab-new"
                  onClick={() => setActiveBanner('new')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeBanner === 'new'
                      ? "bg-white text-amber-700 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  ✦ Fresh Additions
                </button>
              </div>

              {/* Banner Area */}
              <AnimatePresence mode="wait">
                {activeBanner === 'sale' && (
                  <motion.div
                    key="sale-banner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-rose-950 via-neutral-900 to-rose-950 rounded-2xl md:rounded-3xl overflow-hidden p-4 sm:p-6 md:p-8 border border-rose-900/40 shadow-2xl relative flex flex-row justify-between items-center gap-4 md:gap-6 min-h-0 md:min-h-[220px]"
                  >
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="space-y-2 md:space-y-4 max-w-lg relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>Limited Clearance Celebration</span>
                      </div>
                      <h1 className="font-serif font-black text-sm sm:text-2xl md:text-3xl text-white leading-tight">
                        Exquisite Diamond Sets. <span className="text-rose-400">Up to 20% Off</span> Making Fees!
                      </h1>
                      <p className="text-[10px] sm:text-xs text-neutral-300 leading-tight md:leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                        Treat yourself to certified VS1 brilliant-cut diamonds, masterfully handcrafted emerald rings, and 18K white gold sets at our best prices.
                      </p>
                      <button
                        id="banner-action-sale"
                        onClick={() => {
                          setSelectedCategoryPage("all");
                          setSelectedCategoryBadge("sale");
                          setActiveTab('category');
                        }}
                        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/20 hover:-translate-y-0.5"
                      >
                        <span>Unlock Best Offers</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 h-20 xs:w-28 xs:h-28 sm:w-48 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 relative flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80"
                        alt="Royal Diamond Ring"
                        className="w-full h-full object-cover opacity-95"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 sm:bottom-2.5 sm:left-2.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-850 text-[6px] sm:text-[9px] font-mono font-semibold text-rose-400 px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                        IGI Diamonds
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeBanner === 'trending' && (
                  <motion.div
                    key="trending-banner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-neutral-950 via-emerald-950 to-neutral-950 rounded-2xl md:rounded-3xl overflow-hidden p-4 sm:p-6 md:p-8 border border-emerald-900/30 shadow-2xl relative flex flex-row justify-between items-center gap-4 md:gap-6 min-h-0 md:min-h-[220px]"
                  >
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="space-y-2 md:space-y-4 max-w-lg relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>Adorned By Royals</span>
                      </div>
                      <h1 className="font-serif font-black text-sm sm:text-2xl md:text-3xl text-white leading-tight">
                        Trending Polki & <span className="text-gold">Antique Gold Lines</span>
                      </h1>
                      <p className="text-[10px] sm:text-xs text-neutral-300 leading-tight md:leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                        Discover the heavy heritage bangles, hand-engraved curb chains, and traditional kundan masterpieces that have our elite patrons enthralled.
                      </p>
                      <button
                        id="banner-action-trending"
                        onClick={() => {
                          setSelectedCategoryPage("all");
                          setSelectedCategoryBadge("trending");
                          setActiveTab('category');
                        }}
                        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gold hover:bg-gold-dark text-neutral-950 font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-gold/20 hover:-translate-y-0.5"
                      >
                        <span>Explore Trending Masterpieces</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 h-20 xs:w-28 xs:h-28 sm:w-48 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 relative flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80"
                        alt="Heritage Kundan Work"
                        className="w-full h-full object-cover opacity-95"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 sm:bottom-2.5 sm:left-2.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-850 text-[6px] sm:text-[9px] font-mono font-semibold text-gold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                        BIS 916 Pure
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeBanner === 'new' && (
                  <motion.div
                    key="new-banner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 rounded-2xl md:rounded-3xl overflow-hidden p-4 sm:p-6 md:p-8 border border-amber-900/30 shadow-2xl relative flex flex-row justify-between items-center gap-4 md:gap-6 min-h-0 md:min-h-[220px]"
                  >
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="space-y-2 md:space-y-4 max-w-lg relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        <span>The Modernist Chapter</span>
                      </div>
                      <h1 className="font-serif font-black text-sm sm:text-2xl md:text-3xl text-white leading-tight">
                        Fresh Minimalist <span className="text-amber-400">18K Solitaires & Coins</span>
                      </h1>
                      <p className="text-[10px] sm:text-xs text-neutral-300 leading-tight md:leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                        Unveiling lightweight everyday rings, pure 24K gold investment coins with BIS certificates, and delicate modern chains designed for current aesthetic senses.
                      </p>
                      <button
                        id="banner-action-new"
                        onClick={() => {
                          setSelectedCategoryPage("all");
                          setSelectedCategoryBadge("new");
                          setActiveTab('category');
                        }}
                        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-600/20 hover:-translate-y-0.5"
                      >
                        <span>Be the First to Adorn</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 h-20 xs:w-28 xs:h-28 sm:w-48 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 relative flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=400&q=80"
                        alt="Minimalist Solitaire Collection"
                        className="w-full h-full object-cover opacity-95"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 sm:bottom-2.5 sm:left-2.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-850 text-[6px] sm:text-[9px] font-mono font-semibold text-amber-400 px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                        BIS Certified
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scroll Type Segment 2: Royal Masterpieces (Trending) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-serif font-black text-lg text-neutral-900">🔥 Royal Masterpieces</h3>
                  <p className="text-[10px] text-neutral-400 font-medium">The most admired and celebrated heirloom jewelry lines</p>
                </div>
                <button
                  id="view-all-trending"
                  onClick={() => {
                    setSelectedCategoryPage("all");
                    setSelectedCategoryBadge("trending");
                    setActiveTab('category');
                  }}
                  className="text-xs font-semibold text-gold-dark flex items-center gap-0.5 hover:text-gold"
                >
                  <span>View All Trending</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {products.filter(p => p.badge === 'trending' || p.badge === 'bestseller').map(product => (
                  <div key={product.id} className="w-56 flex-shrink-0">
                    <ProductCard
                      product={product}
                      onOpenDetail={setSelectedProduct}
                      onOpenQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Occasion / Style Bento Grid Banners */}
            <div className="space-y-3">
              <h3 className="font-serif font-black text-sm uppercase text-neutral-400 tracking-widest">Curated Style Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Bridal Heritage */}
                <div 
                  onClick={() => {
                    setSelectedCategoryPage("necklaces");
                    setSelectedCategoryBadge("trending");
                    setActiveTab('category');
                  }}
                  className="group relative h-48 rounded-3xl overflow-hidden border border-neutral-200/80 bg-neutral-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-5"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80" 
                    alt="Traditional Bridal Collection" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-555 opacity-70"
                    referrerPolicy="no-referrer"
                  />
                  <span className="relative z-20 self-start text-[9px] font-black uppercase tracking-widest bg-gold text-neutral-950 px-2.5 py-1 rounded-md shadow-sm">
                    Royal Heritage
                  </span>
                  <div className="relative z-20 text-white">
                    <h3 className="font-serif font-black text-sm tracking-wide group-hover:text-gold transition-colors">The Bridal Edit</h3>
                    <p className="text-[10px] text-neutral-200/90 leading-tight mt-0.5 font-medium">Heavy 22K Antique Polki Necklaces & Bangles</p>
                  </div>
                </div>

                {/* Card 2: Modern Minimalist */}
                <div 
                  onClick={() => {
                    setSelectedCategoryPage("rings");
                    setSelectedCategoryBadge("all");
                    setActiveTab('category');
                  }}
                  className="group relative h-48 rounded-3xl overflow-hidden border border-neutral-200/80 bg-neutral-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-5"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80" 
                    alt="Modern Minimalist Ring" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-555 opacity-70"
                    referrerPolicy="no-referrer"
                  />
                  <span className="relative z-20 self-start text-[9px] font-black uppercase tracking-widest bg-neutral-900 border border-neutral-700 text-white px-2.5 py-1 rounded-md shadow-sm">
                    Modern Luxury
                  </span>
                  <div className="relative z-20 text-white">
                    <h3 className="font-serif font-black text-sm tracking-wide group-hover:text-gold transition-colors">Contemporary Chic</h3>
                    <p className="text-[10px] text-neutral-200/90 leading-tight mt-0.5 font-medium">Delicate 18K Solitaires & Floating Pendant Chains</p>
                  </div>
                </div>

                {/* Card 3: Auspicious Investment */}
                <div 
                  onClick={() => {
                    setSelectedCategoryPage("coins");
                    setSelectedCategoryBadge("all");
                    setActiveTab('category');
                  }}
                  className="group relative h-48 rounded-3xl overflow-hidden border border-neutral-200/80 bg-neutral-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-5"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=400&q=80" 
                    alt="Gold investment coins" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-555 opacity-70"
                    referrerPolicy="no-referrer"
                  />
                  <span className="relative z-20 self-start text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2.5 py-1 rounded-md shadow-sm">
                    999 Purity Certified
                  </span>
                  <div className="relative z-20 text-white">
                    <h3 className="font-serif font-black text-sm tracking-wide group-hover:text-gold transition-colors">Auspicious Shubh Labh</h3>
                    <p className="text-[10px] text-neutral-200/90 leading-tight mt-0.5 font-medium">Pure 24K Gold & 999 Fine Silver Wealth Coins</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Type Segment 3: Unbeatable Special Offers (Sale) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-serif font-black text-lg text-neutral-900">💎 Exclusive Special Valuation</h3>
                  <p className="text-[10px] text-neutral-400">Time-limited event pricing on heirloom investment jewelry</p>
                </div>
                <button
                  id="view-all-sale"
                  onClick={() => {
                    setSelectedCategoryPage("all");
                    setSelectedCategoryBadge("sale");
                    setActiveTab('category');
                  }}
                  className="text-xs font-semibold text-gold-dark flex items-center gap-0.5 hover:text-gold"
                >
                  <span>View All Offers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                {products.filter(p => p.badge === 'sale' || p.badge === 'limited').map(product => (
                  <div key={product.id} className="w-56 flex-shrink-0">
                    <ProductCard
                      product={product}
                      onOpenDetail={setSelectedProduct}
                      onOpenQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Trust Strip Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: "BIS 916 Hallmarked", desc: "100% Pure Certified", icon: "✓", bg: "bg-amber-500/10 text-amber-800 border-amber-200" },
                { title: "Insured Free Delivery", desc: "Secure Doorstep Transit", icon: "📦", bg: "bg-emerald-500/10 text-emerald-800 border-emerald-200" },
                { title: "7-Days Safe Refund", desc: "No Questions Asked", icon: "🛡️", bg: "bg-rose-500/10 text-rose-800 border-rose-200" },
                { title: "Lifetime Buyback", desc: "Guaranteed Metal Valuation", icon: "💎", bg: "bg-blue-500/10 text-blue-800 border-blue-200" }
              ].map((badge, index) => (
                <div key={index} className={`p-3 rounded-2xl border ${badge.bg} flex items-center gap-3 shadow-xs hover:scale-[1.02] transition-transform`}>
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[10px] uppercase tracking-wide leading-none">{badge.title}</h4>
                    <p className="text-[9px] text-neutral-500 font-medium mt-1 leading-tight">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fine Catalogue filter panel */}
            <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-5 border border-amber-100/60 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black tracking-widest text-gold-dark uppercase">MASTER SELECTION</span>
                  <h3 className="font-serif font-extrabold text-lg text-neutral-900">Bespoke Jewelry Collection</h3>
                </div>
                
                {/* Search & View Switcher */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search active catalog..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none text-xs bg-[#FAF8F5]/50 placeholder-neutral-400 font-sans"
                    />
                  </div>
                  <div className="flex items-center border border-neutral-200/80 rounded-xl p-1 bg-[#FAF8F5]">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? "bg-white text-gold-dark shadow-xs" : "text-neutral-400 hover:text-neutral-600"}`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? "bg-white text-gold-dark shadow-xs" : "text-neutral-400 hover:text-neutral-600"}`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter selectors */}
              <div className="space-y-3 pt-2.5 border-t border-neutral-100">
                {/* Category selectors */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest w-16 flex-shrink-0">Category:</span>
                  <div className="flex gap-1.5 overflow-x-auto">
                    {Object.keys(categoryMetadata).map((catKey) => {
                      const isActive = selectedCategory === catKey;
                      const cat = categoryMetadata[catKey];
                      return (
                        <button
                          key={catKey}
                          onClick={() => setSelectedCategory(catKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                            isActive
                              ? "bg-gold text-neutral-950 shadow-xs border border-gold"
                              : "bg-[#FAF8F5] text-neutral-600 hover:text-neutral-900 border border-neutral-200/60"
                          }`}
                        >
                          <span className="capitalize">{cat.displayName.replace("Masterpieces", "All").replace("Deluxe ", "").replace("Royal ", "").replace("Fine ", "").replace("Luxury ", "").replace("Bridal ", "")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Material selectors */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest w-16 flex-shrink-0">Material:</span>
                  <div className="flex gap-1.5">
                    {["all", "Gold", "Diamond", "Silver", "Platinum"].map((mat) => {
                      const isActive = selectedMaterial === mat;
                      return (
                        <button
                          key={mat}
                          onClick={() => setSelectedMaterial(mat)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                            isActive
                              ? "bg-neutral-950 text-white shadow-xs border border-neutral-900"
                              : "bg-[#FAF8F5] text-neutral-500 hover:text-neutral-800 border border-neutral-200/60"
                          }`}
                        >
                          {mat === "all" ? "All Metals" : mat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Badge/Offer selectors */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest w-16 flex-shrink-0">Collections:</span>
                  <div className="flex gap-1.5">
                    {[
                      { key: "all", label: "All Items" },
                      { key: "new", label: "Newest Art" },
                      { key: "sale", label: "Offers" },
                      { key: "exclusive", label: "Royal Exclusive" },
                      { key: "trending", label: "Most Loved" }
                    ].map((badgeObj) => {
                      const isActive = selectedBadge === badgeObj.key;
                      return (
                        <button
                          key={badgeObj.key}
                          onClick={() => setSelectedBadge(badgeObj.key)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                            isActive
                              ? "bg-gold-light/40 border border-gold text-gold-dark font-extrabold shadow-2xs"
                              : "bg-[#FAF8F5] text-neutral-500 hover:text-neutral-800 border border-neutral-200/60"
                          }`}
                        >
                          {badgeObj.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Fine Catalogue section results */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1 border-b border-neutral-100 pb-2">
                <div>
                  <h3 className="font-serif font-black text-base text-neutral-900">Fine Catalogue Selection</h3>
                  <p className="text-[10px] text-neutral-400">Displaying {filteredProducts.length} certified masterpieces</p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800">No Jewel Found</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    There are no items matching your selected filtering combination. Try clearing filters or changing search terms.
                  </p>
                  <button
                    id="clear-all-filters"
                    onClick={() => { setSelectedCategory("all"); setSelectedMaterial("all"); setSelectedBadge("all"); setSearchQuery(""); }}
                    className="text-xs font-semibold text-gold"
                  >
                    Reset Catalogue Filter
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
                }>
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpenDetail={setSelectedProduct}
                        onOpenQuickView={setQuickViewProduct}
                        onAddToCart={handleAddToCart}
                        viewMode={viewMode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>


          </>
        ) : (
          /* About story page section */
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100 shadow-xs space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-bold text-gold-dark tracking-widest uppercase">Since 1985 • Royal Legacy</span>
              <h2 className="font-serif font-black text-2xl md:text-3xl text-neutral-950">
                Fine Jewelry & Family Values
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Our legacy is built on the strict pursuit of pure fine gold, certified premium diamonds, and a completely transparent client advisory service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4 text-xs text-neutral-600 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    Our Story
                  </h4>
                  <p>
                    {storeSettings.aboutStory}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                    Uncompromising Certification
                  </h4>
                  <p>
                    Every ounce of gold at Atulya is hallmarked under BIS Bureau of Indian Standards procedures. Our diamonds carry independent certificates of color and clarity from leading gemological laboratories, so your luxury investment remains secure for generations.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-neutral-200 h-64 md:h-72">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80"
                  alt="Our legacy workstation"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Heritage Trust Marks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-4 border-t border-neutral-100">
              <div className="space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <span className="block font-serif text-lg font-black text-gold-dark">100%</span>
                <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest">BIS Hallmarked</span>
              </div>
              <div className="space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <span className="block font-serif text-lg font-black text-gold-dark">38+ Yrs</span>
                <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Of Elite Trust</span>
              </div>
              <div className="space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <span className="block font-serif text-lg font-black text-gold-dark">IGI/GIA</span>
                <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Certified Gems</span>
              </div>
              <div className="space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <span className="block font-serif text-lg font-black text-gold-dark">0%</span>
                <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Risk Insured Shpt</span>
              </div>
            </div>
          </div>
        )}
      </main>
    )}





      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductDetailModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* Google Login SSO Modal */}
      <AnimatePresence>
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setProfileDropdownOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Live Order Tracker Modal */}
      <AnimatePresence>
        {trackOrdersOpen && currentUser && (
          <OrderTracker
            orders={orders}
            onClose={() => setTrackOrdersOpen(false)}
            userEmail={currentUser.email}
          />
        )}
      </AnimatePresence>

       {/* Checkout Slide-over Page */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutPage
            cart={cart}
            products={productsState}
            onClose={() => setCheckoutOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOrderPlaced={async (order) => {
              try {
                await addOrderToDB(order);
                setOrders(prev => [order, ...prev]);
              } catch (err) {
                console.error("Failed to save order to Firestore:", err);
              }
            }}
          />
        )}
      </AnimatePresence>


      {/* Elegant Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-10 border-t border-neutral-900 mt-12 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs leading-relaxed">
          {/* Brand block */}
          <div className="space-y-3.5">
            <span className="font-serif font-black text-base text-white tracking-tight block">
              ATULYA <span className="text-gold-dark font-normal font-sans italic text-xs tracking-widest uppercase">Gold</span>
            </span>
            <p className="text-neutral-500">
              Fine Indian jewelry craftsmanship since 1985. Crafting unique experiences and standard certified gold, coins, and diamonds for global patrons.
            </p>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-800 rounded px-2.5 py-1 inline-block">
              BIS Bureau Standards Compliant
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[11px] tracking-wider uppercase text-neutral-200">Our Showrooms</h4>
            <ul className="space-y-2">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>{storeSettings.contactAddress}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-gold" />
                <span>{storeSettings.contactPhone}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-gold" />
                <span>{storeSettings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Quick assistance */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[11px] tracking-wider uppercase text-neutral-200">Customer Concierge</h4>
            <ul className="space-y-2">
              <li className="flex gap-2.5 items-start">
                <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>Showroom Hours:<br />{storeSettings.showroomHours}</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>AI Gold Consultant:<br />24/7 Available Online</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Notice */}
          <div className="space-y-3.5">
            <h4 className="font-sans font-bold text-[11px] tracking-wider uppercase text-neutral-200">Authenticity Promise</h4>
            <p className="text-neutral-500">
              We stand behind our materials. Every buy carries custom laser-engraved hallmarking, certified weight logs, and our signature velvet safeguard presentation box.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-neutral-900 mt-8 pt-6 text-center text-[10px] text-neutral-600">
          <p>© 2026 Atulya Gold. All Rights Reserved. Crafted with pristine premium materials.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      {!selectedProduct && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-150 py-1 px-1.5 flex justify-around items-center z-40 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] h-[52px]">
          {[
            { tab: 'home', label: 'Home', icon: Home, action: () => { setActiveTab('home'); setSelectedProduct(null); } },
            { tab: 'category', label: 'Category', icon: Grid, action: () => { setActiveTab('category'); setSelectedProduct(null); } },
            { tab: 'search', label: 'Search', icon: Search, action: () => { setActiveTab('search'); setSelectedProduct(null); } },
            { tab: 'cart', label: 'Cart', icon: ShoppingBag, action: () => { setActiveTab('cart'); setSelectedProduct(null); }, badge: cartCount },
            { tab: 'profile', label: 'Profile', icon: UserIcon, action: () => {
              if (!currentUser) {
                setLoginOpen(true);
              } else {
                setActiveTab('profile');
                setSelectedProduct(null);
              }
            } }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab && !selectedProduct;
            return (
              <button
                key={item.tab}
                id={`bottom-nav-${item.tab}`}
                onClick={item.action}
                className="flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer group py-0.5 outline-none"
              >
                <div className="relative">
                  <Icon className={`w-4.5 h-4.5 transition-all ${isActive ? "text-gold-dark scale-110" : "text-neutral-400 group-hover:text-neutral-600"}`} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[8px] font-bold mt-0.5 tracking-wider uppercase transition-all ${isActive ? "text-gold-dark font-black" : "text-neutral-400 group-hover:text-neutral-600"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
