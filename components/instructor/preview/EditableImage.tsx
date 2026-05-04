"use client";

import { usePreviewEdit } from "@/context/PreviewEditContext";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateCourse } from "@/lib/api"; // Need specific update for file upload

interface EditableImageProps {
    currentImage: string;
    onSave: (file: File) => Promise<string | void>;
    className?: string;
    aspectRatio?: string;
}

export default function EditableImage({ currentImage, onSave, className, aspectRatio = "video" }: EditableImageProps) {
    const { isEditMode, course, setCourse } = usePreviewEdit();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Helper to trigger file input
    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            // Need a special API call for FormData if not using the context generic saver
            // Or assume onSave handles it.
            // Since context uses JSON body by default in saveCourseField, file upload needs specific handling.
            
            // For now, let's try to use the onSave prop passed from parent which should wrap the logic.
            const newUrl = await onSave(file);
            
            // If onSave returns a string (new URL), we might want to update local state immediately
            // But context update is better.
            toast({ title: "Success", description: "Image updated." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            // clear input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!isEditMode) {
        return (
            <div className={`relative w-full ${aspectRatio === "video" ? "aspect-video" : "aspect-square"} ${className}`}>
                 <Image
                    src={currentImage || "/placeholder.jpg"}
                    alt="Course Thumbnail"
                    fill
                    className="object-cover rounded-md"
                />
            </div>
        );
    }

    return (
        <div className={`relative w-full ${aspectRatio === "video" ? "aspect-video" : "aspect-square"} group ${className}`}>
            <Image
                src={currentImage || "/placeholder.jpg"}
                alt="Course Thumbnail (Edit Mode)"
                fill
                className={`object-cover rounded-md transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-75'}`}
            />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleTriggerUpload}
                    disabled={isUploading}
                    className="flex gap-2"
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Change Image
                </Button>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
}
