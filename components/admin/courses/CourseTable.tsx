"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { toggleCourseActive, approveCourse, rejectCourse } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { getCourseThumbnail } from "@/lib/image-utils";
import Image from "next/image";

interface Course {
    id: number;
    title: string;
    slug: string;
    instructor_name: string;
    thumbnail: string;
    status: string;
    is_active: boolean;
    price: number;
    category_name: string;
    created_at: string;
}

interface CourseTableProps {
    data: Course[];
    onRefresh: () => void;
    onUpdate?: (id: number, updates: any) => void;
}

export function CourseTable({ data, onRefresh, onUpdate }: CourseTableProps) {
    const { toast } = useToast();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleToggleActive = async (course: Course) => {
        const newStatus = !course.is_active;
        
        try {
            // Optimistic update if onUpdate is provided
            if (onUpdate) {
                onUpdate(course.id, { is_active: newStatus });
            }

            // Call API
            await toggleCourseActive(course.id);
            
            // Show custom toast
            if (newStatus) {
                // Activated
                 toast({
                    title: "Status Updated",
                    description: "Course is now Active",
                });
            } else {
                // Deactivated (Red X style)
                toast({
                    variant: "destructive",
                    title: "Course Unavailable",
                    description: "Course is now Inactive and hidden from students.",
                });
            }

            // Only refresh if no optimistic update handler (fallback)
            if (!onUpdate) {
                onRefresh();
            }
        } catch (error) {
            // Revert on error
            if (onUpdate) {
                onUpdate(course.id, { is_active: !newStatus });
            }
            
            toast({
                title: "Error",
                description: "Failed to update course status",
                variant: "destructive",
            });
        }
    };

    const handleApprove = async (id: number) => {
        setLoadingId(id);
        try {
            await approveCourse(id);
            toast({ title: "Course Approved", description: "Course is now live on the marketplace." });
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve course", variant: "destructive" });
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = window.prompt("Enter reason for rejection:");
        if (reason === null) return; // User cancelled
        
        setLoadingId(id);
        try {
            await rejectCourse(id, reason || "Violation of guidelines");
            toast({ title: "Course Rejected", description: "Course has been rejected and moved back to draft." });
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject course", variant: "destructive" });
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    return (
        <div className="rounded-md border border-gray-800 bg-gray-900/50">
            <Table>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Course Info</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((course) => (
                        <TableRow key={course.id} className="border-gray-800 hover:bg-gray-800/50">
                            <TableCell>
                                <div className="relative h-12 w-20 overflow-hidden rounded-md bg-gray-800">
                                    <Image 
                                        src={getCourseThumbnail(course.id, course.thumbnail)} 
                                        alt={course.title} 
                                        fill 
                                        className="object-cover"
                                        sizes="80px"
                                        priority={false}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col max-w-[250px]">
                                    <span className="font-medium text-gray-200 truncate" title={course.title}>
                                        {course.title}
                                    </span>
                                    <span className="text-xs text-gray-500">{course.category_name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                                {course.instructor_name}
                            </TableCell>
                            <TableCell className="text-gray-300 font-mono">
                                ${course.price}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getStatusColor(course.status)}>
                                    {course.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Switch 
                                    checked={course.is_active}
                                    onCheckedChange={() => handleToggleActive(course)}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem 
                                            className="focus:bg-gray-800 cursor-pointer"
                                            onClick={() => window.open(`/course/${course.slug}`, '_blank')}
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Preview Course
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-800" />
                                        {course.status === 'pending' && (
                                            <>
                                                <DropdownMenuItem 
                                                    className="focus:bg-gray-800 cursor-pointer text-green-400"
                                                    onClick={() => handleApprove(course.id)}
                                                    disabled={loadingId === course.id}
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Approve Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="focus:bg-gray-800 cursor-pointer text-red-400"
                                                    onClick={() => handleReject(course.id)}
                                                    disabled={loadingId === course.id}
                                                >
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Reject Course
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {course.status === 'published' && (
                                             <DropdownMenuItem 
                                                className="focus:bg-gray-800 cursor-pointer text-gray-400"
                                                onClick={() => {}}
                                            >
                                                View Analytics
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
