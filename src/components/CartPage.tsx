import React, { useState } from "react";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Ticket, 
  ShieldCheck, 
  Info, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, Product } from "../types";

interface CartPageProps {
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onGoBack: () => void;
  onProceedToCheckout: () => void;
}

export default function CartPage({
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGoBack,
  onProceedToCheckout
}: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; error?: string } | null>(null);

  // Parse items
  const cartDetails = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return {
      product,
      quantity: item.quantity
    };
  }).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];

  const cartSubtotal = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Dynamic pricing breakdown
  // Let's assume a realistic jewelry pricing model: 
  // Base metal rate constitutes 85%, and making charges are about 12% of the price.
  const baseMetalValue = Math.round(cartSubtotal * 0.88);
  const makingCharges = Math.round(cartSubtotal * 0.12);
  
  // Calculate discount
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  
  // Taxes: GST on jewelry is 3% in India
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const gstAmount = Math.round(taxableAmount * 0.03);
  
  const grandTotal = taxableAmount + gstAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === "ATULYA10") {
      const discount = Math.round(cartSubtotal * 0.10);
      setAppliedCoupon({ code: "ATULYA10", discount });
    } else {
      setAppliedCoupon({ code: cleanCode, discount: 0, error: "Invalid Coupon. Try 'ATULYA10'" });
      setTimeout(() => setAppliedCoupon(null), 3000);
    }
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <div className="bg-neutral-50/50 min-h-screen py-3 md:py-10 font-sans">
      <div className="max-w-7xl mx-auto px-2.5 md:px-4 space-y-4 md:space-y-8">
        
        {/* Header section */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 md:pb-5">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onGoBack}
              className="p-1.5 md:p-2.5 rounded-full hover:bg-neutral-100 bg-white border border-neutral-200 text-neutral-800 cursor-pointer transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <div>
              <span className="text-[8px] md:text-[9px] font-bold text-gold-dark uppercase tracking-widest block">Your Selected Masterpieces</span>
              <h1 className="font-serif font-black text-lg md:text-2xl text-neutral-950 flex items-center gap-1.5 md:gap-2">
                Shopping Bag <ShoppingBag className="w-4.5 h-4.5 md:w-5 md:h-5 text-gold" />
              </h1>
            </div>
          </div>

          {cartDetails.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Bag</span>
            </button>
          )}
        </div>

        {cartDetails.length === 0 ? (
          /* Empty Bag state */
          <div className="text-center py-12 md:py-20 bg-white rounded-2xl md:rounded-3xl border border-neutral-150 max-w-xl mx-auto space-y-4 md:space-y-6 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-black text-neutral-900 text-base md:text-lg">Your Bag is Empty</h2>
              <p className="text-[11px] md:text-xs text-neutral-500 max-w-xs mx-auto">
                Discover masterfully crafted certified diamonds, pure investment gold coins, and traditional bridal jewelry.
              </p>
            </div>
            <button
              onClick={onGoBack}
              className="px-5 py-2.5 md:px-6 md:py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl md:rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Start Exploring Designs
            </button>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
            
            {/* Left side: Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-150 overflow-hidden shadow-xs divide-y divide-neutral-100">
                {cartDetails.map(({ product, quantity }) => {
                  const weightAttr = product.attributes.find(attr => attr.label.toLowerCase().includes("weight"));
                  const metalAttr = product.attributes.find(attr => attr.label.toLowerCase().includes("material") || attr.label.toLowerCase().includes("purity"));
                  
                  return (
                    <div key={product.id} className="p-3 md:p-6 flex flex-col sm:flex-row gap-3 md:gap-4 sm:items-center justify-between">
                      {/* Product details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 flex-shrink-0 relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          {product.badge && (
                            <span className="inline-block text-[9px] font-black uppercase text-gold-dark tracking-wider">
                              {product.badge}
                            </span>
                          )}
                          <h3 className="font-serif font-bold text-neutral-950 text-sm md:text-base leading-tight truncate">
                            {product.title}
                          </h3>
                          
                          {/* Technical attributes */}
                          <div className="flex items-center gap-2 flex-wrap text-[10px] text-neutral-400 font-bold">
                            <span className="bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
                              SKU: AT-{product.id}0{quantity}
                            </span>
                            {weightAttr && (
                              <span className="bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
                                {weightAttr.value}
                              </span>
                            )}
                            {metalAttr && (
                              <span className="bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
                                {metalAttr.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions and quantity */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 border border-neutral-200 bg-neutral-50 rounded-xl p-1">
                          <button
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            className="p-1 rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-800 cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-neutral-950">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            className="p-1 rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-800 cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right flex items-center sm:block gap-3">
                          <span className="font-mono text-xs text-neutral-400 block font-semibold leading-none sm:mb-1.5">
                            {quantity} x ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono text-sm font-black text-neutral-900 block">
                            ₹{(product.price * quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security certification badge */}
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 md:p-4 rounded-2xl md:rounded-3xl flex items-start gap-2.5 md:gap-3">
                <ShieldCheck className="w-4.5 h-4.5 md:w-5 md:h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] md:text-xs text-emerald-800 space-y-0.5">
                  <h4 className="font-bold">100% Insured Transit Guarantee</h4>
                  <p className="text-emerald-700/85 leading-tight">
                    Your luxury shipment is fully insured by Atulya Gold against any loss or damage during transit. Hand-delivered in heavy steel-lined tamper proof security envelopes.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Detailed Price breakdown */}
            <div className="space-y-4 md:space-y-6">
              
              {/* Order Summary box */}
              <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-150 p-4 md:p-6 shadow-xs space-y-4 md:space-y-5">
                <h3 className="font-serif font-black text-sm md:text-base text-neutral-950 pb-2.5 md:pb-3 border-b border-neutral-100">
                  Detailed Invoice Summary
                </h3>

                {/* Pricing sub-components */}
                <div className="space-y-2.5 md:space-y-3.5 text-[11px] md:text-xs text-neutral-600">
                  <div className="flex justify-between font-medium">
                    <span>Pure Gold / Gem Valuation:</span>
                    <span className="font-mono text-neutral-950 font-bold">₹{baseMetalValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="flex items-center gap-1">
                      Making Charges: 
                      <span className="text-[9px] md:text-[10px] text-neutral-400 font-bold">(12% avg)</span>
                    </span>
                    <span className="font-mono text-neutral-950 font-bold">₹{makingCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between font-black text-neutral-800 pt-2 border-t border-neutral-100">
                    <span>Cart Subtotal:</span>
                    <span className="font-mono text-neutral-950 font-black">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Coupon section */}
                  {appliedCoupon ? (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="flex items-center gap-1">
                        Voucher Discount ({appliedCoupon.code}):
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase"
                        >
                          [Remove]
                        </button>
                      </div>
                    </div>
                  ) : (
                    appliedCoupon?.error && (
                      <div className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded-xl">
                        {appliedCoupon.error}
                      </div>
                    )
                  )}

                  <div className="flex justify-between font-medium">
                    <span className="flex items-center gap-1">
                      Government GST: 
                      <span className="text-[9px] md:text-[10px] text-neutral-400 font-bold">(3% legal)</span>
                    </span>
                    <span className="font-mono text-neutral-950 font-bold">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between font-medium text-emerald-600 font-bold">
                    <span>Secure Transit Shipping:</span>
                    <span>FREE (Insured)</span>
                  </div>
                </div>

                {/* Coupon entry form */}
                {!appliedCoupon && (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-gold text-[11px] md:text-xs font-bold font-mono placeholder-neutral-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-950 text-white hover:bg-neutral-900 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Total box */}
                <div className="pt-3 md:pt-4 border-t border-neutral-100 flex justify-between items-baseline">
                  <span className="font-serif font-black text-sm text-neutral-950">Grand Total:</span>
                  <div className="text-right">
                    <span className="font-mono text-base md:text-lg font-black text-gold-dark block leading-none">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-neutral-400 font-bold block mt-1">
                      (Price inclusive of BIS standards & insurance)
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3 md:py-3.5 bg-gold hover:bg-gold-dark text-white rounded-xl md:rounded-2xl text-xs font-black shadow-lg shadow-gold/20 hover:shadow-gold/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 group"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Informative Rate Card Info */}
              <div className="bg-neutral-900 text-white p-3.5 md:p-4 rounded-2xl md:rounded-3xl space-y-2 border border-neutral-950 shadow-sm">
                <h4 className="font-serif font-black text-[11px] md:text-xs text-gold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> Honest Rate Card Promise
                </h4>
                <p className="text-[9px] md:text-[10px] text-neutral-400 leading-relaxed">
                  Jewelry rates fluctuate in real-time according to Bullion exchange indices. Your price is locked instantly when clicking 'Proceed to Secure Checkout' for the next 20 minutes.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
