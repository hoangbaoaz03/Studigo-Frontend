'use client';

import React from 'react';
import { Search } from 'lucide-react';

export const ExamPrepHero = () => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Get certified, lead your career
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Prepare for top IT and project management certifications like PMP, AWS, Cisco, Microsoft Azure. 
            We provide expert-designed exam prep courses.
          </p>
          
          {/* Search Bar in Hero */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm shadow-md"
              placeholder="Search certifications (e.g. AWS, PMP, Cisco)..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
