"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileUp, Sparkles } from "lucide-react";
import { generateQuizFromDoc } from "@/lib/api";

interface QuizGeneratorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sectionId: number;
    onSuccess: () => void;
}

export function QuizGeneratorModal({ open, onOpenChange, sectionId, onSuccess }: QuizGeneratorModalProps) {
    const [title, setTitle] = useState("Auto-Generated Quiz");
    const [file, setFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
            
            if (!validTypes.includes(selectedFile.type)) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a PDF or Word document.",
                    variant: "destructive"
                });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleGenerate = async () => {
        if (!file || !title.trim()) return;

        setIsGenerating(true);
        try {
            await generateQuizFromDoc(sectionId, title, file);
            toast({
                title: "Quiz generated successfully!",
                description: "The AI has created 10 questions from your document."
            });
            onSuccess();
            onOpenChange(false);
            setFile(null);
            setTitle("Auto-Generated Quiz");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Generation Failed",
                description: error.response?.data?.error || "Failed to generate quiz. Please check your file.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Generate Quiz with AI
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Upload a PDF or Word document containing study material. Our AI will automatically read it and generate a 10-question multiple-choice quiz.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quiz-title">Quiz Title</Label>
                        <Input 
                            id="quiz-title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Source Document (PDF or DOCX)</Label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-800/50 relative hover:bg-gray-800 transition-colors">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                disabled={isGenerating}
                            />
                            {file ? (
                                <div className="text-center">
                                    <FileUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-center pointer-events-none">
                                    <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-300">Click or drag file to upload</p>
                                    <p className="text-xs text-gray-500 mt-1">Supports .pdf and .docx</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)} 
                        disabled={isGenerating}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleGenerate} 
                        disabled={!file || !title.trim() || isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing AI...
                            </>
                        ) : (
                            "Generate Quiz"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
