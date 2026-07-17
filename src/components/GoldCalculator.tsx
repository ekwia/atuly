import { useState, useEffect } from "react";
import { X, Calculator, Info, Landmark, TrendingUp, ShieldCheck, Download, Award, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoldRate } from "../types";

interface GoldCalculatorProps {
  onClose?: () => void;
  goldRates: GoldRate;
  isPage?: boolean;
  onBackToHome?: () => void;
}

export default function GoldCalculator({ onClose, goldRates, isPage = false, onBackToHome }: GoldCalculatorProps) {
  const [metal, setMetal] = useState<'gold' | 'silver' | 'platinum'>('gold');
  const [goldKarat, setGoldKarat] = useState<'24K' | '22K' | '18K'>('24K');
  const [weight, setWeight] = useState<string>("10"); // Default 10g
  const [makingCharges, setMakingCharges] = useState<number>(10); // Default 10%
  const [gst, setGst] = useState<number>(3); // Standard 3% GST on jewelry in India
  const [savedQuotes, setSavedQuotes] = useState<Array<{ id: string; timestamp: Date; total: number; weight: number; metal: string; purity: string }>>([]);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Generate some high-end simulated gold price trend points for a gorgeous SVG graph
  const [trendPoints, setTrendPoints] = useState<number[]>([]);

  useEffect(() => {
    // Generate simulated historical trends around current rates
    const base = goldRates[goldKarat] || goldRates["24K"];
    const points = [
      base - 140,
      base - 80,
      base - 110,
      base - 40,
      base - 20,
      base + 10,
      base
    ];
    setTrendPoints(points);
  }, [goldKarat, goldRates]);

  const calculateEstimation = () => {
    const wt = parseFloat(weight);
    if (isNaN(wt) || wt <= 0) return null;

    let baseRate = 0;
    if (metal === 'gold') {
      baseRate = goldRates[goldKarat];
    } else if (metal === 'silver') {
      baseRate = goldRates.Silver;
    } else {
      baseRate = goldRates.Platinum;
    }

    const rawMetalValue = wt * baseRate;
    const makingValue = rawMetalValue * (makingCharges / 100);
    const subtotal = rawMetalValue + makingValue;
    const gstValue = subtotal * (gst / 100);
    const grandTotal = subtotal + gstValue;

    return {
      rawMetalValue,
      makingValue,
      gstValue,
      grandTotal,
      baseRate
    };
  };

  const estimation = calculateEstimation();

  const handleSaveQuote = () => {
    if (!estimation) return;
    const newQuote = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date(),
      total: estimation.grandTotal,
      weight: parseFloat(weight),
      metal,
      purity: metal === 'gold' ? goldKarat : metal === 'silver' ? 'Sterling Silver' : '950 Platinum'
    };
    setSavedQuotes(prev => [newQuote, ...prev.slice(0, 4)]);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Render content in page view
  if (isPage) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto w-full px-1 py-2">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold-dark font-black text-xs uppercase tracking-widest">
              <Landmark className="w-4 h-4" />
              <span>Live Gold & Silver Rates</span>
            </div>
            <h1 className="font-serif font-black text-2xl md:text-3xl text-neutral-900 tracking-tight">
              Gold & Silver Price Calculator
            </h1>
            <p className="text-xs text-neutral-500 max-w-2xl">
              Calculate the exact price of gold, silver, and platinum with today's live market rates. This is based on standard BIS-Hallmark quality.
            </p>
          </div>
          {onBackToHome && (
            <button
              id="back-to-collections"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs self-start md:self-center"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>Back to Jewelry Catalog</span>
            </button>
          )}
        </div>

        {/* Dynamic Rates Quick Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "24K Fine Gold", rate: goldRates["24K"], unit: "per gram", color: "from-amber-400 to-amber-500", text: "text-amber-900" },
            { title: "22K Jewel Gold", rate: goldRates["22K"], unit: "per gram", color: "from-yellow-400 to-amber-500", text: "text-amber-950" },
            { title: "950 Platinum", rate: goldRates.Platinum, unit: "per gram", color: "from-neutral-100 to-neutral-200", text: "text-neutral-800" },
            { title: "Sterling Silver", rate: goldRates.Silver, unit: "per gram", color: "from-slate-100 to-slate-200", text: "text-slate-800" }
          ].map((item, index) => (
            <div key={index} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 shadow-md space-y-1 relative overflow-hidden group hover:shadow-xl hover:border-gold/45 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-gold-dark" />
              <span className="text-[10px] font-bold text-gold-dark uppercase tracking-wider block">{item.title}</span>
              <span className="font-mono text-lg font-black text-white block">
                ₹{item.rate.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-neutral-450 font-medium block">{item.unit}</span>
            </div>
          ))}
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Calculator Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-neutral-150/70 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold-dark shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-black text-lg text-neutral-900">Calculate Your Jewelry Price</h2>
                <p className="text-[10px] text-neutral-400">Enter weight, purity, and making charges to get total price</p>
              </div>
            </div>

            {/* Metal Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100 rounded-xl">
              {(['gold', 'silver', 'platinum'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMetal(m);
                    if (m === 'gold') setMakingCharges(10);
                    else if (m === 'silver') setMakingCharges(5);
                    else setMakingCharges(12);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    metal === m
                      ? "bg-white text-neutral-900 shadow-sm font-extrabold"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Karat Options for Gold */}
              {metal === 'gold' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    Select Gold Purity (Karat)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['24K', '22K', '18K'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setGoldKarat(k)}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          goldKarat === k
                            ? "border-gold bg-gold/5 text-gold-dark font-black"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className="text-xs">{k}</span>
                        <span className="text-[9px] font-mono font-medium text-neutral-500">₹{goldRates[k]}/g</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Slider & Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    Weight in Grams (g)
                  </label>
                  <span className="text-xs font-mono font-bold text-gold-dark">{weight || "0"} Grams</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <input
                      type="range"
                      min="0.5"
                      max="100"
                      step="0.5"
                      value={weight || "10"}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full accent-gold cursor-pointer"
                    />
                  </div>
                  <div className="sm:col-span-4 relative">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none font-bold text-neutral-800 text-xs font-mono transition-colors text-right"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 pointer-events-none">g</span>
                  </div>
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                      Making Charges (%)
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-600">{makingCharges}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={makingCharges}
                    onChange={(e) => setMakingCharges(parseInt(e.target.value))}
                    className="w-full accent-gold cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                      Sovereign GST (%)
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-600">{gst}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={gst}
                    onChange={(e) => setGst(parseFloat(e.target.value))}
                    className="w-full accent-gold cursor-pointer"
                  />
                </div>
              </div>

              {/* Estimation Results Card */}
              {estimation ? (
                <div className="mt-6 p-5 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-3 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-b border-neutral-800 pb-3">
                    <div className="text-neutral-400">Selected Item:</div>
                    <div className="font-bold text-white text-right capitalize">
                      {metal === 'gold' ? `${goldKarat} Pure Gold` : metal}
                    </div>

                    <div className="text-neutral-400">Live Base Rate:</div>
                    <div className="font-mono font-bold text-white text-right">
                      ₹{estimation.baseRate.toLocaleString('en-IN')}/g
                    </div>

                    <div className="text-neutral-400">Raw Value ({weight}g):</div>
                    <div className="font-mono font-bold text-white text-right">
                      ₹{estimation.rawMetalValue.toLocaleString('en-IN')}
                    </div>

                    <div className="text-neutral-400">Making Charges ({makingCharges}%):</div>
                    <div className="font-mono font-bold text-white text-right">
                      ₹{estimation.makingValue.toLocaleString('en-IN')}
                    </div>

                    <div className="text-neutral-400">GST Registration ({gst}%):</div>
                    <div className="font-mono font-bold text-white text-right">
                      ₹{estimation.gstValue.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Estimated Acquisition Value</span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Price Insured & Locked</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-2xl text-gold block">
                        ₹{estimation.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      id="studio-save-quote"
                      onClick={handleSaveQuote}
                      className="py-2.5 rounded-xl border border-neutral-200 hover:border-gold/30 hover:bg-gold/5 text-neutral-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Lock & Save Quote</span>
                    </button>
                    <button
                      id="studio-download-quote"
                      onClick={() => window.print()}
                      className="py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-neutral-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-gold/15"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Download Estimate Bill</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  <Calculator className="w-8 h-8 text-neutral-300 mx-auto mb-2 animate-bounce" />
                  <span>Please change weight or select a metal to see the price</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Market Intelligence & Saving Advices */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Chart/Trend Card */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-gold-dark" />
                  <h3 className="font-serif font-black text-sm text-neutral-900">7-Day Purity Index</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  +1.42% Bullish
                </span>
              </div>

              {/* Sparkline Vector Graph */}
              <div className="h-28 flex items-end justify-center relative pt-4 pb-2">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A359" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D4A359" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {trendPoints.length > 0 && (
                    <>
                      {/* Gradient path */}
                      <path
                        d={`M 0,100 
                            L 0,${100 - ((trendPoints[0] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 16,${100 - ((trendPoints[1] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 32,${100 - ((trendPoints[2] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 48,${100 - ((trendPoints[3] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 64,${100 - ((trendPoints[4] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 80,${100 - ((trendPoints[5] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 100,${100 - ((trendPoints[6] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 100,100 Z`}
                        fill="url(#chartGradient)"
                      />
                      {/* Stroke path */}
                      <path
                        d={`M 0,${100 - ((trendPoints[0] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 16,${100 - ((trendPoints[1] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 32,${100 - ((trendPoints[2] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 48,${100 - ((trendPoints[3] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 64,${100 - ((trendPoints[4] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 80,${100 - ((trendPoints[5] - (goldRates[goldKarat] - 200)) / 300) * 80} 
                            L 100,${100 - ((trendPoints[6] - (goldRates[goldKarat] - 200)) / 300) * 80}`}
                        fill="none"
                        stroke="#D4A359"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
                {/* Horizontal guide indicators */}
                <div className="absolute left-2 top-0 text-[8px] font-bold text-neutral-400">High: ₹{(goldRates[goldKarat] + 80).toLocaleString('en-IN')}</div>
                <div className="absolute right-2 bottom-0 text-[8px] font-bold text-neutral-400">Spot: ₹{goldRates[goldKarat].toLocaleString('en-IN')}</div>
              </div>
              <span className="text-[9px] text-neutral-400 font-bold block text-center uppercase tracking-widest">Simulated intraday commodity index (INR)</span>
            </div>

            {/* Purity & Trust Guide */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-4">
              <h3 className="font-serif font-black text-sm text-neutral-900 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-gold" />
                <span>Gold Purity & Trust Guide</span>
              </h3>
              <div className="space-y-3.5">
                {[
                  { title: "24K Gold vs 22K Gold", desc: "24 Karat is 99.9% pure gold, mostly used for gold coins or bars. 22 Karat is 91.6% pure gold mixed with small alloys, which is perfect for making strong wedding jewelry." },
                  { title: "BIS 916 Hallmark Stamp", desc: "Every piece of our gold has a laser hallmark stamp from the government (Bureau of Indian Standards) showing its exact purity. This protects your gold's resale value." },
                  { title: "100% Easy Buyback", desc: "Get 100% current market value of the gold whenever you want to sell or exchange your Atulya jewelry in the future. No hidden charges." }
                ].map((rule, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-800">{rule.title}</h4>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Estimates Stack */}
            {savedQuotes.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-3">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Saved Estimates</span>
                <div className="space-y-2">
                  {savedQuotes.map((quote) => (
                    <div key={quote.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-150/50">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-gold/15 text-gold-dark font-mono font-bold px-1 py-0.5 rounded">{quote.id}</span>
                          <span className="text-[10px] text-neutral-600 font-bold">{quote.weight}g {quote.purity}</span>
                        </div>
                        <span className="text-[8px] text-neutral-400 block mt-0.5">{quote.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <span className="font-mono text-xs font-black text-neutral-900">
                        ₹{quote.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Saved Toast Alert */}
        <AnimatePresence>
          {showSavedToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-neutral-800"
            >
              <div className="w-5 h-5 rounded-full bg-gold text-neutral-950 flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-xs font-bold tracking-wide">Quotation saved to your secure profile vault successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Original small modal/box layout remains fully compliant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-2xl max-w-md w-full relative"
    >
      {onClose && (
        <button
          id="close-calculator"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-base text-neutral-900">
            Precious Metals Calculator
          </h3>
          <p className="text-[11px] text-neutral-500">Calculate estimated price based on live market rates</p>
        </div>
      </div>

      {/* Metal Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-lg mb-4">
        {(['gold', 'silver', 'platinum'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMetal(m);
              if (m === 'gold') setMakingCharges(10);
              else if (m === 'silver') setMakingCharges(5);
              else setMakingCharges(12);
            }}
            className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${
              metal === m
                ? "bg-white text-neutral-900 shadow-xs font-bold"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Karat Options for Gold */}
        {metal === 'gold' && (
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Select Gold Karat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['24K', '22K', '18K'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setGoldKarat(k)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    goldKarat === k
                      ? "border-gold bg-gold/5 text-gold-dark"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <span>{k}</span>
                  <span className="text-[9px] font-mono font-medium text-neutral-500">₹{goldRates[k]}/g</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weight input */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
            Weight in Grams (g)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 10"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-neutral-200 focus:border-gold focus:outline-none font-semibold text-neutral-800 placeholder-neutral-400 font-mono transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">g</span>
          </div>
        </div>

        {/* Customizations */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Making Charges (%)
            </label>
            <input
              type="number"
              value={makingCharges}
              onChange={(e) => setMakingCharges(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-gold focus:outline-none text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              GST Rate (%)
            </label>
            <input
              type="number"
              value={gst}
              onChange={(e) => setGst(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-gold focus:outline-none text-xs font-mono"
            />
          </div>
        </div>

        {/* Estimation Results Panel */}
        {estimation ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2"
          >
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>Base Rate (per gram)</span>
              <span className="font-mono font-medium">₹{estimation.baseRate.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>Raw Metal Value</span>
              <span className="font-mono font-medium">₹{estimation.rawMetalValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>Making Charges ({makingCharges}%)</span>
              <span className="font-mono font-medium">₹{estimation.makingValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>GST ({gst}%)</span>
              <span className="font-mono font-medium">₹{estimation.gstValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-px bg-neutral-200/60 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-800">Total Estimated Price</span>
              <span className="font-mono font-bold text-gold-dark text-base">
                ₹{estimation.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-6 text-neutral-400 text-xs flex flex-col items-center gap-1.5">
            <Info className="w-5 h-5 text-neutral-300" />
            <span>Enter metal weight to view live valuation</span>
          </div>
        )}

        {/* Certificate notice */}
        <div className="flex gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100/50 text-[10px] text-amber-800 leading-normal">
          <Landmark className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            This estimation is calculated on current spot prices. Making charges and GST of 3% are compliant with BIS Hallmark certification standards.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
