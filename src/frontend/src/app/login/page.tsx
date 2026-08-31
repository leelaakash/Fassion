"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_CREDENTIALS, UserRole } from "@/context/AuthContext";
import ThreeFashionScene from "@/components/ThreeFashionScene";
import Card3DTilt from "@/components/Card3DTilt";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<UserRole>("user");
  const [email, setEmail] = useState(DEMO_CREDENTIALS.user.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.user.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (res.success) {
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push("/app");
        }
      } else {
        setError(res.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
      }
    }, 450);
  };

  const handleQuickFill = (role: UserRole) => {
    setActiveTab(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#d4af37]/30 selection:text-[#fcebc2]">
      {/* Background 3D Orb & Ambient Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-[#d4af37]/20 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-tl from-cyan-500/20 to-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6 border-b border-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] via-[#f5d77f] to-[#b8860b] flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-[#d4af37]/25 group-hover:scale-105 transition-transform">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg tracking-[0.25em] font-bold text-white group-hover:text-[#fcebc2] transition-colors">
                LUMINA COUTURE
              </span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                3D ATELIER
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider">Generative Haute-Couture AI</p>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>←</span> Back to Showcase
        </Link>
      </header>

      {/* Main Login Workspace */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Interactive Visualizer Showcase */}
          <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md h-[400px] relative">
              <ThreeFashionScene className="w-full h-full" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] text-gray-300 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Interactive 3D Runway Gem · Drag to Rotate</span>
              </div>
            </div>

            <div className="mt-4 max-w-sm">
              <h3 className="font-serif text-2xl font-bold text-white">
                Next-Gen Generative Fashion
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Log in to experience bespoke wardrobe intelligence, realtime virtual try-on, skin-tone harmony vectors, and automated catalog discovery.
              </p>
            </div>
          </div>

          {/* Right Column: 3D Tilt Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <Card3DTilt maxTilt={8}>
              <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-b from-[#141824]/90 via-[#0e111a]/95 to-[#090b12]/95 border border-[#d4af37]/30 shadow-2xl backdrop-blur-2xl">
                {/* Header inside card */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                    Client & Executive Access
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-white mt-1">
                    Sign in to Lumina
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Select a pre-configured role or enter your credentials.
                  </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
                  <button
                    type="button"
                    onClick={() => handleTabChange("user")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === "user"
                        ? "bg-gradient-to-r from-[#d4af37] to-[#c5a059] text-black shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>✨</span>
                    <span>VIP Stylist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("admin")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                      activeTab === "admin"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>⚡</span>
                    <span>Admin Director</span>
                  </button>
                </div>

                {/* Demo Credentials Quick Fill Badges */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                      <span>🔑</span> Demo Credentials Available
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Ready to Use
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {/* VIP Client Pill */}
                    <div
                      onClick={() => handleQuickFill("user")}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        activeTab === "user"
                          ? "bg-[#d4af37]/15 border-[#d4af37]/60 shadow-sm"
                          : "bg-black/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-white mb-0.5">
                        <span>VIP Client</span>
                        <span className="text-[9px] text-[#d4af37]">1-Click Fill</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">vip@luminacouture.ai</div>
                      <div className="text-[10px] text-gray-500 font-mono">pass: user123</div>
                    </div>

                    {/* Admin Pill */}
                    <div
                      onClick={() => handleQuickFill("admin")}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        activeTab === "admin"
                          ? "bg-purple-600/20 border-purple-500/60 shadow-sm"
                          : "bg-black/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-white mb-0.5">
                        <span>Admin Director</span>
                        <span className="text-[9px] text-purple-300">1-Click Fill</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">admin@luminacouture.ai</div>
                      <div className="text-[10px] text-gray-500 font-mono">pass: admin123</div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2 animate-shake">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-300 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-300 block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-[11px] text-[#d4af37] hover:underline"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-black/40 border-white/20 text-[#d4af37] focus:ring-0 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <span className="text-gray-500 text-[11px]">256-bit AES Vault</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-bold text-sm shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Atelier Access...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Lumina Couture</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer links */}
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>Guest Preview Available</span>
                  <Link
                    href="/app"
                    className="text-[#d4af37] hover:underline font-medium"
                  >
                    Explore as Guest →
                  </Link>
                </div>
              </div>
            </Card3DTilt>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-gray-500 border-t border-white/5">
        Lumina Couture © 2026 · Autonomous Multi-Agent Fashion Engine & Virtual Atelier
      </footer>
    </div>
  );
}
