"use client";

import { useState, useEffect, useRef } from "react";
import { WardrobeItem } from "@/types";
import { getWardrobe, addToWardrobe, seedWardrobe, fileToBase64 } from "@/lib/api";

interface WardrobeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: WardrobeItem) => void;
}

const CLOTHING_LABELS = [
  "Shirts & Tops",
  "Pants",
  "Dresses",
  "Coats & Jackets",
  "Shoes",
  "Handbags",
  "Jewelry",
  "Scarves & Shawls",
  "Sunglasses",
  "Skirts",
  "Shorts",
  "Sweaters",
  "Accessories",
  "Other",
];

export default function WardrobeDrawer({
  isOpen,
  onClose,
  onSelectItem,
}: WardrobeDrawerProps) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // Add-item panel state
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addLabel, setAddLabel] = useState(CLOTHING_LABELS[0]);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [addFile, setAddFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && items.length === 0) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchItems = async () => {
    setLoading(true);
    const data = await getWardrobe();
    setItems(data.items);
    setLoading(false);
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAddError("Please select an image file.");
      return;
    }
    setAddFile(file);
    setAddError(null);
    const reader = new FileReader();
    reader.onload = () => setAddPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Add item ───────────────────────────────────────────────────────────────
  const handleAddItem = async () => {
    if (!addFile) { setAddError("Please choose an image first."); return; }
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const base64 = await fileToBase64(addFile);
      await addToWardrobe(base64, addLabel);
      setAddSuccess(`✓ "${addLabel}" added to your wardrobe!`);
      // Reset form
      setAddFile(null);
      setAddPreview(null);
      setAddLabel(CLOTHING_LABELS[0]);
      // Refresh list
      const data = await getWardrobe();
      setItems(data.items);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setAdding(false);
    }
  };

  // ── Seed sample data ───────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await seedWardrobe();
      setSeedMsg(`✓ Loaded ${res.added} sample items from dataset.`);
      const data = await getWardrobe();
      setItems(data.items);
    } catch (err: unknown) {
      setSeedMsg(`✗ ${err instanceof Error ? err.message : "Seed failed"}`);
    } finally {
      setSeeding(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.label)))];
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((i) => i.label === selectedCategory);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#0a0d14] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧥</span>
              <h2 className="text-lg font-semibold text-white">My Smart Closet</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} indexed items in Qdrant Vector Engine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAddPanel((v) => !v); setAddSuccess(null); setAddError(null); }}
              title="Add new clothing"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showAddPanel
                  ? "bg-[#d4af37] text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="text-base leading-none">{showAddPanel ? "✕" : "+"}</span>
              {showAddPanel ? "Close" : "Add Item"}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Add Item Panel ── */}
        {showAddPanel && (
          <div className="flex-shrink-0 border-b border-white/10 bg-white/3 px-6 py-5 space-y-4">
            <p className="text-sm font-semibold text-[#d4af37]">Add a Clothing Item</p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
                dragOver
                  ? "border-[#d4af37] bg-[#d4af37]/10"
                  : "border-white/20 hover:border-white/40 bg-white/5"
              }`}
            >
              {addPreview ? (
                <img
                  src={addPreview}
                  alt="preview"
                  className="w-full h-full object-contain rounded-xl p-1"
                />
              ) : (
                <>
                  <span className="text-3xl mb-2">👗</span>
                  <p className="text-xs text-gray-400">
                    Drag & drop or <span className="text-[#d4af37] underline">browse</span>
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">JPG, PNG, WEBP</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Label selector */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Category / Label</label>
              <select
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                {CLOTHING_LABELS.map((l) => (
                  <option key={l} value={l} className="bg-[#0a0d14]">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback */}
            {addError && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{addError}</p>
            )}
            {addSuccess && (
              <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{addSuccess}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleAddItem}
              disabled={adding || !addFile}
              className="w-full py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#c9a227] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {adding ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Embedding & Saving...
                </>
              ) : (
                "✨ Add to Wardrobe"
              )}
            </button>

            {/* Seed divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleSeed}
              disabled={seeding}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading sample clothes...
                </>
              ) : (
                "📦 Load Sample Clothes from Dataset"
              )}
            </button>
            {seedMsg && (
              <p className={`text-xs rounded-lg px-3 py-2 ${
                seedMsg.startsWith("✓") ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
              }`}>
                {seedMsg}
              </p>
            )}
          </div>
        )}

        {/* ── Category Filter ── */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto no-scrollbar border-b border-white/5 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#d4af37] text-black font-semibold shadow-sm"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Items Grid ── */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
              <p className="text-sm">Accessing wardrobe embeddings...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-4">
              <span className="text-4xl">👔</span>
              <p className="text-gray-400 text-sm font-medium">Your wardrobe is empty</p>
              <p className="text-gray-600 text-xs max-w-[220px]">
                Click <span className="text-[#d4af37]">+ Add Item</span> to upload clothes,
                or load sample data from the dataset.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-2.5 flex flex-col group relative overflow-hidden"
                >
                  <div className="w-full h-32 rounded-lg bg-black/40 overflow-hidden mb-2">
                    <img
                      src={item.image_url}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-size='30'%3E👗%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white truncate">{item.label}</span>
                  <span className="text-[10px] text-gray-500 truncate">#{String(item.id).slice(0, 8)}</span>
                  <button
                    type="button"
                    onClick={() => { onSelectItem(item); onClose(); }}
                    className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37]/20 to-[#c5a059]/10 hover:from-[#d4af37] hover:to-[#c5a059] text-[11px] font-semibold text-[#d4af37] hover:text-black border border-[#d4af37]/30 hover:border-transparent transition-all duration-200"
                  >
                    ✨ Style This Piece
                  </button>
                </div>

              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-white/10 flex-shrink-0 text-center">
          <button
            onClick={fetchItems}
            className="text-xs text-[#d4af37] hover:underline"
          >
            ↻ Sync Closet from Qdrant
          </button>
        </div>
      </div>
    </div>
  );
}
