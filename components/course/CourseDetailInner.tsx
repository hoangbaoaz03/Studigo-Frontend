"use client";

import { usePreviewEdit } from "@/context/PreviewEditContext";
import { CourseSidebar } from "@/components/CourseSidebar";
import { Button } from "@/components/ui/button";
import { Star, PlayCircle, Globe, Award } from "lucide-react";
import CourseCarousel from "@/components/home/CourseCarousel";
import EditModeToggle from "@/components/instructor/preview/EditModeToggle";
import EditableText from "@/components/instructor/preview/EditableText";
import EditableTextarea from "@/components/instructor/preview/EditableTextarea";
import EditableList from "@/components/instructor/preview/EditableList";
import { Plus, Trash2, Edit } from "lucide-react";
import LectureEditor from "@/components/instructor/LectureEditor";
import { useState } from "react";

export default function CourseDetailInner({ relatedCourses, isOwner }: { relatedCourses: any[], isOwner: boolean }) {
    const { 
        course, 
        saveCourseField, 
        saveSectionField, 
        saveLectureField,
        addSection,
        removeSection,
        addLecture,
        removeLecture,
        isEditMode,
        updateLectureInState,
        togglePublishStatus,
    } = usePreviewEdit();
    
    // State for Lecture Editor Modal
    const [editingLecture, setEditingLecture] = useState<any>(null);
    const [isLectureEditorOpen, setIsLectureEditorOpen] = useState(false);

    const handleEditLecture = (lecture: any) => {
        setEditingLecture(lecture);
        setIsLectureEditorOpen(true);
    };

    const handleLectureSaved = (updatedLecture: any) => {
        // Update local state via context
        updateLectureInState(updatedLecture);
        setEditingLecture(null);
        setIsLectureEditorOpen(false);
    };

    if (!course) return null;

    return (
        <div className="relative">
             {/* Edit Mode Toggle - Only for owner */}
             {isOwner && (
                <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end">
                    <EditModeToggle />
                    <Button 
                        variant={course.status === 'published' ? "destructive" : "default"}
                        onClick={togglePublishStatus}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                        {course.status === 'published' ? "Unpublish Course" : "Publish Course"}
                    </Button>
                </div>
            )}

      {/* Dark Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 max-w-6xl flex">
            <div className="max-w-2xl flex flex-col gap-4">
                {/* Breadcrumb substitute */}
                <div className="text-sm font-semibold text-purple-300 flex gap-2">
                    <span>{course.category_name}</span>
                    <span>{">"}</span>
                    <span>{course.subcategory_name || "General"}</span>
                </div>

                {/* Editable Title */}
                <h1 className="text-4xl font-bold leading-tight">
                    <EditableText 
                        value={course.title} 
                        onSave={(val) => saveCourseField('title', val)}
                        className="text-4xl font-bold bg-transparent border-white/20 text-white"
                    />
                </h1>

                {/* Editable Subtitle */}
                <div className="text-lg text-gray-200">
                    <EditableTextarea
                         value={course.subtitle} 
                         onSave={(val) => saveCourseField('subtitle', val)}
                         className="text-lg bg-transparent border-white/20 text-white min-h-[60px]"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-amber-400">{course.average_rating}</span>
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(Number(course.average_rating)) ? "fill-amber-400 text-amber-400" : "fill-none text-gray-500"}`} 
                            />
                        ))}
                    </div>
                    <span className="text-purple-300 underline">({course.total_reviews} ratings)</span>
                    <span>•</span>
                    <span>{course.total_enrollments} students</span>
                </div>

                <div className="text-sm">
                    Created by <span className="text-purple-300 underline font-bold cursor-pointer">{course.instructor_name}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-200 mt-2">
                    <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>Last updated {new Date(course.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span>{course.language}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content & Sticky Sidebar */}
      <div className="container mx-auto px-6 max-w-6xl flex flex-col-reverse lg:flex-row gap-12 mt-8 relative">
        
        {/* Left Column: Content */}
        <div className="flex-1 lg:max-w-2xl flex flex-col gap-10 pb-20">
            {/* What you'll learn */}
            {/* What you'll learn */}
            <div className="border border-gray-300 p-6 bg-white">
                <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                 <EditableList 
                    items={course.what_you_will_learn || []}
                    field="what_you_will_learn"
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    itemClassName="flex gap-2 items-start text-sm"
                    prefix={<span className="text-gray-900 mt-1">✓</span>}
                />
            </div>

            {/* Course Content (Curriculum) */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Course content</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{course.sections?.length || 0} sections • {course.total_lectures} lectures • {Math.round(course.total_duration / 60)}h total length</span>
                    <Button variant="ghost" className="h-auto p-0 text-purple-700 font-bold hover:bg-transparent">Expand all sections</Button>
                </div>
                
                <div className="border border-gray-200 divide-y divide-gray-200">
                    {course.sections?.map((section: any) => (
                        <div key={section.id} className="group">
                            <details className="group-open:bg-gray-50" open={true}>
                                <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 group-hover:bg-gray-100 font-bold">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="group-open:rotate-180 transition-transform">▼</span>
                                        <div onClick={(e) => e.preventDefault()} className="flex-1 flex items-center gap-2">
                                            <EditableText 
                                                value={section.title} 
                                                onSave={(val) => saveSectionField(section.id, 'title', val)}
                                                className="font-bold text-gray-900 bg-transparent border-gray-300 w-full"
                                            />
                                            {isEditMode && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeSection(section.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-normal text-gray-500">{section.lectures.length} lectures</span>
                                </summary>
                                <div className="p-4 bg-white flex flex-col gap-3">
                                    {section.lectures?.map((lecture: any) => (
                                        <div key={lecture.id} className="flex items-center justify-between text-sm group/lecture">
                                            <div className="flex items-center gap-2 text-gray-700 flex-1">
                                                <PlayCircle className="h-4 w-4 text-gray-400" />
                                                <span className={`${lecture.is_preview ? "text-purple-700 underline cursor-pointer" : ""} flex-1`}>
                                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                                                        <EditableText 
                                                            value={lecture.title} 
                                                            onSave={(val) => saveLectureField(lecture.id, 'title', val)}
                                                            className="text-sm cursor-text w-full"
                                                        />
                                                         {isEditMode && (
                                                            <div className="flex items-center opacity-0 group-hover/lecture:opacity-100 transition-opacity">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 text-blue-500 hover:bg-blue-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditLecture(lecture);
                                                                    }}
                                                                    title="Edit Video/Content"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 text-red-500 hover:bg-red-50 ml-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeLecture(lecture.id);
                                                                    }}
                                                                    title="Delete Lecture"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-500">
                                                {lecture.is_preview && <span className="text-purple-700">Preview</span>}
                                                <span>{Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, "0")}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {isEditMode && (
                                        <Button
                                            variant="ghost" 
                                            size="sm"
                                            className="w-full justify-start text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 mt-2"
                                            onClick={() => addLecture(section.id, "New Lecture")}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Lecture
                                        </Button>
                                    )}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
                {isEditMode && (
                    <Button 
                        variant="outline" 
                        className="mt-4 w-full border-dashed"
                        onClick={() => addSection("New Section")}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Section
                    </Button>
                )}
            </div>

            {/* Requirements */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                 <EditableList 
                    items={course.requirements || []}
                    field="requirements"
                    className="list-disc pl-5 space-y-2 text-sm"
                    itemClassName=""
                    listType="ul"
                />
            </div>

            {/* Description */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <div className="prose max-w-none text-sm space-y-4">
                    <EditableTextarea
                         value={course.description} 
                         onSave={(val) => saveCourseField('description', val)}
                         className="min-h-[200px]"
                    />
                </div>
            </div>

            {/* Related Courses / Students also bought */}
            {relatedCourses.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold mb-6">Students also bought</h2>
                    <CourseCarousel courses={relatedCourses} />
                </div>
            )}
        </div>

        {/* Right Column: Sticky Sidebar with Pricing */}
        {/* Pass the editable course object to sidebar if needed, but sidebar is usually complex. 
            For MVP, we might keep sidebar read-only or make it editable later. */}
        <CourseSidebar course={course} />

      </div>
      
      {/* Lecture Editor Modal */}
      {isEditMode && editingLecture && (
          <LectureEditor 
              isOpen={isLectureEditorOpen}
              onClose={() => setIsLectureEditorOpen(false)}
              sectionId={editingLecture.section}
              lecture={editingLecture}
              onSaved={handleLectureSaved}
          />
      )}
    </div>
    );
}
