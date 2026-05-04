"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotesTab } from "./NotesTab";
import { FileText, MessageCircle, Info, Star, Plus, Send, Loader2, Bell, Edit, Trash2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createQuestion, createReview, getAnnouncements, createAnswer, createAnnouncement, updateAnnouncement, deleteAnnouncement, getCourseQuestions, getCourseReviews } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { useSearchParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";

export function LearningTabs({ 
    course, 
    currentLecture, 
    notes,
    questions = [], // New prop
    reviews = [],   // New prop 
    currentTime, 
    onSeek, 
    onNoteAdded 
    }: any) { // Relax types for speed
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'overview';
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    const { toast } = useToast();
    const { user } = useAuth();
    const isInstructor = user && course?.instructor_id && user.id === course.instructor_id;
    const [qstTitle, setQstTitle] = useState("");
    const [qstContent, setQstContent] = useState("");
    const [isAsking, setIsAsking] = useState(false);
    
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);

    // Initial state initialized from props
    const [liveQuestions, setLiveQuestions] = useState<any[]>(questions);
    const [liveReviews, setLiveReviews] = useState<any[]>(reviews);

    const allQuestions = liveQuestions;
    const allReviews = liveReviews;

    // Q&A State
    const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
    
    // Check for question target
    useEffect(() => {
        const questionId = searchParams.get('question');
        if (questionId && activeTab === 'qa') {
            setExpandedQuestionId(parseInt(questionId));
        }
    }, [searchParams, activeTab]);

    const [replyContent, setReplyContent] = useState("");

    const [announcements, setAnnouncements] = useState<any[]>([]);

    // Initial fetch on mount (one-time)
    useEffect(() => {
        if (!course?.id) return;
        const fetchData = async () => {
            try {
                const [fetchQ, fetchR, fetchA] = await Promise.all([
                    getCourseQuestions(course.id),
                    getCourseReviews(course.id),
                    getAnnouncements(course.id)
                ]);
                setLiveQuestions(fetchQ);
                setLiveReviews(fetchR);
                setAnnouncements(fetchA);
            } catch (error) {
                console.error("Initial fetch error", error);
            }
        };
        fetchData();
    }, [course?.id]);

    // Real-Time WebSocket listener for course events
    const handleCourseEvent = useCallback((data: any) => {
        switch (data.event) {
            case "new_question":
                setLiveQuestions(prev => [data.question, ...prev]);
                break;
            case "new_answer":
                setLiveQuestions(prev => prev.map(q => {
                    if (q.id === data.question_id) {
                        return {
                            ...q,
                            answers: [...(q.answers || []), data.answer],
                            answer_count: (q.answer_count || q.answers?.length || 0) + 1,
                        };
                    }
                    return q;
                }));
                break;
            case "new_review":
                setLiveReviews(prev => [data.review, ...prev]);
                break;
            case "new_announcement":
                setAnnouncements(prev => [data.announcement, ...prev]);
                break;
        }
    }, []);

    useWebSocket({
        path: `/ws/course/${course?.id}/`,
        onMessage: handleCourseEvent,
        enabled: !!course?.id,
    });
    
    // Instructor Announcement State
    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");
    const [isPostingNews, setIsPostingNews] = useState(false);
    const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
    
    // Announcement Handlers
    const handlePostAnnouncement = async () => {
        if (!newsTitle.trim() || !newsContent.trim()) return;
        setIsPostingNews(true);
        try {
            if (editingNewsId) {
                const updated = await updateAnnouncement(editingNewsId, newsTitle, newsContent);
                setAnnouncements(announcements.map(a => a.id === editingNewsId ? {...a, title: updated.title, content: updated.content, created_at_formatted: updated.created_at_formatted} : a));
                toast({ title: "Announcement updated successfully" });
            } else {
                const newAnn = await createAnnouncement(course.id, newsTitle, newsContent);
                setAnnouncements([newAnn, ...announcements]);
                toast({ title: "Announcement posted successfully" });
            }
            setNewsTitle("");
            setNewsContent("");
            setEditingNewsId(null);
        } catch (error) {
            console.error("Failed to post/update announcement:", error);
            toast({ title: "Failed to process announcement", variant: "destructive" });
        } finally {
            setIsPostingNews(false);
        }
    };

    const handleDeleteAnnouncement = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await deleteAnnouncement(id);
            setAnnouncements(announcements.filter(a => a.id !== id));
            toast({ title: "Announcement deleted" });
        } catch (error) {
            toast({ title: "Failed to delete announcement", variant: "destructive" });
        }
    };
    
    const startEditAnnouncement = (ann: any) => {
        setNewsTitle(ann.title);
        setNewsContent(ann.content);
        setEditingNewsId(ann.id);
    };
    
    const cancelEditAnnouncement = () => {
        setNewsTitle("");
        setNewsContent("");
        setEditingNewsId(null);
    };

    const handleAddQuestion = async () => {
        if (!qstTitle.trim() || !qstContent.trim()) return;
        setIsAsking(true);
        try {
            await createQuestion({
                course_id: course.id,
                lecture_id: currentLecture.id,
                title: qstTitle,
                content: qstContent
            });
            
            // Re-fetch immediately
            const qs = await getCourseQuestions(course.id);
            setLiveQuestions(qs);
            
            setQstTitle("");
            setQstContent("");
            toast({ title: "Question posted successfully" });
        } catch (error) {
            toast({ title: "Failed to post question", variant: "destructive" });
        } finally {
            setIsAsking(false);
        }
    };

    const handleAddReview = async () => {
        if (!reviewComment.trim()) return;
        setIsReviewing(true);
        try {
            await createReview({
                course_id: course.id,
                rating: reviewRating,
                comment: reviewComment
            });
            
            // Re-fetch immediately
            const revs = await getCourseReviews(course.id);
            setLiveReviews(revs);
            
            setReviewComment("");
            toast({ title: "Review posted successfully" });
        } catch (error) {
            toast({ title: "Failed to post review", variant: "destructive" });
        } finally {
            setIsReviewing(false);
        }
    };

    const handleAddAnswer = async (questionId: number) => {
        if (!replyContent.trim()) return;
        try {
            await createAnswer({
                question_id: questionId,
                answer: replyContent
            });
            
            // Re-fetch immediately
            if (course?.id) {
                const qs = await getCourseQuestions(course.id);
                setLiveQuestions(qs);
            }
            
            setReplyContent("");
            toast({ title: "Answer posted successfully" });
        } catch (error) {
            toast({ title: "Failed to post answer", variant: "destructive" });
        }
    };

    return (
        <div className="h-full bg-gray-900 border-t border-gray-800 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b border-gray-800 px-4 md:px-8">
                    <TabsList className="bg-transparent h-14 w-full justify-start gap-4">
                        <TabsTrigger 
                            value="overview" 
                            className="text-gray-400 hover:text-gray-200 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 pb-3 pt-3 transition-colors"
                        >
                            <Info className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger 
                            value="notes" 
                            className="text-gray-400 hover:text-gray-200 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 pb-3 pt-3 transition-colors"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Notes ({notes.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="qa" 
                            className="text-gray-400 hover:text-gray-200 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 pb-3 pt-3 transition-colors"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Q&A
                        </TabsTrigger>
                        <TabsTrigger 
                            value="reviews" 
                            className="text-gray-400 hover:text-gray-200 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 pb-3 pt-3 transition-colors"
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Reviews
                        </TabsTrigger>
                        <TabsTrigger 
                            value="announcements" 
                            className="text-gray-400 hover:text-gray-200 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-0 pb-3 pt-3 transition-colors"
                        >
                            <Bell className="h-4 w-4 mr-2" />
                            News
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
    {/* Overview Tab */}
                    <TabsContent value="overview" className="w-full m-0 p-0">
                        <div className="w-full">
                            <div className="p-4 md:p-8 max-w-4xl">
                                <h2 className="text-2xl font-bold mb-4 text-white">About this course</h2>
                                <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                                    {course.description || "No description available."}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-gray-800">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Instructor</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-lg">
                                                {course.instructor?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{course.instructor}</p>
                                                <p className="text-xs text-gray-400">Instructor</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                         <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Stats</h3>
                                         <div className="flex gap-4 text-sm text-gray-300">
                                             <div className="flex items-center gap-1">
                                                 <Star className="h-4 w-4 text-yellow-500" />
                                                 {course.average_rating} Rating
                                             </div>
                                             <div>
                                                 {course.total_reviews} Reviews
                                             </div>
                                         </div>
                                    </div>
                                </div>
                                
                                {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
                                    <div className="py-6 border-t border-gray-800">
                                        <h3 className="text-xl font-bold mb-4 text-white">What you'll learn</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {course.what_you_will_learn.map((item: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-gray-300">
                                                    <span className="text-green-500">✓</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="w-full m-0 p-0">
                        <div className="h-[600px] w-full">
                        <NotesTab 
                            notes={notes}
                            currentLecture={currentLecture}
                            currentTime={currentTime}
                            onSeek={onSeek}
                            onNoteAdded={onNoteAdded}
                        />
                        </div>
                    </TabsContent>

                    {/* Q&A Tab */}
                    <TabsContent value="qa" className="w-full m-0 p-0">
                        <div className="flex flex-col w-full">
                            <div className="p-4 border-b border-gray-800 bg-gray-900 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-400">Ask a Question</h3>
                                <Input 
                                    placeholder="Title (e.g., How do I...)" 
                                    value={qstTitle}
                                    onChange={(e) => setQstTitle(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                />
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="What's on your mind?" 
                                        value={qstContent}
                                        onChange={(e) => setQstContent(e.target.value)}
                                        className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    />
                                    <Button 
                                        onClick={handleAddQuestion}
                                        disabled={isAsking || !qstTitle || !qstContent}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isAsking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="p-4 md:p-8 max-w-4xl">
                                    {allQuestions.length > 0 ? (
                                        <div className="space-y-4">
                                            {allQuestions.map((q: any) => (
                                                <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                    <div 
                                                        className="cursor-pointer"
                                                        onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}
                                                    >
                                                        <div className="font-bold text-white mb-1 hover:text-purple-400 transition-colors">{q.title}</div>
                                                        <p className="text-gray-400 text-sm mb-2">{q.question}</p>
                                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                                            <div className="flex gap-2">
                                                                <span>by {q.user_name || q.user}</span>
                                                                <span>•</span>
                                                                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MessageCircle className="h-3 w-3" />
                                                                <span>{q.answers?.length || q.answer_count || 0} answers</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Answers Section */}
                                                    {expandedQuestionId === q.id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-700 pl-4">
                                                            {/* Existing Answers */}
                                                            {q.answers && q.answers.map((ans: any) => (
                                                                <div key={ans.id} className="mb-3 text-sm">
                                                                    <div className="font-bold text-gray-300 text-xs mb-1">
                                                                        {ans.user_name || ans.user} 
                                                                        {ans.is_instructor_answer && <span className="ml-2 text-purple-400 font-normal">(Instructor)</span>}
                                                                    </div>
                                                                    <div className="text-gray-400">{ans.answer}</div>
                                                                </div>
                                                            ))}

                                                            {/* Reply Input */}
                                                            <div className="mt-4 flex gap-2">
                                                                <Input 
                                                                    size={30}
                                                                    placeholder="Write an answer..." 
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                    className="bg-gray-900 border-gray-600 text-white text-sm h-9"
                                                                />
                                                                <Button 
                                                                    size="sm"
                                                                    onClick={() => handleAddAnswer(q.id)}
                                                                    disabled={!replyContent.trim()}
                                                                    className="bg-purple-600 hover:bg-purple-700 h-9"
                                                                >
                                                                    <Send className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 mt-10">
                                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            <p>No questions yet. Be the first to ask!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    
                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="w-full m-0 p-0">
                        <div className="flex flex-col w-full">
                            <div className="p-4 border-b border-gray-800 bg-gray-900 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-400">Write a Review</h3>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`h-5 w-5 cursor-pointer ${star <= reviewRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                                onClick={() => setReviewRating(star)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Share your experience..." 
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    />
                                    <Button 
                                        onClick={handleAddReview}
                                        disabled={isReviewing || !reviewComment}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isReviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="p-4 md:p-8 max-w-4xl">
                                    {allReviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {allReviews.map((r: any) => (
                                                <div key={r.id} className="bg-gray-800 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold">
                                                            {(r.student_name || r.user || "U")[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-white text-sm font-bold">{r.student_name || r.user || "User"}</div>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">{r.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 mt-10">
                                            <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            <p>No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                    {/* Announcements Tab */}
                    <TabsContent value="announcements" className="w-full m-0 p-0">
                        <div className="flex flex-col w-full">
                            {isInstructor && (
                                <div className="p-4 border-b border-gray-800 bg-gray-900 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-400">
                                            {editingNewsId ? "Edit Announcement" : "Post a New Announcement"}
                                        </h3>
                                        {editingNewsId && (
                                            <Button variant="ghost" size="sm" onClick={cancelEditAnnouncement} className="text-gray-400 hover:text-white h-8">
                                                <X className="h-4 w-4 mr-2" /> Cancel Edit
                                            </Button>
                                        )}
                                    </div>
                                    <Input 
                                        placeholder="Announcement Title" 
                                        value={newsTitle}
                                        onChange={(e) => setNewsTitle(e.target.value)}
                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    />
                                    <div className="flex gap-2">
                                        <Textarea 
                                            placeholder="What would you like to share with your students?" 
                                            value={newsContent}
                                            onChange={(e) => setNewsContent(e.target.value)}
                                            className="flex-1 min-h-[80px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                                        />
                                        <div className="flex items-end">
                                            <Button 
                                                onClick={handlePostAnnouncement}
                                                disabled={isPostingNews || !newsTitle || !newsContent}
                                                className="bg-purple-600 hover:bg-purple-700 h-10 px-6"
                                            >
                                                {isPostingNews ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingNewsId ? "Update" : "Post")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="w-full">
                                <div className="p-4 md:p-8 max-w-4xl">
                                    {!isInstructor && <h2 className="text-xl font-bold mb-6 text-white">Instructor Announcements</h2>}
                                    
                                    {announcements.length > 0 ? (
                                        <div className="space-y-6">
                                            {announcements.map((ann: any) => (
                                                <div key={ann.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                                                                <Bell className="h-5 w-5 text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{ann.instructor_name || "Instructor"}</div>
                                                                <div className="text-xs text-gray-400">Posted on {ann.created_at_formatted || new Date(ann.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        {isInstructor && (
                                                            <div className="flex items-center gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => startEditAnnouncement(ann)}
                                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-2">{ann.title}</h3>
                                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{ann.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-12">
                                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            <p>No announcements from the instructor yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

