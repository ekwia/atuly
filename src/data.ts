import { Product, Review } from "./types";

export const products: Product[] = [
  {
    id: 1,
    title: "24K Gold Coin (10g) with BIS Certificate",
    price: 68500,
    originalPrice: 72000,
    category: "coins",
    material: "gold",
    image: "https://images.unsplash.com/photo-1611591437281-4608be122683?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 142,
    sold: 128,
    badge: "exclusive",
    description: "This exquisite 24K gold coin is crafted with pure gold and comes with a BIS hallmark certification. Each coin weighs exactly 10 grams and features intricate designs of Lakshmi and Ganesha on both sides. Perfect for investment or gifting on special occasions.",
    attributes: [
      { label: "Material", value: "24K Gold (99.9% pure)" },
      { label: "Weight", value: "10 grams" },
      { label: "Certification", value: "BIS Hallmark" },
      { label: "Dimensions", value: "24mm diameter" },
      { label: "Manufacturer", value: "Atulya Jewelers" },
      { label: "Country of Origin", value: "India" }
    ]
  },
  {
    id: 2,
    title: "Diamond Solitaire Ring (1.5ct)",
    price: 185000,
    originalPrice: 210000,
    category: "rings",
    material: "diamond",
    image: "https://images.unsplash.com/photo-1603974374373-9a8a0a0d9f11?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    ratingCount: 86,
    sold: 42,
    badge: "new",
    description: "A stunning solitaire diamond ring featuring a 1.5 carat brilliant cut diamond set in 18K white gold. The diamond is G color, VS1 clarity, and comes with IGI certification.",
    attributes: [
      { label: "Material", value: "18K White Gold" },
      { label: "Diamond Weight", value: "1.5 carat" },
      { label: "Diamond Color", value: "G" },
      { label: "Diamond Clarity", value: "VS1" },
      { label: "Certification", value: "IGI Certified" }
    ]
  },
  {
    id: 3,
    title: "Emerald & Diamond Pendant (18K Gold)",
    price: 78500,
    originalPrice: 92000,
    category: "pendants",
    material: "emerald",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 64,
    sold: 57,
    badge: "sale",
    description: "Beautiful emerald and diamond pendant set in 18K yellow gold. The center natural emerald is surrounded by sparkling round-cut diamonds, creating an elegant and timeless piece.",
    attributes: [
      { label: "Material", value: "18K Yellow Gold" },
      { label: "Emerald Weight", value: "1.2 carat" },
      { label: "Diamond Weight", value: "0.5 carat" },
      { label: "Chain Length", value: "18 inches" }
    ]
  },
  {
    id: 4,
    title: "Platinum Wedding Band for Men",
    price: 65000,
    originalPrice: 65000,
    category: "rings",
    material: "platinum",
    image: "https://images.unsplash.com/photo-1608042314451-ef075a5e8a0e?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    ratingCount: 112,
    sold: 89,
    badge: "limited",
    description: "Classic platinum wedding band for men with a polished finish. This timeless piece is perfect for everyday wear and will last a lifetime.",
    attributes: [
      { label: "Material", value: "Platinum (95% pure)" },
      { label: "Width", value: "6mm" },
      { label: "Weight", value: "8 grams" }
    ]
  },
  {
    id: 5,
    title: "Ruby & Diamond Earrings (22K Gold)",
    price: 112000,
    originalPrice: 130000,
    category: "earrings",
    material: "ruby",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 28,
    sold: 15,
    badge: "new",
    description: "Exquisite ruby and diamond earrings set in 22K gold. Each earring features a center oval-cut ruby surrounded by brilliant cut diamonds, displaying traditional bridal elegance.",
    attributes: [
      { label: "Material", value: "22K Yellow Gold" },
      { label: "Ruby Weight", value: "1.0 carat each" },
      { label: "Diamond Weight", value: "0.3 carat each" },
      { label: "Closure", value: "Screw-back" }
    ]
  },
  {
    id: 6,
    title: "Sapphire Bracelet with Diamonds",
    price: 95000,
    originalPrice: 110000,
    category: "bracelets",
    material: "sapphire",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    ratingCount: 15,
    sold: 8,
    badge: "new",
    description: "Elegant sapphire and diamond bracelet in 18K white gold. Features alternating deep blue sapphires and diamonds in a delicate infinity chain design.",
    attributes: [
      { label: "Material", value: "18K White Gold" },
      { label: "Sapphire Weight", value: "2.5 carats total" },
      { label: "Diamond Weight", value: "1.0 carat total" },
      { label: "Length", value: "7 inches" }
    ]
  },
  {
    id: 7,
    title: "Pearl Strand Necklace with 18K Clasp",
    price: 45000,
    originalPrice: 50000,
    category: "necklaces",
    material: "pearl",
    image: "https://images.unsplash.com/photo-1605106715994-18d3fec838be?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 72,
    sold: 65,
    badge: "bestseller",
    description: "Classic strand of freshwater pearls with an 18K gold clasp. The pearls are perfectly matched for uniform size, roundness, and high-luster sheen.",
    attributes: [
      { label: "Material", value: "Freshwater Pearls" },
      { label: "Length", value: "45cm" },
      { label: "Pearl Size", value: "7-8mm" },
      { label: "Clasp", value: "18K Yellow Gold" }
    ]
  },
  {
    id: 8,
    title: "Royal Silver Pooja Thali Set (5 Pieces)",
    price: 28500,
    originalPrice: 32000,
    category: "coins",
    material: "silver",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    ratingCount: 143,
    sold: 112,
    badge: "bestseller",
    description: "Traditional sterling silver pooja set with rich gold plating accents. Includes a diya, kalash, spoon, and beautiful hand-embossed plate.",
    attributes: [
      { label: "Material", value: "Sterling Silver (92.5% pure)" },
      { label: "Weight", value: "350 grams" },
      { label: "Pieces", value: "5 pieces" }
    ]
  },
  {
    id: 9,
    title: "Gold Mangalsutra with Black Beads",
    price: 45000,
    originalPrice: 50000,
    category: "necklaces",
    material: "gold",
    image: "https://images.unsplash.com/photo-1608042314451-ef075a5e8a0e?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 256,
    sold: 210,
    badge: "bestseller",
    description: "Traditional bridal mangalsutra in 22K gold with high-grade black spinel beads. The central pendant features exquisite filigree art and comes with an adjustable length.",
    attributes: [
      { label: "Material", value: "22K Gold" },
      { label: "Chain Length", value: "Adjustable 16-18 inches" },
      { label: "Pendant Size", value: "1.5 x 1.0 inch" }
    ]
  },
  {
    id: 10,
    title: "Classic Diamond Studs (1.0ct total)",
    price: 62000,
    originalPrice: 68000,
    category: "earrings",
    material: "diamond",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 189,
    sold: 156,
    badge: "bestseller",
    description: "Classic four-prong diamond stud earrings in 14K white gold. Each earring features a 0.5 carat brilliant round cut diamond with excellent cut, color, and clarity.",
    attributes: [
      { label: "Material", value: "14K White Gold" },
      { label: "Diamond Weight", value: "0.5 carat each" },
      { label: "Diamond Quality", value: "VS2, G color" },
      { label: "Closure", value: "Screw-back" }
    ]
  },
  {
    id: 11,
    title: "Traditional Gold Bangle Set (22K, 2pcs)",
    price: 85000,
    originalPrice: 95000,
    category: "bangles",
    material: "gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 178,
    sold: 145,
    badge: "bestseller",
    description: "Set of two matching 22K gold bangles featuring handcrafted royal antique motifs. Perfect for weddings and ceremonial occasions.",
    attributes: [
      { label: "Material", value: "22K Gold" },
      { label: "Weight", value: "16 grams total" },
      { label: "Diameter", value: "2.5 inches" }
    ]
  },
  {
    id: 12,
    title: "Royal Curb Link Gold Chain (24K, 30g)",
    price: 156000,
    originalPrice: 165000,
    category: "chains",
    material: "gold",
    image: "https://images.unsplash.com/photo-1611591437281-4608be122683?auto=format&fit=crop&w=600&q=80",
    rating: 4,
    ratingCount: 92,
    sold: 78,
    badge: "exclusive",
    description: "Solid 24K gold chain for men with a classic heavy curb link design. High-gloss finish with a robust, certified BIS hallmarked clasp.",
    attributes: [
      { label: "Material", value: "24K Gold" },
      { label: "Weight", value: "30 grams" },
      { label: "Length", value: "22 inches" },
      { label: "Width", value: "6mm" }
    ]
  },
  {
    id: 13,
    title: "Emerald Cut Diamond Eternity Ring",
    price: 198000,
    originalPrice: 220000,
    category: "rings",
    material: "diamond",
    image: "https://images.unsplash.com/photo-1603974374373-9a8a0a0d9f11?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 42,
    sold: 38,
    badge: "trending",
    description: "Breathtaking emerald-cut diamonds hand-set in a continuous eternity circle, mounted on premium platinum. Excellent sparkle and fire.",
    attributes: [
      { label: "Material", value: "Platinum" },
      { label: "Diamond Weight", value: "3.2 carats total" },
      { label: "Width", value: "4mm" }
    ]
  },
  {
    id: 14,
    title: "Traditional Kundan Pendant Necklace Set",
    price: 135000,
    originalPrice: 150000,
    category: "necklaces",
    material: "gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    ratingCount: 49,
    sold: 31,
    badge: "trending",
    description: "Exquisite traditional Rajasthani Kundan pendant necklace. Features green enamel (meenakari) work on the reverse side and premium hand-set uncut gemstones.",
    attributes: [
      { label: "Material", value: "22K Gold & Gemstones" },
      { label: "Gem Type", value: "Kundan, Rubies, Pearls" },
      { label: "Weight", value: "28.5 grams" }
    ]
  }
];

export const reviews: Review[] = [
  {
    id: 1,
    name: "Priya Sharma",
    date: "2 days ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5,
    text: "The gold necklace I purchased from Atulya is absolutely stunning! The traditional craftsmanship is flawless and the BIS certification offers real peace of mind."
  },
  {
    id: 2,
    name: "Rahul Patel",
    date: "1 week ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 4,
    text: "Great quality platinum ring. The weight is perfect and the matte finish looks very elegant. Delivery was fast and the safety box packaging was outstanding."
  },
  {
    id: 3,
    name: "Ananya Gupta",
    date: "3 weeks ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5,
    text: "I'm in love with my diamond solitaire earrings! They sparkle brilliantly under any light. The AI jewelry advisor helped me choose the best option within my budget!"
  }
];
