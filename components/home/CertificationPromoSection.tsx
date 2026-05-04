'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CertificationPromoSection() {
    const { t } = useLanguage();

    // Mock logos/badges for the visual area
    const CERTIFICATES = [
        { name: 'AWS', color: 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20' },
        { name: 'Microsoft Azure', color: 'bg-[#0078D4]/10 text-[#0078D4] border-[#0078D4]/20' },
        { name: 'Cisco', color: 'bg-[#1BA0D7]/10 text-[#1BA0D7] border-[#1BA0D7]/20' },
        { name: 'PMP', color: 'bg-[#1B2F50]/10 text-[#1B2F50] border-[#1B2F50]/20' },
    ];

    return (
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    
                    {/* Left Column: Content */}
                    <div className="lg:w-1/2 space-y-8">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider">
                            <Award className="h-4 w-4" />
                            <span>Professional Certification</span>
                        </div>

                        <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                            {t.banners.certification.title || "Get certified, lead your career"}
                        </h2>
                        
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {t.banners.certification.description || "Prepare for top industry certifications like PMP, AWS, Cisco, and more with our curated exam prep courses."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                             <Link href="/exam-prep">
                                <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white font-bold h-12 px-8 text-base shadow-lg shadow-purple-900/10 active:scale-95 transition-all">
                                    {t.banners.certification.cta || "View exam prep"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                             </Link>
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="lg:w-1/2 w-full">
                        <div className="relative bg-gray-50/50 rounded-2xl p-8 border border-gray-200">
                            {/* Decorative decorative background */}
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 rounded-2xl"></div>
                            
                            <div className="relative grid grid-cols-2 gap-4">
                                {CERTIFICATES.map((cert) => (
                                    <div 
                                        key={cert.name} 
                                        className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 ${cert.color} bg-white shadow-sm hover:shadow-md transition-shadow cursor-default`}
                                    >
                                        <div className="font-bold text-xl">{cert.name}</div>
                                        <div className="text-xs opacity-70 mt-1 font-semibold uppercase tracking-wide">Certified</div>
                                    </div>
                                ))}
                                
                                {/* Center Badge Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-4 rounded-full shadow-xl border border-gray-100 flex items-center justify-center h-20 w-20 transform rotate-12">
                                        <ShieldCheck className="h-10 w-10 text-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
