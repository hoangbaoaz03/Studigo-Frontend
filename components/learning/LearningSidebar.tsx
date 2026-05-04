"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, CheckCircle, PlayCircle, Loader2, FileText, File, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface LearningSidebarProps {
    course: any;
    curriculum: any[];
    currentLecture: any;
    onLectureSelect: (lecture: any) => void;
    open: boolean;
    onClose: () => void;
}

export function LearningSidebar({ 
    course, 
    curriculum, 
    currentLecture, 
    onLectureSelect,
    open,
    onClose
}: LearningSidebarProps) {
    
    // Auto-expand the section containing the current lecture
    const [expandedSections, setExpandedSections] = useState<number[]>([]);

    useEffect(() => {
        if (currentLecture && curriculum) {
            const activeSection = curriculum.find(section => 
                section.lectures.some((l: any) => l.id === currentLecture.id)
            );
            if (activeSection && !expandedSections.includes(activeSection.id)) {
                setExpandedSections(prev => [...prev, activeSection.id]);
            }
        }
    }, [currentLecture?.id, curriculum]);

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const totalLectures = curriculum?.reduce((acc, sec) => acc + sec.lectures.length, 0) || 0;
    const completedLectures = curriculum?.reduce((acc, sec) => 
        acc + sec.lectures.filter((l: any) => l.completed).length
    , 0) || 0;
    
    const progress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

    const getLectureIcon = (type: string, className: string) => {
        switch (type) {
            case 'article':
                return <FileText className={className} />;
            case 'file':
                return <File className={className} />;
            case 'quiz':
                return <HelpCircle className={className} />;
            case 'video':
            default:
                return <PlayCircle className={className} />;
        }
    };

    return (
        <aside className={cn(
            "fixed top-16 bottom-0 right-0 z-40 w-80 bg-gray-900 border-l border-gray-800 flex flex-col transition-transform duration-300 transform",
            open ? "translate-x-0" : "translate-x-full",
            "md:relative md:top-0 md:bottom-auto md:translate-x-0 md:h-full md:z-0",
            !open && "md:hidden" 
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
                <span className="font-bold text-gray-200">Course Content</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {curriculum?.map((section) => {
                    const isExpanded = expandedSections.includes(section.id);
                    return (
                        <div key={section.id} className="border-b border-gray-800">
                            <button 
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-sm font-bold text-gray-200 text-left">{section.title}</span>
                                    <span className="text-xs text-gray-500">
                                        {section.lectures.filter((l: any) => l.completed).length} / {section.lectures.length} | {Math.round(section.lectures.reduce((acc: number, l: any) => acc + l.duration, 0) / 60)} min
                                    </span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", !isExpanded && "-rotate-90")} />
                            </button>
                            
                            {isExpanded && (
                                <div>
                                    {section.lectures.map((lecture: any) => (
                                        <button
                                            key={lecture.id}
                                            onClick={() => onLectureSelect(lecture)}
                                            className={cn(
                                                "w-full flex items-start gap-3 p-3 pl-6 text-left text-sm hover:bg-gray-800 transition-colors group",
                                                currentLecture?.id === lecture.id ? "bg-gray-800 border-l-4 border-purple-500" : "border-l-4 border-transparent"
                                            )}
                                        >
                                            <div className="mt-0.5 relative z-10 w-4 h-4 flex items-center justify-center">
                                                {lecture.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-purple-500 fill-purple-500/20" />
                                                ) : (
                                                    getLectureIcon(lecture.lecture_type, cn("h-4 w-4", currentLecture?.id === lecture.id ? "text-white" : "text-gray-500 group-hover:text-gray-300"))
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className={cn("mb-1", currentLecture?.id === lecture.id ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-300")}>
                                                    {lecture.title}
                                                </div>
                                                {lecture.lecture_type !== 'article' && lecture.lecture_type !== 'file' && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <PlayCircle className="h-3 w-3" />
                                                        {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
