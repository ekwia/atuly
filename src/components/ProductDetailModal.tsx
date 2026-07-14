import { useState } from "react";
import { X, Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Landmark, Share2, Check } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("Standard");
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }).catch(err => {
      console.error("Failed to copy URL:", err);
    });
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          id="close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-800 shadow-md hover:scale-105 z-10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image section */}
            <div className="h-64 md:h-full bg-neutral-50 relative min-h-[300px]">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-gold text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Information section */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gold-dark">{product.material} Jewelry</p>
                <h2 className="font-serif font-bold text-lg md:text-xl text-neutral-900 mt-1 leading-tight">
                  {product.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < product.rating ? "fill-amber-400" : "text-neutral-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-neutral-700">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-neutral-400">({product.ratingCount} reviews)</span>
                  <span className="text-xs text-neutral-300">|</span>
                  <span className="text-xs text-neutral-500 font-medium">{product.sold} items sold</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] font-black text-gold-dark block mb-0.5 uppercase tracking-wider">ESTIMATED PRICE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-black text-white">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && (
                      <span className="font-mono text-xs text-neutral-400 line-through decoration-neutral-600">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {discount > 0 && (
                  <span className="bg-rose-950/40 border border-rose-900/60 text-rose-400 font-black text-xs px-2.5 py-1 rounded-lg">
                    {discount}% Off Selected
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-800">Description</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.attributes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-800">Fine Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100/60 flex flex-col">
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold mb-0.5">{attr.label}</span>
                        <span className="font-medium text-neutral-800 font-mono text-[11px]">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizing/Quantity Option */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-800">Weight / Size Selection</h4>
                <div className="flex gap-2">
                  {["Standard", "Heavy 15g", "Luxe 20g"].map((size) => (
                    <button
                      key={size}
                      id={`size-${size.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === size
                          ? "border-gold bg-gold/5 text-gold-dark"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials / Promises */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-neutral-600">
                <div className="flex flex-col items-center gap-1 bg-neutral-50 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span className="font-semibold text-neutral-800">Hallmarked</span>
                  <span className="text-[8px] text-neutral-400">100% Certified</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-neutral-50 p-2.5 rounded-xl">
                  <Truck className="w-4 h-4 text-gold" />
                  <span className="font-semibold text-neutral-800">Insured Delivery</span>
                  <span className="text-[8px] text-neutral-400">Free across India</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-neutral-50 p-2.5 rounded-xl">
                  <RefreshCw className="w-4 h-4 text-gold" />
                  <span className="font-semibold text-neutral-800">Easy Returns</span>
                  <span className="text-[8px] text-neutral-400">7-Day Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex gap-3">
          <div className="flex gap-1 p-2 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-800 leading-normal flex-1 items-center">
            <Landmark className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="font-medium">
              We certify this {product.material} item is hallmarked and meets standard weight purity.
            </p>
          </div>
          <button
            id="share-product-detail-modal"
            onClick={handleShare}
            className={`px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
              copiedShare 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-neutral-200 text-neutral-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            }`}
            title="Share Product"
          >
            {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? "Copied!" : "Share"}</span>
          </button>
          <button
            id="add-to-cart-detail-modal"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-dark text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Bag
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
