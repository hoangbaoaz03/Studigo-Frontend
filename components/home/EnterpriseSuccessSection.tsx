'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Quote } from 'lucide-react';
import Image from 'next/image';

// Mock Data structure (could be moved to a separate data file later)
export const CASE_STUDIES = [
  {
    slug: 'fpt-corporation',
    company: 'FPT Corporation',
    logo: '/images/companies/fpt-logo.png', // Placeholder path
    logoText: 'FPT Corporation', // Fallback text
    headline: 'FPT Corporation builds a world-class tech team',
    quote: "Studigo Business is a strategic partner helping us train thousands of software engineers with the latest technologies. Thanks to it, we can meet global client needs quickly.",
    author: 'Chief Technology Officer',
    outcomes: [
      '3000+ Enrolled Engineers',
      '40% Faster Onboarding',
      '95% Certification Pass Rate'
    ]
  }
];

export default function EnterpriseSuccessSection() {
  const featuredStory = CASE_STUDIES[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Enterprises
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how organizations around the world use Studigo to transform their workforce.
          </p>
        </div>

        {/* Featured Story Card */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row">
            
            {/* Image / Visual Side */}
            <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full bg-gray-200">
               {/* Use a real image ideally, using a placeholder for now */}
               <img 
                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000&h=1200" 
                 alt="FPT Corporation Team" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                 <div className="text-white">
                    <p className="font-bold text-lg mb-1">{featuredStory.company}</p>
                    <p className="text-sm opacity-90">Vietnam's Leading Technology Corporation</p>
                 </div>
               </div>
            </div>

            {/* Content Side */}
            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-8">
                 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    "{featuredStory.headline}"
                 </h3>
                 <div className="relative pl-6 border-l-4 border-orange-500 italic text-gray-600 text-lg mb-6">
                    "{featuredStory.quote}"
                 </div>
                 <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-8">
                    <span>— {featuredStory.author}</span>
                 </div>
              </div>

               {/* Key Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8 border-t border-b border-gray-200 py-6">
                {featuredStory.outcomes.map((outcome, idx) => {
                    const [val, ...rest] = outcome.split(' ');
                    return (
                        <div key={idx} className="text-center md:text-left">
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{val}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">{rest.join(' ')}</div>
                        </div>
                    );
                })}
              </div>

              <div>
                <Link href={`/business/case-studies/${featuredStory.slug}`}>
                  <Button variant="outline" size="lg" className="font-bold text-base h-12 px-8 group border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                    Read full story
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Logo Strip (Optional addition for context) */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Simple Text Logos for demo */}
           <span className="text-xl font-bold text-gray-400">SAMSUNG</span>
           <span className="text-xl font-bold text-gray-400">VIETTEL</span>
           <span className="text-xl font-bold text-gray-400">VINFAST</span>
           <span className="text-xl font-bold text-gray-400">MOMO</span>
        </div>

      </div>
    </section>
  );
}
