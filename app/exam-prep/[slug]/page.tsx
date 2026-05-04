'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { certificationApi } from '@/lib/api/certification';
import { CertificationDetail } from '@/types/certification';
import Link from 'next/link';
import { ArrowLeft, Clock, BarChart, CheckCircle, FileText, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CertificationSidebar } from '@/components/certification/CertificationSidebar';

export default function CertificationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [cert, setCert] = useState<CertificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await certificationApi.getCertificationBySlug(slug);
        setCert(data);
      } catch (error) {
        console.error("Failed to load certification", error);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Certification Not Found</h1>
        <Link href="/exam-prep" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Exam Prep
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner - Full width background */}
      <div className="bg-gray-900 text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/exam-prep" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Certifications
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
             <div className="flex-1 lg:max-w-2xl">
                <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-semibold mb-4">
                  {cert.level} Level
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{cert.title}</h1>
                <p className="text-lg text-gray-300 mb-6">{cert.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{cert.estimated_prep_time} Prep</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <BarChart className="w-4 h-4" />
                     <span>{cert.modules.length} Modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4" />
                     <span>{cert.practice_exams.length} Practice Exams</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                    Created by {cert.provider.name} • Last updated {new Date(cert.created_at).toLocaleDateString()}
                </div>
             </div>
             
             {/* Spacer for sidebar to float next to on large screens, or just hidden on mobile/desktop since sidebar is absolute/sticky there? 
                 Actually, we need to preserve space or let the sidebar component handle its positioning relative to container.
                 For typical Layout: Header is full width. Sidebar starts typically overlapping header or just below.
                 We will put the Sidebar in the Main Content area but use negative margin to pull it up.
             */}
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 relative">
           
           {/* Left Content Column */}
           <div className="flex-1 py-8">
              <div className="space-y-8">
                 {/* Syllabus / Modules */}
                 <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                    <div className="space-y-4">
                       {cert.modules.length > 0 ? cert.modules.map((module) => (
                          <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                   <PlayCircle className="w-5 h-5 text-blue-600" />
                                   {module.title}
                                </h3>
                                <span className="text-xs text-gray-500">{module.duration_minutes} mins</span>
                             </div>
                             <div className="pl-7 text-sm text-gray-600">
                                 <ReactMarkdown>{module.content.substring(0, 150) + "..."}</ReactMarkdown>
                             </div>
                          </div>
                       )) : (
                           <div className="text-gray-500 italic">No modules listed yet.</div>
                       )}
                    </div>
                 </div>

                 {/* Practice Exams */}
                 <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Exams</h2>
                    <div className="space-y-4">
                       {cert.practice_exams.length > 0 ? cert.practice_exams.map((exam) => (
                          <div key={exam.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                             <div>
                                <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                                <p className="text-sm text-gray-500">
                                   {exam.questions_count} Questions • {exam.duration_minutes} Minutes
                                </p>
                             </div>
                             <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                                Start Mock Exam
                             </button>
                          </div>
                       )) : (
                            <div className="text-gray-500 italic">No practice exams listed yet.</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Sidebar Column */}
           <aside className="lg:w-[340px] flex-shrink-0 lg:-mt-24">
               <CertificationSidebar cert={cert} />
           </aside>

        </div>
      </div>
    </div>
  );
}
