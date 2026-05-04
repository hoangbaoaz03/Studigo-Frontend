import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InstructorPromoData {
  title: string;
  description: string;
  cta: string;
  image: string;
}

interface InstructorPromotionalProps {
  data?: InstructorPromoData;
}

const InstructorPromotional: React.FC<InstructorPromotionalProps> = ({ data }) => {
  if (!data) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-white to-purple-50/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Content Left */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {data.title}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {data.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
               <Link href="/teach">
                <Button size="lg" className="h-14 px-10 rounded-full font-bold text-lg bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  {data.cta}
                </Button>
               </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-gray-500">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Join 50k+ Instructors</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Teach Globally</span>
               </div>
            </div>
          </div>

          {/* Visuals Right */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
             <div className="relative">
                {/* Abstract Background Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-200/20 rounded-full blur-3xl"></div>
                
                {/* Main Image Container */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                   <div className="space-y-4 mt-8">
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-500">
                         <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         </div>
                         <h3 className="font-bold text-gray-900">Create</h3>
                         <p className="text-sm text-gray-500 mt-1">Film courses your way</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-500 delay-100">
                         <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <h3 className="font-bold text-gray-900">Inspire</h3>
                         <p className="text-sm text-gray-500 mt-1">Impact potential learners</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-500 delay-75">
                         <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                         </div>
                         <h3 className="font-bold text-gray-900">Grow</h3>
                         <p className="text-sm text-gray-500 mt-1">Build your audience</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-500 delay-200">
                         <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <h3 className="font-bold text-gray-900">Earn</h3>
                         <p className="text-sm text-gray-500 mt-1">Get rewarded</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default InstructorPromotional;
