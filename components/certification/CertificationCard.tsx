'use client';

import React from 'react';
import { Certification } from '@/types/certification';
import Link from 'next/link';
import { Clock, BookOpen, BarChart } from 'lucide-react';

interface CertificationCardProps {
  certification: Certification;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({ certification }) => {
  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header / Logo Area */}
      <div className="h-32 bg-white flex items-center justify-center p-6 border-b border-gray-100 relative">
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
            {certification.level}
          </span>
        </div>
        {certification.badge_image_url ? (
            <div className="w-full h-full relative flex items-center justify-center">
                 <img 
                    src={certification.badge_image_url} 
                    alt={certification.title} 
                    className="max-h-full max-w-full object-contain"
                 />
            </div>
        ) : (
            <h3 className="text-xl font-bold text-gray-400 opacity-20 tracking-widest uppercase">
            {certification.provider.name}
            </h3>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/exam-prep/${certification.slug}`} className="hover:underline">
            {certification.title}
          </Link>
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
          {certification.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{certification.estimated_prep_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{certification.modules_count} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="w-3.5 h-3.5" />
            <span>{certification.exams_count} Exams</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="font-bold text-lg text-gray-900">
            ${certification.price}
          </span>
          <Link 
            href={`/exam-prep/${certification.slug}`}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
