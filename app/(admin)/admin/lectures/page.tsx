"use client";

import { useEffect, useState } from "react";
import { getAdminLectures, updateLectureNote } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Loader2, FileText, Video, HelpCircle, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminLecturesPage() {
    const [lectures, setLectures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Note editing state
    const [editingNote, setEditingNote] = useState<any>(null);
    const [noteContent, setNoteContent] = useState("");
    const [noteSaving, setNoteSaving] = useState(false);

    const { toast } = useToast();

    const fetchLectures = () => {
        setLoading(true);
        const params: any = {};
        if (searchQuery) params.search = searchQuery;

        getAdminLectures(params)
            .then((data) => {
                setLectures(data.results || data);
            })
            .catch((err) => {
                console.error(err);
                toast({ title: "Failed to load lectures", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLectures();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLectures();
    };
    
    const handleEditNote = (lecture: any) => {
        setEditingNote(lecture);
        setNoteContent(lecture.admin_note || "");
    };
    
    const handleSaveNote = async () => {
        if (!editingNote) return;
        
        setNoteSaving(true);
        try {
            await updateLectureNote(editingNote.id, noteContent);
            toast({ title: "Note updated successfully" });
            
            // Update local state
            setLectures(lectures.map(l => l.id === editingNote.id ? { ...l, admin_note: noteContent } : l));
            setEditingNote(null);
        } catch (error) {
            toast({ title: "Failed to save note", variant: "destructive" });
        } finally {
            setNoteSaving(false);
        }
    };

    const getLectureIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4 text-blue-400" />;
            case 'quiz': return <HelpCircle className="h-4 w-4 text-yellow-400" />;
            default: return <FileText className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Lecture Management</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                    <Input
                        placeholder="Search lectures..."
                        className="bg-gray-900 border-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" variant="outline" className="border-gray-700 hover:bg-gray-800">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-800/50">
                        <TableRow className="hover:bg-transparent border-gray-800">
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Admin Note</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                                </TableCell>
                            </TableRow>
                        ) : lectures.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No lectures found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            lectures.map((lecture) => (
                                <TableRow key={lecture.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-white">
                                        {lecture.title}
                                        {lecture.is_preview && <Badge variant="secondary" className="ml-2 text-[10px]">Preview</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            {getLectureIcon(lecture.lecture_type)}
                                            <span className="capitalize">{lecture.lecture_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 max-w-md truncate" title={lecture.admin_note}>
                                        {lecture.admin_note || <span className="text-gray-600 italic">No notes</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            lecture.status === 'published' ? 'text-green-500 border-green-900' : 
                                            lecture.status === 'draft' ? 'text-gray-500 border-gray-700' : 
                                            'text-yellow-500 border-yellow-900'
                                        }>
                                            {lecture.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleEditNote(lecture)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Note
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Note Edit Dialog */}
            <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Internal Admin Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Note for "{editingNote?.title}"</Label>
                            <Textarea 
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Enter internal review notes or rejection reasons..."
                                className="bg-gray-800 border-gray-700 min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingNote(null)}>Cancel</Button>
                        <Button onClick={handleSaveNote} disabled={noteSaving}>
                            {noteSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
