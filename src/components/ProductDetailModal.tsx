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
  const [selectedCustomOption, setSelectedCustomOption] = useState<string>("");
  const [customOptionError, setCustomOptionError] = useState<boolean>(false);
  const [selectedCustomOption2, setSelectedCustomOption2] = useState<string>("");
  const [customOptionError2, setCustomOptionError2] = useState<boolean>(false);
  const [selectedCustomOption3, setSelectedCustomOption3] = useState<string>("");
  const [customOptionError3, setCustomOptionError3] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const currentImage = selectedImage || product.image;
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
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
            <div className="bg-neutral-50 flex flex-col justify-between border-r border-neutral-100">
              <div className="h-64 md:h-96 relative overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-all duration-350"
                  referrerPolicy="no-referrer"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-gold text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
                    {product.badge}
                  </span>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="p-3 bg-neutral-100/50 border-t border-neutral-200 flex gap-2 overflow-x-auto justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        currentImage === img ? "border-gold scale-105 shadow-xs" : "border-transparent hover:border-neutral-300"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
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

              {/* Custom Selector Options */}
              {((product.customOptionLabel && product.customOptionValues) ||
                (product.customOptionLabel2 && product.customOptionValues2) ||
                (product.customOptionLabel3 && product.customOptionValues3)) && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  {/* Option 1 */}
                  {product.customOptionLabel && product.customOptionValues && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                        <span>{product.customOptionLabel} <span className="text-rose-500">*</span></span>
                        {selectedCustomOption && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded font-mono">
                            {selectedCustomOption}
                          </span>
                        )}
                      </h4>
                      <select
                        value={selectedCustomOption}
                        onChange={(e) => {
                          setSelectedCustomOption(e.target.value);
                          setCustomOptionError(false);
                        }}
                        className={`w-full bg-white border rounded-xl p-2.5 text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                          customOptionError
                            ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse"
                            : "border-neutral-200 focus:border-amber-500"
                        }`}
                      >
                        <option value="">-- Choose {product.customOptionLabel} --</option>
                        {product.customOptionValues.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      {customOptionError && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                          <span>⚠️ Please choose a {product.customOptionLabel} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Option 2 */}
                  {product.customOptionLabel2 && product.customOptionValues2 && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                        <span>{product.customOptionLabel2} <span className="text-rose-500">*</span></span>
                        {selectedCustomOption2 && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded font-mono">
                            {selectedCustomOption2}
                          </span>
                        )}
                      </h4>
                      <select
                        value={selectedCustomOption2}
                        onChange={(e) => {
                          setSelectedCustomOption2(e.target.value);
                          setCustomOptionError2(false);
                        }}
                        className={`w-full bg-white border rounded-xl p-2.5 text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                          customOptionError2
                            ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse"
                            : "border-neutral-200 focus:border-amber-500"
                        }`}
                      >
                        <option value="">-- Choose {product.customOptionLabel2} --</option>
                        {product.customOptionValues2.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      {customOptionError2 && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                          <span>⚠️ Please choose a {product.customOptionLabel2} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Option 3 */}
                  {product.customOptionLabel3 && product.customOptionValues3 && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                        <span>{product.customOptionLabel3} <span className="text-rose-500">*</span></span>
                        {selectedCustomOption3 && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded font-mono">
                            {selectedCustomOption3}
                          </span>
                        )}
                      </h4>
                      <select
                        value={selectedCustomOption3}
                        onChange={(e) => {
                          setSelectedCustomOption3(e.target.value);
                          setCustomOptionError3(false);
                        }}
                        className={`w-full bg-white border rounded-xl p-2.5 text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                          customOptionError3
                            ? "border-rose-400 bg-rose-50/20 text-rose-700 animate-pulse"
                            : "border-neutral-200 focus:border-amber-500"
                        }`}
                      >
                        <option value="">-- Choose {product.customOptionLabel3} --</option>
                        {product.customOptionValues3.split(",").map(v => v.trim()).filter(Boolean).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      {customOptionError3 && (
                        <p className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                          <span>⚠️ Please choose a {product.customOptionLabel3} before adding!</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

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
              
              let updatedProduct = product;
              const suffixParts = [];
              if (selectedSize) {
                suffixParts.push(`Size: ${selectedSize}`);
              }
              if (product.customOptionLabel && selectedCustomOption) {
                suffixParts.push(`${product.customOptionLabel}: ${selectedCustomOption}`);
              }
              if (product.customOptionLabel2 && selectedCustomOption2) {
                suffixParts.push(`${product.customOptionLabel2}: ${selectedCustomOption2}`);
              }
              if (product.customOptionLabel3 && selectedCustomOption3) {
                suffixParts.push(`${product.customOptionLabel3}: ${selectedCustomOption3}`);
              }
              
              if (suffixParts.length > 0) {
                updatedProduct = {
                  ...product,
                  title: `${product.title} (${suffixParts.join(", ")})`
                };
              }
              onAddToCart(updatedProduct);
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
