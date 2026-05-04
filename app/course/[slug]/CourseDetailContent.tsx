"use client";

import Image from "next/image";
import { Star, Globe, Award, Clock, FileText, Smartphone, Infinity, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCourseThumbnail } from "@/lib/image-utils";
import { CourseDetail, Course } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import ReactMarkdown from "react-markdown";

// Sub-components
import { CourseSidebar } from "@/components/CourseSidebar";
import CourseCarousel from "@/components/home/CourseCarousel";

interface CourseDetailContentProps {
  course: CourseDetail;
  relatedCourses: Course[];
}

export default function CourseDetailContent({ course, relatedCourses }: CourseDetailContentProps) {
  const { locale, t } = useLanguage();

  const displayTitle = (locale === 'vi' && course.title_vi) ? course.title_vi : course.title;
  const displaySubtitle = (locale === 'vi' && course.subtitle_vi) ? course.subtitle_vi : course.subtitle;
  const displayDescription = (locale === 'vi' && course.description_vi) ? course.description_vi : course.description;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#1c1d1f] text-white py-12">
        <div className="container mx-auto px-6 max-w-[1240px] relative">
          <div className="max-w-[700px] z-10 relative">
            <div className="mb-4 text-purple-300 font-bold text-sm breadcrumbs">
                <span className="text-purple-300 pointer-events-none">{course.category_name}</span> 
                {course.subcategory_name && (
                    <> <span className="text-gray-400 text-[10px] mx-1">▶</span> <span className="text-purple-300 pointer-events-none">{course.subcategory_name}</span> </>
                )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {displayTitle}
            </h1>
            <p className="text-lg md:text-xl mb-6 line-clamp-3">
              {displaySubtitle}
            </p>
            
             <div className="flex items-center gap-4 mb-4 text-sm">
                {course.average_rating > 4.5 && course.total_reviews > 10 && (
                  <Badge className="bg-[#eceb98] text-[#3d3c0a] border-none hover:bg-[#eceb98] rounded-sm px-2 font-bold text-xs uppercase">
                     {t.course.bestseller}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-500">{Number(course.average_rating).toFixed(1)}</span>
                    <div className="flex">
                      {Array.from({length: 5}).map((_, i) => (
                         <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(course.average_rating)) ? "fill-amber-500 text-amber-500" : "fill-gray-600 text-gray-600"}`} />
                      ))}
                    </div>
                    <span className="text-purple-300 underline cursor-pointer">({course.total_reviews} {t.course.ratings})</span>
                </div>
                <span>{course.total_enrollments.toLocaleString()} {t.course.students}</span>
             </div>

             <div className="flex items-center gap-4 text-sm mb-8">
                 <span className="flex items-center gap-1">
                     {t.course.createdBy} <span className="text-purple-300 underline cursor-pointer ml-1">{course.instructor_name || "Unknown"}</span>
                 </span>
                <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {course.language}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="container mx-auto px-6 max-w-[1240px] py-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column: Course Info */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                  
                  {/* What you'll learn */}
                  {((locale === 'vi' && course.what_you_will_learn_vi && course.what_you_will_learn_vi.length > 0) || (course.what_you_will_learn && course.what_you_will_learn.length > 0)) && (
                      <div className="border border-gray-300 p-6 mb-8 bg-white">
                          <h2 className="text-2xl font-bold mb-4 text-gray-900">{t.course.whatYouWillLearn}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {((locale === 'vi' && course.what_you_will_learn_vi && course.what_you_will_learn_vi.length > 0) ? course.what_you_will_learn_vi : course.what_you_will_learn).map((item, idx) => (
                                  <div key={idx} className="flex gap-2 items-start">
                                      <span className="text-gray-400 mt-1">✓</span>
                                      <span className="text-sm text-gray-700">{item}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Course Content (Curriculum) */}
                  <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900">{t.course.content}</h2>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>{course.sections?.length || 0} {t.course.sections} • {course.total_lectures} {t.course.lectures} • {Math.round(course.total_duration / 60)}m {t.course.length}</span>
                          <span className="text-indigo-700 font-bold cursor-pointer">{t.course.expandAll}</span>
                      </div>
                      
                      <div className="border border-gray-300 rounded-sm">
                          <Accordion type="multiple" className="w-full">
                                {course.sections?.map((section) => (
                                    <AccordionItem key={section.id} value={`section-${section.id}`}>
                                        <AccordionTrigger className="bg-gray-50 px-4 py-3 hover:no-underline hover:bg-gray-100">
                                            <div className="flex justify-between w-full pr-4 items-center">
                                                <span className="font-bold text-gray-800 text-left">{section.title}</span>
                                                <span className="text-xs text-gray-500 font-normal hidden sm:block">{section.lecture_count} {t.course.lectures} • 15m</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <div className="flex flex-col">
                                                {section.lectures?.map((lecture: any) => (
                                                    <div key={lecture.id} className="flex justify-between items-center py-3 px-4 pl-8 border-b last:border-0 hover:bg-gray-50 cursor-pointer group">
                                                         <div className="flex items-center gap-3">
                                                            <PlayCircle className="h-4 w-4 text-gray-500 group-hover:text-gray-800" />
                                                            <span className="text-sm text-gray-700 group-hover:underline">{lecture.title}</span>
                                                         </div>
                                                         <div className="flex items-center gap-4">
                                                             {lecture.is_preview && <span className="text-xs text-indigo-600 underline font-bold">{t.course.preview}</span>}
                                                             <span className="text-xs text-gray-500">{Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}</span>
                                                         </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                          </Accordion>
                      </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8 py-4">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900">{t.course.description}</h2>
                      <div className="prose max-w-none text-sm text-gray-800">
                          <ReactMarkdown>{displayDescription}</ReactMarkdown>
                      </div>
                  </div>
                   
                  {/* Students Also Bought */}
                   {relatedCourses.length > 0 && (
                        <div className="mb-12 pt-8 border-t">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">{t.course.studentsAlsoBought}</h2>
                            <CourseCarousel courses={relatedCourses} />
                        </div>
                    )}
              </div>

              {/* Right Column: Sticky Sidebar */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                   <div className="sticky top-24">
                       <CourseSidebar course={course} displayTitle={displayTitle} displaySubtitle={displaySubtitle} />
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}
