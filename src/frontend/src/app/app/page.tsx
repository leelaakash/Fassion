"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ModelPhotoModal from "@/components/ModelPhotoModal";
import WardrobeDrawer from "@/components/WardrobeDrawer";
import AgentNetworkModal from "@/components/AgentNetworkModal";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Message, WardrobeItem } from "@/types";
import { sendChatMessage, getWardrobe, fileToBase64 } from "@/lib/api";

const WELCOME_MESSAGE: Message = {
  id: "welcome-1",
  role: "assistant",
  content: `### Welcome to Lumina Couture AI Atelier ✨

I am your **Haute-Couture AI Stylist & Silhouette Architect**, coordinating an autonomous multi-agent studio.

**What we can explore together:**
* **Complexion & Silhouette Analysis**: Upload your portrait to calculate your exact undertone, skin radiance, body silhouette, and tailored fit guidelines.
* **Smart Closet Curation**: Blend pieces from your indexed wardrobe with real-time vector search.
* **Live Marketplace Discovery**: Fetch matching designer apparel from **Amazon, Flipkart, and Meesho**.
* **Generative Virtual Try-On**: Visualize ensembles draping onto your uploaded model avatar.

*Upload your portrait below or pick one of the quick prompts to begin!*`,
  timestamp: "2026-10-18T18:00:00.000Z",
};

export default function AppPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Model photo states
  const [modelPhotoFile, setModelPhotoFile] = useState<File | null>(null);
  const [modelPhotoPreview, setModelPhotoPreview] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Wardrobe drawer state
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [wardrobeCount, setWardrobeCount] = useState<number>(0);

  // Agent network modal state
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem("fashion_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("fashion_session_id", sid);
    }
    setSessionId(sid);

    getWardrobe().then((data) => {
      setWardrobeCount(data.total);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSetModelPhoto = (file: File | null) => {
    setModelPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setModelPhotoPreview(url);
    } else {
      setModelPhotoPreview(null);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!modelPhotoFile) return;
    const prompt =
      "Analyze my skin tone and body type from my uploaded photo, and recommend flattering colors and tailoring guidelines.";
    await handleSendMessage(prompt, [modelPhotoFile]);
  };

  const handleSendMessage = async (text: string, images: File[] = []) => {
    if (!text.trim() && images.length === 0) return;

    let base64Images: string[] = [];
    try {
      base64Images = await Promise.all(images.map((f) => fileToBase64(f)));
    } catch {
      // Continue without base64 images if encoding fails
    }

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      images: images.map((f, i) => ({
        image_id: "upload-" + i,
        url: URL.createObjectURL(f),
        type: "inspiration_piece",
      })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let modelPhotoB64: string | undefined;
      if (modelPhotoFile) {
        try {
          modelPhotoB64 = await fileToBase64(modelPhotoFile);
        } catch {
          // ignore
        }
      }

      const response = await sendChatMessage(
        text,
        base64Images,
        sessionId || undefined,
        modelPhotoB64
      );

      const botMsg: Message = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
        images: response.retrieved_images,
        analysis: response.analysis,
        products: response.products,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        role: "assistant",
        content:
          "I encountered an issue processing your styling request. Please verify the backend service is running or try a different prompt.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWardrobeItem = (item: WardrobeItem) => {
    handleSendMessage(`Please create a complete haute-couture outfit built around this ${item.label}.`);
  };

  const handleClearHistory = () => {
    const newSid = "sess_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("fashion_session_id", newSid);
    setSessionId(newSid);
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090e] text-[#f1f3f7] overflow-hidden">
      {/* Universal Navbar */}
      <Navbar />

      {/* Sub-header / Studio Toolbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#090c13]/90 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#fcebc2]">Atelier Stylist Studio</span>
          <span className="text-[10px] text-gray-400 hidden sm:inline" suppressHydrationWarning>
            · Session: <code className="text-gray-300" suppressHydrationWarning>{sessionId?.slice(0, 10) || "Active"}</code>
          </span>
          {user && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30" suppressHydrationWarning>
              {user.tier}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Model Photo Button */}
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              modelPhotoPreview
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
            }`}
          >
            <span>✨</span>
            <span className="hidden sm:inline">My Portrait</span>
            {modelPhotoPreview && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          {/* Wardrobe Drawer Button */}
          <button
            onClick={() => setIsWardrobeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
          >
            <span>🧥</span>
            <span className="hidden sm:inline">Smart Closet</span>
            {wardrobeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#d4af37] text-black font-bold">
                {wardrobeCount}
              </span>
            )}
          </button>

          {/* Agent Architecture */}
          <button
            onClick={() => setIsNetworkModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
          >
            <span>🕸️</span>
            <span>Agent Spokes</span>
          </button>

          {/* Clear Session */}
          <button
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* Main Workspace Body with Focused Chat Stream */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl glass-panel max-w-sm animate-pulse border border-[#d4af37]/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#c5a059] flex items-center justify-center text-black font-bold text-xs">
                  ✦
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">Lumina Stylist Synthesizing...</p>
                  <p className="text-[10px] text-gray-400">
                    Consulting visual descriptor, vector closet & search spokes
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>

      {/* Input Bar */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* Modals & Drawers */}
      <ModelPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        previewUrl={modelPhotoPreview}
        onSetFile={handleSetModelPhoto}
        onAnalyze={handleAnalyzePhoto}
      />

      <WardrobeDrawer
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        onSelectItem={handleSelectWardrobeItem}
      />

      <AgentNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />
    </div>
  );
}
