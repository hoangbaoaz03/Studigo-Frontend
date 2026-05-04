"use client";

import { useEffect, useState } from "react";
import { getCoursePlayer } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, FileIcon, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// New Components
import { VideoPlayer } from "./learning/VideoPlayer";
import { ArticleViewer } from "./learning/ArticleViewer";
import { QuizPlayer } from "./learning/QuizPlayer";
import { LearningSidebar } from "./learning/LearningSidebar";
import { LearningTabs } from "./learning/LearningTabs";
import { useLearning } from "@/context/LearningContext";
import ChatWidget from "./chatbot/ChatWidget";

export function LearningClient({ slug }: { slug: string }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { setCourse, isSidebarOpen, setSidebarOpen } = useLearning();
    
    // Data State
    const [courseData, setCourseData] = useState<any>(null);
    const [currentLecture, setCurrentLecture] = useState<any>(null);
    const [notes, setNotes] = useState<any[]>([]);
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    // Removed local sidebarOpen state
    
    // Playback State (lifted up for Tabs/Notes interaction)
    const [currentTime, setCurrentTime] = useState(0);
    
    // Check screen size on mount and resize
    useEffect(() => {
        const handleResize = () => {
             if (window.innerWidth >= 768) {
                // Determine if we should auto-open. 
                // For now, let's enforce open on desktop to fix the "disappearing" issue.
                // We could be smarter and only do this if it was closed ONLY due to mobile constraint,
                // but simpler is safer for this bug report.
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setSidebarOpen]);

    // Sync Course Info to Navbar Context
    useEffect(() => {
        if (courseData) {
            setCourse({
                title: courseData.course.title,
                progress: courseData.enrollment?.progress_percent || 0,
                slug: courseData.course.slug
            });
        }
        
        // Cleanup on unmount
        return () => {
            setCourse(null);
        };
    }, [courseData, setCourse]);

    // We need a ref to the video element to control it from outside (Tabs)
    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=/course/${slug}/learn`);
            return;
        }

        if (user) {
            loadCourseData();
        }
    }, [user, loading, slug]);

    const loadCourseData = async () => {
        try {
            const data = await getCoursePlayer(slug);
            setCourseData(data);
            setNotes(data.notes || []);
            
            if (data.curriculum && data.curriculum.length > 0) {
                 // Try to pick up where user left off? 
                 // Backend could provide 'last_accessed' lecture ID.
                 // For now, simpler: First lecture.
                 const firstLecture = data.curriculum[0].lectures[0];
                 if (firstLecture) setCurrentLecture(firstLecture);
            }
        } catch (error) {
            console.error("Failed to load course player", error);
            // Handle 403 or 404
        } finally {
            setIsLoading(false);
        }
    };

    const handleLectureSelect = (lecture: any) => {
        setCurrentLecture(lecture);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleVideoCompleted = () => {
        if (courseData && currentLecture) {
            const newCurriculum = [...courseData.curriculum];
            for (const section of newCurriculum) {
                const lec = section.lectures.find((l: any) => l.id === currentLecture.id);
                if (lec) {
                    lec.completed = true;
                    setCourseData({ ...courseData, curriculum: newCurriculum });
                    break;
                }
            }
        }
    };
    
    // Seek via global query selector (simple approach) or event bus
    const handleSeek = (time: number) => {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = time;
            video.play();
        }
    };

    /**
     * Called when the user clicks a timestamp link in the AI chatbot.
     * Switches to the correct lecture (if different) then seeks the video.
     */
    const handleChatbotSeekVideo = (lectureId: number, seconds: number) => {
        // Check if we need to switch lectures first
        if (currentLecture?.id !== lectureId && courseData?.curriculum) {
            for (const section of courseData.curriculum) {
                const targetLecture = section.lectures.find((l: any) => l.id === lectureId);
                if (targetLecture) {
                    setCurrentLecture(targetLecture);
                    // Wait for the new video to mount, then seek
                    setTimeout(() => handleSeek(seconds), 1200);
                    return;
                }
            }
        }
        // Same lecture — seek immediately
        handleSeek(seconds);
    };

    const toggleLectureCompletion = async () => {
        if (!currentLecture) return;
        
        try {
            const newStatus = !currentLecture.completed;
            const result = await import('@/lib/api').then(m => m.updateLectureProgress(currentLecture.id, newStatus));
            
            // Update local state
            const newCurriculum = [...courseData.curriculum];
            for (const section of newCurriculum) {
                const lec = section.lectures.find((l: any) => l.id === currentLecture.id);
                if (lec) {
                    lec.completed = newStatus;
                    // Update current lecture ref as well
                    setCurrentLecture({...lec});
                    break;
                }
            }
            
            // Update enrollment progress from server response
            const updatedEnrollment = {
                ...courseData.enrollment,
                progress_percent: result.progress ?? courseData.enrollment.progress_percent
            };
            setCourseData({ ...courseData, curriculum: newCurriculum, enrollment: updatedEnrollment });
            
        } catch (error) {
            console.error("Failed to toggle completion", error);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!courseData) return null;

    return (
        <div className="flex min-h-screen flex-col bg-gray-900 text-white">
            {/* Header Removed - Managed by Global Navbar via Context */}

            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-black relative z-10 transition-all duration-300">
                    {/* Video Section */}
                    
                    <div className="flex-none bg-black w-full border-b border-gray-800">
                        <div className="max-w-6xl mx-auto">
                            {/* Toolbar above video */}
                            <div className="p-4 flex justify-between items-center bg-gray-900/50">
                                <h2 className="text-lg font-bold text-white truncate pr-4">
                                    {currentLecture?.title}
                                </h2>
                                <Button 
                                    onClick={toggleLectureCompletion}
                                    variant={currentLecture?.completed ? "default" : "outline"}
                                    className={`shrink-0 ${currentLecture?.completed 
                                        ? 'bg-green-600 hover:bg-green-700 text-white border-none' 
                                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}
                                >
                                    {currentLecture?.completed ? "✓ Completed" : "Mark as Completed"}
                                </Button>
                            </div>

                            
                             {!currentLecture ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-lg min-h-[400px] border border-gray-800">
                                    <h3 className="text-xl font-semibold text-white mb-2">No Content Available</h3>
                                    <p className="text-gray-400 text-center max-w-md">
                                        This course doesn't have any lectures yet. Please check back later.
                                    </p>
                                </div>
                             ) : currentLecture.lecture_type === 'article' ? (
                                <ArticleViewer 
                                    lecture={currentLecture}
                                    onCompleted={toggleLectureCompletion}
                                />
                             ) : currentLecture.lecture_type === 'file' ? (
                                <div className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-lg min-h-[400px] border border-gray-800">
                                    <FileIcon className="h-16 w-16 text-blue-500 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">{currentLecture.title}</h3>
                                    <p className="text-gray-400 mb-6 text-center max-w-md">
                                        {currentLecture.content || "Please download the attached resource file to continue your learning progress."}
                                    </p>
                                    {currentLecture.video_file ? (
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <a href={currentLecture.video_file} target="_blank" rel="noopener noreferrer" download>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Resource File
                                            </a>
                                        </Button>
                                    ) : (
                                        <div className="p-4 bg-yellow-900/30 text-yellow-500 rounded-md border border-yellow-900 text-sm">
                                            No file attached to this lecture.
                                        </div>
                                    )}
                                </div>
                             ) : currentLecture.lecture_type === 'quiz' ? (
                                <QuizPlayer 
                                    lecture={currentLecture}
                                    onCompleted={toggleLectureCompletion}
                                />
                             ) : (
                                <VideoPlayer 
                                    lecture={currentLecture} 
                                    onCompleted={handleVideoCompleted}
                                    onTimeUpdate={(time) => setCurrentTime(time)}
                                />
                             )}
                        </div>
                    </div>
                    
                    {/* Tabs / Lower Content */}
                    <div className="w-full bg-gray-900">
                         <LearningTabs 
                            course={courseData.course}
                            currentLecture={currentLecture}
                            profile={null}
                            notes={notes}
                            questions={courseData.questions}
                            reviews={courseData.reviews}
                            currentTime={currentTime}
                            onSeek={handleSeek}
                            onNoteAdded={(n: any) => setNotes([...notes, n])}
                         />
                    </div>
                </main>

                {/* Sidebar */}
                <LearningSidebar 
                    course={courseData.course}
                    curriculum={courseData.curriculum}
                    currentLecture={currentLecture}
                    onLectureSelect={handleLectureSelect}
                    open={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>
            
            <ChatWidget courseId={courseData.course.id} onSeekVideo={handleChatbotSeekVideo} />
        </div>
    );
}
