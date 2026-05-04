"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Hide footer on learning pages - Reverted based on user feedback
  // if (pathname?.endsWith('/learn')) {
  //   return null;
  // }
  
  return (
    <footer className="bg-[#1c1d1f] text-white pt-12 pb-8 border-t border-gray-700 mt-0">
        <div className="container mx-auto px-6 max-w-[1340px]">
            {/* Top Section: Links & Language */}
            <div className="flex flex-col md:flex-row justify-between mb-16 gap-8">
                
                {/* Link Columns */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-24 w-full md:w-3/4">
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="hover:underline text-sm font-normal text-white">Studigo Business</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.navbar.teachOn}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">Get the app</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.about}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.help}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.careers}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.blog}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.help}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.investors}</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.terms}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.privacy}</Link>
                        <Link href="#" className="hover:underline text-sm font-normal text-white">{t.footer.settings}</Link>
                    </div>
                </div>

                {/* Language Selector */}
                <div className="w-full md:w-1/4 flex md:justify-end items-start">
                     <div className="dark">
                        {/* Force dark mode styles for dropdown if needed, or just standard */}
                        <LanguageSwitcher />
                     </div>
                </div>
            </div>

            {/* Bottom Section: Logo & Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
                <div className="mb-4 md:mb-0">
                     <Link href="/" className="text-2xl font-bold italic font-serif">
                        <span className="text-white">Studigo</span>
                     </Link>
                </div>
                <div className="text-xs text-gray-400">
                    {t.footer.copyright}
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
