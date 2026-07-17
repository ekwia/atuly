import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, Mail, Phone, MapPin, Settings, Package, Lock, 
  ShieldCheck, LogOut, Edit3, Save, CheckCircle2, ChevronRight, 
  Sparkles, FileText, HelpCircle, Activity, Check, Truck, BadgeCheck,
  Eye, Info, Bell, Shield, Compass, ArrowRight, Heart, Award, Calendar,
  Download, ExternalLink, Percent, TrendingUp
} from "lucide-react";
import { User, Order } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface UserProfilePageProps {
  currentUser: User | null;
  orders: Order[];
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function UserProfilePage({ 
  currentUser, 
  orders, 
  onLogout, 
  onUpdateUser 
}: UserProfilePageProps) {
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "address" | "settings" | "loyalty" | "certificates" | "concierge">("orders");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  
  // Consultation booking state
  const [bookings, setBookings] = useState<any[]>(() => {
    try {
      if (currentUser) {
        const stored = localStorage.getItem(`atulya_bookings_${currentUser.email}`);
        return stored ? JSON.parse(stored) : [];
      }
    } catch {}
    return [];
  });
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("11:00 AM");
  const [bookingType, setBookingType] = useState("bridal");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSavedMessage, setBookingSavedMessage] = useState("");

  // Certificates verification state
  const [verifyingCertId, setVerifyingCertId] = useState<string | null>(null);
  const [verifiedCertId, setVerifiedCertId] = useState<string | null>(null);

  // Custom dialog state for support/AI concierge link helper
  const [activeHelpOrder, setActiveHelpOrder] = useState<string | null>(null);

  // Address State
  const [addressData, setAddressData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
    alternatePhone: "",
    deliveryNotes: ""
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressSavedMessage, setAddressSavedMessage] = useState("");

  // Settings State
  const [settingsData, setSettingsData] = useState({
    metalPurity: "22K",
    currency: "INR",
    emailNotifications: true,
    smsAlerts: true,
    exclusiveOffers: true,
    biometricVerification: false
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState("");

  // Initialize from LocalStorage
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      
      // Load saved address
      try {
        const storedAddr = localStorage.getItem(`atulya_address_${currentUser.email}`);
        if (storedAddr) {
          setAddressData(prev => ({
            ...prev,
            ...JSON.parse(storedAddr)
          }));
        } else {
          // Defaults
          setAddressData({
            name: currentUser.name,
            phone: "",
            address: "",
            city: "",
            pincode: "",
            landmark: "",
            alternatePhone: "",
            deliveryNotes: ""
          });
        }
      } catch (e) {
        console.error("Error reading saved address:", e);
      }

      // Load saved settings
      try {
        const storedSettings = localStorage.getItem(`atulya_settings_${currentUser.email}`);
        if (storedSettings) {
          setSettingsData(prev => ({
            ...prev,
            ...JSON.parse(storedSettings)
          }));
        }
      } catch (e) {
        console.error("Error reading saved settings:", e);
      }
    }
  }, [currentUser]);

  // Persist bookings to LocalStorage when they change
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(`atulya_bookings_${currentUser.email}`, JSON.stringify(bookings));
      } catch (e) {
        console.error("Failed to save bookings", e);
      }
    }
  }, [bookings, currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-gold border border-amber-100 shadow-sm">
          <UserIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">Your Atulya Desk</h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Please sign in to access your sovereign jewelry ledger, track transit packages, and update your delivery vault addresses.
          </p>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-[11px] text-amber-900 leading-normal max-w-xs mx-auto">
          🔒 Real-time hallmark tracking and custom order verification requires secure login credentials.
        </div>
      </div>
    );
  }

  // Filter orders for the current user
  const userOrders = orders.filter(
    order => order.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
  );

  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    const updatedUser: User = {
      ...currentUser,
      name: profileName.trim(),
      picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profileName.trim())}`
    };
    onUpdateUser(updatedUser);
    setIsEditingProfile(false);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(`atulya_address_${currentUser.email}`, JSON.stringify(addressData));
      setIsEditingAddress(false);
      setAddressSavedMessage("Address vaulted successfully!");
      setTimeout(() => setAddressSavedMessage(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(`atulya_settings_${currentUser.email}`, JSON.stringify(settingsData));
      setSettingsSavedMessage("Boutique preferences updated!");
      setTimeout(() => setSettingsSavedMessage(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to determine active steps for progress tracker
  const getProgressStep = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return 4;
    if (s.includes("transit") || s.includes("shipped")) return 3;
    if (s.includes("processing") || s.includes("work")) return 2;
    return 1; // Order Placed
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" id="user-profile-desk">
      {/* Header section with royal background card */}
      <div className="bg-neutral-950 border border-amber-500/25 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Glowing background elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-gradient-radial from-gold-dark/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full border-2 border-gold/40 p-1 bg-neutral-900 relative group shadow-lg">
            <img 
              src={currentUser.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover bg-neutral-900"
              referrerPolicy="no-referrer"
            />
            {currentUser.role === 'admin' && (
              <span className="absolute -top-1 -right-1 bg-gold text-neutral-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow border border-amber-400">
                ADMIN
              </span>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {isEditingProfile ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="px-3 py-1 text-sm font-bold border border-neutral-700 rounded-lg focus:outline-none focus:border-gold bg-neutral-900 text-white"
                  />
                  <button 
                    onClick={handleSaveProfile}
                    className="p-1.5 rounded bg-gold hover:bg-gold-dark text-neutral-950 transition-colors cursor-pointer"
                    title="Save name"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <h1 className="font-serif font-black text-2xl text-white flex items-center gap-2 tracking-tight">
                  <span>{currentUser.name}</span>
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="p-1 rounded hover:bg-neutral-850 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </h1>
              )}
            </div>
            
            <p className="text-xs text-neutral-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-mono">{currentUser.email}</span>
            </p>
            <p className="text-[9px] text-gold font-bold tracking-widest uppercase bg-gold/10 border border-gold/25 px-2.5 py-0.5 rounded-full inline-block">
              ✦ Certified Patron Since 2026
            </p>
          </div>
        </div>

        {/* Action Logout button */}
        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl border border-rose-900/30 hover:bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer relative z-10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Boutique</span>
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar panel (CSS target matches this container) */}
        <div className="lg:col-span-3 space-y-2.5">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "orders"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Package className={`w-4 h-4 ${activeSubTab === "orders" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Order Ledger</span>
              </div>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${activeSubTab === "orders" ? "bg-gold text-neutral-950" : "bg-neutral-100 text-neutral-600"}`}>
                {userOrders.length}
              </span>
            </div>
            <p className={`text-[10px] leading-snug mt-0.5 ${activeSubTab === "orders" ? "text-neutral-400" : "text-neutral-400"}`}>
              Transit, hallmarking logs & insurance keys
            </p>
          </button>

          <button
            onClick={() => setActiveSubTab("address")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "address"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <MapPin className={`w-4 h-4 ${activeSubTab === "address" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Delivery Vault</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${activeSubTab === "address" ? "rotate-90 text-gold" : "text-neutral-400"}`} />
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
              Pre-authorized shipping credentials
            </p>
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "settings"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Settings className={`w-4 h-4 ${activeSubTab === "settings" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Boutique Preferences</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${activeSubTab === "settings" ? "rotate-90 text-gold" : "text-neutral-400"}`} />
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
              Showroom base purity & alert options
            </p>
          </button>

          <button
            onClick={() => setActiveSubTab("loyalty")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "loyalty"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Award className={`w-4 h-4 ${activeSubTab === "loyalty" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Loyalty Ledger</span>
              </div>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${activeSubTab === "loyalty" ? "bg-gold text-neutral-950" : "bg-neutral-100 text-neutral-600"}`}>
                {userOrders.length > 0 ? `${userOrders.length * 1250 + 250} Pts` : "250 Pts"}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
              Sovereign points & reward vouchers
            </p>
          </button>

          <button
            onClick={() => setActiveSubTab("certificates")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "certificates"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 ${activeSubTab === "certificates" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Certificates Locker</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${activeSubTab === "certificates" ? "rotate-90 text-gold" : "text-neutral-400"}`} />
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
              GIA/IGI/BIS authenticity reports
            </p>
          </button>

          <button
            onClick={() => setActiveSubTab("concierge")}
            className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
              activeSubTab === "concierge"
                ? "bg-neutral-950 text-white border-gold/40 shadow-xl shadow-gold/5"
                : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50/50 hover:border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${activeSubTab === "concierge" ? "text-gold" : "text-neutral-400"}`} />
                <span className="text-xs font-black tracking-wider uppercase">Private Concierge</span>
              </div>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${activeSubTab === "concierge" ? "bg-gold text-neutral-950" : "bg-neutral-100 text-neutral-600"}`}>
                {bookings.length}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
              Bespoke private showroom bookings
            </p>
          </button>
        </div>

        {/* Workspace Display Area */}
        <div className="lg:col-span-9 bg-white border border-neutral-100 rounded-3xl p-5 md:p-7 min-h-[480px] shadow-xs relative">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: ORDER HISTORY */}
            {activeSubTab === "orders" && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2.5">
                      <span>Showroom Order History</span>
                      <span className="text-[10px] font-sans px-2.5 py-0.5 bg-neutral-950 text-gold rounded-full font-bold">
                        {userOrders.length} Completed / Active
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      All boutique transactions carry government hallmarking certification, full insurance coverage, and digital smart-tracking options.
                    </p>
                  </div>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-20 space-y-4 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/30">
                    <div className="w-16 h-16 rounded-full bg-amber-50/50 flex items-center justify-center text-gold mx-auto border border-amber-100/50 shadow-xs animate-pulse">
                      <Package className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <p className="font-black text-neutral-800 text-xs">No Boutique Transactions Found</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        You haven't ordered any custom hallmark jewelry yet. Check out our royal catalogs to begin your journey.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.slice().reverse().map((order) => {
                      const currentStep = getProgressStep(order.status);
                      return (
                        <div 
                          key={order.id} 
                          className="border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-lg transition-all duration-300 bg-neutral-50/10 overflow-hidden"
                        >
                          {/* Order top bar summary */}
                          <div className="bg-[#FAF8F5] border-b border-neutral-200 p-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                              <div>
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">ID LEDGER</span>
                                <span className="font-mono font-bold text-neutral-800">{order.id}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">DATE SECURED</span>
                                <span className="font-bold text-neutral-700">{order.createdAt}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">TOTAL VALUE</span>
                                <span className="font-mono font-extrabold text-neutral-900">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-stretch sm:self-auto">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-center flex-1 sm:flex-initial ${
                                order.status === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : order.status === 'Insured Transit'
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items details inside order */}
                          <div className="p-4 space-y-4 bg-white">
                            <div className="divide-y divide-neutral-100">
                              {order.items.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    {item.image && (
                                      <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-12 h-12 rounded-xl object-cover border border-neutral-100 flex-shrink-0 shadow-xs"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <div className="min-w-0 text-xs">
                                      <p className="font-black text-neutral-800 truncate">{item.title}</p>
                                      <p className="text-[10px] text-neutral-400 mt-1">
                                        Quantity: <strong className="font-mono text-neutral-600">{item.quantity}</strong> × ₹{item.price.toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-xs text-neutral-950 flex-shrink-0">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* PREMIUM UPGRADE: Interactive Order Status Steps Roadmap */}
                            <div className="border-t border-b border-neutral-100 py-4 my-2">
                              <div className="relative">
                                {/* Tracker line */}
                                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-neutral-100 -z-10" />
                                <div 
                                  className="absolute top-3.5 left-4 h-0.5 bg-gold transition-all duration-500 -z-10" 
                                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                />

                                {/* Tracker points */}
                                <div className="grid grid-cols-4 text-center">
                                  {[
                                    { step: 1, label: "Certified Placed", icon: ShieldCheck, desc: "Sovereign validation" },
                                    { step: 2, label: "Artisan Craft", icon: Activity, desc: "BIS Hallmarking" },
                                    { step: 3, label: "Insured Transit", icon: Truck, desc: "Secured cargo fleet" },
                                    { step: 4, label: "Delivered", icon: BadgeCheck, desc: "Handover verified" }
                                  ].map((node) => {
                                    const active = currentStep >= node.step;
                                    const NodeIcon = node.icon;
                                    return (
                                      <div key={node.step} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                          active 
                                            ? "bg-gold text-neutral-950 shadow-md shadow-gold/20 font-black scale-105" 
                                            : "bg-white border border-neutral-200 text-neutral-300"
                                        }`}>
                                          {active ? (
                                            <Check className="w-4 h-4 stroke-[3]" />
                                          ) : (
                                            <NodeIcon className="w-3.5 h-3.5" />
                                          )}
                                        </div>
                                        <span className={`text-[10px] font-black mt-1.5 ${active ? "text-neutral-900" : "text-neutral-400"}`}>
                                          {node.label}
                                        </span>
                                        <span className="text-[8px] text-neutral-400 mt-0.5 hidden sm:block max-w-[80px]">
                                          {node.desc}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Courier Summary and AI Inquiry Integration */}
                            <div className="pt-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-xs">
                              <div className="space-y-1 max-w-md">
                                <span className="font-black text-neutral-400 uppercase text-[9px] tracking-widest block">VAULT DELIVERY SHIPMENT ADDRESS</span>
                                <span className="font-semibold text-neutral-700 block leading-relaxed">
                                  {order.customerName}, {order.shippingAddress}, {order.city} - {order.pincode} (Tel: {order.customerPhone})
                                </span>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2.5">
                                {/* Prefilled help inquiry helper */}
                                <button
                                  onClick={() => setActiveHelpOrder(activeHelpOrder === order.id ? null : order.id)}
                                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-amber-200/50 hover:border-gold/50 text-neutral-700 text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-white"
                                >
                                  <HelpCircle className="w-3.5 h-3.5 text-gold-dark" />
                                  <span>Inquire via AI Concierge</span>
                                </button>
                              </div>
                            </div>

                            {/* Collapsible support info helper */}
                            <AnimatePresence>
                              {activeHelpOrder === order.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2 overflow-hidden text-[11px] leading-relaxed text-amber-950"
                                >
                                  <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-gold-dark mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                      <p className="font-bold">Prompt instructions for the AI Concierge:</p>
                                      <p className="text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-100 font-mono select-all select-none selection:bg-amber-100">
                                        "Hello AI Concierge! I want to check on my Atulya order ID <strong className="text-neutral-900">{order.id}</strong>. The current status is listed as '{order.status}'. Can you verify the BIS Hallmarking security guidelines and transit timeline?"
                                      </p>
                                      <p className="text-[10px] text-neutral-500">
                                        💡 Copy the text above, navigate to the <strong className="text-amber-900">AI Concierge</strong> tab, and paste it to receive instant handcrafting or delivery insights.
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: SAVED ADDRESS */}
            {activeSubTab === "address" && (
              <motion.div
                key="address-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2.5">
                      <span>Sovereign Delivery Vault</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Store and edit your default transit address. This information is secured and pre-fills your checkout bag for immediate hallmark clearance.
                    </p>
                  </div>
                  {!isEditingAddress && (
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gold-dark" />
                      <span>Update Vault</span>
                    </button>
                  )}
                </div>

                {addressSavedMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{addressSavedMessage}</span>
                  </div>
                )}

                {!isEditingAddress ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* PREMIUM UPGRADE: Gorgeous Gold Signature Vault Card */}
                    <div className="md:col-span-7 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-gold/30 p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                      {/* Grid overlays */}
                      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-gold animate-pulse">
                        <Lock className="w-2.5 h-2.5" />
                        <span>PRE-AUTH VAULTED</span>
                      </div>

                      <div className="space-y-4 relative z-10">
                        {/* Chip & Logo */}
                        <div className="flex justify-between items-center">
                          {/* Simulated golden chip */}
                          <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-500 border border-gold/40 shadow-inner flex flex-col justify-between p-1.5">
                            <div className="grid grid-cols-3 gap-0.5 h-full opacity-60">
                              <div className="border-r border-neutral-850" />
                              <div className="border-r border-neutral-850" />
                              <div className="border-r border-neutral-850" />
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="font-serif font-black text-xs tracking-wider text-gold-light">ATULYA</span>
                            <span className="text-[6px] text-neutral-400 font-bold uppercase tracking-widest leading-none">LOUNGE DESK</span>
                          </div>
                        </div>

                        {/* Address parameters */}
                        <div className="space-y-1 text-xs">
                          <p className="font-extrabold text-white text-sm tracking-wide">{addressData.name || currentUser.name}</p>
                          <p className="text-neutral-300 font-mono tracking-tight text-[11px] mt-1.5">
                            {addressData.address ? (
                              `${addressData.address}, ${addressData.city} - ${addressData.pincode}`
                            ) : (
                              "Sovereign shipping coordinates not added."
                            )}
                          </p>
                          {addressData.landmark && (
                            <p className="text-neutral-400 text-[10px] italic">
                              Landmark: {addressData.landmark}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card bottom info */}
                      <div className="border-t border-neutral-800 pt-3 flex justify-between items-center relative z-10 text-[9px] text-neutral-400 font-mono">
                        <div>
                          <span className="block text-[7px] text-neutral-500">CONTACT SECURED</span>
                          <span>{addressData.phone || "No phone added"}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[7px] text-neutral-500">LEDGER SIGNATURE</span>
                          <span className="text-gold tracking-widest font-black uppercase">AT-CO-916</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-amber-950 uppercase tracking-wider">Courier Dispatch Safeguard</p>
                          <p className="text-[11px] text-neutral-600 leading-relaxed">
                            Every package shipped from our headquarters is 100% transit-insured. Your vaulted address pre-approves instantaneous shipping, bypassing additional identification gates at check-out.
                          </p>
                        </div>
                      </div>

                      {addressData.deliveryNotes && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">SPECIAL INSTRUCTIONS</span>
                          <p className="text-xs text-neutral-700 italic font-medium">
                            "{addressData.deliveryNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Receiver Name</label>
                        <input
                          type="text"
                          required
                          value={addressData.name}
                          onChange={(e) => setAddressData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-medium text-neutral-800"
                          placeholder="e.g. Priya Sharma"
                        />
                      </div>
                      <div>
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Courier Phone Contact</label>
                        <input
                          type="tel"
                          required
                          value={addressData.phone}
                          onChange={(e) => setAddressData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-mono"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Transit Street Address</label>
                      <input
                        type="text"
                        required
                        value={addressData.address}
                        onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-medium text-neutral-800"
                        placeholder="House/Apartment details, Street Name, Block"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">City</label>
                        <input
                          type="text"
                          required
                          value={addressData.city}
                          onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-medium text-neutral-800"
                          placeholder="e.g. New Delhi"
                        />
                      </div>
                      <div>
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Postal Pincode</label>
                        <input
                          type="text"
                          required
                          value={addressData.pincode}
                          onChange={(e) => setAddressData(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-mono"
                          placeholder="e.g. 110001"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={addressData.landmark}
                          onChange={(e) => setAddressData(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-medium text-neutral-800"
                          placeholder="e.g. Near Metro Pillar 152"
                        />
                      </div>
                      <div>
                        <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Alternate Phone (Optional)</label>
                        <input
                          type="tel"
                          value={addressData.alternatePhone}
                          onChange={(e) => setAddressData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-mono"
                          placeholder="e.g. 9988776655"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-black text-neutral-700 mb-1 uppercase tracking-wider text-[10px]">Special Handover Guidelines (Optional)</label>
                      <textarea
                        rows={2}
                        value={addressData.deliveryNotes}
                        onChange={(e) => setAddressData(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-white font-medium text-neutral-800"
                        placeholder="e.g. Please deliver to reception only, or verify signature with call before handover."
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2 border border-neutral-200 rounded-xl text-neutral-500 font-bold text-xs bg-white cursor-pointer hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-gold rounded-xl font-bold text-xs cursor-pointer shadow transition-all hover:-translate-y-0.5"
                      >
                        Secure Vault Address
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* TAB 3: SETTINGS / PREFERENCES */}
            {activeSubTab === "settings" && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2">
                    <span>Boutique Preferences</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage your preferred jewelry purity parameters, base showroom currencies, and security dispatch communications.
                  </p>
                </div>

                {settingsSavedMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{settingsSavedMessage}</span>
                  </div>
                )}

                <div className="space-y-6 text-xs">
                  
                  {/* Gold purity preference toggle */}
                  <div className="space-y-3">
                    <label className="block font-black text-neutral-850 uppercase tracking-wider text-[10px]">Preferred Gold/Metal Purity</label>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Your selected purity is automatically highlighted on royal catalog items to display custom making fees and carat valuations.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-w-2xl">
                      {[
                        { code: "24K", name: "24 Karat", desc: "99.9% Pure Gold • Bullion / Coins" },
                        { code: "22K", name: "22 Karat", desc: "91.6% Pure Gold • Wedding Ornaments" },
                        { code: "18K", name: "18 Karat", desc: "75.0% Pure Gold • Diamond Settings" }
                      ].map((item) => {
                        const active = settingsData.metalPurity === item.code;
                        return (
                          <button
                            key={item.code}
                            type="button;}"
                            onClick={() => setSettingsData(prev => ({ ...prev, metalPurity: item.code }))}
                            className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col gap-1 ${
                              active 
                                ? "bg-neutral-950 border-neutral-950 text-white shadow-lg shadow-neutral-950/10" 
                                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            <span className={`text-xs font-black ${active ? "text-gold" : "text-neutral-800"}`}>
                              {item.code} ({item.name})
                            </span>
                            <span className="text-[9px] text-neutral-400 leading-none">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-neutral-100" />

                  {/* Currency Base toggle */}
                  <div className="space-y-3">
                    <label className="block font-black text-neutral-850 uppercase tracking-wider text-[10px]">Showroom Base Currency</label>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Select your default currency. International transactions undergo real-time currency conversion rates.
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                      {[
                        { key: "INR", label: "INR (Indian Rupee - ₹)", desc: "Primary showroom base" },
                        { key: "USD", label: "USD (US Dollar - $)", desc: "Global trade index" }
                      ].map((item) => {
                        const active = settingsData.currency === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSettingsData(prev => ({ ...prev, currency: item.key }))}
                            className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col gap-1 ${
                              active 
                                ? "bg-neutral-950 border-neutral-950 text-white shadow-lg" 
                                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                            }`}
                          >
                            <span className={`text-xs font-black ${active ? "text-gold" : "text-neutral-800"}`}>
                              {item.label}
                            </span>
                            <span className="text-[9px] text-neutral-400 leading-none">
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-neutral-100" />

                  {/* Notifications and notifications controls */}
                  <div className="space-y-3">
                    <label className="block font-black text-neutral-850 uppercase tracking-wider text-[10px]">Communications & Ledger Alerts</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 rounded-2xl border border-neutral-200/60 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settingsData.emailNotifications}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                          className="rounded border-neutral-300 text-gold focus:ring-gold w-4 h-4 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-800 block text-xs">Email Ledger Invoices</span>
                          <span className="text-[10px] text-neutral-400 block leading-relaxed">Receive immediate certified PDF digital invoices and certificates upon ordering.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 rounded-2xl border border-neutral-200/60 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settingsData.smsAlerts}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, smsAlerts: e.target.checked }))}
                          className="rounded border-neutral-300 text-gold focus:ring-gold w-4 h-4 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-800 block text-xs">Real-Time SMS Courier Updates</span>
                          <span className="text-[10px] text-neutral-400 block leading-relaxed">Receive instantaneous dispatch SMS and PIN verification prompts at handover.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 rounded-2xl border border-neutral-200/60 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settingsData.exclusiveOffers}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, exclusiveOffers: e.target.checked }))}
                          className="rounded border-neutral-300 text-gold focus:ring-gold w-4 h-4 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-800 block text-xs">Exclusive Vault Access Alerts</span>
                          <span className="text-[10px] text-neutral-400 block leading-relaxed">Get early viewing access to new private vaults, collections, and holiday discount codes.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3.5 p-3.5 bg-neutral-50 hover:bg-neutral-100/70 rounded-2xl border border-neutral-200/60 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={settingsData.biometricVerification}
                          onChange={(e) => setSettingsData(prev => ({ ...prev, biometricVerification: e.target.checked }))}
                          className="rounded border-neutral-300 text-gold focus:ring-gold w-4 h-4 mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-neutral-800 block text-xs">Extra Biometric Pin Gate</span>
                          <span className="text-[10px] text-neutral-400 block leading-relaxed">Require custom OTP verification prior to displaying saved transit logs.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white hover:text-gold font-bold text-xs shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      Save Preferences
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: LOYALTY & REWARDS LEDGER */}
            {activeSubTab === "loyalty" && (
              <motion.div
                key="loyalty-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gold-dark" />
                    <span>Membership & Gold Savings</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Track your Atulya gold tier, membership points, and the current value of your gold savings.
                  </p>
                </div>

                {/* Main bento panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Platinum Elite Membership Card */}
                  <div className="md:col-span-6 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-amber-950 border border-gold p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black tracking-widest text-gold uppercase">MEMBERSHIP LEVEL</span>
                          <h3 className="font-serif font-black text-lg text-white">Sovereign Gold Elite</h3>
                        </div>
                        <span className="text-[8px] font-black tracking-widest bg-gold/15 border border-gold/40 text-gold px-2.5 py-1 rounded-full uppercase animate-pulse">
                          GOLD LEVEL 4
                        </span>
                      </div>

                      <div className="pt-2">
                        <span className="block text-[8px] text-neutral-400 uppercase tracking-widest">YOUR MEMBERSHIP POINTS</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="font-serif font-black text-3xl text-gold-light">
                            {userOrders.length > 0 ? userOrders.length * 1250 + 250 : 250}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-400">Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1 relative z-10">
                      <div className="flex justify-between text-[9px] text-neutral-400 font-bold">
                        <span>Next Level Milestone: 5,000 Pts</span>
                        <span className="text-gold">
                          {userOrders.length > 0 ? 5000 - (userOrders.length * 1250 + 250) : 4750} pts to Maharaja Club
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold transition-all duration-500"
                          style={{ width: `${Math.min(100, ((userOrders.length > 0 ? userOrders.length * 1250 + 250 : 250) / 5000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-3 flex justify-between items-center text-[9px] text-neutral-400 font-mono relative z-10">
                      <div>
                        <span className="block text-[7px] text-neutral-500">MEMBER ID</span>
                        <span>AT-PATRON-{currentUser.email.split('@')[0].toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[7px] text-neutral-500">DISCOUNT VALUE</span>
                        <span className="text-gold font-bold">₹{userOrders.length > 0 ? (userOrders.length * 1250 + 250) * 2 : 500} Cashable</span>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Holdings Value calculation Card */}
                  <div className="md:col-span-6 bg-[#FAF8F5] border border-amber-100 p-5 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-amber-800 tracking-wider uppercase block">✦ YOUR SAVINGS SUMMARY</span>
                      <h3 className="font-serif font-black text-base text-neutral-900">Your Metal Holdings</h3>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        A live calculation of the value of the gold & silver you bought from us, based on today's Delhi market rates.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-2xl border border-neutral-200/60 shadow-xs">
                        <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">ESTIMATED WEIGHT</span>
                        <span className="block text-sm font-black text-neutral-800 font-mono mt-0.5">
                          {userOrders.length > 0 ? `${(userOrders.reduce((acc, curr) => acc + curr.grandTotal, 0) / 7200).toFixed(2)} g` : "0.00 g"}
                        </span>
                        <span className="block text-[9px] text-gold-dark font-medium leading-none mt-0.5">Sovereign 22K Gold equivalent</span>
                      </div>

                      <div className="p-3 bg-white rounded-2xl border border-neutral-200/60 shadow-xs">
                        <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Bullion Value</span>
                        <span className="block text-sm font-black text-emerald-700 font-mono mt-0.5">
                          {userOrders.length > 0 
                            ? `₹${Math.round(userOrders.reduce((acc, curr) => acc + curr.grandTotal, 0) * 0.85).toLocaleString()}`
                            : "₹0"
                          }
                        </span>
                        <span className="block text-[9px] text-neutral-400 font-medium leading-none mt-0.5">Est. Meltdown value</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50 flex items-center gap-2 text-[10px] text-amber-950 font-bold">
                      <TrendingUp className="w-4 h-4 text-gold-dark" />
                      <span>Bullion market yields: +4.2% since January 2026</span>
                    </div>
                  </div>
                </div>

                {/* Exclusive Voucher codes section */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-black text-neutral-850 uppercase tracking-wider text-[10px]">Unlocked Patron Privilege Vouchers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { code: "ROYALWELCOME", label: "₹500 Welcome Bonus", desc: "No minimum purchase requirement • Valid for 1 year", icon: "🎁", unlocked: true },
                      { code: "HEIRLOOM15", label: "15% Off Handcrafting Fees", desc: "Applicable on standard custom Polki necklaces", icon: "✨", unlocked: userOrders.length > 0 },
                      { code: "GOLDCOIN", label: "Free 1g Pure Silver Coin", desc: "Unlocked upon second transaction order", icon: "🪙", unlocked: userOrders.length >= 2 }
                    ].map((voucher, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-3 ${
                          voucher.unlocked 
                            ? "bg-white border-gold/40 hover:border-gold shadow-sm hover:shadow animate-fade-in" 
                            : "bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xl">{voucher.icon}</span>
                            <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${
                              voucher.unlocked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-neutral-200 text-neutral-500"
                            }`}>
                              {voucher.unlocked ? "Active & Ready" : "Locked"}
                            </span>
                          </div>
                          <p className={`text-xs font-black mt-2 ${voucher.unlocked ? "text-neutral-900" : "text-neutral-500"}`}>{voucher.label}</p>
                          <p className="text-[10px] text-neutral-400 leading-tight">{voucher.desc}</p>
                        </div>

                        {voucher.unlocked ? (
                          <div className="bg-neutral-950 p-2 rounded-xl flex justify-between items-center text-xs font-mono font-bold text-gold mt-1">
                            <span>{voucher.code}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                try {
                                  navigator.clipboard.writeText(voucher.code);
                                  alert(`Voucher code "${voucher.code}" copied to clipboard! Paste this code in checkout under 'Promo Code' for your discount.`);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-[9px] uppercase tracking-wider font-sans text-white hover:text-gold cursor-pointer"
                            >
                              Copy Code
                            </button>
                          </div>
                        ) : (
                          <div className="bg-neutral-100 p-2 rounded-xl text-center text-[10px] font-mono text-neutral-400 mt-1">
                            Locked Privileges
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: CERTIFICATES LOCKER */}
            {activeSubTab === "certificates" && (
              <motion.div
                key="certificates-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold-dark" />
                    <span>Heirloom Certificate Locker</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Store and verify legal government-authenticated purity certificates for your diamond and gold purchases.
                  </p>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-20 space-y-4 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/30">
                    <div className="w-16 h-16 rounded-full bg-amber-50/50 flex items-center justify-center text-gold mx-auto border border-amber-100/50 shadow-xs animate-pulse">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5 max-w-xs mx-auto">
                      <p className="font-black text-neutral-800 text-xs">No Purity Certificates Found</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Authenticity certificates are generated automatically upon purchase. Start your fine jewelry collection to see items vaulted here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
                      <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs text-emerald-950">
                        <p className="font-black uppercase tracking-wider text-[10px]">Bureau of Indian Standards Approved</p>
                        <p className="leading-normal">
                          All gold purchases on your account are tracked on the government <strong>BIS Care platform</strong> under License ID <strong>AT-CO-916</strong>. Diamond items are pre-certified with individual <strong>GIA</strong> or <strong>IGI</strong> serial key numbers.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {userOrders.map((order, index) => {
                        const certId = `AT-CERT-${order.id.slice(-6).toUpperCase()}-${index + 1}`;
                        const isVerifying = verifyingCertId === certId;
                        const isVerified = verifiedCertId === certId;

                        return (
                          <div key={order.id} className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col justify-between gap-4 shadow-2xs hover:border-neutral-300 transition-all">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] font-black text-neutral-400">CERTIFICATE NO: {certId}</span>
                                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${
                                  isVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {isVerified ? "BIS VERIFIED ✓" : "PRE-AUTHORIZED"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <p className="font-serif font-black text-neutral-900 leading-snug">
                                  Heirloom Asset for Order #{order.id.slice(-6).toUpperCase()}
                                </p>
                                <p className="text-neutral-400 text-[10px]">
                                  Purity Standard: <span className="font-bold text-neutral-700">22 Carat (91.6% Fine Gold)</span>
                                </p>
                                <p className="text-neutral-400 text-[10px]">
                                  Assay Weight estimation: <span className="font-bold text-neutral-700">{(order.grandTotal / 7200).toFixed(2)} Grams</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 border-t border-neutral-100 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isVerified) return;
                                  setVerifyingCertId(certId);
                                  setTimeout(() => {
                                    setVerifyingCertId(null);
                                    setVerifiedCertId(certId);
                                  }, 1500);
                                }}
                                disabled={isVerified || isVerifying}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                  isVerified
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                    : "bg-neutral-950 hover:bg-neutral-900 text-gold hover:scale-[1.01]"
                                }`}
                              >
                                {isVerifying ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                    <span>Querying BIS Registry...</span>
                                  </>
                                ) : isVerified ? (
                                  <>
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Purity Verified Authentic</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                                    <span>Verify BIS Govt Purity</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Downloading PDF Certificate File... \n Purity Ledger: ${certId}\n Order Total: ₹${order.grandTotal.toLocaleString()}\n Status: Pure Hallmarked. This document is authenticated with an asymmetric RSA key.`);
                                }}
                                className="px-3 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-700 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer"
                                title="Download Certified PDF"
                              >
                                <Download className="w-3.5 h-3.5 text-neutral-400" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 6: BESPOKE PRIVATE CONCIERGE BOOKING */}
            {activeSubTab === "concierge" && (
              <motion.div
                key="concierge-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="font-serif font-black text-xl text-neutral-950 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold-dark" />
                    <span>Private Concierge & Consultation Booking</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Schedule private showroom visits or a high-resolution virtual custom jewelry drafting consultation with our master Delhi gemologist.
                  </p>
                </div>

                {bookingSavedMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{bookingSavedMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Booking Form Card */}
                  <div className="md:col-span-6 bg-white border border-neutral-200 p-5 rounded-3xl space-y-4 shadow-sm">
                    <h3 className="font-serif font-black text-sm text-neutral-950 uppercase tracking-wide">Request a Secure Meeting</h3>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!bookingDate) {
                          alert("Please select a date for your boutique private session.");
                          return;
                        }
                        const newBooking = {
                          id: `BOOK-${Math.floor(100000 + Math.random() * 900000)}`,
                          date: bookingDate,
                          time: bookingTime,
                          type: bookingType,
                          notes: bookingNotes,
                          status: "Approved",
                          advisor: "Sri Anand Dev (Master Gemologist)"
                        };
                        const updated = [newBooking, ...bookings];
                        setBookings(updated);
                        setBookingDate("");
                        setBookingNotes("");
                        setBookingSavedMessage("Bespoke Private Consultation Booked successfully! An advisor will call to finalize security escort details.");
                        setTimeout(() => setBookingSavedMessage(""), 5000);
                      }} 
                      className="space-y-3.5 text-xs"
                    >
                      <div>
                        <label className="block font-black text-neutral-700 mb-1">Session Character</label>
                        <select
                          value={bookingType}
                          onChange={(e) => setBookingType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none bg-white font-medium text-neutral-800"
                        >
                          <option value="bridal">💍 Royal Bridal Legacy Design (60 Mins)</option>
                          <option value="portfolio">📈 High-Value Bullion Portfolio Planning (45 Mins)</option>
                          <option value="appraisal">🔍 Antique Kundan & Diamond Appraisal (30 Mins)</option>
                          <option value="video">📹 Live High-Definition Virtual Tour (30 Mins)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-black text-neutral-700 mb-1">Select Date</label>
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none bg-white text-neutral-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-black text-neutral-700 mb-1">Preferred Slot</label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none bg-white text-neutral-800"
                          >
                            <option value="11:00 AM">11:00 AM - Morning Tea</option>
                            <option value="02:30 PM">02:30 PM - Afternoon Viewing</option>
                            <option value="05:30 PM">05:30 PM - Sunset High-Value VIP Slot</option>
                            <option value="08:00 PM">08:00 PM - Evening Gala Hour</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-black text-neutral-700 mb-1">Custom Artisan Instructions (Optional)</label>
                        <textarea
                          rows={2}
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none bg-white text-neutral-850 font-medium"
                          placeholder="e.g. Seeking traditional antique Rajasthani Jadau choker lines or GIA certified diamonds..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 text-gold rounded-xl font-bold transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                        <span>Reserve Secure Consultation Slot</span>
                      </button>
                    </form>
                  </div>

                  {/* Right side - Active bookings list */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="bg-[#FAF8F5] border border-amber-100 p-5 rounded-3xl flex items-start gap-3.5">
                      <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-1 text-xs">
                        <p className="font-black text-amber-950 uppercase tracking-wider text-[10px]">Secure Showroom Protocol</p>
                        <p className="text-neutral-600 leading-relaxed">
                          For high-value designs, our New Delhi boutique provides secure personal transit escorts and zero-visibility private viewing suites. Your session guarantees confidential curation.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-black text-neutral-800 uppercase tracking-wider text-[10px] px-1">Your Scheduled Curation Sessions</h4>
                      
                      {bookings.length === 0 ? (
                        <div className="p-8 text-center border border-neutral-200 border-dashed rounded-2xl bg-neutral-50/50">
                          <p className="text-xs font-bold text-neutral-500">No Private Sessions Requested</p>
                          <p className="text-[10px] text-neutral-400 mt-1">Book an appointment on the form to secure custom crafting guidance.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                          {bookings.map((b) => (
                            <div key={b.id} className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-2xs hover:border-neutral-300 transition-all">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-mono font-bold text-neutral-400">{b.id}</span>
                                <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                  {b.status}
                                </span>
                              </div>

                              <div className="text-xs space-y-0.5">
                                <p className="font-black text-neutral-800 capitalize">
                                  {b.type === "bridal" ? "💍 Royal Bridal Legacy Design" : b.type === "portfolio" ? "📈 Bullion Portfolio Planning" : b.type === "appraisal" ? "🔍 Kundan & Diamond Appraisal" : "📹 Virtual Tour Session"}
                                </p>
                                <p className="text-neutral-500 text-[10px]">
                                  📅 Date: <span className="font-bold text-neutral-700 font-mono">{b.date}</span> • Slot: <span className="font-bold text-neutral-700">{b.time}</span>
                                </p>
                                <p className="text-neutral-400 text-[10px]">
                                  Assigned Expert: <span className="text-gold-dark font-medium">{b.advisor}</span>
                                </p>
                                {b.notes && (
                                  <p className="text-neutral-500 italic text-[10px] border-t border-neutral-100 pt-1.5 mt-1.5">
                                    "{b.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
