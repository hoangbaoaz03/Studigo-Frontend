"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTrashedCourses, restoreCourse, permanentDeleteCourse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash2, RefreshCcw, AlertTriangle } from "lucide-react";
import { getCourseThumbnail } from "@/lib/image-utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function TrashPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user && !authLoading) {
            router.push("/login");
            return;
        }

        if (user && !user.is_instructor) {
             router.push("/");
             return;
        }

        async function fetchTrash() {
            try {
                const data = await getTrashedCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch trash", error);
                toast.error("Failed to load trash items");
            } finally {
                setLoading(false);
            }
        }

        if (user) fetchTrash();
    }, [user, authLoading, router]);

    const handleRestore = async (slug: string) => {
        const toastId = toast.loading("Restoring course...");
        try {
            await restoreCourse(slug);
            setCourses(courses.filter(c => c.slug !== slug));
            toast.success("Course restored successfully", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to restore course", { id: toastId });
        }
    }

    const handleDeleteForever = async (slug: string) => {
        const toastId = toast.loading("Deleting permanently...");
        try {
            await permanentDeleteCourse(slug);
            setCourses(courses.filter(c => c.slug !== slug));
            toast.success("Course deleted permanently", { id: toastId });
        } catch (error) {
             console.error(error);
             toast.error("Failed to delete course", { id: toastId });
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/instructor/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trash2 className="h-8 w-8 text-red-500" />
                        Trash
                    </h1>
                    <p className="text-gray-500">Manage your deleted courses. Restoring puts them back to Draft.</p>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">Trash is empty.</p>
                    <Link href="/instructor/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Deleted Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={getCourseThumbnail(course.id, course.thumbnail)} 
                                                alt={course.title}
                                                className="w-16 h-10 object-cover rounded"
                                            />
                                            <span className="font-medium">{course.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {course.deleted_at ? new Date(course.deleted_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleRestore(course.slug)}
                                        >
                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                            Restore
                                        </Button>
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="destructive">
                                                     Delete Forever
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                    <DialogDescription>
                                                        This action cannot be undone. This will permanently delete the course "{course.title}" and all its contents (sections, lectures, files).
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <Button variant="destructive" onClick={() => handleDeleteForever(course.slug)}>
                                                        Delete Forever
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
