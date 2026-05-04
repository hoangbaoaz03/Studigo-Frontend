'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, Users, Shield, ArrowRight } from 'lucide-react';

export default function BusinessLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#1c1d1f] text-white pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                Upskill your team with Studigo Business
              </h1>
              <p className="text-lg text-gray-300 max-w-xl">
                Get unlimited access to 10,000+ top courses for your team. Empower your workforce with the skills they need to succeed in the digital age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/business/contact">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8">
                    Get Studigo Business
                  </Button>
                </Link>
                <Link href="/business/demo">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-bold h-12 px-8 border-2 border-transparent">
                    Request a Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
               {/* Hero Image */}
               <div className="relative h-[400px] w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000" 
                    alt="Business Team Learning" 
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badge Section */}
      <div className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale">
                <span className="text-xl font-bold text-gray-400">Google</span>
                <span className="text-xl font-bold text-gray-400">Amazon</span>
                <span className="text-xl font-bold text-gray-400">Microsoft</span>
                <span className="text-xl font-bold text-gray-400">Spotify</span>
                <span className="text-xl font-bold text-gray-400">Slack</span>
            </div>
        </div>
      </div>

      {/* Value Props */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose Studigo Business?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                 We provide the tools and content to help your organization grow, adapt, and innovate.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                 <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Users className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Role-Based Learning</h3>
                 <p className="text-gray-600">
                    Curated learning paths for Engineering, Marketing, Sales, and Data Science teams.
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <Shield className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Certification Prep</h3>
                 <p className="text-gray-600">
                    Prepare your team for industry-standard certifications (AWS, PMP, Cisco) with our specialized prep modules.
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <BarChart className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Actionable Insights</h3>
                 <p className="text-gray-600">
                    Track usage, completion rates, and skill acquisition with our advanced analytics dashboard.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { step: "01", title: "Create Organization", desc: "Sign up and set up your company profile." },
                  { step: "02", title: "Invite Team", desc: "Upload email list or use auto-join domains." },
                  { step: "03", title: "Assign Courses", desc: "Create learning paths for specific roles." },
                  { step: "04", title: "Track Progress", desc: "Monitor skill growth via the admin dashboard." }
               ].map((item, idx) => (
                  <div key={idx} className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                     <span className="text-5xl font-bold text-gray-100 absolute top-4 right-4">{item.step}</span>
                     <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{item.title}</h3>
                     <p className="text-gray-600 text-sm relative z-10">{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your workforce?</h2>
            <p className="text-xl text-blue-100 mb-8">
               Join 5,000+ organizations already learning with Studigo Business.
            </p>
            <Link href="/business/contact">
               <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold h-14 px-10 text-lg">
                  Get Started Today
               </Button>
            </Link>
         </div>
      </section>
    </div>
  );
}
