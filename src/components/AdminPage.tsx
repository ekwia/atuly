import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, ShoppingBag, DollarSign, Tag, Image as ImageIcon, 
  Layers, Hammer, Package, ArrowLeft, Check, HelpCircle, 
  ExternalLink, Calendar, Phone, Mail, UserCheck, CheckCircle,
  Edit3, Sliders, Search, Award, CheckSquare, LayoutDashboard,
  Percent, Settings, AlertCircle, Printer, TrendingUp, Coins, Eye,
  RefreshCw, ChevronRight, Filter, Info, ArrowUpRight, Crown, Laptop,
  Users, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, OrderItem, ProductAttribute, GoldRate, Category } from "../types";

interface AdminPageProps {
  products: Product[];
  orders: Order[];
  goldRates: GoldRate;
  onUpdateGoldRates: (rates: GoldRate) => void;
  storeSettings: {
    storeName: string;
    announcementText: string;
    announcementCode: string;
    announcementDiscount: string;
    contactAddress: string;
    contactPhone: string;
    contactEmail: string;
    showroomHours: string;
    aboutStory: string;
  };
  onUpdateStoreSettings: (settings: any) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onUpdateProduct?: (product: Product) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateOrderPayment: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  categories?: Category[];
  onAddCategory?: (category: Category) => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (id: string) => void;
  onBack: () => void;
}

interface CustomCoupon {
  code: string;
  type: 'percent' | 'fixed' | 'gold_percent';
  value: number;
  description: string;
  active: boolean;
}

const LUXURY_TEMPLATES = [
  {
    title: "Vedic Gold Pendant (22K)",
    price: 48500,
    originalPrice: 53000,
    category: "pendants",
    material: "gold",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    badge: "trending",
    description: "An elegant round pendant crafted in pure 22K gold featuring the royal Vedic sunburst motif. BIS hallmarked and handmade by traditional Varanasi gold artisans.",
    attributes: [
      { label: "Material", value: "22K Gold (91.6% Pure)" },
      { label: "Weight", value: "7.2 grams" },
      { label: "Certification", value: "BIS Hallmark Certified" }
    ]
  },
  {
    title: "Royal Emerald Ring (18K)",
    price: 125000,
    originalPrice: 140000,
    category: "rings",
    material: "emerald",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    badge: "exclusive",
    description: "An outstanding 2.5 carat natural Columbian emerald set in 18K Yellow Gold and surrounded by micro-paved brilliant cut diamonds. Certified by GIA.",
    attributes: [
      { label: "Material", value: "18K Yellow Gold" },
      { label: "Gemstone", value: "2.5 carat Columbian Emerald" },
      { label: "Certification", value: "GIA Certified Gem" }
    ]
  },
  {
    title: "Pure Silver Ganesha Coin (50g)",
    price: 6500,
    originalPrice: 7500,
    category: "coins",
    material: "silver",
    image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=150&h=150&q=80",
    badge: "new",
    description: "99.9% fine silver coin featuring high-embossed Lord Ganesha sitting under a floral archway. Excellent choice for Diwali pooja or special family gifts.",
    attributes: [
      { label: "Material", value: "Fine Silver (99.9% Pure)" },
      { label: "Weight", value: "50 grams" },
      { label: "Diameter", value: "45mm" }
    ]
  },
  {
    title: "Imperial Diamond Choker",
    price: 420000,
    originalPrice: 480000,
    category: "necklaces",
    material: "diamond",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=150&h=150&q=80",
    badge: "limited",
    description: "Breathtaking multi-layer diamond choker with round-cut, baguette, and princess-cut diamonds set in solid platinum. Intended for elite bridal attire.",
    attributes: [
      { label: "Material", value: "950 Platinum" },
      { label: "Diamond Weight", value: "8.5 carats total" },
      { label: "Certification", value: "IGI Double Hallmarked" }
    ]
  }
];

export default function AdminPage({
  products,
  orders,
  goldRates,
  onUpdateGoldRates,
  storeSettings,
  onUpdateStoreSettings,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  onUpdateOrderPayment,
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onBack
}: AdminPageProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'coupons' | 'rates' | 'settings' | 'users' | 'categories'>('stats');

  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catId, setCatId] = useState("");
  const [catName, setCatName] = useState("");
  const [catTitle, setCatTitle] = useState("");
  const [catTagline, setCatTagline] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catBanner, setCatBanner] = useState("");
  const [catPurityBadge, setCatPurityBadge] = useState("");
  const [catTrustFactor, setCatTrustFactor] = useState("");

  // Product CRUD states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form input fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("rings");
  const [material, setMaterial] = useState("gold");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [badge, setBadge] = useState<any>("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [section, setSection] = useState<"latest" | "popular" | "special" | "">("");
  const [customOptionLabel, setCustomOptionLabel] = useState("");
  const [customOptionValues, setCustomOptionValues] = useState("");
  const [customOptionLabel2, setCustomOptionLabel2] = useState("");
  const [customOptionValues2, setCustomOptionValues2] = useState("");
  const [customOptionLabel3, setCustomOptionLabel3] = useState("");
  const [customOptionValues3, setCustomOptionValues3] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([
    { label: "Material", value: "22K Gold" },
    { label: "Weight", value: "8 grams" },
    { label: "Certification", value: "BIS Hallmarked" }
  ]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Custom Coupon State
  const [couponsList, setCouponsList] = useState<CustomCoupon[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_coupons");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      { code: "ATULYA10", type: "percent", value: 10, description: "10% Flat store discount", active: true },
      { code: "FESTIVE5000", type: "fixed", value: 5000, description: "Flat ₹5,000 off orders", active: true },
      { code: "GOLDEN15", type: "gold_percent", value: 15, description: "15% off Gold metal weight", active: true }
    ];
  });

  // New Coupon Form state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed' | 'gold_percent'>('percent');
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");

  // Sync Coupons to localStorage for CheckoutPage access
  useEffect(() => {
    localStorage.setItem("atulya_coupons", JSON.stringify(couponsList));
  }, [couponsList]);

  // Inventory Filter/Search states
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("all");
  const [inventoryMaterial, setInventoryMaterial] = useState("all");

  // User Management states
  const [usersList, setUsersList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("atulya_users");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "USR001", name: "Aarav Sharma", email: "aarav@atulya.com", role: "Goldsmith Admin", status: "Active", totalSpent: 120000, orderCount: 2, registeredAt: "15 Apr 2026", phone: "+91 98765 43210" },
      { id: "USR002", name: "Priya Patel", email: "priya@gmail.com", role: "Patron", status: "Active", totalSpent: 485000, orderCount: 4, registeredAt: "02 May 2026", phone: "+91 91234 56789" },
      { id: "USR003", name: "Rajesh Iyer", email: "rajesh.jewel@gmail.com", role: "Artisan", status: "Active", totalSpent: 0, orderCount: 0, registeredAt: "10 Jan 2026", phone: "+91 93456 78901" },
      { id: "USR004", name: "Vikram Singh", email: "vikram.singh@yahoo.com", role: "Patron", status: "Suspended", totalSpent: 85000, orderCount: 1, registeredAt: "22 Mar 2026", phone: "+91 94567 12345" },
      { id: "USR005", name: "Meera Sen", email: "meera.sen@outlook.com", role: "Patron", status: "Active", totalSpent: 12000, orderCount: 1, registeredAt: "08 Jun 2026", phone: "+91 95678 23456" }
    ];
  });

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Patron");
  const [userStatus, setUserStatus] = useState("Active");
  const [userPhone, setUserPhone] = useState("");
  const [userDeleteConfirmId, setUserDeleteConfirmId] = useState<string | null>(null);

  // Filter/Search states for Users
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");
  const [usersStatusFilter, setUsersStatusFilter] = useState("all");

  // Sync Users list to local storage
  useEffect(() => {
    localStorage.setItem("atulya_users", JSON.stringify(usersList));
  }, [usersList]);

  const handleOpenUserAddForm = () => {
    setEditingUser(null);
    setUserName("");
    setUserEmail("");
    setUserRole("Patron");
    setUserStatus("Active");
    setUserPhone("");
    setShowUserForm(true);
  };

  const handleOpenUserEditForm = (user: any) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserStatus(user.status);
    setUserPhone(user.phone || "");
    setShowUserForm(true);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setErrorMsg("Please specify at least Name and Email address.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (editingUser) {
      // Edit mode
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        status: userStatus,
        phone: userPhone.trim()
      } : u));
      setSuccessMsg("User profile updated successfully in directory!");
    } else {
      // Add mode
      const nextId = `USR${Math.floor(100 + Math.random() * 900)}`;
      const newUser = {
        id: nextId,
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        status: userStatus,
        phone: userPhone.trim(),
        totalSpent: 0,
        orderCount: 0,
        registeredAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      setUsersList(prev => [...prev, newUser]);
      setSuccessMsg("New user profile registered successfully!");
    }

    setShowUserForm(false);
    setEditingUser(null);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleDeleteUser = (id: string) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
    setSuccessMsg("User account deleted from master registry.");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  // Orders Filter/Search states
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");

  // Order Details Panel & Invoice modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderInvoice, setShowOrderInvoice] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Gold Rate Calculator state
  const [calcPurity, setCalcPurity] = useState<"24K" | "22K" | "18K">("22K");
  const [calcWeight, setCalcWeight] = useState("8.5");
  const [calcMakingCharges, setCalcMakingCharges] = useState("12"); 
  const [calcResult, setCalcResult] = useState<any>(null);

  // Fluctuation toggle state
  const [disableFluctuations, setDisableFluctuations] = useState(() => {
    return localStorage.getItem("atulya_disable_fluctuations") === "true";
  });

  const handleToggleFluctuations = () => {
    const nextVal = !disableFluctuations;
    setDisableFluctuations(nextVal);
    localStorage.setItem("atulya_disable_fluctuations", nextVal ? "true" : "false");
  };

  // Local copy of goldRates for rate adjustments
  const [localRates, setLocalRates] = useState<GoldRate>({ ...goldRates });

  useEffect(() => {
    setLocalRates({ ...goldRates });
  }, [goldRates]);

  // Compute live jeweler quote
  useEffect(() => {
    const weight = parseFloat(calcWeight) || 0;
    const ratePerGram = goldRates[calcPurity] || 0;
    const makingPercent = parseFloat(calcMakingCharges) || 0;
    
    if (weight > 0 && ratePerGram > 0) {
      const metalCost = weight * ratePerGram;
      const makingChargesCost = metalCost * (makingPercent / 100);
      const sub = metalCost + makingChargesCost;
      const gstAmount = sub * 0.03; 
      const grand = sub + gstAmount;

      setCalcResult({
        metalCost,
        makingChargesCost,
        subtotal: sub,
        gst: gstAmount,
        grandTotal: grand
      });
    } else {
      setCalcResult(null);
    }
  }, [calcPurity, calcWeight, calcMakingCharges, goldRates]);

  // Overall Financial Aggregations
  const totalSales = orders.reduce((sum, o) => o.paymentStatus === 'Paid' ? sum + o.grandTotal : sum, 0);
  const pendingSales = orders.reduce((sum, o) => o.paymentStatus === 'Unpaid' ? sum + o.grandTotal : sum, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered').length;
  const fulfilledOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  const handleAddAttribute = () => {
    setAttributes(prev => [...prev, { label: "", value: "" }]);
  };

  const handleAttributeChange = (index: number, key: 'label' | 'value', val: string) => {
    setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, [key]: val } : attr));
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (template: typeof LUXURY_TEMPLATES[0]) => {
    setTitle(template.title);
    setCategory(template.category);
    setMaterial(template.material);
    setPrice(template.price.toString());
    setOriginalPrice(template.originalPrice?.toString() || "");
    setBadge(template.badge || "");
    setDescription(template.description);
    setImage(template.image);
    setAttributes(template.attributes);
    setSuccessMsg(`Applied "${template.title}" template details!`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setTitle("");
    setCategory("rings");
    setMaterial("gold");
    setPrice("");
    setOriginalPrice("");
    setBadge("");
    setDescription("");
    setImage("");
    setSection("");
    setCustomOptionLabel("");
    setCustomOptionValues("");
    setCustomOptionLabel2("");
    setCustomOptionValues2("");
    setCustomOptionLabel3("");
    setCustomOptionValues3("");
    setAdditionalImages([]);
    setAttributes([
      { label: "Material", value: "22K Gold" },
      { label: "Weight", value: "8.5 grams" },
      { label: "Certification", value: "BIS Hallmarked" }
    ]);
    setErrorMsg("");
    setSuccessMsg("");
    setShowProductForm(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setCategory(product.category);
    setMaterial(product.material);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "");
    setBadge(product.badge || "");
    setDescription(product.description || "");
    setImage(product.image || "");
    setSection(product.section || "");
    setCustomOptionLabel(product.customOptionLabel || "");
    setCustomOptionValues(product.customOptionValues || "");
    setCustomOptionLabel2(product.customOptionLabel2 || "");
    setCustomOptionValues2(product.customOptionValues2 || "");
    setCustomOptionLabel3(product.customOptionLabel3 || "");
    setCustomOptionValues3(product.customOptionValues3 || "");
    setAdditionalImages(product.images || []);
    setAttributes(product.attributes && product.attributes.length > 0 ? product.attributes : [
      { label: "Material", value: "22K Gold" },
      { label: "Weight", value: "8 grams" },
      { label: "Certification", value: "BIS Hallmarked" }
    ]);
    setErrorMsg("");
    setSuccessMsg("");
    setShowProductForm(true);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !image) {
      setErrorMsg("Title, Price, and Image URL are required.");
      return;
    }

    const filteredAttrs = attributes.filter(a => a.label.trim() && a.value.trim());
    const validImages = additionalImages.map(img => img.trim()).filter(img => img !== "");

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        title,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        material,
        image,
        badge: badge || undefined,
        description,
        attributes: filteredAttrs,
        section: section || undefined,
        customOptionLabel: customOptionLabel || undefined,
        customOptionValues: customOptionValues || undefined,
        customOptionLabel2: customOptionLabel2 || undefined,
        customOptionValues2: customOptionValues2 || undefined,
        customOptionLabel3: customOptionLabel3 || undefined,
        customOptionValues3: customOptionValues3 || undefined,
        images: validImages.length > 0 ? validImages : undefined,
      };

      if (onUpdateProduct) {
        onUpdateProduct(updatedProduct);
        setSuccessMsg("Masterpiece updated successfully!");
      } else {
        onAddProduct(updatedProduct);
        setSuccessMsg("Masterpiece saved successfully!");
      }
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id), 100) + 1,
        title,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        material,
        image,
        rating: 4.8 + Math.random() * 0.2,
        ratingCount: Math.floor(10 + Math.random() * 90),
        sold: 0,
        badge: badge || undefined,
        description,
        attributes: filteredAttrs,
        section: section || undefined,
        customOptionLabel: customOptionLabel || undefined,
        customOptionValues: customOptionValues || undefined,
        customOptionLabel2: customOptionLabel2 || undefined,
        customOptionValues2: customOptionValues2 || undefined,
        customOptionLabel3: customOptionLabel3 || undefined,
        customOptionValues3: customOptionValues3 || undefined,
        images: validImages.length > 0 ? validImages : undefined,
      };

      onAddProduct(newProduct);
      setSuccessMsg("New masterpiece added to catalog!");
    }

    setTimeout(() => {
      setShowProductForm(false);
      setEditingProduct(null);
    }, 1500);
  };

  const handleSaveGoldRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoldRates(localRates);
    setSuccessMsg("Royal metal board rates updated successfully!");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue) {
      setErrorMsg("Please enter coupon code and value.");
      return;
    }
    const newCoupon: CustomCoupon = {
      code: newCouponCode.toUpperCase().replace(/\s+/g, ""),
      type: newCouponType,
      value: parseFloat(newCouponValue),
      description: newCouponDesc || `${newCouponValue}${newCouponType === 'percent' ? '% Off' : ' Rupees Waiver'}`,
      active: true
    };
    setCouponsList(prev => [newCoupon, ...prev]);
    setNewCouponCode("");
    setNewCouponValue("");
    setNewCouponDesc("");
    setSuccessMsg("Promo coupon issued successfully!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleToggleCoupon = (code: string) => {
    setCouponsList(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  const handleDeleteCoupon = (code: string) => {
    setCouponsList(prev => prev.filter(c => c.code !== code));
  };

  // Filtered lists for rendering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(inventorySearch.toLowerCase()) || p.description.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCategory = inventoryCategory === "all" || p.category === inventoryCategory;
    const matchesMaterial = inventoryMaterial === "all" || p.material === inventoryMaterial;
    return matchesSearch && matchesCategory && matchesMaterial;
  });

  const filteredOrders = orders.filter(o => {
    const searchLow = ordersSearch.toLowerCase();
    const matchesSearch = o.customerName.toLowerCase().includes(searchLow) || o.id.toLowerCase().includes(searchLow) || o.customerEmail.toLowerCase().includes(searchLow);
    const matchesStatus = ordersStatusFilter === "all" || o.status === ordersStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter(u => {
    const searchLow = usersSearch.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(searchLow) || u.email.toLowerCase().includes(searchLow) || u.id.toLowerCase().includes(searchLow) || (u.phone && u.phone.includes(searchLow));
    const matchesRole = usersRoleFilter === "all" || u.role === usersRoleFilter;
    const matchesStatus = usersStatusFilter === "all" || u.status === usersStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row w-full font-sans antialiased">
      
      {/* Left Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col flex-shrink-0 relative z-10">
        {/* Brand Identity */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-gold shadow-sm">
            <Crown className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <span className="font-serif font-black text-sm tracking-wider text-slate-900 block">{storeSettings.storeName}</span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 font-extrabold uppercase block">Admin Office</span>
          </div>
        </div>

        {/* Live Gold Widget inside Sidebar */}
        <div className="mx-4 mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-800">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>BOARD RATES (22K)</span>
          </div>
          <span className="text-lg font-mono font-black text-slate-900 block mt-1">₹{goldRates["22K"]}/g</span>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">Real-Time Market Base</span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stats' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Console</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Masterwork Catalogue</span>
            <span className="ml-auto bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Fulfillment Logistics</span>
            {pendingOrdersCount > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Management</span>
            <span className="ml-auto bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {usersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coupons' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Royal Vouchers</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rates' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Metal Rate Board</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Category Desk</span>
            <span className="ml-auto bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/15" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Boutique Settings</span>
          </button>
        </nav>

        {/* Return to website */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onBack}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Retail Store</span>
          </button>
        </div>
      </aside>

      {/* Main Control Panel Dashboard Workspace */}
      <main className="flex-grow min-w-0 bg-slate-50 flex flex-col overflow-y-auto">
        
        {/* Top Control Header bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-800">
              {activeTab === 'stats' && "Executive Console"}
              {activeTab === 'products' && "Catalogue Management desk"}
              {activeTab === 'orders' && "Fulfillment Operations room"}
              {activeTab === 'users' && "User Management Directory"}
              {activeTab === 'coupons' && "Promo Coupons & Vouchers"}
              {activeTab === 'rates' && "Metal Valuation Board"}
              {activeTab === 'settings' && "Boutique Story Settings"}
              {activeTab === 'categories' && "Category Structuring desk"}
            </h1>
            <span className="hidden sm:inline bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure live sync
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="hidden sm:flex text-xs font-bold text-slate-500 hover:text-slate-900 items-center gap-1"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700 font-mono shadow-inner">
                GD
              </div>
              <span className="text-xs font-bold text-slate-700 hidden lg:inline">Goldsmith Director</span>
            </div>
          </div>
        </header>

        {/* Global Notifications Panel (Success/Error Messages) */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-6 md:mx-8 mt-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 shadow-sm"
            >
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold">{successMsg}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-6 md:mx-8 mt-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0" />
              <span className="text-xs font-bold">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Inner Tab View */}
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1">
          
          {/* ==================== TAB 1: EXECUTIVE CONSOLE ==================== */}
          {activeTab === 'stats' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              
              {/* KPIs Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                
                {/* Metric 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Realized Revenue</span>
                    <span className="text-xl font-mono font-black text-slate-900 block">₹{totalSales.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] font-bold text-emerald-600 block flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      Paid Orders volume
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unpaid Pipeline</span>
                    <span className="text-xl font-mono font-black text-slate-900 block">₹{pendingSales.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] font-bold text-amber-600 block flex items-center gap-0.5">
                      <Info className="w-3 h-3" />
                      Pending secure payment
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Transit Logistics</span>
                    <span className="text-xl font-mono font-black text-slate-900 block">{pendingOrdersCount}</span>
                    <span className="text-[9px] font-bold text-rose-500 block flex items-center gap-0.5 animate-pulse">
                      • Pending dispatch
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fulfillment Rate</span>
                    <span className="text-xl font-mono font-black text-slate-900 block">
                      {totalOrdersCount > 0 ? Math.round((fulfilledOrdersCount / totalOrdersCount) * 100) : 100}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block">
                      {fulfilledOrdersCount} of {totalOrdersCount} orders delivered
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Graphic charts & quick actions bento block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue projection custom SVG chart card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-black text-base text-slate-900">Boutique Revenue Trajectory</h3>
                      <p className="text-[10px] text-slate-400">Monthly realized revenue vs pending order pipeline</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Realized</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" /> Pending</span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative h-44 bg-slate-50/50 rounded-xl border border-slate-100 p-2 overflow-hidden flex items-end">
                    <svg className="w-full h-full absolute inset-0 text-slate-200" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <grid className="opacity-10" />
                      {/* Grid lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />

                      {/* Area 1: Realized (Green) */}
                      <path 
                        d="M0,200 L50,180 L120,130 L200,160 L280,110 L370,80 L440,65 L500,45 L500,200 Z" 
                        fill="rgba(16, 185, 129, 0.08)" 
                      />
                      <path 
                        d="M0,200 L50,180 L120,130 L200,160 L280,110 L370,80 L440,65 L500,45" 
                        fill="none" 
                        stroke="rgba(16, 185, 129, 0.8)" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Area 2: Pending (Amber) */}
                      <path 
                        d="M0,200 L50,195 L120,180 L200,150 L280,135 L370,120 L440,110 L500,90" 
                        fill="none" 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="3"
                      />
                    </svg>

                    {/* Chart Labels */}
                    <div className="absolute inset-x-2 bottom-1 flex justify-between text-[8px] font-mono font-bold text-slate-400">
                      <span>APR</span>
                      <span>MAY</span>
                      <span>JUN</span>
                      <span>JUL</span>
                      <span>AUG</span>
                      <span>SEP</span>
                      <span>OCT</span>
                      <span>NOV (LIVE)</span>
                    </div>
                  </div>
                </div>

                {/* Category distribution bar list */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="font-serif font-black text-base text-slate-900">Vault Distribution</h3>
                    <p className="text-[10px] text-slate-400">Inventory counts across jewelry categories</p>
                  </div>

                  <div className="space-y-3.5 pt-1 text-xs">
                    {Array.from(new Set(products.map(p => p.category))).slice(0, 5).map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      const percentage = Math.round((count / products.length) * 100) || 0;
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="capitalize text-slate-700">{cat}</span>
                            <span className="font-mono text-slate-500">{count} items ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Fast Forge Tool & Valuation Calculator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Quick Forge Template Spawner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-black text-base text-slate-900">⚡ Forge Masterworks</h3>
                      <p className="text-[10px] text-slate-400">Instantly register pre-configured artisan prototypes</p>
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">One-Click Addition</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {LUXURY_TEMPLATES.map(tmpl => (
                      <button
                        key={tmpl.title}
                        onClick={() => {
                          applyTemplate(tmpl);
                          setActiveTab('products');
                          setShowProductForm(true);
                        }}
                        className="p-3 bg-slate-50 hover:bg-amber-500/5 rounded-xl border border-slate-200/60 hover:border-amber-500/30 text-left transition-all group flex gap-2.5 items-start cursor-pointer"
                      >
                        <img 
                          src={tmpl.image} 
                          alt={tmpl.title} 
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="font-sans font-bold text-[10px] text-slate-800 group-hover:text-amber-800 transition-colors truncate">{tmpl.title}</h4>
                          <span className="font-mono text-[9px] font-bold text-slate-500 block mt-0.5">₹{tmpl.price.toLocaleString('en-IN')}</span>
                          <span className="text-[8px] bg-amber-500/10 text-amber-800 font-extrabold px-1 rounded uppercase tracking-wider block w-max mt-1">
                            {tmpl.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jeweller Quote Estimator */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="font-serif font-black text-base text-slate-900">📐 Master Goldsmith Calculator</h3>
                    <p className="text-[10px] text-slate-400">Test gold quotes with live board rates, making charges, and GST</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Purity</label>
                      <select 
                        value={calcPurity} 
                        onChange={(e) => setCalcPurity(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="24K">24K Gold</option>
                        <option value="22K">22K Gold</option>
                        <option value="18K">18K Gold</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Grams Weight</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={calcWeight} 
                        onChange={(e) => setCalcWeight(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Making Charge %</label>
                      <input 
                        type="number" 
                        value={calcMakingCharges} 
                        onChange={(e) => setCalcMakingCharges(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {calcResult ? (
                    <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 grid grid-cols-2 gap-y-1.5 gap-x-4 text-[10px] font-bold">
                      <div className="text-slate-500">Pure Gold Metal Cost:</div>
                      <div className="font-mono text-right text-slate-800">₹{Math.round(calcResult.metalCost).toLocaleString('en-IN')}</div>
                      
                      <div className="text-slate-500">Artisan Making Charges ({calcMakingCharges}%):</div>
                      <div className="font-mono text-right text-slate-800">₹{Math.round(calcResult.makingChargesCost).toLocaleString('en-IN')}</div>
                      
                      <div className="text-slate-500 border-t border-slate-100 pt-1">Artisan Subtotal:</div>
                      <div className="font-mono text-right text-slate-800 border-t border-slate-100 pt-1">₹{Math.round(calcResult.subtotal).toLocaleString('en-IN')}</div>
                      
                      <div className="text-slate-500">Government GST (3%):</div>
                      <div className="font-mono text-right text-slate-800">₹{Math.round(calcResult.gst).toLocaleString('en-IN')}</div>
                      
                      <div className="text-amber-800 font-extrabold border-t border-amber-500/20 pt-1">Final Client Estimate:</div>
                      <div className="font-mono text-right text-amber-900 font-black text-xs border-t border-amber-500/20 pt-1">₹{Math.round(calcResult.grandTotal).toLocaleString('en-IN')}</div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[10px] text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      Enter grams weight above to build a custom estimate.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 2: CATALOGUE MANAGEMENT ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              {showProductForm ? (
                // IN-PAGE FORM: No popup/modal!
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
                  {/* Form Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="font-serif font-black text-lg text-slate-900 flex items-center gap-2">
                        <Crown className="w-5.5 h-5.5 text-amber-500" />
                        <span>{editingProduct ? "✦ Reforge Certified Masterpiece" : "✦ Register New Masterpiece"}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Specify precise artistic details, technical weight and metals for the luxury catalog</p>
                    </div>
                    <button 
                      onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                      className="w-full sm:w-auto text-xs text-slate-600 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Catalogue</span>
                    </button>
                  </div>

                  {/* Templates list inside page for rapid injection */}
                  {!editingProduct && (
                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-600" />
                        Inject From Royal Blueprint:
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {LUXURY_TEMPLATES.map(tmpl => (
                          <button
                            key={tmpl.title}
                            type="button"
                            onClick={() => applyTemplate(tmpl)}
                            className="px-3 py-1.5 bg-white hover:bg-amber-500/10 text-slate-700 hover:text-amber-955 border border-slate-200 hover:border-amber-500/30 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            {tmpl.title.split(" (")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actual Form */}
                  <form onSubmit={handleSubmitProduct} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Masterpiece Title</label>
                        <input 
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Temple Heritage Kada"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Category</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 transition-all"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Primary Metal</label>
                          <select 
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 transition-all"
                          >
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="platinum">Platinum</option>
                            <option value="diamond">Diamond</option>
                            <option value="emerald">Emerald</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Final Selling Price (₹)</label>
                        <input 
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g., 75000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Original Price (₹) (Optional)</label>
                        <input 
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="e.g., 85000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Promo Ribbon Badge</label>
                        <select
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 transition-all"
                        >
                          <option value="">No Badge</option>
                          <option value="new">Fresh Arrival (NEW)</option>
                          <option value="exclusive">Limited Edition (EXCLUSIVE)</option>
                          <option value="sale">Promotional Offer (SALE)</option>
                          <option value="trending">Most Popular (TRENDING)</option>
                          <option value="bestseller">Best Seller (BESTSELLER)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Jewelry High-Res Image URL</label>
                      <div className="flex gap-3">
                        <input 
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                        {image && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                            <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gallery Images (अतिरिक्त चित्र) */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-slate-500" />
                        Gallery Images / Multiple Images (अतिरिक्त चित्र)
                      </h4>
                      <p className="text-[10px] text-slate-500">Add up to 5 additional high-resolution images for the product detail slide gallery.</p>
                      
                      <div className="space-y-2">
                        {additionalImages.map((imgUrl, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-[10px] font-mono text-slate-400 w-4">#{idx + 1}</span>
                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => {
                                const newImgs = [...additionalImages];
                                newImgs[idx] = e.target.value;
                                setAdditionalImages(newImgs);
                              }}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-grow bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                            />
                            {imgUrl && (
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                                <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const newImgs = additionalImages.filter((_, i) => i !== idx);
                                setAdditionalImages(newImgs);
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => setAdditionalImages([...additionalImages, ""])}
                          className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-amber-500 hover:text-amber-600 rounded-xl text-xs font-bold text-slate-500 flex items-center justify-center gap-2 transition-all cursor-pointer bg-white"
                        >
                          <span>➕ Add Gallery Image URL</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Artisan Description</label>
                      <textarea 
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe heritage details, BIS hallmark details, gemstone clarity, cut..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                      />
                    </div>

                    {/* Homepage Placement section */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest block flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-slate-500" />
                        Homepage Section Placement
                      </h4>
                      <div className="space-y-1">
                        <select
                          value={section}
                          onChange={(e) => setSection(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                        >
                          <option value="">No Special Homepage Section</option>
                          <option value="latest">✨ Latest Designs</option>
                          <option value="popular">🔥 Popular Jewelry</option>
                          <option value="special">💎 Special Offers & Discounts</option>
                        </select>
                        <p className="text-[9px] text-slate-400">Choose which curated category on the homepage this masterpiece will show up under.</p>
                      </div>
                    </div>

                    {/* Product Variables Section */}
                    <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/10 pb-3">
                        <div>
                          <h4 className="text-[11.5px] font-black uppercase text-amber-950 tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                            Product Options & Selection Variables (उत्पाद के विकल्प / Variables)
                          </h4>
                          <p className="text-[10px] text-amber-900/80 mt-0.5 font-bold">
                            Add custom options (like Size, Color, Gold Purity, Polish) that customers can choose from.
                          </p>
                        </div>
                      </div>

                      {/* Quick Presets for Admin */}
                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider block">
                          ⚡ Quick Variant Blueprints (त्वरित विकल्प टेम्पलेट):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!customOptionLabel) {
                                setCustomOptionLabel("Ring Size");
                                setCustomOptionValues("Size 10, Size 12, Size 14, Size 16, Size 18, Size 20");
                              } else if (!customOptionLabel2) {
                                setCustomOptionLabel2("Ring Size");
                                setCustomOptionValues2("Size 10, Size 12, Size 14, Size 16, Size 18, Size 20");
                              } else {
                                setCustomOptionLabel3("Ring Size");
                                setCustomOptionValues3("Size 10, Size 12, Size 14, Size 16, Size 18, Size 20");
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-955 border border-amber-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>💍 Ring Size</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!customOptionLabel) {
                                setCustomOptionLabel("Gold Polish");
                                setCustomOptionValues("Yellow Gold, Rose Gold, White Gold");
                              } else if (!customOptionLabel2) {
                                setCustomOptionLabel2("Gold Polish");
                                setCustomOptionValues2("Yellow Gold, Rose Gold, White Gold");
                              } else {
                                setCustomOptionLabel3("Gold Polish");
                                setCustomOptionValues3("Yellow Gold, Rose Gold, White Gold");
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-955 border border-amber-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>✨ Gold Polish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!customOptionLabel) {
                                setCustomOptionLabel("Gold Purity");
                                setCustomOptionValues("18 Karat Gold, 22 Karat Gold");
                              } else if (!customOptionLabel2) {
                                setCustomOptionLabel2("Gold Purity");
                                setCustomOptionValues2("18 Karat Gold, 22 Karat Gold");
                              } else {
                                setCustomOptionLabel3("Gold Purity");
                                setCustomOptionValues3("18 Karat Gold, 22 Karat Gold");
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-955 border border-amber-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>🏆 Gold Purity</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomOptionLabel("");
                              setCustomOptionValues("");
                              setCustomOptionLabel2("");
                              setCustomOptionValues2("");
                              setCustomOptionLabel3("");
                              setCustomOptionValues3("");
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <span>❌ Clear All Slots</span>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Option Slots */}
                      <div className="space-y-4">
                        {/* Slot 1 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-amber-200/50 space-y-3">
                          <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest block bg-amber-100/50 px-2 py-0.5 rounded w-fit">
                            Custom Dropdown Option Slot 1 (प्रथम विकल्प)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Option Label / Name</label>
                              <input 
                                type="text"
                                value={customOptionLabel}
                                onChange={(e) => setCustomOptionLabel(e.target.value)}
                                placeholder="e.g., Select Ring Size or Polish Type"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Choices (Comma-separated List)</label>
                              <input 
                                type="text"
                                value={customOptionValues}
                                onChange={(e) => setCustomOptionValues(e.target.value)}
                                placeholder="e.g., Size 10, Size 12, Size 14"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Slot 2 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-amber-200/50 space-y-3">
                          <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest block bg-amber-100/50 px-2 py-0.5 rounded w-fit">
                            Custom Dropdown Option Slot 2 (द्वितीय विकल्प)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Option Label / Name</label>
                              <input 
                                type="text"
                                value={customOptionLabel2}
                                onChange={(e) => setCustomOptionLabel2(e.target.value)}
                                placeholder="e.g., Select Gold Polish"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Choices (Comma-separated List)</label>
                              <input 
                                type="text"
                                value={customOptionValues2}
                                onChange={(e) => setCustomOptionValues2(e.target.value)}
                                placeholder="e.g., Yellow Gold, Rose Gold, White Gold"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Slot 3 */}
                        <div className="bg-white/60 p-3 rounded-xl border border-amber-200/50 space-y-3">
                          <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest block bg-amber-100/50 px-2 py-0.5 rounded w-fit">
                            Custom Dropdown Option Slot 3 (तृतीय विकल्प)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Option Label / Name</label>
                              <input 
                                type="text"
                                value={customOptionLabel3}
                                onChange={(e) => setCustomOptionLabel3(e.target.value)}
                                placeholder="e.g., Select Gold Purity"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">Choices (Comma-separated List)</label>
                              <input 
                                type="text"
                                value={customOptionValues3}
                                onChange={(e) => setCustomOptionValues3(e.target.value)}
                                placeholder="e.g., 18 Karat, 22 Karat"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800 transition-all shadow-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Attributes list */}
                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Technical Specifications</span>
                        <button
                          type="button"
                          onClick={handleAddAttribute}
                          className="text-[9px] bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-slate-700 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Spec Row</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {attributes.map((attr, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={attr.label}
                              placeholder="e.g., Weight"
                              onChange={(e) => handleAttributeChange(index, 'label', e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                            <input 
                              type="text"
                              value={attr.value}
                              placeholder="e.g., 12.4 grams"
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(index)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submission Buttons */}
                    <div className="flex gap-4 pt-3">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Discard Reforge
                      </button>
                      <button
                        type="submit"
                        className="flex-grow-[2] py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-gold" />
                        <span>{editingProduct ? "Re-Forge & Publish Masterpiece" : "Commit to Vault & Live Catalogue"}</span>
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                // NORMAL PRODUCTS LIST VIEW
                <>
                  {/* Header Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      
                      {/* Search bar input */}
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search masterpieces..." 
                          value={inventorySearch}
                          onChange={(e) => setInventorySearch(e.target.value)}
                          className="w-full sm:w-60 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder-slate-400 text-slate-800"
                        />
                      </div>

                      {/* Category Filter */}
                      <select
                        value={inventoryCategory}
                        onChange={(e) => setInventoryCategory(e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none text-slate-700"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>

                      {/* Material Filter */}
                      <select
                        value={inventoryMaterial}
                        onChange={(e) => setInventoryMaterial(e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none text-slate-700"
                      >
                        <option value="all">All Materials</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="diamond">Diamond</option>
                        <option value="emerald">Emerald</option>
                      </select>

                    </div>

                    <button
                      onClick={handleOpenAddForm}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-101 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 text-gold" />
                      <span>Forge Masterpiece</span>
                    </button>
                  </div>

                  {/* Master Inventory Listing Grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-16 space-y-2">
                        <Layers className="w-12 h-12 text-slate-200 mx-auto" />
                        <h4 className="font-serif font-black text-sm text-slate-800">No masterpieces match your query</h4>
                        <p className="text-[10px] text-slate-400">Try adjusting your filters or search keywords above.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="p-4.5">Artisan Preview</th>
                              <th className="p-4.5">Masterpiece Title</th>
                              <th className="p-4.5">Category</th>
                              <th className="p-4.5">Metal Material</th>
                              <th className="p-4.5 text-right">Value (₹)</th>
                              <th className="p-4.5 text-center">Fulfillment Status</th>
                              <th className="p-4.5 text-center">Desk Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredProducts.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-4">
                                  <img 
                                    src={p.image} 
                                    alt={p.title} 
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                                  />
                                </td>
                                <td className="p-4 font-bold text-slate-900">
                                  <div className="space-y-0.5">
                                    <span className="block">{p.title}</span>
                                    {p.badge && (
                                      <span className="inline-block text-[8px] bg-amber-500/10 text-amber-800 font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 capitalize text-slate-500 font-bold">{p.category}</td>
                                <td className="p-4 capitalize font-mono text-slate-500">{p.material}</td>
                                <td className="p-4 font-mono font-black text-slate-800 text-right">₹{p.price.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-center">
                                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                                    In Vault Stock
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditForm(p)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Product"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    
                                    {deleteConfirmId === p.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            onDeleteProduct(p.id);
                                            setDeleteConfirmId(null);
                                            setSuccessMsg("Masterpiece removed from catalogue.");
                                            setTimeout(() => setSuccessMsg(""), 2000);
                                          }}
                                          className="p-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-bold px-2.5"
                                        >
                                          Confirm Delete
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirmId(null)}
                                          className="p-1.5 bg-slate-200 text-slate-600 rounded-lg text-[9px] font-bold"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteConfirmId(p.id)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Product"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== TAB 3: FULFILLMENT OPERATIONS ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Filter Area */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by client name, email, or order ID..." 
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400"
                  />
                </div>

                <select
                  value={ordersStatusFilter}
                  onChange={(e) => setOrdersStatusFilter(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none text-slate-700"
                >
                  <option value="all">All Transit Statuses</option>
                  <option value="Pending">Pending Assignment</option>
                  <option value="Customizing">Customizing Desk</option>
                  <option value="Assayed & Certified">Assayed & Certified</option>
                  <option value="Insured Transit">Insured Transit</option>
                  <option value="Delivered">Delivered Handshake</option>
                </select>

              </div>

              {/* Orders Split layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Orders List Table Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" />
                      <h4 className="font-serif font-black text-sm text-slate-800">No client orders recorded</h4>
                      <p className="text-[10px] text-slate-400">Wait for client checkouts or try adjusting filters.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Client Patron</th>
                            <th className="p-4">Total Amount (₹)</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Logistics</th>
                            <th className="p-4 text-center">Fulfillment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredOrders.map(o => (
                            <tr 
                              key={o.id} 
                              onClick={() => setSelectedOrder(o)}
                              className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                                selectedOrder?.id === o.id ? "bg-amber-500/5 hover:bg-amber-500/10" : ""
                              }`}
                            >
                              <td className="p-4 font-mono font-bold text-slate-900">#{o.id.substring(0, 8)}</td>
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <span className="block font-bold text-slate-800">{o.customerName}</span>
                                  <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{o.customerEmail}</span>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-black text-slate-800">₹{o.grandTotal.toLocaleString('en-IN')}</td>
                              <td className="p-4">
                                <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  o.paymentStatus === 'Paid' 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                    : o.paymentStatus === 'Refunded'
                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}>
                                  {o.paymentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                  o.status === 'Delivered' 
                                    ? "bg-slate-100 text-slate-600" 
                                    : o.status === 'Insured Transit'
                                    ? "bg-blue-500 text-white animate-pulse"
                                    : "bg-amber-500/10 text-amber-800"
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button className="text-xs text-amber-800 hover:text-amber-900 font-black">
                                  Manage Desk →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Logistics Desk Console Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-6">
                  {selectedOrder ? (
                    <div className="space-y-5">
                      
                      {/* Section 1 Header */}
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ACTIVE LOGISTICS DESK</span>
                        <h3 className="font-serif font-black text-base text-slate-900 mt-1">Order #{selectedOrder.id.substring(0, 12)}</h3>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Placed: {selectedOrder.createdAt}</span>
                      </div>

                      {/* Section 2 Patron specs */}
                      <div className="space-y-2 text-xs">
                        <h4 className="font-sans font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Patron Information</h4>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 font-medium text-slate-700">
                          <div className="flex justify-between"><span>Name:</span><span className="font-bold text-slate-900">{selectedOrder.customerName}</span></div>
                          <div className="flex justify-between"><span>Phone:</span><span className="font-mono text-slate-900">{selectedOrder.customerPhone}</span></div>
                          <div className="flex justify-between"><span>City:</span><span className="text-slate-900">{selectedOrder.city}</span></div>
                          <div className="flex justify-between"><span>Zipcode:</span><span className="font-mono text-slate-900">{selectedOrder.pincode}</span></div>
                          <div className="border-t border-slate-200/50 pt-1.5 mt-1.5">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Shipping Transit Address:</span>
                            <span className="text-slate-900 block leading-tight font-sans text-[11px]">{selectedOrder.shippingAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 3 Bag products */}
                      <div className="space-y-2">
                        <h4 className="font-sans font-extrabold text-[10px] uppercase text-slate-400 tracking-wider flex items-center justify-between">
                          <span>Acquired Masterpieces</span>
                          <span className="text-[9px] text-gold font-bold">Click item to view product</span>
                        </h4>
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {selectedOrder.items.map(item => {
                            const matchingProduct = products.find(p => p.id === item.id) || {
                              id: item.id,
                              title: item.title,
                              price: item.price,
                              category: "acquired",
                              material: "gold",
                              image: item.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
                              description: "An authentic masterpiece acquired in order #" + selectedOrder.id,
                              attributes: [
                                { label: "Material", value: "Verified Gold / Platinum" },
                                { label: "Acquired Price", value: `₹${item.price.toLocaleString('en-IN')}` }
                              ]
                            };

                            return (
                              <div 
                                key={item.id} 
                                onClick={() => setPreviewProduct(matchingProduct as Product)}
                                className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-bold border border-slate-100 hover:bg-amber-50/70 hover:border-amber-200 cursor-pointer transition-all duration-200 group relative"
                                title="Click to view product details"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={item.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"}
                                    alt={item.title}
                                    className="w-8 h-8 object-cover rounded-md border border-slate-200 flex-shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <span className="block text-slate-800 truncate group-hover:text-amber-800 transition-colors">{item.title}</span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="font-mono text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                  <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-gold transition-colors" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 4 Logistics Actions */}
                      <div className="space-y-3.5 border-t border-slate-100 pt-4">
                        <h4 className="font-sans font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Update Order Status</h4>
                        
                        {/* Status Select */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 block">Artisan Transit Status</label>
                          <select 
                            value={selectedOrder.status}
                            onChange={(e) => {
                              onUpdateOrderStatus(selectedOrder.id, e.target.value as any);
                              setSelectedOrder(prev => prev ? { ...prev, status: e.target.value as any } : null);
                              setSuccessMsg("Artisan transit status synchronized!");
                              setTimeout(() => setSuccessMsg(""), 2000);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                          >
                            <option value="Pending">Pending Assignment</option>
                            <option value="Customizing">Customizing Desk</option>
                            <option value="Assayed & Certified">Assayed & Certified</option>
                            <option value="Insured Transit">Insured Transit</option>
                            <option value="Delivered">Delivered Handshake</option>
                          </select>
                        </div>

                        {/* Payment Select */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 block">Board Payment Status</label>
                          <select 
                            value={selectedOrder.paymentStatus}
                            onChange={(e) => {
                              onUpdateOrderPayment(selectedOrder.id, e.target.value as any);
                              setSelectedOrder(prev => prev ? { ...prev, paymentStatus: e.target.value as any } : null);
                              setSuccessMsg("Board payment state synchronized!");
                              setTimeout(() => setSuccessMsg(""), 2000);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                          >
                            <option value="Unpaid">Unpaid Pipeline</option>
                            <option value="Paid">Paid Settlement</option>
                            <option value="Refunded">Refunded Settlement</option>
                          </select>
                        </div>

                        {/* Printable Invoice & simulated WhatsApp */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            onClick={() => setShowOrderInvoice(true)}
                            className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Printer className="w-4 h-4 text-gold" />
                            <span>View Invoice</span>
                          </button>

                          <a
                            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(selectedOrder.customerPhone)}&text=${encodeURIComponent(`Greetings ${selectedOrder.customerName}! This is ${storeSettings.storeName}. Your Royal Order #${selectedOrder.id.substring(0,8)} is updated to: ${selectedOrder.status}. Secure BIS tracking link available online!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Phone className="w-4 h-4" />
                            <span>WhatsApp SMS</span>
                          </a>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 space-y-2">
                      <Sliders className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-[10px] font-bold">Pick an order from the list to launch the active logistics desk.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Printable Invoice Modal overlay */}
              <AnimatePresence>
                {showOrderInvoice && selectedOrder && (
                  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 border border-neutral-200 overflow-y-auto max-h-[90vh]"
                      id="printable-invoice-container"
                    >
                      {/* Premium Certified Invoice Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-4 border-slate-950 pb-5">
                        <div className="space-y-1.5">
                          <h2 className="font-serif font-black text-2xl text-slate-950 tracking-tight flex items-center gap-2">
                            <Crown className="w-6 h-6 text-gold" />
                            <span>{storeSettings.storeName}</span>
                          </h2>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-xs">
                            {storeSettings.contactAddress}<br />
                            Email: {storeSettings.contactEmail} | Tel: {storeSettings.contactPhone}
                          </p>
                        </div>
                        <div className="text-right space-y-1 sm:self-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[9px] font-black uppercase tracking-wider rounded">
                            <Award className="w-3.5 h-3.5 text-gold-dark" />
                            <span>BIS Certified Voucher</span>
                          </div>
                          <p className="font-mono text-xs font-bold text-slate-900 mt-1">Invoice ID: #{selectedOrder.id}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Date: {selectedOrder.createdAt}</p>
                        </div>
                      </div>

                      {/* Invoice Client Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-b border-neutral-100 pb-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">CLIENT BILL TO:</span>
                          <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                          <p className="text-slate-500 font-mono text-[10px]">{selectedOrder.customerEmail}</p>
                          <p className="text-slate-500 font-mono">{selectedOrder.customerPhone}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">TRANSIT SECURED DESTINATION:</span>
                          <p className="text-slate-700 leading-tight">
                            {selectedOrder.shippingAddress}<br />
                            {selectedOrder.city} - {selectedOrder.pincode}<br />
                            <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1 mt-1">
                              ✓ Fully Insured Doorstep Express
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Itemized Table */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">ITEMIZED DESCRIPTION OF PRECIOUS METALS</span>
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-[9px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-200">
                                <th className="p-3">Masterwork Acquired Item</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-center">Hallmark Purity</th>
                                <th className="p-3 text-right">Sum subtotal (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {selectedOrder.items.map(item => (
                                <tr key={item.id}>
                                  <td className="p-3">
                                    <div>
                                      <p className="text-slate-900 font-bold">{item.title}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">UID: AT-PRD-{item.id}</p>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center text-slate-600 font-mono font-bold">{item.quantity}</td>
                                  <td className="p-3 text-center">
                                    <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-200/40 px-2 py-0.5 rounded font-black">
                                      HUID Verified
                                    </span>
                                  </td>
                                  <td className="p-3 text-right text-slate-900 font-mono font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Calculations total */}
                      <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs font-bold gap-1.5">
                        <div className="flex justify-between w-64 text-slate-500">
                          <span>Showroom Subtotal:</span>
                          <span className="font-mono">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between w-64 text-slate-500">
                          <span>Precious Metal Tax (GST 3%):</span>
                          <span className="font-mono">₹{selectedOrder.gst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between w-64 text-slate-500">
                          <span>Insured Safeguard Package:</span>
                          <span className="text-emerald-700 font-bold uppercase">Free</span>
                        </div>
                        <div className="flex justify-between w-64 border-t border-slate-900 pt-2 text-sm text-slate-950 font-black">
                          <span>Certified Total Settlement:</span>
                          <span className="font-mono text-amber-900 text-base">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Bottom signatures / certifications */}
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100 items-end text-center">
                        <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                          <span className="text-[15px]">👑</span>
                          <span className="text-[8px] font-black uppercase text-neutral-400 mt-1.5 tracking-widest">ATULYA GUARANTEE</span>
                          <p className="text-[9px] text-neutral-600 font-bold mt-0.5">100% Certified Metal Purity</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="border-b border-neutral-300 mx-auto w-36 h-8 flex items-end justify-center">
                            <span className="font-serif italic text-xs font-bold text-neutral-700">Aparna Sen</span>
                          </div>
                          <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block">Concierge Desk Sign</span>
                        </div>
                      </div>

                      {/* Footer terms */}
                      <div className="border-t border-slate-100 pt-4 text-center space-y-3">
                        <p className="text-[9px] text-slate-400 font-medium">
                          Thank you for being a patron of {storeSettings.storeName}. This digital receipt serves as legal proof of BIS Hallmarking coverage.
                        </p>
                        <div className="flex justify-center gap-3 text-[10px] font-bold">
                          <button
                            onClick={() => {
                              const printContent = document.getElementById("printable-invoice-container");
                              if (!printContent) return;
                              const originalContent = document.body.innerHTML;
                              document.body.innerHTML = printContent.outerHTML;
                              window.print();
                              document.body.innerHTML = originalContent;
                              window.location.reload();
                            }}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
                          >
                            <Printer className="w-4 h-4 text-gold" />
                            <span>Print Certified Invoice</span>
                          </button>
                          <button
                            onClick={() => setShowOrderInvoice(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Product Preview Modal overlay inside order details */}
              <AnimatePresence>
                {previewProduct && (
                  <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200 flex flex-col"
                    >
                      {/* Image Header with Badge */}
                      <div className="relative h-64 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={previewProduct.image}
                          alt={previewProduct.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {previewProduct.badge && (
                          <span className="absolute top-4 left-4 text-[9px] font-black bg-gold text-neutral-950 px-2.5 py-1 uppercase tracking-widest rounded-full shadow-md animate-pulse">
                            {previewProduct.badge}
                          </span>
                        )}
                        <button
                          onClick={() => setPreviewProduct(null)}
                          className="absolute top-4 right-4 p-2 bg-white/85 hover:bg-white text-neutral-800 rounded-full shadow-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Details Content */}
                      <div className="p-6 space-y-4 text-left flex-1 overflow-y-auto">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-black tracking-wider text-amber-800 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                              {previewProduct.category} • {previewProduct.material}
                            </span>
                            <span className="text-xs font-mono font-bold text-neutral-400">ID: #{previewProduct.id}</span>
                          </div>
                          <h3 className="font-serif font-black text-xl text-neutral-900 leading-snug mt-1.5">{previewProduct.title}</h3>
                        </div>

                        {/* Valuation Pricing */}
                        <div className="flex items-baseline gap-2 pb-3 border-b border-slate-100">
                          <span className="text-lg font-mono font-black text-gold-dark">₹{previewProduct.price.toLocaleString('en-IN')}</span>
                          {previewProduct.originalPrice && (
                            <span className="text-xs font-mono font-bold text-neutral-400 line-through">₹{previewProduct.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Artisan Craft Description</span>
                          <p className="text-xs text-neutral-600 leading-relaxed font-medium">{previewProduct.description}</p>
                        </div>

                        {/* Product specifications list */}
                        {previewProduct.attributes && previewProduct.attributes.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Royal Metal Specifications</span>
                            <div className="grid grid-cols-2 gap-2">
                              {previewProduct.attributes.map((attr, idx) => (
                                <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs font-medium">
                                  <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{attr.label}</span>
                                  <span className="text-slate-800 font-bold block mt-0.5">{attr.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Authentication Notice */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2 items-center text-[10px] text-amber-900 leading-normal font-medium">
                          <Award className="w-5 h-5 text-gold flex-shrink-0" />
                          <span>
                            This design carries standard <strong>Laser HUID engraving</strong>, verifying 100% pure precious alloys. Hand-crafted using century-old filigree styles by award-winning karigars.
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewProduct(null)}
                          className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Dismiss Preview
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* ==================== TAB 3.5: USER MANAGEMENT DIRECTORY ==================== */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              
              {showUserForm ? (
                // Beautiful in-page profile creation form (No popup!)
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
                  {/* Form Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="font-serif font-black text-lg text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-5.5 h-5.5 text-amber-500" />
                        <span>{editingUser ? "✦ Re-role & Update Patron Profile" : "✦ Register New User Profile"}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Specify precise contact details, roles, and vault access permissions</p>
                    </div>
                    <button 
                      onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                      className="w-full sm:w-auto text-xs text-slate-600 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Directory</span>
                    </button>
                  </div>

                  {/* Actual Form */}
                  <form onSubmit={handleSubmitUser} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Full Patron Name</label>
                        <input 
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="e.g., Aarav Sharma"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Patron Email Address</label>
                        <input 
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="e.g., aarav@atulya.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Contact Telephone Phone</label>
                        <input 
                          type="text"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="e.g., +91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Vault Access Role</label>
                        <select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 transition-all"
                        >
                          <option value="Patron">Patron (Standard Customer)</option>
                          <option value="Artisan">Artisan (Workshop Goldsmith)</option>
                          <option value="Goldsmith Admin">Goldsmith Admin (Full Office Controller)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Registry Status</label>
                        <select
                          value={userStatus}
                          onChange={(e) => setUserStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 transition-all"
                        >
                          <option value="Active">Active Profile</option>
                          <option value="Suspended">Suspended/Locked Profile</option>
                        </select>
                      </div>

                    </div>

                    {/* Submission Buttons */}
                    <div className="flex gap-4 pt-3">
                      <button
                        type="button"
                        onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Discard Profile
                      </button>
                      <button
                        type="submit"
                        className="flex-grow-[2] py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-gold" />
                        <span>{editingUser ? "Update Patron Profile" : "Register Profile to Directory"}</span>
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                // NORMAL USERS LIST VIEW
                <>
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Directory</span>
                        <span className="text-lg font-mono font-black text-slate-900 block">{usersList.length}</span>
                        <span className="text-[9px] font-bold text-slate-500 block">Registered customer accounts</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Officers</span>
                        <span className="text-lg font-mono font-black text-slate-900 block">
                          {usersList.filter(u => u.role !== 'Patron').length}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 block">Admins & Artisans online</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <UserCheck className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suspended Directory</span>
                        <span className="text-lg font-mono font-black text-slate-900 block">
                          {usersList.filter(u => u.status === 'Suspended').length}
                        </span>
                        <span className="text-[9px] font-bold text-rose-500 block">Restricted vault access</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      
                      {/* Search bar input */}
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search directory by name, ID or email..." 
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder-slate-400 text-slate-800"
                        />
                      </div>

                      {/* Role Filter */}
                      <select
                        value={usersRoleFilter}
                        onChange={(e) => setUsersRoleFilter(e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none text-slate-700"
                      >
                        <option value="all">All Roles</option>
                        <option value="Patron">Patron</option>
                        <option value="Artisan">Artisan</option>
                        <option value="Goldsmith Admin">Goldsmith Admin</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={usersStatusFilter}
                        onChange={(e) => setUsersStatusFilter(e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none text-slate-700"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Active">Active Profile</option>
                        <option value="Suspended">Suspended Profile</option>
                      </select>

                    </div>

                    <button
                      onClick={handleOpenUserAddForm}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-101 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 text-gold" />
                      <span>Register Patron Profile</span>
                    </button>
                  </div>

                  {/* Users Listing Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-16 space-y-2">
                        <UserCheck className="w-12 h-12 text-slate-200 mx-auto" />
                        <h4 className="font-serif font-black text-sm text-slate-800">No patron records found</h4>
                        <p className="text-[10px] text-slate-400">Try adjusting your filters or search keywords above.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="p-4.5">Client Patron</th>
                              <th className="p-4.5">Registry Role</th>
                              <th className="p-4.5">Contact Phone</th>
                              <th className="p-4.5 text-right">Lifetime Spent</th>
                              <th className="p-4.5 text-center">Orders Placed</th>
                              <th className="p-4.5 text-center">Registry Status</th>
                              <th className="p-4.5 text-center">Desk Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredUsers.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="block font-bold text-slate-900">{u.name}</span>
                                    <span className="block text-[10px] text-slate-400 font-mono font-medium">{u.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                    u.role === 'Goldsmith Admin' 
                                      ? "bg-rose-50 text-rose-700 border-rose-100" 
                                      : u.role === 'Artisan'
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-slate-500 font-medium">{u.phone || "Not Specified"}</td>
                                <td className="p-4 font-mono font-black text-slate-800 text-right">₹{u.totalSpent.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-center font-mono font-bold text-slate-600">{u.orderCount}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    u.status === 'Active' 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenUserEditForm(u)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Profile"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    
                                    {userDeleteConfirmId === u.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            handleDeleteUser(u.id);
                                            setUserDeleteConfirmId(null);
                                          }}
                                          className="p-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-bold px-2.5 cursor-pointer"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => setUserDeleteConfirmId(null)}
                                          className="p-1.5 bg-slate-200 text-slate-600 rounded-lg text-[9px] font-bold cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setUserDeleteConfirmId(u.id)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== TAB 4: ROYAL VOUCHERS ==================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to issue new coupon */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ROYAL DECREE</span>
                    <h3 className="font-serif font-black text-base text-slate-900 mt-1">Issue New Promo Coupon</h3>
                    <p className="text-[10px] text-slate-400">Spawn custom codes for seasonal marketing campaigns</p>
                  </div>

                  <form onSubmit={handleAddCoupon} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Voucher Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g., DIWALI2026"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-black tracking-wider uppercase focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Discount Type</label>
                        <select
                          value={newCouponType}
                          onChange={(e) => setNewCouponType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none text-slate-800"
                        >
                          <option value="percent">Percentage Off (%)</option>
                          <option value="fixed">Flat Cash Off (₹)</option>
                          <option value="gold_percent">Gold Waiver (%)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Waiver Value</label>
                        <input 
                          type="number" 
                          placeholder="e.g., 10"
                          value={newCouponValue}
                          onChange={(e) => setNewCouponValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Client Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Flat 10% store discount for Diwali patrons"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/10 cursor-pointer transition-all"
                    >
                      Issue Coupon
                    </button>

                  </form>
                </div>

                {/* Coupons active index list */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-serif font-black text-base text-slate-900">Active Royal Promo Coupons</h3>
                    <p className="text-[10px] text-slate-400">Total {couponsList.length} promotional codes issued in registry</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {couponsList.map(c => (
                      <div key={c.code} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-800 font-mono font-black text-xs rounded-lg border border-amber-500/20 tracking-wider">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono">
                              ({c.type === 'percent' ? `${c.value}% Flat Off` : c.type === 'fixed' ? `₹${c.value} Waivers` : `${c.value}% Gold Waivers`})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{c.description}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleToggleCoupon(c.code)}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                              c.active 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                          >
                            {c.active ? "● ACTIVE" : "○ INACTIVE"}
                          </button>

                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 5: METAL VALUATION BOARD ==================== */}
          {activeTab === 'rates' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to update rates */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">METAL BOARD DESK</span>
                    <h3 className="font-serif font-black text-base text-slate-900 mt-1">Board Rates (per gram)</h3>
                    <p className="text-[10px] text-slate-400">Set base rates used for calculations & live quotes</p>
                  </div>

                  <form onSubmit={handleSaveGoldRates} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">24K Pure Gold (₹/g)</label>
                      <input 
                        type="number" 
                        value={localRates["24K"]}
                        onChange={(e) => setLocalRates(prev => ({ ...prev, "24K": parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">22K Jewelry Gold (₹/g)</label>
                      <input 
                        type="number" 
                        value={localRates["22K"]}
                        onChange={(e) => setLocalRates(prev => ({ ...prev, "22K": parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">18K Custom Gold (₹/g)</label>
                      <input 
                        type="number" 
                        value={localRates["18K"]}
                        onChange={(e) => setLocalRates(prev => ({ ...prev, "18K": parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Fine Silver (₹/g)</label>
                        <input 
                          type="number" 
                          value={localRates.Silver}
                          onChange={(e) => setLocalRates(prev => ({ ...prev, Silver: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Platinum (₹/g)</label>
                        <input 
                          type="number" 
                          value={localRates.Platinum}
                          onChange={(e) => setLocalRates(prev => ({ ...prev, Platinum: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/10 cursor-pointer transition-all"
                    >
                      Save Board Rates
                    </button>

                  </form>
                </div>

                {/* Configuration / Explanation Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                  <div>
                    <h3 className="font-serif font-black text-base text-slate-900">Board Rate Desk Configuration</h3>
                    <p className="text-[10px] text-slate-400">Control the real-time simulation logic and client estimators</p>
                  </div>

                  <div className="space-y-4 pt-1">
                    
                    {/* Rate Fluctuations Switch Toggle */}
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="space-y-1 max-w-[75%]">
                        <h4 className="font-sans font-bold text-xs text-slate-800">Enable Automated Market Fluctuations</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          When checked, the rates will simulate minor stock exchange drift fluctuations every 12 seconds to give the website a real-time live trading feel. Uncheck to keep static jeweler board rates.
                        </p>
                      </div>

                      <button
                        onClick={handleToggleFluctuations}
                        className={`px-4.5 py-2 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${
                          !disableFluctuations 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-slate-100 text-slate-400 border-slate-200"
                        }`}
                      >
                        {!disableFluctuations ? "● ENABLED" : "○ LOCKED STATIC"}
                      </button>
                    </div>

                    {/* Quick helper desk */}
                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <h5 className="font-bold text-slate-900">Precious Metal Pricing Formula:</h5>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          Client Product Estimate = <span className="font-bold text-slate-800">(Gram Weight × Board Rate)</span> + <span className="font-bold text-slate-800">Artisan Making Charge</span> + <span className="font-bold text-slate-800">3% Government GST</span>. Live valuation estimates are calculated dynamically on the Valuation Studio and master checkouts.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 6: BOUTIQUE STORY SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-6 max-w-3xl">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">BOUTIQUE IDENTITY DESK</span>
                  <h3 className="font-serif font-black text-base text-slate-900 mt-1">Manage Website Content Settings</h3>
                  <p className="text-[10px] text-slate-400">Edit brand, contact, hours, and stories dynamically across your entire store</p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSuccessMsg("Store settings committed successfully!");
                    setTimeout(() => setSuccessMsg(""), 2500);
                  }} 
                  className="space-y-4 text-xs font-bold"
                >
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Boutique Name</label>
                      <input 
                        type="text" 
                        value={storeSettings.storeName}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Concierge Email</label>
                      <input 
                        type="email" 
                        value={storeSettings.contactEmail}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Concierge Tel Phone</label>
                      <input 
                        type="text" 
                        value={storeSettings.contactPhone}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, contactPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Showroom Hours Notice</label>
                      <input 
                        type="text" 
                        value={storeSettings.showroomHours}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, showroomHours: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Promo Countdown Banner Text</label>
                      <input 
                        type="text" 
                        value={storeSettings.announcementText}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">Active Promo Coupon Code</label>
                      <input 
                        type="text" 
                        value={storeSettings.announcementCode}
                        onChange={(e) => onUpdateStoreSettings({ ...storeSettings, announcementCode: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-black uppercase focus:outline-none focus:border-amber-500 text-slate-800"
                      />
                    </div>

                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-4">
                    <label className="text-[9px] font-black uppercase text-slate-400 block">Physical Showroom Address</label>
                    <input 
                      type="text" 
                      value={storeSettings.contactAddress}
                      onChange={(e) => onUpdateStoreSettings({ ...storeSettings, contactAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block">Family Heritage story text (About section)</label>
                    <textarea 
                      rows={4}
                      value={storeSettings.aboutStory}
                      onChange={(e) => onUpdateStoreSettings({ ...storeSettings, aboutStory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium leading-normal focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-900/10 cursor-pointer"
                    >
                      Commit Website Changes
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* ==================== TAB 7: CATEGORY MANAGEMENT ==================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CATALOG STRUCTURING DESK</span>
                  <h3 className="font-serif font-black text-base text-slate-900 mt-1">Boutique Category Collections</h3>
                  <p className="text-[10px] text-slate-400">Add, edit, or remove catalog categories, update banners and marketing promises dynamically</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatId("");
                    setCatName("");
                    setCatTitle("");
                    setCatTagline("");
                    setCatDescription("");
                    setCatBanner("");
                    setCatPurityBadge("");
                    setCatTrustFactor("");
                    setShowCategoryForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer self-start sm:self-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>

              {/* Form Modal/Section */}
              <AnimatePresence>
                {showCategoryForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4 max-w-3xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-serif font-black text-sm text-slate-900">
                        {editingCategory ? `Modify Category: ${editingCategory.name}` : "Establish New Category"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(false)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!catId.trim() || !catName.trim()) {
                          setErrorMsg("Category ID and Category Name are required.");
                          return;
                        }
                        const finalId = catId.trim().toLowerCase().replace(/\s+/g, "-");
                        const newCat: Category = {
                          id: finalId,
                          name: catName.trim(),
                          title: catTitle.trim() || undefined,
                          tagline: catTagline.trim() || undefined,
                          description: catDescription.trim() || undefined,
                          banner: catBanner.trim() || undefined,
                          purityBadge: catPurityBadge.trim() || undefined,
                          trustFactor: catTrustFactor.trim() || undefined
                        };

                        if (editingCategory) {
                          onUpdateCategory?.(newCat);
                          setSuccessMsg(`Category "${newCat.name}" updated successfully!`);
                        } else {
                          onAddCategory?.(newCat);
                          setSuccessMsg(`Category "${newCat.name}" created successfully!`);
                        }
                        setShowCategoryForm(false);
                        setTimeout(() => setSuccessMsg(""), 2500);
                      }}
                      className="space-y-4 text-xs font-bold text-left"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Category ID (Unique Slug)</label>
                          <input
                            type="text"
                            disabled={!!editingCategory}
                            value={catId}
                            onChange={(e) => setCatId(e.target.value)}
                            placeholder="e.g. rings"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800 disabled:opacity-50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Category Display Name</label>
                          <input
                            type="text"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            placeholder="e.g. Rings"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Hero Title</label>
                          <input
                            type="text"
                            value={catTitle}
                            onChange={(e) => setCatTitle(e.target.value)}
                            placeholder="e.g. Engagement & Cocktail Rings"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Hero Tagline</label>
                          <input
                            type="text"
                            value={catTagline}
                            onChange={(e) => setCatTagline(e.target.value)}
                            placeholder="e.g. VVS-VS Clarity Hand-Crafted Diamonds"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Hero Banner Image URL</label>
                        <input
                          type="text"
                          value={catBanner}
                          onChange={(e) => setCatBanner(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-amber-500 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Description</label>
                        <textarea
                          rows={3}
                          value={catDescription}
                          onChange={(e) => setCatDescription(e.target.value)}
                          placeholder="Describe this category's craftsmanship and unique identity..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium leading-normal focus:outline-none focus:border-amber-500 text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Purity Assurance Badge</label>
                          <input
                            type="text"
                            value={catPurityBadge}
                            onChange={(e) => setCatPurityBadge(e.target.value)}
                            placeholder="e.g. BIS Hallmarked 18K/22K"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block text-left">Trust Factor / Guarantee Promise</label>
                          <input
                            type="text"
                            value={catTrustFactor}
                            onChange={(e) => setCatTrustFactor(e.target.value)}
                            placeholder="e.g. Hand-set by Elite Artisans"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                        >
                          {editingCategory ? "Commit Category Edits" : "Launch Category Collection"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCategoryForm(false)}
                          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid List of categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
                {categories.map((cat) => {
                  const productCount = products.filter(p => p.category === cat.id).length;
                  return (
                    <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col hover:shadow-md transition-shadow">
                      {/* Category Banner Preview */}
                      <div className="h-32 bg-slate-100 relative">
                        {cat.banner ? (
                          <img
                            src={cat.banner}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                            <Layers className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <span className="text-[8px] bg-amber-500/95 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-block mb-1">
                            {cat.id}
                          </span>
                          <h4 className="font-serif font-black text-sm leading-tight">{cat.name}</h4>
                        </div>
                        <div className="absolute top-3 right-4 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[8.5px] font-bold text-white uppercase tracking-wider">
                          {productCount} items
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between text-left space-y-3">
                        <div className="space-y-1">
                          {cat.tagline && (
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider line-clamp-1">{cat.tagline}</p>
                          )}
                          {cat.description && (
                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{cat.description}</p>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-1 text-left">
                          {cat.purityBadge && (
                            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Badge: {cat.purityBadge}</span>
                            </div>
                          )}
                          {cat.trustFactor && (
                            <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Promise: {cat.trustFactor}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCatId(cat.id);
                              setCatName(cat.name);
                              setCatTitle(cat.title || "");
                              setCatTagline(cat.tagline || "");
                              setCatDescription(cat.description || "");
                              setCatBanner(cat.banner || "");
                              setCatPurityBadge(cat.purityBadge || "");
                              setCatTrustFactor(cat.trustFactor || "");
                              setShowCategoryForm(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="flex-grow py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg transition-colors border border-slate-100 cursor-pointer text-center"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to delete category "${cat.name}"?`)) {
                                onDeleteCategory?.(cat.id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
