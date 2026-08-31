"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card3DTilt from "@/components/Card3DTilt";
import { useAuth } from "@/context/AuthContext";
import { getWardrobe } from "@/lib/api";
import { WardrobeItem } from "@/types";

const QUICK_PROMPTS = [
  { icon: "👗", label: "Style today's look", prompt: "Recommend an outfit for today from my wardrobe pieces", color: "from-amber-500/20 to-yellow-500/5 border-amber-500/30" },
  { icon: "🍸", label: "Evening Gala", prompt: "Create a formal evening outfit using my closet and flattering accessories", color: "from-purple-500/20 to-indigo-500/5 border-purple-500/30" },
  { icon: "💼", label: "Boardroom Chic", prompt: "Design a professional corporate outfit with my tops and blazers", color: "from-cyan-500/20 to-blue-500/5 border-cyan-500/30" },
  { icon: "✨", label: "Complexion Match", prompt: "Analyze what items in my closet best flatter my skin tone and undertone", color: "from-emerald-500/20 to-teal-500/5 border-emerald-500/30" },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "wardrobe" | "tips">("overview");

  useEffect(() => {
    setSessionId(localStorage.getItem("fashion_session_id"));
    getWardrobe().then((data) => {
      setWardrobeItems(data.items);
      setLoading(false);
    });
  }, []);

  const byLabel: Record<string, WardrobeItem[]> = {};
  wardrobeItems.forEach((item) => {
    if (!byLabel[item.label]) byLabel[item.label] = [];
    byLabel[item.label].push(item);
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f3f7] selection:bg-[#d4af37]/30 selection:text-[#fcebc2]">
      {/* Universal Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & User Profile Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#161a26]/90 via-[#10131d]/95 to-[#090b12]/95 border border-[#d4af37]/35 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/15"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {user?.name || "Camille Laurent"}
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 font-semibold">
                    {user?.tier || "VIP Stylist Client"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Client ID: <code className="text-gray-300 font-mono">{user?.id || "usr_vip_001"}</code> · Email: {user?.email || "vip@luminacouture.ai"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨</span>
                <span>Open 3D Stylist</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md">
          {(["overview", "wardrobe", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeSection === tab
                  ? "bg-[#d4af37] text-black shadow-md font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "overview" ? "Closet Overview" : tab === "wardrobe" ? `Pieces (${wardrobeItems.length})` : "Styling Intelligence"}
            </button>
          ))}
        </div>

        {/* 3D Tilt Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card3DTilt maxTilt={8}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30">
              <span className="text-2xl mb-2 block">🧥</span>
              <div className="text-2xl font-bold text-white">{wardrobeItems.length}</div>
              <p className="text-xs text-gray-400 mt-0.5">Indexed Wardrobe Items</p>
            </div>
          </Card3DTilt>

          <Card3DTilt maxTilt={8}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30">
              <span className="text-2xl mb-2 block">📂</span>
              <div className="text-2xl font-bold text-white">{Object.keys(byLabel).length}</div>
              <p className="text-xs text-gray-400 mt-0.5">Fashion Categories</p>
            </div>
          </Card3DTilt>

          <Card3DTilt maxTilt={8}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30">
              <span className="text-2xl mb-2 block">⚡</span>
              <div className="text-2xl font-bold text-white">512-dim</div>
              <p className="text-xs text-gray-400 mt-0.5">CLIP Vector Embeddings</p>
            </div>
          </Card3DTilt>

          <Card3DTilt maxTilt={8}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30">
              <span className="text-2xl mb-2 block">🟢</span>
              <div className="text-2xl font-bold text-white">Online</div>
              <p className="text-xs text-gray-400 mt-0.5">Qdrant Vector Engine</p>
            </div>
          </Card3DTilt>
        </div>

        {/* Overview Tab Content */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-white mb-3">
                Quick Consult Prompts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {QUICK_PROMPTS.map((p, idx) => (
                  <Card3DTilt key={idx} maxTilt={10}>
                    <Link
                      href="/app"
                      className={`block p-4 rounded-2xl border bg-gradient-to-br ${p.color} transition-all hover:scale-[1.01]`}
                    >
                      <span className="text-2xl mb-1.5 block">{p.icon}</span>
                      <h4 className="text-sm font-bold text-white">{p.label}</h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {p.prompt}
                      </p>
                    </Link>
                  </Card3DTilt>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
              <h3 className="text-base font-serif font-bold text-white mb-4">
                Wardrobe Categories Distribution
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(byLabel).map(([category, items]) => (
                  <div
                    key={category}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{category}</div>
                      <div className="text-[10px] text-gray-400">Indexed for Cosine Search</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#d4af37]">
                      {items.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wardrobe Grid Tab */}
        {activeSection === "wardrobe" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-white">
                Indexed Closet Pieces
              </h3>
              <Link
                href="/app"
                className="text-xs text-[#d4af37] hover:underline"
              >
                + Style a piece in Studio →
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {wardrobeItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#d4af37]/50 transition-all flex flex-col group"
                  >
                    <div className="w-full h-32 rounded-xl bg-black/50 overflow-hidden mb-2">
                      <img
                        src={item.image_url}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-semibold text-white truncate">{item.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">#{String(item.id).slice(0, 8)}</span>
                    <Link
                      href="/app"
                      className="mt-2 py-1 rounded-lg bg-white/10 hover:bg-[#d4af37] hover:text-black text-[10px] font-semibold text-center text-gray-200 transition-colors"
                    >
                      Style with AI
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Styling Tips Tab */}
        {activeSection === "tips" && (
          <div className="space-y-4 max-w-3xl">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h4 className="text-sm font-bold text-[#d4af37] mb-1">Skin Tone & Silhouette Correlation</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Warm undertones glow in terracotta, olive, and champagnes. Cool undertones resonate with emerald, sapphire, and charcoal. Our multi-agent tool calculates your precise swatch spectrum upon portrait upload.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h4 className="text-sm font-bold text-cyan-400 mb-1">Vector Smart Search</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Your wardrobe is stored in Qdrant as 512-dimensional multimodal CLIP vectors. You can query with natural concepts like &ldquo;chic autumn brunch jacket&rdquo; and our agent finds visually compatible matches instantly.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
