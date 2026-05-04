import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google"; // Import serif font
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Providers } from "@/components/Providers";

import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import SalesChatWidget from "@/components/chatbot/SalesChatWidget";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: "Studigo | Online Marketplace",
  description: "Learn anything, on your schedule.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="pt-20 min-h-screen bg-white">
                {children}
            </main>
            <Footer />
            <SalesChatWidget />
            <Toaster />
            <SonnerToaster />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
