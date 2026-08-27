"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const isLinkActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] via-[#f5d77f] to-[#b8860b] flex items-center justify-center text-black font-bold text-base shadow-lg shadow-[#d4af37]/25 group-hover:scale-105 transition-transform">
            <span>✦</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-black animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base sm:text-lg font-bold tracking-[0.2em] text-white group-hover:text-[#fcebc2] transition-colors">
                LUMINA COUTURE
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                AI ATELIER
              </span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider hidden md:block">
              Generative Haute-Couture AI
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isLinkActive("/") && pathname === "/"
                ? "bg-[#d4af37] text-black font-semibold shadow-md"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Showcase
          </Link>

          <Link
            href="/app"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              isLinkActive("/app")
                ? "bg-gradient-to-r from-[#d4af37] to-[#c5a059] text-black font-semibold shadow-md"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>✨</span>
            <span>AI Stylist</span>
          </Link>

          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              isLinkActive("/dashboard")
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-md"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🧥</span>
            <span>Smart Closet</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              isLinkActive("/admin")
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>⚡</span>
            <span>Admin Hub</span>
            {isAdmin && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </Link>
        </div>

        {/* Right Section: Auth User Badge or Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23d4af37'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23000' font-size='40'%3ELC%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#d4af37] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{user.tier}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="ml-1 text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#c5a059] text-black font-semibold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span>Sign In</span>
            </Link>
          )}

          {/* Quick CTA to 3D App */}
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 hover:border-white/20 transition-all"
          >
            <span>Launch Studio</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
