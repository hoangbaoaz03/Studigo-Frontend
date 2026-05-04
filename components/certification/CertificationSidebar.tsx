'use client';

import React from 'react';
import { CertificationDetail } from '@/types/certification';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileText, CheckCircle, Award, BarChart, Clock } from 'lucide-react';

interface CertificationSidebarProps {
  cert: CertificationDetail;
}

export const CertificationSidebar: React.FC<CertificationSidebarProps> = ({ cert }) => {
  return (
    <div className="lg:w-[340px] relative z-10 h-full">
      <div className="sticky top-24 bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        {/* Header / Preview Area */}
        <div className="bg-gray-100 p-6 text-center border-b border-gray-100">
             <div className="aspect-video bg-white rounded-lg shadow-sm flex items-center justify-center mb-2 px-4 py-2">
                {cert.badge_image_url ? (
                    <img src={cert.badge_image_url} alt={cert.title} className="max-h-32 max-w-full object-contain" />
                ) : cert.provider.logo ? (
                    <img src={cert.provider.logo} alt={cert.provider.name} className="max-h-16 max-w-[80%]" />
                ) : (
                    <h3 className="text-xl font-bold text-gray-400 tracking-widest">{cert.provider.name}</h3>
                )}
             </div>
             <p className="text-sm font-medium text-gray-500">Preview this course</p>
        </div>

        <div className="p-6 flex flex-col gap-4">
             {/* Price */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">${cert.price}</span>
            </div>

            {/* Buttons */}
            <Button 
                size="lg" 
                className="w-full font-bold h-12 text-base bg-purple-600 hover:bg-purple-700 text-white"
            >
                Buy Now
            </Button>
            <Button 
                size="lg" 
                variant="outline"
                className="w-full font-bold h-12 text-base border-gray-900 text-gray-900 hover:bg-gray-50"
            >
                Try Diagnostic Test
            </Button>

            <div className="text-center text-xs text-gray-500 pt-2">
                30-Day Money-Back Guarantee
            </div>

            {/* Includes */}
            <div className="flex flex-col gap-3 pt-4 text-sm text-gray-700 border-t border-gray-100 mt-2">
                <span className="font-bold">This exam prep includes:</span>
                
                <div className="flex items-center gap-3">
                    <PlayCircle className="h-4 w-4 text-gray-500" />
                    <span>{cert.modules.length} Exam-focused modules</span>
                </div>
                <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{cert.practice_exams.length} Full-length mock exams</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{cert.estimated_prep_time} of content</span>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span>100% Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span>Certificate of completion</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
