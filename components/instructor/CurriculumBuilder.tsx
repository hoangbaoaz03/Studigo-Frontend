"use client";

import { useState, useEffect } from "react";
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, GripVertical, FileText, Video, File, Sparkles } from "lucide-react";
import { Section, Lecture, createSection, updateSection, deleteSection, deleteLecture } from "@/lib/api";
import { toast } from "sonner";
import LectureEditor from "./LectureEditor";
import { Input } from "@/components/ui/input";

interface CurriculumBuilderProps {
    courseId: number;
    initialSections: Section[];
}

export default function CurriculumBuilder({ courseId, initialSections }: CurriculumBuilderProps) {
    const [sections, setSections] = useState<Section[]>(initialSections);

    // Sync from parent if prop updates (e.g. after refresh)
    useEffect(() => {
        if (initialSections) {
             setSections(initialSections);
        }
    }, [initialSections]);

    const [loading, setLoading] = useState(false);
    
    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
    const [editingLecture, setEditingLecture] = useState<Lecture | undefined>(undefined);
    
    // New Section State
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        setLoading(true);
        try {
            // Calculate next order safely
            const maxOrder = sections.reduce((max, section) => Math.max(max, section.order), -1);
            const nextOrder = maxOrder + 1;

            const newSection = await createSection({ 
                course: courseId, 
                title: newSectionTitle,
                order: nextOrder
            });
            setSections([...sections, { ...newSection, lectures: [] }]);
            setNewSectionTitle("");
            setIsAddingSection(false);
            toast.success("Section added");
        } catch (error) {
            toast.error("Failed to add section");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm("Are you sure? This will delete all lectures in this section.")) return;
        try {
            await deleteSection(id);
            setSections(sections.filter(s => s.id !== id));
            toast.success("Section deleted");
        } catch (error) {
            toast.error("Failed to delete section");
        }
    };

    const handleDeleteLecture = async (sectionId: number, lectureId: number) => {
        if (!confirm("Delete this lecture?")) return;
        try {
            await deleteLecture(lectureId);
            setSections(sections.map(s => {
                if (s.id === sectionId) {
                    return { ...s, lectures: s.lectures.filter(l => l.id !== lectureId) };
                }
                return s;
            }));
            toast.success("Lecture deleted");
        } catch (error) {
            toast.error("Failed to delete lecture");
        }
    };

    const openAddLecture = (sectionId: number) => {
        setActiveSectionId(sectionId);
        setEditingLecture(undefined);
        setEditorOpen(true);
    };

    const openEditLecture = (sectionId: number, lecture: Lecture) => {
        setActiveSectionId(sectionId);
        setEditingLecture(lecture);
        setEditorOpen(true);
    };

    const handleLectureSaved = (savedLecture: Lecture) => {
        setSections(sections.map(s => {
            if (s.id === activeSectionId) {
                const exists = s.lectures.find(l => l.id === savedLecture.id);
                if (exists) {
                    return { 
                        ...s, 
                        lectures: s.lectures.map(l => l.id === savedLecture.id ? savedLecture : l) 
                    };
                } else {
                    return { ...s, lectures: [...s.lectures, savedLecture] };
                }
            }
            return s;
        }));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'article': return <FileText className="h-4 w-4" />;
            case 'quiz': return <Sparkles className="h-4 w-4 text-purple-500" />;
            default: return <File className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Curriculum</h3>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {sections.map((section, index) => (
                    <AccordionItem key={section.id} value={`section-${section.id}`} className="border rounded-md px-4 bg-white dark:bg-gray-950">
                        <div className="flex items-center justify-between py-2">
                             <div className="flex items-center gap-2 flex-1">
                                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                <span className="font-medium">Section {index + 1}: {section.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openAddLecture(section.id)}>
                                    <Plus className="h-4 w-4 mr-1" /> Lecture
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteSection(section.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <AccordionTrigger className="w-8 p-0" />
                            </div>
                        </div>

                        <AccordionContent className="pl-8 pr-4 py-2 space-y-2">
                            {section.lectures.length === 0 && (
                                <div className="text-sm text-gray-500 italic py-2">No lectures yet.</div>
                            )}
                            {section.lectures.map((lecture) => (
                                <div key={lecture.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 group">
                                    <div className="flex items-center gap-3">
                                        {getIcon(lecture.lecture_type)}
                                        <span className="font-medium">{lecture.title}</span>
                                        {lecture.status === 'draft' && (
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Draft</span>
                                        )}
                                        {lecture.is_preview && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Preview</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => openEditLecture(section.id, lecture)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteLecture(section.id, lecture.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2">
                                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => openAddLecture(section.id)}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Lecture
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {isAddingSection ? (
                <div className="flex items-center gap-2 p-4 border rounded-md">
                    <Input 
                        value={newSectionTitle} 
                        onChange={(e) => setNewSectionTitle(e.target.value)} 
                        placeholder="Enter section title..." 
                        className="flex-1"
                        autoFocus
                    />
                    <Button onClick={handleAddSection} disabled={loading}>Add</Button>
                    <Button variant="ghost" onClick={() => setIsAddingSection(false)}>Cancel</Button>
                </div>
            ) : (
                <Button onClick={() => setIsAddingSection(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Section
                </Button>
            )}

            {activeSectionId && (
                <LectureEditor 
                    isOpen={editorOpen}
                    onClose={() => setEditorOpen(false)}
                    sectionId={activeSectionId}
                    initialOrder={sections.find(s => s.id === activeSectionId)?.lectures.length || 0}
                    lecture={editingLecture}
                    onSaved={handleLectureSaved}
                />
            )}
        </div>
    );
}
