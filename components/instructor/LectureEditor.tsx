"use client";

import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, CheckCircle2, FileUp } from "lucide-react";
import { createLecture, updateLecture, Lecture, LectureType, VideoSource, LectureStatus, previewQuizFromDoc } from "@/lib/api";
import { toast } from "sonner";

interface LectureEditorProps {
    isOpen: boolean;
    onClose: () => void;
    sectionId: number;
    initialOrder?: number;
    lecture?: Lecture; // If provided, edit mode
    onSaved: (lecture: Lecture) => void;
}

export default function LectureEditor({ 
    isOpen, 
    onClose, 
    sectionId,
    initialOrder = 0,
    lecture, 
    onSaved 
}: LectureEditorProps) {
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [type, setType] = useState<LectureType>("video");
    const [status, setStatus] = useState<LectureStatus>("draft");
    const [publishedAt, setPublishedAt] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    
    // Video specific
    const [videoSource, setVideoSource] = useState<VideoSource>("upload");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [duration, setDuration] = useState(0); // in seconds
    
    // Article specific
    const [articleContent, setArticleContent] = useState("");
    const [summary, setSummary] = useState(""); // content field
    
    // File specific
    const [resourceFile, setResourceFile] = useState<File | null>(null);

    // Quiz specific
    const [quizFile, setQuizFile] = useState<File | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizPreviewData, setQuizPreviewData] = useState<any[] | null>(null);

    // Preview State
    const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setPreviewObjectUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewObjectUrl(null);
        }
    }, [videoFile]);

    // Reset or Populate form
    useEffect(() => {
        if (isOpen) {
            if (lecture) {
                setTitle(lecture.title);
                setType(lecture.lecture_type);
                setStatus(lecture.status);
                setIsPreview(lecture.is_preview);
                setVideoSource(lecture.video_source || "upload");
                setVideoUrl(lecture.video_url || "");
                setVideoFile(null); // Reset file on edit
                setDuration(lecture.duration || 0);
                setArticleContent(lecture.article_content || "");
                setSummary(lecture.content || "");
                
                // Format datetime for input (YYYY-MM-DDThh:mm)
                if (lecture.published_at) {
                    const date = new Date(lecture.published_at);
                    const formatted = date.toISOString().slice(0, 16); // "2023-10-01T12:00"
                    setPublishedAt(formatted);
                } else {
                    setPublishedAt("");
                }
            } else {
                // Reset for new lecture
                setTitle("");
                setType("video");
                setStatus("draft");
                setPublishedAt("");
                setIsPreview(false);
                setVideoSource("upload");
                setVideoUrl("");
                setVideoFile(null);
                setDuration(0);
                setArticleContent("");
                setSummary("");
                setResourceFile(null);
                setQuizFile(null);
                setQuizPreviewData(null);
            }
        }
    }, [isOpen, lecture]);

    // --- Quiz: Generate Preview ---
    const handleGenerateQuizPreview = async () => {
        if (!quizFile) return;
        setIsGeneratingQuiz(true);
        try {
            const data = await previewQuizFromDoc(quizFile);
            setQuizPreviewData(data.questions);
            toast.success(`AI generated ${data.questions.length} questions. Review them below.`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to generate quiz. Check your file.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleQuizFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
            ];
            if (!validTypes.includes(selectedFile.type)) {
                toast.error("Please upload a PDF or Word document (.pdf, .docx).");
                return;
            }
            setQuizFile(selectedFile);
            setQuizPreviewData(null); // Reset preview when new file selected
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        // For quiz type, require preview data
        if (type === "quiz" && (!quizPreviewData || quizPreviewData.length === 0)) {
            toast.error("Please generate and preview the quiz before saving.");
            return;
        }

        setLoading(true);
        try {
            // Check if we need FormData (for file upload)
            const isVideoUpload = type === "video" && videoSource === "upload" && videoFile;
            const isFileUpload = type === "file" && resourceFile;
            const useFormData = isVideoUpload || isFileUpload;
            
            // Determine order
            const order = lecture ? lecture.order : initialOrder;

            let payload: any;
            
            if (useFormData) {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("order", String(order));
                formData.append("lecture_type", type);
                formData.append("status", status);
                
                if (status === 'scheduled' && publishedAt) {
                    formData.append("published_at", new Date(publishedAt).toISOString());
                }
                
                formData.append("is_preview", String(isPreview)); // "true"/"false"
                formData.append("content", summary);
                formData.append("section", String(sectionId));
                
                formData.append("video_source", "upload"); // Always 'upload' for uploaded files
                
                if (type === "video" && videoFile) {
                    formData.append("video_file", videoFile);
                    formData.append("duration", String(duration));
                } else if (type === "file" && resourceFile) {
                    formData.append("video_file", resourceFile); // Backend currently uses video_file field for all lecture types 
                }
                
                payload = formData;
            } else {
                // Standard JSON
                payload = {
                    title,
                    order,
                    lecture_type: type,
                    status,
                    is_preview: isPreview,
                    content: summary, 
                    section: sectionId,
                    video_source: videoSource
                };
                
                 if (status === 'scheduled' && publishedAt) {
                    payload.published_at = new Date(publishedAt).toISOString();
                }

                if (type === "video") {
                    payload.video_source = videoSource;
                    payload.video_url = videoUrl;
                    payload.duration = duration;
                } else if (type === "article") {
                    payload.article_content = articleContent;
                    const wordCount = articleContent.split(/\s+/).length;
                    payload.duration = Math.ceil((wordCount / 200) * 60); 
                } else if (type === "quiz" && quizPreviewData) {
                    // Attach quiz data as JSON string for the backend to save
                    payload.quiz_data = JSON.stringify(quizPreviewData);
                }
            }

            let result;
            if (lecture) {
                result = await updateLecture(lecture.id, payload);
                toast.success("Lecture updated successfully");
            } else {
                result = await createLecture(payload);
                toast.success("Lecture created successfully");
            }
            
            onSaved(result);
            onClose();
        } catch (error: any) {
            console.error("Failed to save lecture", error);
            if (error.response && error.response.data) {
                toast.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                toast.error("Failed to save lecture");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);

            // Auto-detect duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const detectedDuration = Math.round(video.duration);
                setDuration(detectedDuration);
                toast.success(`Broad detected duration: ${detectedDuration}s`);
            }
            video.onerror = () => {
                 toast.warning("Could not detect video duration automatically.");
            }
            video.src = URL.createObjectURL(file);
        }
    };

    const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResourceFile(e.target.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lecture ? "Edit Lecture" : "Add New Lecture"}</DialogTitle>
                    <DialogDescription>
                        {lecture ? "Make changes to your lecture here." : "Add a new lecture to this section."}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="e.g. Introduction to React"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(v: LectureType) => { setType(v); setQuizPreviewData(null); setQuizFile(null); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="article">Article</SelectItem>
                                    <SelectItem value="file">File / Resource</SelectItem>
                                    <SelectItem value="quiz">
                                        <span className="flex items-center gap-1">
                                            <Sparkles className="h-3 w-3 text-purple-500" /> Quiz (AI)
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v: LectureStatus) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {status === 'scheduled' && (
                        <div className="grid gap-2">
                            <Label>Publish Date & Time</Label>
                            <Input 
                                type="datetime-local" 
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Content Fields based on Type */}
                    {type === "video" && (
                        <div className="space-y-4 border p-4 rounded-md bg-gray-50 dark:bg-gray-900/50">
                            <div className="grid gap-2">
                                <Label>Video Source</Label>
                                <Select value={videoSource} onValueChange={(v: VideoSource) => setVideoSource(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upload">Direct Upload</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="vimeo">Vimeo</SelectItem>
                                        <SelectItem value="external">External Link (MP4)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {videoSource === 'upload' ? (
                                <div className="grid gap-2">
                                    <Label>Video File</Label>
                                    <Input 
                                        key="video-file-input"
                                        type="file" 
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                    {lecture?.video_file && !videoFile && (
                                        <p className="text-sm text-green-600">Current file: {lecture.video_file}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label>Video URL</Label>
                                    <Input 
                                        key="video-url-input"
                                        value={videoUrl} 
                                        onChange={(e) => setVideoUrl(e.target.value)} 
                                        placeholder="https://"
                                    />
                                </div>
                            )}
                            
                            <div className="grid gap-2">
                                <Label>Duration (seconds)</Label>
                                <Input 
                                    type="number" 
                                    value={duration} 
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)} 
                                />
                                <p className="text-xs text-muted-foreground">Auto-detected on file select. Can be manually adjusted.</p>
                            </div>

                            {/* Preview Player */}
                            <div className="mt-2">
                                <Label>Preview</Label>
                                <div className="mt-1 aspect-video bg-black rounded overflow-hidden flex items-center justify-center relative">
                                    {videoSource === 'upload' ? (
                                        (previewObjectUrl || lecture?.video_file) ? (
                                            <video 
                                                src={previewObjectUrl || lecture?.video_file} 
                                                controls 
                                                className="w-full h-full" 
                                            />
                                        ) : <span className="text-gray-500">No video selected</span>
                                    ) : videoSource === 'youtube' && videoUrl ? (
                                        <iframe 
                                            src={videoUrl.replace('watch?v=', 'embed/')} 
                                            className="w-full h-full" 
                                            allowFullScreen 
                                        />
                                    ) : (
                                        <span className="text-gray-500">Preview not available for this source</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {type === "article" && (
                        <div className="space-y-4 border p-4 rounded-md bg-gray-50 dark:bg-gray-900/50">
                            <div className="grid gap-2">
                                <Label>Article Content (Markdown)</Label>
                                <Textarea 
                                    value={articleContent} 
                                    onChange={(e) => setArticleContent(e.target.value)} 
                                    className="min-h-[300px] font-mono"
                                    placeholder="# Heading\n\nWrite your content here..."
                                />
                            </div>
                        </div>
                    )}
                    
                    {type === "file" && (
                        <div className="space-y-4 border p-4 rounded-md bg-gray-50 dark:bg-gray-900/50">
                            <div className="grid gap-2">
                                <Label>Select Resource File</Label>
                                <Input 
                                    key="resource-file-input"
                                    type="file" 
                                    onChange={handleResourceFileChange}
                                />
                                {lecture?.video_file && !resourceFile && (
                                    <p className="text-sm text-green-600">Current file: {lecture.video_file}</p>
                                )}
                                <p className="text-xs text-muted-foreground">Upload PDFs, ZIPs, Docs, etc. to share with students.</p>
                            </div>
                        </div>
                    )}

                    {/* ===== QUIZ TYPE ===== */}
                    {type === "quiz" && (
                        <div className="space-y-4 border p-4 rounded-md bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                <h4 className="font-semibold text-purple-700 dark:text-purple-300">AI Quiz Generator</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Upload a PDF or Word document. Our AI will read it and generate 10 multiple-choice questions for you to review before saving.
                            </p>

                            {/* File Upload Area */}
                            <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-4 flex items-center gap-4 bg-white dark:bg-gray-900/50 relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleQuizFileChange}
                                    disabled={isGeneratingQuiz}
                                />
                                <FileUp className="h-8 w-8 text-purple-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    {quizFile ? (
                                        <>
                                            <p className="text-sm font-medium truncate">{quizFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{(quizFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium">Click to upload document</p>
                                            <p className="text-xs text-muted-foreground">Supports .pdf and .docx</p>
                                        </>
                                    )}
                                </div>
                                {quizFile && !quizPreviewData && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 relative z-10"
                                        onClick={(e) => { e.stopPropagation(); handleGenerateQuizPreview(); }}
                                        disabled={isGeneratingQuiz}
                                    >
                                        {isGeneratingQuiz ? (
                                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Sparkles className="mr-1 h-4 w-4" /> Generate Preview</>
                                        )}
                                    </Button>
                                )}
                                {quizPreviewData && (
                                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                )}
                            </div>

                            {/* Quiz Preview */}
                            {quizPreviewData && quizPreviewData.length > 0 && (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-semibold text-sm text-green-700 dark:text-green-400">
                                            ✓ {quizPreviewData.length} Questions Generated — Review Below
                                        </h5>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => { setQuizPreviewData(null); setQuizFile(null); }}
                                        >
                                            Re-generate
                                        </Button>
                                    </div>
                                    {quizPreviewData.map((q: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-white dark:bg-gray-900 border rounded-md text-sm">
                                            <p className="font-medium mb-2">
                                                <span className="text-purple-600 mr-1">Q{idx + 1}.</span> {q.question}
                                            </p>
                                            <ul className="space-y-1 ml-4">
                                                {q.choices.map((choice: string, cIdx: number) => {
                                                    const isCorrect = choice.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                                                    return (
                                                        <li key={cIdx} className={`flex items-center gap-2 ${isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-3.5" />}
                                                            {choice}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {q.explanation && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">💡 {q.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="grid gap-2">
                        <Label>Short Summary (Optional)</Label>
                        <Textarea 
                            value={summary} 
                            onChange={(e) => setSummary(e.target.value)} 
                            placeholder="Brief description of this lecture..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                         <Switch 
                            id="is-preview" 
                            checked={isPreview}
                            onCheckedChange={setIsPreview}
                        />
                        <Label htmlFor="is-preview">Free Preview</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading || (type === 'quiz' && (!quizPreviewData || quizPreviewData.length === 0))}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {type === 'quiz' ? 'Save Quiz' : 'Save Lecture'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
