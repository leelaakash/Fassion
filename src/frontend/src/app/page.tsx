"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ThreeFashionScene from "@/components/ThreeFashionScene";
import Card3DTilt from "@/components/Card3DTilt";

import { useAuth, DEMO_CREDENTIALS } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: "💎",
    title: "Haute Silhouette & Fit Tailoring",
    desc: "Personalized silhouette matching and custom tailoring recommendations based on body frame, posture, and proportion analysis.",
    accent: "from-amber-500/20 to-yellow-500/5 border-amber-500/40 text-amber-300",
    tag: "AI Tailoring",
  },

  {
    icon: "✨",
    title: "Personal Visage & Color Harmonies",
    desc: "Upload a portrait to compute your undertone, skin radiance, flattering color palettes, and custom styling advice.",
    accent: "from-purple-500/20 to-indigo-500/5 border-purple-500/40 text-purple-300",
    tag: "Gemini Vision",
  },
  {
    icon: "🧥",
    title: "Qdrant Vector Smart Closet",
    desc: "Sub-50ms cosine similarity search matching retrieved fashion pieces with 512-dimension multimodal CLIP embeddings.",
    accent: "from-cyan-500/20 to-blue-500/5 border-cyan-500/40 text-cyan-300",
    tag: "Vector DB",
  },
  {
    icon: "🛍️",
    title: "Live E-Commerce Finds",
    desc: "Real-time search scraping and recommending matching products from Amazon, Flipkart, and Meesho within your budget.",
    accent: "from-emerald-500/20 to-teal-500/5 border-emerald-500/40 text-emerald-300",
    tag: "Real-Time",
  },
  {
    icon: "📸",
    title: "Generative Virtual Try-On",
    desc: "Preview how complete ensembles drape onto your uploaded model photo using advanced multi-agent image synthesis.",
    accent: "from-rose-500/20 to-pink-500/5 border-rose-500/40 text-rose-300",
    tag: "VTON Tool",
  },
  {
    icon: "🕸️",
    title: "Autonomous Agent Orchestrator",
    desc: "LangGraph hub coordinating 5 specialist spokes: Descriptor, VTON, Recommender, Web Search, and Vector Retrieval.",
    accent: "from-orange-500/20 to-amber-500/5 border-orange-500/40 text-orange-300",
    tag: "LangGraph",
  },
];

const PROMPTS = [
  "✨ 'Analyze my skin tone & silhouette and recommend an emerald cocktail gown'",
  "🛍️ 'Find a velvet blazer under ₹2,999 on Amazon and Flipkart that matches my trousers'",
  "🍸 'Assemble a gala look combining my black stilettos and silk trench coat'",
  "💼 'Style a sharp executive boardroom outfit with tailored wide-leg trousers'",
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activePrompt, setActivePrompt] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePrompt((prev) => (prev + 1) % PROMPTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-[#d4af37]/30 selection:text-[#fcebc2] overflow-x-hidden">
      {/* Universal Navbar */}
      <Navbar />

      {/* Hero Section with Interactive 3D WebGL Canvas */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Gradient Flares */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#d4af37]/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[420px] h-[420px] bg-gradient-to-bl from-cyan-500/15 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37]/20 via-purple-500/15 to-cyan-500/20 border border-[#d4af37]/40 backdrop-blur-md shadow-lg shadow-[#d4af37]/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#fcebc2]">
                Lumina Couture Atelier 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-white leading-[1.12]">
              The Premier <span className="text-gold-gradient">Generative AI</span> Haute-Couture Platform
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-light leading-relaxed">
              Experience personalized styling with bespoke silhouette curation, multi-agent wardrobe retrieval, complexion harmony vectors, and real-time e-commerce intelligence.
            </p>

            {/* Interactive Rotating Prompt Preview */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md max-w-xl">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                Try asking Lumina:
              </span>
              <p className="text-sm font-medium text-[#fcebc2] transition-all duration-300 min-h-[44px] flex items-center">
                {PROMPTS[activePrompt]}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/app"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-bold text-sm shadow-xl shadow-[#d4af37]/25 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Launch Stylist Studio</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/login"
                className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm border border-white/10 hover:border-white/25 transition-all flex items-center gap-2"
              >
                <span>🔑</span>
                <span>Sign In / Demo Access</span>
              </Link>

              <Link
                href="/dashboard"
                className="px-5 py-3.5 rounded-2xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white text-sm font-medium transition-all"
              >
                Explore Smart Closet →
              </Link>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="flex items-center gap-4 pt-3 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Admin: <code className="text-[#fcebc2]">admin@luminacouture.ai</code></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>VIP: <code className="text-[#fcebc2]">vip@luminacouture.ai</code></span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Three.js Gem Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <Card3DTilt maxTilt={10} className="w-full">
              <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#141824]/90 to-[#0b0e16]/95 border border-[#d4af37]/35 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✦</span>
                    <span className="text-xs font-semibold text-white tracking-widest uppercase">
                      Interactive 3D Faceted Gem
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    WebGL 60FPS
                  </span>
                </div>

                <div className="w-full h-[320px] relative">
                  <ThreeFashionScene className="w-full h-full" />
                </div>

                <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Move mouse to tilt & rotate</span>
                  <Link
                    href="/app"
                    className="text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Open in Studio</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            </Card3DTilt>
          </div>
        </div>
      </section>

      {/* Silhouette & Tailoring Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
            Bespoke Styling Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2">
            Personal Visage & Silhouette Intelligence
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Our multi-agent vision framework analyzes body lines, posture harmony, and undertones to engineer custom styling guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#d4af37]/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-4">
              📐
            </div>
            <h4 className="text-base font-serif font-bold text-white mb-2">Precision Silhouette Analysis</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automatically determines body frame balance (Hourglass, Pear, Rectangle, Athletic, Inverted Triangle) and provides tailored necklines, hemlines, and waist-cinching advice.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-4">
              🎨
            </div>
            <h4 className="text-base font-serif font-bold text-white mb-2">Flattering Radiance Swatches</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Calculates seasonal color harmonies (Warm Autumn, Cool Winter, Soft Summer, Bright Spring) with interactive color swatches that enhance your natural complexion.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h4 className="text-base font-serif font-bold text-white mb-2">Direct Marketplace Discovery</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connects directly to live marketplaces (Amazon, Flipkart, Meesho) to discover matching luxury and everyday apparel that fits your generated silhouette recommendation.
            </p>
          </div>
        </div>
      </section>


      {/* Features Grid with 3D Card Tilt */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
            Atelier Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2">
            Six Autonomous AI Spokes Powered by LangGraph
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Hover over any card to experience responsive 3D perspective physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => (
            <Card3DTilt key={idx} maxTilt={12}>
              <div
                className={`h-full p-6 rounded-3xl border bg-gradient-to-br backdrop-blur-xl transition-all shadow-xl ${feat.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{feat.icon}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white font-semibold">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </Card3DTilt>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-[#d4af37]/20 via-[#1a1e2c] to-purple-900/30 border border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
              Ready for Real-World Haute Couture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Step Into the Lumina Couture Atelier Today
            </h2>
            <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Login as Admin or VIP Stylist with 1-click credentials to access your smart closet, personal silhouette styling studio, and multi-agent recommendations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/app"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-bold text-sm shadow-xl hover:brightness-110 transition-all cursor-pointer"
              >
                Launch Studio Now →
              </Link>
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all"
              >
                🔑 Sign In / Demo Credentials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37] font-serif font-bold">LUMINA COUTURE</span>
            <span>· Next-Gen Generative 3D Fashion</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/app" className="hover:text-white transition-colors">3D Stylist</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Smart Closet</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin Engine</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
