import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMINA COUTURE · 3D Generative AI Fashion Atelier & Wardrobe Intelligence",
  description: "Next-generation 3D generative fashion atelier, interactive silhouette styling, skin-tone harmony vectors, and real-time e-commerce discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090e] text-[#f1f3f7] antialiased selection:bg-[#d4af37]/30 selection:text-[#fcebc2]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
