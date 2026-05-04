"use client";

import { Lecture } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

interface ArticleViewerProps {
    lecture: Lecture;
    onCompleted: () => void;
}

export function ArticleViewer({ lecture }: ArticleViewerProps) {
    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-lg h-full min-h-[500px] flex flex-col relative overflow-hidden">
            <ScrollArea className="flex-1 p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">{lecture.title}</h1>
                    
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-ul:text-gray-300 prose-ol:text-gray-300 prose-strong:text-white text-gray-300">
                        <ReactMarkdown>
                            {lecture.article_content || lecture.content || "No content available."}
                        </ReactMarkdown>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
