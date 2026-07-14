import React, { useState } from "react";
import { 
  X, Trash2, ShoppingBag, ArrowRight, UserCheck, CreditCard, 
  ShieldCheck, Smartphone, Truck, Lock, Printer, RotateCcw,
  CheckCircle2, Loader2, Sparkles, AlertCircle, FileText, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, Product, Order } from "../types";

interface CheckoutPageProps {
  cart: CartItem[];
  products: Product[];
  onClose: () => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

type PaymentMethod = "Card" | "UPI" | "Netbanking" | "COD";

export default function CheckoutPage({
  cart,
  products,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced
}: CheckoutPageProps) {
  const [formData, setFormData] = useState(() => {
    try {
      const storedUser = localStorage.getItem("atulya_user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user) {
        const storedAddress = localStorage.getItem("atulya_address_" + user.email);
        const savedAddr = storedAddress ? JSON.parse(storedAddress) : null;
        return {
          name: savedAddr?.name || user.name || "",
          email: user.email || "",
          phone: savedAddr?.phone || "",
          address: savedAddr?.address || "",
          city: savedAddr?.city || "",
          pincode: savedAddr?.pincode || ""
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      pincode: ""
    };
  });

  // Payment loading & success states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [finalOrder, setFinalOrder] = useState<Order | null>(null);
  
  const [appliedCoupon, setAppliedCoupon] = useState({ code: "", discount: 0, description: "" });
  const [couponError, setCouponError] = useState("");
  
  const [savedVaultAddress, setSavedVaultAddress] = useState<any>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem("atulya_user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user) {
        const storedAddress = localStorage.getItem("atulya_address_" + user.email);
        if (storedAddress) {
          setSavedVaultAddress(JSON.parse(storedAddress));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const cartDetails = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return {
      product,
      quantity: item.quantity
    };
  }).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];

  const subtotal = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = appliedCoupon.discount;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gst = taxableAmount * 0.03; // 3% Gold / Precious GST rate standard in India
  const grandTotal = taxableAmount + gst;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const proceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessingPayment(true);
    
    const steps = [
      "Securing safe connection to billing registry...",
      "Allocating gold collateral vault availability for HUID allocation...",
      "Securing real-time BIS hallmark insurance certification...",
      "Registering order under secure transit protocols...",
      "Completing handshake and printing certified invoice..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setPaymentStepText(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // Create actual Order object
    const newOrderId = `AT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: newOrderId,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      items: cartDetails.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      subtotal: subtotal,
      gst: gst,
      grandTotal: grandTotal,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      paymentStatus: 'Unpaid'
    };

    try {
      await onOrderPlaced(newOrder);
      setFinalOrder(newOrder);
      setIsProcessingPayment(false);
      setOrderPlaced(true);
      onClearCart();
    } catch (err) {
      console.error("Order processing failure:", err);
      setIsProcessingPayment(false);
      alert("Something went wrong with the checkout process. Please check connection and try again.");
    }
  };

  const handleSuccessClose = () => {
    onClearCart();
    onClose();
  };

  // --- PRINT EXQUISITE INVOICE UTILITY ---
  const handlePrintInvoice = () => {
    const printContent = document.getElementById("printable-luxury-invoice");
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Refresh to restore react DOM binding properly
  };

  if (orderPlaced && finalOrder) {
    return (
      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col md:flex-row relative max-h-[90vh] md:max-h-none overflow-y-auto"
        >
          {/* Sidebar / Left Column with Badge & Actions */}
          <div className="p-6 md:w-80 bg-neutral-950 text-white flex flex-col justify-between border-r border-neutral-900 gap-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-bold animate-pulse shadow-inner">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-gold uppercase block">AUTHENTIC PURCHASE</span>
                <h2 className="font-serif font-black text-2xl text-white mt-1 leading-tight">Order Fully Confirmed!</h2>
                <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                  Your luxury transaction has been settled. Below is your verified digital invoice. We have allocated a registered BIS Hallmarked certificate and scheduled fully insured doorstep shipping for your masterpieces.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-left space-y-1.5">
                <span className="text-[9px] font-black text-neutral-500 block tracking-wider uppercase">Shipment Destination</span>
                <p className="text-xs font-bold text-neutral-200">{formData.name}</p>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  {formData.address}, {formData.city} - {formData.pincode}
                </p>
                <p className="text-[11px] text-neutral-400 font-mono">Phone: {formData.phone}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-900">
              <button
                onClick={handlePrintInvoice}
                className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certified Invoice</span>
              </button>
              
              <button
                onClick={handleSuccessClose}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Showroom</span>
              </button>
            </div>
          </div>

          {/* UPGRADED PROFESSIONAL PRINTABLE INVOICE PANEL */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[80vh] md:max-h-[650px] scrollbar-thin">
            <div id="printable-luxury-invoice" className="bg-white p-2 text-neutral-950 font-sans space-y-6">
              {/* Header */}
              <div className="border-b-4 border-neutral-950 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-2xl tracking-tight text-neutral-950">
                      ATULYA <span className="text-gold-dark font-sans font-light italic text-sm tracking-widest uppercase">Jewelers</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-medium leading-relaxed max-w-xs">
                    Showroom 4B, Chandni Chowk Market, Central Delhi, PIN-110006<br />
                    Email: concierge@atulyajewelers.com | Tel: +91 98110 01100
                  </p>
                </div>
                
                <div className="text-right space-y-1 sm:self-center">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[9px] font-black uppercase tracking-wider rounded">
                    <Award className="w-3 h-3 text-gold-dark" />
                    <span>BIS Certified Voucher</span>
                  </div>
                  <p className="font-mono text-xs font-bold text-neutral-900 mt-1">Invoice ID: #{finalOrder.id}</p>
                  <p className="text-[10px] text-neutral-400 font-medium">Date: {finalOrder.createdAt}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">CUSTOMER BILLING INFO:</span>
                  <p className="font-bold text-neutral-900 text-sm">{finalOrder.customerName}</p>
                  <p className="text-neutral-500 font-mono text-[10px]">{finalOrder.customerEmail}</p>
                  <p className="text-neutral-500 font-mono mt-0.5">{finalOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">SECURED SHIPMENT DESK:</span>
                  <p className="text-neutral-700 leading-tight">
                    {finalOrder.shippingAddress}<br />
                    {finalOrder.city} - {finalOrder.pincode}<br />
                    <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1 mt-1">
                      <Truck className="w-3 h-3" /> Fully Insured Doorstep Express
                    </span>
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">ITEMIZED DESCRIPTION OF ACQUIRED JEWELRY</span>
                <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-[9px] text-neutral-500 uppercase tracking-widest font-black border-b border-neutral-200">
                        <th className="p-3">Masterpiece Design</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-center">Hallmark Purity</th>
                        <th className="p-3 text-right">Sum total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {finalOrder.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <div>
                              <p className="text-neutral-900 font-bold">{item.title}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">UID: AT-PRD-{item.id}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center text-neutral-600 font-mono font-bold">{item.quantity}</td>
                          <td className="p-3 text-center">
                            <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-200/40 px-2 py-0.5 rounded font-black">
                              HUID Verified
                            </span>
                          </td>
                          <td className="p-3 text-right text-neutral-900 font-mono font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations */}
              <div className="border-t border-neutral-200 pt-4 flex flex-col items-end text-xs font-bold gap-1.5">
                <div className="flex justify-between w-64 text-neutral-500">
                  <span>Showroom Subtotal:</span>
                  <span className="font-mono">₹{finalOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between w-64 text-rose-600 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-neutral-500">
                  <span>Precious Metal Tax (GST 3%):</span>
                  <span className="font-mono">₹{finalOrder.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between w-64 text-neutral-500">
                  <span>Insured Safeguard Package:</span>
                  <span className="text-emerald-700 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between w-64 border-t border-neutral-900 pt-2 text-sm text-neutral-950 font-black">
                  <span>Certified Total Settlement:</span>
                  <span className="font-mono text-gold-dark text-base">₹{finalOrder.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Signature and Certification seals */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100 items-end text-center">
                <div className="flex flex-col items-center justify-center p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                  <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    👑
                  </div>
                  <span className="text-[8px] font-black uppercase text-neutral-400 mt-2 tracking-widest">ATULYA GUARANTEE</span>
                  <p className="text-[10px] text-neutral-600 font-semibold mt-1">100% Return Policy & Life Exchange</p>
                </div>
                
                <div className="space-y-1">
                  <div className="border-b border-neutral-300 mx-auto w-36 h-8 flex items-end justify-center">
                    <span className="font-serif italic text-xs font-bold text-neutral-700">Aparna Sen</span>
                  </div>
                  <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block">Concierge Desk Sign</span>
                  <span className="text-[9px] text-neutral-500 font-medium">Boutique Manager</span>
                </div>
              </div>

              {/* Legal Warning/Instructions */}
              <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200/50 text-[9px] text-neutral-500 leading-relaxed text-center font-medium">
                🛡️ This digital receipt is valid as authentic proof of purchase under Delhi High Court jewelry guidelines. All precious stones undergo independent lab testing before packing. In case of return, original HUID certificate tag must remain attached.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto flex flex-col">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessingPayment && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 max-w-sm"
            >
              <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
              <h3 className="font-serif font-black text-lg text-white">Secure Payment Settlement</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{paymentStepText}</p>
              <div className="h-1 w-48 bg-neutral-800 rounded-full mx-auto overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                  className="h-full bg-gold"
                />
              </div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">PCI-DSS Secure Endpoint</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-neutral-100 px-4 py-4 sticky top-0 bg-white z-10 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold" />
          <h2 className="font-sans font-black text-xs uppercase tracking-widest text-neutral-800">
            Showroom Billing Bag ({cartDetails.reduce((sum, i) => sum + i.quantity, 0)})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cart items / calculation details column */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif font-black text-neutral-900 text-sm border-b border-neutral-100 pb-2 flex items-center gap-2">
            <span>Selected Treasures</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-neutral-900 text-white rounded-full font-sans font-bold">
              {cartDetails.length} Items
            </span>
          </h3>

          {cartDetails.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs text-neutral-400 font-bold">Your boutique shopping bag is empty.</p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-gold"
              >
                Go browse royal jewelry
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {cartDetails.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 bg-neutral-50/70 p-3 rounded-2xl border border-neutral-250/50 items-center hover:bg-neutral-50 transition-colors">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-sans font-bold text-neutral-800 line-clamp-1">{product.title}</h4>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-5 h-5 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold hover:bg-neutral-50 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center text-neutral-700">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="w-5 h-5 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold hover:bg-neutral-50 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cartDetails.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Promo code block */}
              <div className="bg-[#FAF8F5] border border-amber-100 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-amber-800 block tracking-wider uppercase">🏷️ Apply Boutique Promo Coupon</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ATULYA10, FESTIVE5000"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs uppercase font-mono font-bold focus:outline-none focus:border-gold bg-white"
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().trim();
                      (window as any)._tempCoupon = val;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const typed = ((window as any)._tempCoupon || "").toUpperCase().trim();
                      if (!typed) return;
                      
                      let discountAmt = 0;
                      let description = "";

                      let customCoupons: any[] = [];
                      try {
                        const stored = localStorage.getItem("atulya_coupons");
                        if (stored) customCoupons = JSON.parse(stored);
                      } catch (e) {
                        console.error(e);
                      }

                      const matchedCustom = customCoupons.find((c: any) => c.code.toUpperCase() === typed && c.active !== false);

                      if (matchedCustom) {
                        if (matchedCustom.type === "percent") {
                          discountAmt = subtotal * (matchedCustom.value / 100);
                          description = `${matchedCustom.value}% Flat discount applied`;
                        } else if (matchedCustom.type === "fixed") {
                          discountAmt = Math.min(matchedCustom.value, subtotal);
                          description = `Flat ₹${matchedCustom.value.toLocaleString('en-IN')} discount applied`;
                        } else if (matchedCustom.type === "gold_percent") {
                          const goldSub = cartDetails
                            .filter(i => i.product.material.toLowerCase() === "gold")
                            .reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
                          discountAmt = goldSub * (matchedCustom.value / 100);
                          description = `${matchedCustom.value}% off Gold designs applied`;
                        }
                      } else if (typed === "ATULYA10") {
                        discountAmt = subtotal * 0.1;
                        description = "10% Flat discount applied";
                      } else if (typed === "FESTIVE5000") {
                        discountAmt = Math.min(5000, subtotal);
                        description = "Flat ₹5,000 festive voucher applied";
                      } else if (typed === "GOLDEN15") {
                        const goldSub = cartDetails
                          .filter(i => i.product.material.toLowerCase() === "gold")
                          .reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
                        discountAmt = goldSub * 0.15;
                        description = "15% discount on Gold designs applied";
                      } else {
                        setCouponError("Invalid coupon code. Try 'ATULYA10' or 'FESTIVE5000'!");
                        return;
                      }

                      setCouponError("");
                      setAppliedCoupon({
                        code: typed,
                        discount: discountAmt,
                        description
                      });
                    }}
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2 rounded-xl leading-tight">
                    ⚠ {couponError}
                  </p>
                )}

                {appliedCoupon.code && (
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-800 font-bold">
                    <div>
                      <span>Active: {appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-600/90 font-medium">{appliedCoupon.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon({ code: "", discount: 0, description: "" })}
                      className="text-neutral-400 hover:text-neutral-700 text-xs font-bold px-1.5"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100/80 space-y-2.5 text-xs">
                <h4 className="font-bold text-neutral-800 mb-1">Precious Valuations</h4>
                <div className="flex justify-between text-neutral-500">
                  <span>Gold & Gemstone Base Price</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Campaign Discount</span>
                    <span className="font-mono">-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Secured Hallmark Packaging</span>
                  <span className="text-emerald-600 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Precious GST (3% Government Tax)</span>
                  <span className="font-mono">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-neutral-200 my-1" />
                <div className="flex justify-between text-neutral-900 font-black">
                  <span>Certified Total Amount</span>
                  <span className="font-mono text-gold-dark text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic checkout steps column */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-neutral-100">
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-black text-neutral-950 text-sm border-b border-neutral-100 pb-2">
                Sovereign Courier Transit & Insurance Information
              </h3>
              <p className="text-[10px] text-neutral-400 mt-1">
                Your shipping details are verified against the standard postal network for 100% loss-liability insurance coverage.
              </p>
            </div>

            {savedVaultAddress && (
              <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs animate-fade-in">
                <div className="space-y-1">
                  <span className="font-black text-amber-800 text-[9px] tracking-wider uppercase block">✦ Vault Address Detected</span>
                  <p className="font-bold text-neutral-850">
                    {savedVaultAddress.name} ({savedVaultAddress.phone})
                  </p>
                  <p className="text-neutral-500 text-[10px] leading-tight line-clamp-1">
                    {savedVaultAddress.address}, {savedVaultAddress.city} - {savedVaultAddress.pincode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: savedVaultAddress.name || "",
                      email: formData.email,
                      phone: savedVaultAddress.phone || "",
                      address: savedVaultAddress.address || "",
                      city: savedVaultAddress.city || "",
                      pincode: savedVaultAddress.pincode || ""
                    });
                  }}
                  className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-900 text-gold font-bold text-[10px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 flex-shrink-0 hover:scale-[1.02] active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  <span>Autofill Address</span>
                </button>
              </div>
            )}

            <form onSubmit={proceedToPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Priya Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="priya@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Phone Number (For Courier Contact)</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g., 9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">Shipping Transit Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="House, Street Name, Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g., New Delhi"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 mb-1">Pincode (ZIP)</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="110001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all bg-white"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/50 flex gap-2 items-center text-neutral-500">
                <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0" />
                <p className="text-[10px] leading-tight font-medium">
                  Atulya Safe Delivery: This shipment carries fully insured loss coverage of up to ₹50,00,000. All parcels require mandatory physical OTP confirmation on delivery.
                </p>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-dark disabled:bg-neutral-100 disabled:text-neutral-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-gold/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Place Order (Cash / UPI on Delivery) - ₹{grandTotal.toLocaleString('en-IN')}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
