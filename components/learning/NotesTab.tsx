"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveNote } from "@/lib/api";
import { Loader2, Plus, Edit2 } from "lucide-react";

interface Note {
    id: number;
    lecture_id: number;
    content: string;
    timestamp: number;
    created_at: string;
}

interface NotesTabProps {
    notes: Note[];
    currentLecture: any;
    currentTime: number; // Current playback time in seconds
    onSeek: (time: number) => void;
    onNoteAdded: (note: Note) => void;
}

export function NotesTab({ notes, currentLecture, currentTime, onSeek, onNoteAdded }: NotesTabProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filter notes for current lecture
    const lectureNotes = notes
        .filter(n => n.lecture_id === currentLecture?.id)
        .sort((a, b) => a.timestamp - b.timestamp);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddNote = async () => {
        if (!content.trim() || !currentLecture) return;
        
        setIsSubmitting(true);
        try {
            const newNote = await saveNote({
                lecture_id: currentLecture.id,
                content: content,
                timestamp: Math.floor(currentTime)
            });
            
            // Backend returns simplified note, we might need to enrich it or just pass it
            // Assuming backend returns { id, content, timestamp }
            onNoteAdded({
                ...newNote,
                lecture_id: currentLecture.id,
                created_at: new Date().toISOString()
            });
            
            setContent("");
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Input Area */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-400">Add a note at {formatTime(currentTime)}</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your note here..."
                        className="flex-1 bg-gray-800 border-none rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button 
                        onClick={handleAddNote} 
                        disabled={isSubmitting || !content.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            
            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {lectureNotes.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        No notes for this lecture yet.
                        <br />
                        Start typing above to add one!
                    </div>
                ) : (
                    lectureNotes.map((note) => (
                        <div key={note.id} className="bg-gray-800 rounded-lg p-3 group relative hover:bg-gray-700 transition-colors">
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => onSeek(note.timestamp)}
                                    className="bg-gray-900 text-purple-400 text-xs font-mono px-2 py-1 rounded hover:bg-gray-600 transition-colors min-w-[3rem]"
                                >
                                    {formatTime(note.timestamp)}
                                </button>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-200">{note.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
