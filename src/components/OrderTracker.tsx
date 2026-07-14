import React, { useState } from "react";
import { 
  Package, MapPin, Calendar, Clock, CreditCard, ShoppingBag, 
  ArrowRight, ShieldCheck, CheckCircle, Truck, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order, OrderItem } from "../types";

interface OrderTrackerProps {
  orders: Order[];
  onClose: () => void;
  userEmail: string;
}

const STAGES = [
  { id: 'Pending', label: 'Order Logged', desc: 'Securely registered in boutique', icon: ShoppingBag },
  { id: 'Customizing', label: 'Custom Artisans', desc: 'Sizing & handcraft detailing', icon: HammerIcon },
  { id: 'Assayed & Certified', label: 'Lab Certified', desc: 'Stamping BIS Hallmarks', icon: ShieldCheck },
  { id: 'Insured Transit', label: 'Insured Transit', desc: 'Secure armoed vehicle shipping', icon: Truck },
  { id: 'Delivered', label: 'Hand Delivered', desc: 'Delivered with security seal', icon: CheckCircle }
];

function HammerIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 5 4 4" />
      <path d="M21.5 12H16c-.5 0-1-.5-1-1V5.5c0-.5-.5-1-1-1H9c-.5 0-1 .5-1 1V11c0 .5-.5 1-1 1H2.5c-.5 0-1 .5-1 1v2c0 .5.5 1 1 1H8v4c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-4h5.5c.5 0 1-.5 1-1v-2c0-.5-.5-1-1-1z" />
    </svg>
  );
}

export default function OrderTracker({ orders, onClose, userEmail }: OrderTrackerProps) {
  // Filter orders by this user's email
  const userOrders = orders.filter(
    o => o.customerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    userOrders.length > 0 ? userOrders[0] : null
  );

  const getStageIndex = (status: Order['status']) => {
    return STAGES.findIndex(s => s.id === status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
      <motion.div
        initial={{ y: 25, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 25, opacity: 0, scale: 0.98 }}
        className="bg-white rounded-[32px] max-w-4xl w-full p-6 md:p-8 border border-neutral-100 shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="border-b border-neutral-100 pb-4 mb-5">
          <h2 className="font-serif font-black text-xl md:text-2xl text-neutral-950 tracking-tight flex items-center gap-2">
            Insured Transit Tracking <span className="text-gold font-sans font-bold text-[10px] uppercase tracking-widest bg-gold/10 px-2 py-0.5 rounded border border-gold/15">Royal Service</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time status of your certified gold and diamond checkout items.
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-50 border border-neutral-150 rounded-full flex items-center justify-center text-neutral-300">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-bold text-sm text-neutral-800">No Dispatches Logged Yet</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                There are no orders registered under <span className="font-mono font-bold text-neutral-800">{userEmail}</span>. Make sure you complete the checkout and we will log your premium orders here instantly!
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Fine Catalogue
            </button>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0">
            {/* Left side list of orders */}
            <div className="md:col-span-4 overflow-y-auto pr-1 border-r border-neutral-100 flex flex-col gap-2.5 max-h-[55vh] md:max-h-full">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Your Order Log ({userOrders.length})</span>
              {userOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? "border-gold bg-gold/5 shadow-xs"
                        : "border-neutral-150 hover:border-neutral-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono font-bold text-xs text-neutral-800">{order.id}</span>
                      <span className="text-[9px] text-neutral-400 font-medium">{order.createdAt.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between items-end w-full">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">{order.items.length} Piece{order.items.length > 1 ? 's' : ''}</span>
                      <span className="font-mono font-bold text-xs text-gold-dark">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        ● {order.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right side live status view */}
            <div className="md:col-span-8 overflow-y-auto pl-0 md:pl-2 max-h-[55vh] md:max-h-full flex flex-col gap-5">
              {selectedOrder && (
                <>
                  {/* Order Details Header Card */}
                  <div className="bg-neutral-50 rounded-2xl border border-neutral-150 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">EST. ARRIVAL</span>
                      <span className="font-bold text-neutral-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        <span>Insured Transit</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">SHIPPED VIA</span>
                      <span className="font-semibold text-neutral-800">Atulya Courier (Secured)</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">GRAND TOTAL</span>
                      <span className="font-mono font-bold text-neutral-900 text-xs">₹{selectedOrder.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">PAYMENT</span>
                      <span className={`font-black px-1.5 py-0.5 rounded text-[8px] uppercase ${
                        selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="space-y-4 py-2">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Live Dispatch Milestones</span>
                    <div className="relative pl-7 space-y-6">
                      {/* Vertical line connector */}
                      <div className="absolute left-3 top-2.5 bottom-2.5 w-0.5 bg-neutral-100" />
                      
                      {STAGES.map((stage, idx) => {
                        const currentStageIdx = getStageIndex(selectedOrder.status);
                        const isCompleted = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        const Icon = stage.icon;

                        return (
                          <div key={stage.id} className="relative flex items-start gap-4">
                            {/* Stepper node dot */}
                            <div className={`absolute -left-[25px] w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? isCurrent
                                  ? "bg-gold border-gold text-neutral-950 scale-110 shadow-md animate-pulse"
                                  : "bg-neutral-900 border-neutral-900 text-white"
                                : "bg-white border-neutral-200 text-neutral-300"
                            }`}>
                              <CheckCircle className={`w-3 h-3 ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                            </div>

                            {/* Stepper text content */}
                            <div className="flex gap-3 items-center min-w-0">
                              <div className={`p-2 rounded-xl border flex-shrink-0 transition-all ${
                                isCompleted
                                  ? isCurrent
                                    ? "bg-gold/10 border-gold/30 text-gold-dark"
                                    : "bg-neutral-50 border-neutral-150 text-neutral-800"
                                  : "bg-neutral-50/50 border-neutral-100 text-neutral-300"
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className={`font-bold text-xs leading-none ${isCompleted ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                  {stage.label}
                                </h5>
                                <p className={`text-[10px] mt-1 truncate ${isCompleted ? 'text-neutral-500' : 'text-neutral-400/75'}`}>
                                  {stage.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order items summary card */}
                  <div className="border border-neutral-150 rounded-2xl p-4 space-y-3.5">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Detailed Manifest</span>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs font-sans pb-2 border-b border-neutral-100/60 last:border-0 last:pb-0">
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-800 block truncate">{item.title}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">Quantity: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="font-mono font-bold text-neutral-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
