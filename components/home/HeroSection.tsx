"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  ctaText?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subheadline,
  imageUrl,
  ctaText
}) => {
  const { user } = useAuth();
  const { locale } = useLanguage();

  return (
    <section className="relative w-full h-[450px] md:h-[550px] overflow-hidden group">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
            <img 
              src={imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop"}
              alt="Hero Background" 
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative container mx-auto h-full px-6 flex items-center">
            
            {/* Modern Glass Card */}
            <div className="w-full md:max-w-xl p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-fade-in mt-8 md:mt-0">
                
                {/* AI Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    AI-Powered Learning
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight tracking-tight">
                    {headline || "Thúc đẩy sự nghiệp trong kỷ nguyên AI."}
                </h1>
                
                <p className="text-lg text-gray-200 mb-8 leading-relaxed font-light">
                    {subheadline || "Kỹ năng cho hiện tại (và tương lai). Bắt đầu hành trình học tập với lộ trình được cá nhân hóa ngay hôm nay."}
                </p>
                
                 {/* Offer / CTA */}
                 <div className="flex flex-col sm:flex-row gap-4">
                    {!user && (
                        <Link href="/register" className="flex-1">
                            <Button size="lg" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white h-12 text-base shadow-lg shadow-blue-900/20 border-none transition-all hover:scale-105">
                                {ctaText || (locale === 'vi' ? "Bắt đầu ngay" : "Start Now")}
                            </Button>
                        </Link>
                    )}
                    {user && (
                        <Link href="/my-courses" className="flex-1">
                            <Button size="lg" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white h-12 text-base shadow-lg shadow-blue-900/20 border-none transition-all hover:scale-105">
                                {locale === 'vi' ? "Vào học ngay" : "Start Learning"}
                            </Button>
                        </Link>
                    )}
                    <Link href="/business" className="flex-1">
                        <Button size="lg" className="w-full font-bold bg-white text-gray-900 hover:bg-gray-100 border border-transparent h-12 text-base shadow-lg transition-all hover:scale-105">
                            For Business
                        </Button>
                    </Link>
                 </div>
            </div>
        </div>
    </section>
  );
};

export default HeroSection;
