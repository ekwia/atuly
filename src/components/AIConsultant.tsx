import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, User, ArrowRight, CornerDownLeft, Loader2, Bot, ArrowLeft, Bookmark, MessageSquare, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";

interface AIConsultantProps {
  onClose?: () => void;
  isPage?: boolean;
  onBackToHome?: () => void;
}

const QUICK_PROMPTS = [
  "Which gold coin is best for investment?",
  "What is the difference between GIA and IGI diamonds?",
  "Show me diamond necklaces under 5 Lakhs",
  "Show me daily wear gold rings"
];

const EXPERT_ADVISORS = [
  { name: "Siddharth Sen", role: "Diamond & Gem Expert", status: "Active in Shop", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" },
  { name: "Priya Malhotra", role: "Bridal Design Expert", status: "Active in Shop", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" }
];

export default function AIConsultant({ onClose, isPage = false, onBackToHome }: AIConsultantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Namaste! Welcome to Atulya Gold. 🌟 I am your AI assistant here to help you. \n\nI can help you check gold rates, understand diamond quality (like carat or cut), choose the best wedding jewelry, or answer any other questions. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact advisor");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.text || "I apologize, I experienced a minor connectivity issue. How may I assist you further?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: "I apologize, my communication system is busy at this moment. Please feel free to ask again or browse our collections.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Render full-page mode
  if (isPage) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto w-full px-1 py-2">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold-dark font-black text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Atulya AI Help Desk</span>
            </div>
            <h1 className="font-serif font-black text-2xl md:text-3xl text-neutral-900 tracking-tight">
              Atulya AI Assistant
            </h1>
            <p className="text-xs text-neutral-500 max-w-2xl">
              Chat with our friendly AI jewelry assistant. Ask any questions about gold rates, diamonds, custom designs, or care tips!
            </p>
          </div>
          {onBackToHome && (
            <button
              id="consultant-back-to-home"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs self-start md:self-center"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>Back to Jewelry Catalog</span>
            </button>
          )}
        </div>

        {/* Core Dual Column Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Interactive Guides & Advisors Profiles */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            {/* Advisors Card */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-4">
              <div>
                <span className="text-[9px] font-black text-gold-dark uppercase tracking-widest block">Support Team</span>
                <h3 className="font-serif font-black text-sm text-neutral-900 mt-0.5">Our Store Experts</h3>
              </div>
              <div className="space-y-4">
                {EXPERT_ADVISORS.map((adv, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100">
                    <div className="relative">
                      <img src={adv.avatar} alt={adv.name} className="w-10 h-10 rounded-full object-cover border border-neutral-200" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                        <span>{adv.name}</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/15" />
                      </h4>
                      <p className="text-[10px] text-neutral-400">{adv.role}</p>
                      <span className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-widest block mt-0.5">{adv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diamond Purity & Trust Card */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-4">
              <div>
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Diamond Purity Guide</span>
                <h3 className="font-serif font-black text-sm text-neutral-900 mt-0.5">Learn About Diamonds</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { title: "Carat", desc: "Weight Unit" },
                  { title: "Cut", desc: "Reflex Brilliance" },
                  { title: "Color", desc: "Chromat Grading" },
                  { title: "Clarity", desc: "Internal Purity" }
                ].map((item, index) => (
                  <div key={index} className="p-2 bg-neutral-50 rounded-xl border border-neutral-150/50 space-y-0.5">
                    <span className="block text-[11px] font-black text-gold-dark">{item.title}</span>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase">{item.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9.5px] text-neutral-500 leading-normal font-sans text-center">
                All our diamonds come with certified quality cards from trusted labs like IGI or GIA.
              </p>
            </div>

            {/* Quick Suggestions Cards */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-150/70 shadow-sm space-y-3.5 flex-1">
              <div>
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Quick Questions</span>
                <h3 className="font-serif font-black text-sm text-neutral-900 mt-0.5">Ask our AI</h3>
              </div>
              <div className="flex flex-col gap-2">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    className="text-left px-3 py-2.5 rounded-xl border border-neutral-150 bg-neutral-50 hover:bg-gold/5 hover:border-gold/30 hover:text-gold-dark transition-all duration-200 text-xs text-neutral-700 font-medium flex justify-between items-center group cursor-pointer"
                  >
                    <span className="leading-tight max-w-[90%]">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-gold-dark group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat Dialog Board */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-150/70 shadow-sm flex flex-col h-[600px] overflow-hidden">
            {/* Chat Lobby Header */}
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center border border-gold/40 text-gold relative animate-pulse">
                  <Bot className="w-5 h-5 text-gold" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">Chat with Atulya AI</h3>
                  <p className="text-[9px] text-neutral-400">Ready to help you find pure gold and certified diamonds</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Active Now</span>
              </div>
            </div>

            {/* Conversational Screen */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/50">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isModel = msg.role === "model";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3.5 ${isModel ? "justify-start" : "justify-end"}`}
                    >
                      {isModel && (
                        <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                          <Bot className="w-4.5 h-4.5 text-gold" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs shadow-xs leading-relaxed ${
                          isModel
                            ? "bg-white text-neutral-800 border border-neutral-150/70 rounded-tl-none font-sans"
                            : "bg-gold text-neutral-950 rounded-tr-none font-bold shadow-md shadow-gold/10"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span
                          className={`block text-[8px] mt-2 text-right ${
                            isModel ? "text-neutral-400 font-mono" : "text-neutral-950/70 font-mono"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {!isModel && (
                        <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                          <User className="w-4.5 h-4.5" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3.5 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs mt-0.5 animate-spin">
                      <Loader2 className="w-4.5 h-4.5 text-gold" />
                    </div>
                    <div className="bg-white text-neutral-500 border border-neutral-150/70 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 shadow-xs">
                      <span>Adviser is composing answer</span>
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-neutral-150/70 flex gap-3 items-center">
              <input
                type="text"
                placeholder="Ask about certified diamond ranges, investment coins, or bridal neckpieces..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(input);
                }}
                className="flex-1 px-4 py-3 text-xs rounded-xl border border-neutral-200 focus:border-gold focus:outline-none placeholder-neutral-400 transition-all font-bold text-neutral-800"
              />
              <button
                id="send-consultant-msg-page"
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-gold hover:bg-gold-dark disabled:bg-neutral-100 text-neutral-950 disabled:text-neutral-300 flex items-center justify-center transition-all shadow-md shadow-gold/20 cursor-pointer flex-shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original small floating window remains fully compliant
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
      className="bg-white rounded-t-2xl shadow-2xl border-x border-t border-neutral-100 flex flex-col h-[520px] max-h-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 text-white p-4 rounded-t-2xl flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center border border-gold/45 text-gold relative animate-pulse">
            <Bot className="w-5 h-5 text-gold" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-900" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm tracking-wide text-white">Atulya AI Consultant</h3>
            <p className="text-[10px] text-neutral-400">Luxury Concierge & Gemologist</p>
          </div>
        </div>

        {onClose && (
          <button
            id="close-consultant"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isModel = msg.role === "model";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}
              >
                {isModel && (
                  <div className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                    isModel
                      ? "bg-white text-neutral-800 border border-neutral-100 rounded-tl-none"
                      : "bg-gold text-neutral-950 rounded-tr-none font-bold"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[8px] mt-1.5 text-right ${
                      isModel ? "text-neutral-400" : "text-neutral-950/70"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!isModel && (
                  <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 justify-start"
            >
              <div className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs mt-0.5 animate-spin">
                <Loader2 className="w-4 h-4" />
              </div>
              <div className="bg-white text-neutral-500 border border-neutral-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5 shadow-xs">
                <span>Atulya Advisor is thinking</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              id={`quick-prompt-${prompt.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => handleSend(prompt)}
              className="text-[10px] font-semibold text-neutral-600 bg-white hover:bg-gold/10 hover:text-gold-dark hover:border-gold/30 border border-neutral-200 rounded-lg px-2.5 py-1.5 transition-all text-left flex items-center gap-1 cursor-pointer animate-pulse"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-neutral-100 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Ask our consultant anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(input);
          }}
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 focus:border-gold focus:outline-none placeholder-neutral-400 transition-all font-bold text-neutral-800"
        />
        <button
          id="send-consultant-msg"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl bg-gold hover:bg-gold-dark disabled:bg-neutral-100 text-neutral-950 disabled:text-neutral-300 flex items-center justify-center transition-all shadow-md shadow-gold/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
