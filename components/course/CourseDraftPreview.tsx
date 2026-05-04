"use client";

import { useEffect, useState } from "react";
import { getCourseBySlug, getRelatedCourses, CourseDetail } from "@/lib/api";
import { Loader2 } from "lucide-react";
import CourseDetailContent from "./CourseDetailContent";
import { Button } from "@/components/ui/button";

interface CourseDraftPreviewProps {
    slug: string;
}

export default function CourseDraftPreview({ slug }: CourseDraftPreviewProps) {
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Client-side fetch uses local storage token implicitly via api interceptor
                const [fetchedCourse, fetchedRelated] = await Promise.all([
                    getCourseBySlug(slug),
                    getRelatedCourses(slug)
                ]);
                setCourse(fetchedCourse);
                setRelatedCourses(fetchedRelated || []);
            } catch (err) {
                console.error("Failed to fetch draft course", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading preview...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold">Course not found</h1>
                <p className="text-muted-foreground">The course you are looking for does not exist or you don't have permission to view it.</p>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
             <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm font-bold sticky top-0 z-50">
                Draft Preview Mode - Visible only to Instructor
            </div>
            <CourseDetailContent course={course} relatedCourses={relatedCourses} />
        </div>
    );
}
