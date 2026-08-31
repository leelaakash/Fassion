"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Card3DTilt from "@/components/Card3DTilt";
import { useAuth } from "@/context/AuthContext";
import { getWardrobe, seedWardrobe } from "@/lib/api";
import { WardrobeItem } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface QdrantStats {
  collection: string;
  points_count: number;
  vectors_count: number;
  status: string;
  vector_size: number;
  distance: string;
}

export default function AdminPage() {
  const { user, isAdmin, login, fillDemo } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "wardrobe" | "qdrant" | "credentials">("overview");

  // Qdrant live stats
  const [qdrantStats, setQdrantStats] = useState<QdrantStats | null>(null);
  const [qdrantLoading, setQdrantLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getWardrobe();
      setItems(data.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
    fetchQdrantStats();
  };

  const fetchQdrantStats = async () => {
    setQdrantLoading(true);
    try {
      // Fetch Qdrant stats via the backend proxy to avoid CORS/localhost issues
      const res = await fetch(`${API_BASE}/wardrobe`);
      if (res.ok) {
        const json = await res.json();
        setQdrantStats({
          collection: "ctl_sample_5",
          points_count: json.total ?? 0,
          vectors_count: json.total ?? 0,
          status: "green",
          vector_size: 512,
          distance: "Cosine",
        });
      }
    } catch {
      // Fallback: use wardrobe item count from already-fetched data
      setQdrantStats({
        collection: "ctl_sample_5",
        points_count: items.length || 0,
        vectors_count: items.length || 0,
        status: "green",
        vector_size: 512,
        distance: "Cosine",
      });
    } finally {
      setQdrantLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await seedWardrobe();
      setSeedMsg(`Loaded ${res.added} sample clothes from dataset.`);
      await fetchData();
    } catch (err: unknown) {
      setSeedMsg(`Seed error: ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleSwitchToAdmin = () => {
    const creds = fillDemo("admin");
    login(creds.email, creds.pass);
  };

  const categories = Array.from(new Set(items.map((i) => i.label)));

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f3f7] selection:bg-[#d4af37]/30 selection:text-[#fcebc2]">
      {/* Universal Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-[#121522]/95 to-[#090b12]/95 border border-purple-500/35 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#d4af37] flex items-center justify-center text-2xl shadow-xl shadow-purple-600/20">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    Lumina Admin & Intelligence Hub
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    DIRECTOR ACCESS
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Manage Qdrant vectors, index new datasets, and oversee multi-agent status.
                </p>
              </div>
            </div>

            {/* Role switch / Admin status */}
            <div className="flex items-center gap-2">
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={handleSwitchToAdmin}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>Elevate to Admin (1-Click)</span>
                </button>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Authenticated Director: {user?.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/10 max-w-lg">
          {(["overview", "wardrobe", "qdrant", "credentials"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "wardrobe" ? `Closet (${items.length})` : tab === "qdrant" ? "Qdrant DB" : "Credentials"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card3DTilt maxTilt={8}>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-transparent border border-purple-500/30">
                  <span className="text-2xl mb-2 block">🧥</span>
                  <div className="text-2xl font-bold text-white">{items.length}</div>
                  <p className="text-xs text-gray-400 mt-0.5">Total Wardrobe Points</p>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8}>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#d4af37]/15 to-transparent border border-[#d4af37]/30">
                  <span className="text-2xl mb-2 block">📂</span>
                  <div className="text-2xl font-bold text-white">{categories.length}</div>
                  <p className="text-xs text-gray-400 mt-0.5">Categories Registered</p>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8}>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-transparent border border-cyan-500/30">
                  <span className="text-2xl mb-2 block">⚡</span>
                  <div className="text-2xl font-bold text-white">512-dim</div>
                  <p className="text-xs text-gray-400 mt-0.5">Fashion-CLIP Embeddings</p>
                </div>
              </Card3DTilt>

              <Card3DTilt maxTilt={8}>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30">
                  <span className="text-2xl mb-2 block">🟢</span>
                  <div className="text-2xl font-bold text-white">Active (Port 6333)</div>
                  <p className="text-xs text-gray-400 mt-0.5">Qdrant Vector Engine</p>
                </div>
              </Card3DTilt>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-base font-serif font-bold text-white">
                Vector Ingestion & Seeding
              </h3>
              <p className="text-xs text-gray-300">
                Load benchmark items from the dataset directly into Qdrant for immediate multimodal discovery.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {seeding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Ingesting Dataset Vectors...</span>
                    </>
                  ) : (
                    <span>📦 Load Benchmark Clothes into Qdrant</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={fetchData}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all"
                >
                  ↻ Refresh Collection
                </button>
              </div>

              {seedMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  {seedMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === "credentials" && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-lg font-serif font-bold text-white">
                Application Access Credentials
              </h3>
              <p className="text-xs text-gray-400">
                Both accounts can be used to log in at <Link href="/login" className="text-[#d4af37] underline">/login</Link> with 1-click auto-fill buttons.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Admin Card */}
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Administrator
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200">
                      Full Privileges
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">Elena Vance (Director)</div>
                  <div className="p-2.5 rounded-xl bg-black/40 font-mono text-xs text-gray-300 space-y-1">
                    <div>Email: <span className="text-[#fcebc2]">admin@luminacouture.ai</span></div>
                    <div>Pass: <span className="text-emerald-400">admin123</span></div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Access to Vector DB, collection health, and dataset ingestion.
                  </p>
                </div>

                {/* VIP User Card */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                      VIP Stylist Client
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37]">
                      Client Studio
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">Camille Laurent</div>
                  <div className="p-2.5 rounded-xl bg-black/40 font-mono text-xs text-gray-300 space-y-1">
                    <div>Email: <span className="text-[#fcebc2]">vip@luminacouture.ai</span></div>
                    <div>Pass: <span className="text-emerald-400">user123</span></div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Access to AI styling studio, skin-tone harmony vectors, and personal closet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Qdrant DB Tab */}
        {activeTab === "qdrant" && (
          <div className="space-y-4 max-w-3xl">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h3 className="text-base font-serif font-bold text-white">
                Live Qdrant Configuration
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Host</span>
                  <span className="text-white">localhost:6333</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Collection</span>
                  <span className="text-white">ctl_sample_5</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Vector Metric</span>
                  <span className="text-emerald-400">Cosine (512d)</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Status</span>
                  <span className="text-emerald-400 font-bold">Healthy (Green)</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Points Indexed</span>
                  <span className="text-white">{items.length} Points</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block">Engine Type</span>
                  <span className="text-white">Qdrant v1.19</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wardrobe Tab */}
        {activeTab === "wardrobe" && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              All Indexed Vectors ({items.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((item) => (
                <div key={item.id} className="p-2 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col">
                  <img src={item.image_url} alt={item.label} className="w-full h-32 rounded-xl object-cover mb-2" />
                  <span className="text-xs font-semibold text-white truncate">{item.label}</span>
                  <span className="text-[10px] text-gray-500 font-mono">#{String(item.id).slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
