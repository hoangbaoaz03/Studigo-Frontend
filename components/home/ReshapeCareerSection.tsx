'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Brain, Cpu, Network } from 'lucide-react';

export default function ReshapeCareerSection() {
  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
      {/* Abstract Background Effects */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column: Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
               <Brain className="h-4 w-4" />
               <span>Future-Proof Your Skills</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Reshape your career in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI Era</span>
            </h2>
            
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              The professional landscape is shifting. Master the tools of tomorrow by learning how to build, deploy, and leverage Artificial Intelligence today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Link href="/ai-roadmap/plan">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 text-base">
                      Plan Your Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
               </Link>
               <Link href="/ai-roadmap">
                   <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-white/10 h-12 px-8 text-base bg-transparent">
                      View AI Roadmap
                   </Button>
               </Link>
            </div>
          </div>

          {/* Right Column: Visual Timeline */}
          <div className="lg:w-1/2 w-full">
             <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
                {/* Connecting Line */}
                <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden sm:block"></div>

                <div className="space-y-8 relative">
                   {/* Step 1 */}
                   <div className="flex gap-4 md:gap-6 relative">
                      <div className="flex shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-900 border border-blue-500/30 items-center justify-center relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                         <span className="text-blue-400 font-bold text-sm md:text-base">1</span>
                      </div>
                      <div>
                         <h3 className="text-lg md:text-xl font-bold text-white mb-2">Foundations & Literacy</h3>
                         <p className="text-gray-400 text-sm">Understand LLMs, Prompt Engineering, and AI ethics.</p>
                      </div>
                   </div>

                   {/* Step 2 */}
                   <div className="flex gap-4 md:gap-6 relative">
                       <div className="flex shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-900 border border-purple-500/30 items-center justify-center relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                         <span className="text-purple-400 font-bold text-sm md:text-base">2</span>
                      </div>
                      <div>
                         <h3 className="text-lg md:text-xl font-bold text-white mb-2">Applied AI Development</h3>
                         <p className="text-gray-400 text-sm">Build AI-powered apps using Python, LangChain, and OpenAI API.</p>
                      </div>
                   </div>

                   {/* Step 3 */}
                   <div className="flex gap-4 md:gap-6 relative">
                       <div className="flex shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-900 border border-pink-500/30 items-center justify-center relative z-10 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                         <span className="text-pink-400 font-bold text-sm md:text-base">3</span>
                      </div>
                      <div>
                         <h3 className="text-lg md:text-xl font-bold text-white mb-2">Leadership & Strategy</h3>
                         <p className="text-gray-400 text-sm">Lead AI transformation in your organization and drive innovation.</p>
                      </div>
                   </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 h-20 w-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-purple-500/10 rounded-full blur-2xl"></div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
