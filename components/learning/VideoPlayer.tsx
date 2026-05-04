"use client";

import { useEffect, useRef, useState } from "react";
import { PlayCircle, CheckCircle, Loader2 } from "lucide-react";
import { updateLectureProgress, API_URL } from "@/lib/api";

interface VideoPlayerProps {
    lecture: any;
    onCompleted: () => void;
    onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ lecture, onCompleted, onTimeUpdate }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    // Reset when lecture changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [lecture.id]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            
            // Report time to parent (throttled/simple)
            if (onTimeUpdate) {
                onTimeUpdate(current);
            }

            const duration = videoRef.current.duration;
            if (duration > 0) {
                const percent = (current / duration) * 100;
                setProgress(percent);
            }
        }
    };

    const handleEnded = async () => {
        if (!lecture.completed && !isUpdating) {
            setIsUpdating(true);
            try {
                await updateLectureProgress(lecture.id, true);
                onCompleted();
            } catch (error) {
                console.error("Failed to update progress", error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    // Helper to get video source
    const getVideoSrc = () => {
        if (!lecture) return null;
        
        console.log("DEBUG: VideoPlayer lecture:", lecture);

        // 1. YouTube
        if (lecture.video_source === 'youtube' && lecture.video_url) {
            // Return embed URL
            return getYouTubeEmbedUrl(lecture.video_url);
        }

        // 2. Upload / Direct File
        const fileUrl = lecture.video_file || lecture.video_url; // generic fallback
        console.log("DEBUG: fileUrl raw:", fileUrl);
        
        if (!fileUrl) return null;

        // Ensure absolute URL if likely relative
        if (fileUrl.startsWith('http') || fileUrl.startsWith('blob:')) {
            console.log("DEBUG: Returning absolute url:", fileUrl);
            return fileUrl;
        }
        
        // Remove /api suffix if present in API_URL for media construction?
        // Usually API_URL is http://localhost:8000/api
        // Media is http://localhost:8000/media/...
        // Base URL extraction:
        const baseUrl = API_URL.replace('/api', '');
        const fullUrl = `${baseUrl}${fileUrl}`;
        console.log("DEBUG: Constructed full url:", fullUrl);
        return fullUrl;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        try {
            // Handle various formats: https://youtu.be/ID, https://youtube.com/watch?v=ID, etc.
            let videoId = '';
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('/embed/')) {
                return url;
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    if (!lecture) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500 bg-black aspect-video">
                <div className="text-center">
                    <p>Select a lecture to start</p>
                </div>
            </div>
        );
    }

    const videoSrc = getVideoSrc();
    const isYouTube = lecture.video_source === 'youtube';

    return (
        <div className="w-full bg-black shadow-2xl relative">
            <div className="aspect-video w-full bg-black relative">
                {videoSrc ? (
                    isYouTube ? (
                        <iframe 
                            src={videoSrc}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onLoad={() => {
                                // YouTube Iframe API needed for tracking completion accurately.
                                // For MVP, we can't easily track ended event without the API script.
                                // We can provide a button "Mark Complete" which user can use.
                                // Or use 'react-youtube' package later.
                            }}
                        />
                    ) : (
                        <video 
                            ref={videoRef}
                            key={lecture.id}
                            src={videoSrc} 
                            controls 
                            className="h-full w-full object-contain"
                            autoPlay
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleEnded}
                            controlsList="nodownload" 
                        />
                    )
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <div className="text-center">
                            <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No video available for this lecture</p>
                            {/* Debug info */}
                            <p className="text-xs text-gray-600 mt-2">Source: {lecture.video_source}</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Overlay for updating state */}
            {isUpdating && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving progress...</span>
                </div>
            )}
        </div>
    );
}
