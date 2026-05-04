'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, TrendingUp, Users, Globe, Quote } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// Mock Data (Ideally strictly typed and separated)
const CASE_STUDY_DATA: Record<string, any> = {
  'fpt-corporation': {
    company: 'FPT Corporation',
    industry: 'Technology & IT Services',
    location: 'Vietnam (Global)',
    employees: '30,000+',
    headline: 'Building a World-Class Tech Workforce at Scale',
    challenge: `
      As FPT Corporation expanded globally, the demand for high-quality software engineers with specialized skills in AI, Cloud, and Data Science skyrocketed. 
      Traditional training methods were too slow and inconsistent to measure. The challenge was to rapidly upskill thousands of fresher and junior developers to meet international client standards.
    `,
    solution: `
      FPT partnered with Studigo Business to implement a structured role-based learning program.
      
      Key elements of the solution:
      • Customized Learning Paths for Java, .NET, and Cloud Engineering.
      • Integration with FPT's internal LMS for unified tracking.
      • Certification preparation for AWS and Microsoft Azure.
      • Monthly "Learning Sprints" to encourage engagement.
    `,
    results: [
      { metric: '3,000+', label: 'Engineers Upskilled' },
      { metric: '40%', label: 'Reduction in Onboarding Time' },
      { metric: '95%', label: 'Certification Pass Rate' },
      { metric: '$2M', label: 'Estimated Training Cost Savings' }
    ],
    quote: {
      text: "Studigo Business is a strategic partner helping us train thousands of software engineers with the latest technologies. Thanks to it, we can meet global client needs quickly.",
      author: "Nguyen Van A",
      role: "CTO, FPT Software"
    },
    heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000&h=1000"
  }
};

export default function CaseStudyDetail() {
  // In a real app, use `params` from server component, but we are using client for simplicity with existing mock data structure
  const params = useParams();
  const slug = params?.slug as string;
  const data = CASE_STUDY_DATA['fpt-corporation']; // Default fallback for demo / if slug matches

  if (!data) return <div className="p-20 text-center">Case Study Not Found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Home
            </Link>
            <div className="font-bold text-gray-900">Studigo Business Stories</div>
            <Button size="sm">Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-[400px] w-full bg-gray-900">
         <img src={data.heroImage} alt={data.company} className="w-full h-full object-cover opacity-40" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl px-4 text-center text-white">
                <Badge className="mb-4 bg-orange-600 hover:bg-orange-700 text-white border-none px-4 py-1 text-base">
                   Success Story
                </Badge>
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">{data.headline}</h1>
                <p className="text-xl md:text-2xl text-gray-200">How {data.company} transformed their engineering excellence</p>
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-0">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 md:p-12">
             
             {/* Key Metrics Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-100 pb-12">
                {data.results.map((res: any, idx: number) => (
                   <div key={idx} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{res.metric}</div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">{res.label}</div>
                   </div>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Main Text */}
                <div className="lg:col-span-2 space-y-8 text-lg text-gray-700 leading-relaxed">
                   <div className="prose prose-blue max-w-none">
                       <h3 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h3>
                       <p className="mb-8">{data.challenge}</p>
                       
                       <h3 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h3>
                       <p className="whitespace-pre-line">{data.solution}</p>
                   </div>
                   
                   <div className="bg-gray-50 p-8 rounded-xl border-l-4 border-orange-500 my-8">
                       <Quote className="h-8 w-8 text-orange-400 mb-4 opacity-50" />
                       <blockquote className="text-xl italic font-medium text-gray-900 mb-6">
                          "{data.quote.text}"
                       </blockquote>
                       <div className="font-bold text-gray-900">{data.quote.author}</div>
                       <div className="text-sm text-gray-500">{data.quote.role}</div>
                   </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Company Profile</h4>
                        <div className="space-y-4">
                           <div>
                              <div className="text-sm text-gray-500 mb-1">Company</div>
                              <div className="font-semibold text-gray-900">{data.company}</div>
                           </div>
                           <div>
                              <div className="text-sm text-gray-500 mb-1">Industry</div>
                              <div className="font-semibold text-gray-900">{data.industry}</div>
                           </div>
                           <div>
                              <div className="text-sm text-gray-500 mb-1">Headquarters</div>
                              <div className="font-semibold text-gray-900">{data.location}</div>
                           </div>
                           <div>
                              <div className="text-sm text-gray-500 mb-1">Employees</div>
                              <div className="font-semibold text-gray-900">{data.employees}</div>
                           </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-lg text-white text-center">
                       <h4 className="font-bold text-xl mb-2">Ready to achieve similar results?</h4>
                       <p className="text-blue-100 mb-6 text-sm">Empower your team with Studigo Business today.</p>
                       <Link href="/business">
                          <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold">
                             Contact Sales
                          </Button>
                       </Link>
                    </div>
                </div>

             </div>
          </div>
      </div>

    </div>
  );
}
