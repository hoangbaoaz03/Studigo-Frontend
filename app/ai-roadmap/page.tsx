'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown, ChevronUp, BookOpen, Code, Lightbulb, CheckCircle2 } from 'lucide-react';
import { AI_ROADMAP_DATA, RoadmapTier } from '@/data/ai-roadmap';

export default function AIRoadmapPage() {
  const [openTier, setOpenTier] = useState<number | null>(1);

  const toggleTier = (id: number) => {
    setOpenTier(openTier === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <Badge className="mb-6 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 text-sm uppercase tracking-wider backdrop-blur-md">
                Official Learning Path
             </Badge>
             <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                AI Career Roadmap <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">2026</span>
             </h1>
             <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                A structured, tier-based approach to mastering Artificial Intelligence. From foundational literacy to strategic leadership.
             </p>
             <Link href="/ai-roadmap/plan">
                <Button size="lg" className="h-14 px-10 rounded-full font-bold text-lg bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
                   Start Your Plan
                </Button>
             </Link>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="max-w-5xl mx-auto px-4 py-20">
         <div className="space-y-8 relative">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-8 bottom-8 w-1 bg-gray-100 hidden md:block z-0"></div>

            {AI_ROADMAP_DATA.map((tier) => (
               <div key={tier.id} className="relative z-10">
                  {/* Card Header (Clickable) */}
                  <div 
                    onClick={() => toggleTier(tier.id)}
                    className={`
                       group cursor-pointer bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                       ${openTier === tier.id ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/5' : 'border-gray-200 hover:border-blue-300 shadow-sm'}
                    `}
                  >
                     <div className="p-6 md:p-8 flex gap-6 items-start">
                        {/* Number Indicator */}
                        <div className={`
                           hidden md:flex flex-shrink-0 w-14 h-14 rounded-full items-center justify-center font-bold text-xl border-4 transition-colors
                           ${openTier === tier.id ? `bg-${tier.color}-500 text-white border-white shadow-lg` : `bg-white text-gray-400 border-gray-100 group-hover:border-${tier.color}-200`}
                        `} style={{ backgroundColor: openTier === tier.id ? getTailwindColor(tier.color) : 'white' }}>
                           {tier.id}
                        </div>

                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-2">
                               <div>
                                   <div className={`text-sm font-bold uppercase tracking-wider mb-1 text-${tier.color}-600`}>
                                     Tier {tier.id}: {tier.subtitle}
                                   </div>
                                   <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {tier.title}
                                   </h2>
                               </div>
                               <div className={`transform transition-transform duration-300 ${openTier === tier.id ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="w-6 h-6 text-gray-400" />
                               </div>
                           </div>
                           
                           {/* Short Description (Always visible) */}
                           <p className="text-gray-600 pr-8">{tier.description}</p>

                           {/* Expanded Content */}
                           <div className={`grid content-transition ${openTier === tier.id ? 'grid-rows-[1fr] opacity-100 pt-8 mt-8 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0 h-0 hidden'}`}>
                               <div className="overflow-hidden space-y-8">
                                   
                                   {/* Skills Grid */}
                                   <div>
                                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                          <BookOpen className="w-5 h-5 text-blue-500" />
                                          Core Skills
                                       </h3>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {tier.skills.map((skill, idx) => (
                                              <div key={idx} className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                                                 <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                                 <div>
                                                    <div className="font-bold text-gray-900">{skill.name}</div>
                                                    <div className="text-sm text-gray-500">{skill.description}</div>
                                                 </div>
                                              </div>
                                          ))}
                                       </div>
                                   </div>

                                   {/* Courses Grid */}
                                   <div>
                                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                                          Recommended Courses
                                       </h3>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {tier.courses?.map((course) => (
                                              <Link key={course.id} href={`/course/${course.slug}`} className="group block">
                                                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex h-full">
                                                     <div className="w-1/3 relative bg-gray-100">
                                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                                     </div>
                                                     <div className="w-2/3 p-4 flex flex-col justify-between">
                                                        <div>
                                                            <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{course.level}</div>
                                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-700 leading-tight mb-2 line-clamp-2">{course.title}</h4>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500 gap-2">
                                                            <span>⏱ {course.duration}</span>
                                                        </div>
                                                     </div>
                                                  </div>
                                              </Link>
                                          ))}
                                       </div>
                                   </div>

                                   {/* Projects Grid */}
                                   <div>
                                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                          <Code className="w-5 h-5 text-purple-500" />
                                          Hands-on Projects
                                       </h3>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {tier.projects.map((proj, idx) => (
                                              <div key={idx} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                                 <div className="font-bold text-gray-900 mb-1">{proj.title}</div>
                                                 <div className="text-sm text-gray-600">{proj.description}</div>
                                              </div>
                                          ))}
                                       </div>
                                   </div>

                                   {/* Outcome */}
                                   <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                      <div>
                                         <div className="text-xs font-bold uppercase text-blue-500 tracking-wider mb-1">Milestone Outcome</div>
                                         <div className="text-xl font-bold text-gray-900">{tier.outcome}</div>
                                      </div>
                                      <Button className="bg-blue-600 font-bold hover:bg-blue-700">
                                         Start Tier {tier.id}
                                      </Button>
                                   </div>

                               </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

// Helper to map string color names to hex for inline styles where tailwind arbitrary values might be tricky based on safelist
function getTailwindColor(color: string) {
    const map: Record<string, string> = {
        'blue': '#3b82f6',
        'purple': '#a855f7',
        'pink': '#ec4899',
    };
    return map[color] || '#3b82f6';
}
