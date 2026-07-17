import React, { useState } from "react";
import { Star, Eye, ShoppingCart, Share2, Check } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types";

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onOpenDetail: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({
  product,
  onOpenDetail,
  onOpenQuickView,
  onAddToCart,
  viewMode = 'grid'
}: ProductCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const badgeColors = {
    new: "bg-emerald-600 text-white",
    sale: "bg-rose-600 text-white",
    limited: "bg-amber-600 text-white",
    exclusive: "bg-gradient-to-r from-amber-500 to-amber-700 text-white",
    bestseller: "bg-gradient-to-r from-orange-500 to-rose-500 text-white",
    trending: "bg-blue-600 text-white",
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-gold/30 transition-all duration-300 border border-neutral-200/60 flex h-24 sm:h-28 cursor-pointer relative"
        onClick={() => onOpenDetail(product)}
      >
        {product.badge && (
          <span className={`absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-md text-[7px] sm:text-[9px] font-bold uppercase tracking-widest ${badgeColors[product.badge]} shadow-sm`}>
            {product.badge}
          </span>
        )}

        <div className="w-24 sm:w-28 h-full bg-[#FAF8F5] relative overflow-hidden flex-shrink-0 border-r border-neutral-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-108"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1 group-hover:text-gold-dark transition-colors">
              {product.title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-neutral-400 capitalize mt-0.5 font-medium tracking-wide">{product.material} • {product.category}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-neutral-900 text-xs sm:text-base">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-neutral-400 text-[10px] sm:text-xs line-through decoration-neutral-300">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="inline-block bg-rose-50 text-rose-600 font-extrabold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded mt-1 tracking-wider">
                  {discount}% SPECIAL PRICE
                </span>
              )}
            </div>

            <div className="flex gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                id={`share-btn-list-${product.id}`}
                onClick={handleShare}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs ${
                  copied 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-neutral-100 hover:bg-gold hover:text-white text-neutral-700"
                }`}
                title="Share Product"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <button
                id={`quick-view-${product.id}`}
                onClick={() => onOpenQuickView(product)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-gold hover:text-white text-neutral-700 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                id={`add-to-cart-list-${product.id}`}
                onClick={() => {
                  if ((product.customOptionLabel && product.customOptionValues) || (product.customOptionLabel2 && product.customOptionValues2) || (product.customOptionLabel3 && product.customOptionValues3)) {
                    onOpenQuickView(product);
                  } else {
                    onAddToCart(product);
                  }
                }}
                className="h-8 px-3.5 rounded-full bg-gold hover:bg-gold-dark text-white flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 hover:shadow-md hover:shadow-gold/15 hover:-translate-y-0.5 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-gold/30 hover:translate-y-[-2px] transition-all duration-300 border border-neutral-200/60 flex flex-col cursor-pointer relative group/card"
      onClick={() => onOpenDetail(product)}
    >
      {product.badge && (
        <span className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[7px] sm:text-[9px] font-black uppercase tracking-widest ${badgeColors[product.badge]} shadow-sm`}>
          {product.badge}
        </span>
      )}

      <div className="h-28 sm:h-36 md:h-44 bg-[#FAF8F5] relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-108"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-neutral-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            id={`share-btn-grid-${product.id}`}
            onClick={handleShare}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md transform translate-y-2 group-hover/card:translate-y-0 cursor-pointer ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white hover:bg-gold hover:text-white text-neutral-800"
            }`}
            title="Share Product"
          >
            {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => { e.stopPropagation(); onOpenQuickView(product); }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gold hover:text-white text-neutral-800 flex items-center justify-center transition-all duration-300 shadow-md transform translate-y-2 group-hover/card:translate-y-0 cursor-pointer delay-75"
            title="Quick View"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if ((product.customOptionLabel && product.customOptionValues) || (product.customOptionLabel2 && product.customOptionValues2) || (product.customOptionLabel3 && product.customOptionValues3)) {
                onOpenQuickView(product);
              } else {
                onAddToCart(product);
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-gold hover:text-white text-neutral-800 flex items-center justify-center transition-all duration-300 shadow-md transform translate-y-2 group-hover/card:translate-y-0 delay-150 cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4.5 flex flex-col flex-1">
        <div className="flex-1">
          <span className="text-[8px] sm:text-[9px] text-gold-dark font-black uppercase tracking-wider block mb-1">
            {product.material} • {product.category}
          </span>
          <h3 className="font-serif font-bold text-xs sm:text-[13px] text-neutral-900 line-clamp-2 leading-tight sm:leading-snug min-h-6 sm:min-h-9 group-hover/card:text-gold-dark transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
            <span className="font-mono font-extrabold text-neutral-900 text-xs sm:text-base">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-neutral-400 text-[10px] sm:text-xs line-through decoration-neutral-300">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-rose-50 text-rose-600 font-extrabold text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded tracking-wider">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 mt-3.5 pt-2.5">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-800">{product.rating.toFixed(1)}</span>
            <span className="text-[8px] sm:text-[10px] text-neutral-400">({product.ratingCount})</span>
          </div>
          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-full">
            {product.sold} sold
          </span>
        </div>
      </div>
    </motion.div>
  );
}
