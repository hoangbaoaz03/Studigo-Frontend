"use client";

import { useAuth } from "@/context/AuthContext";
import { PreviewEditProvider } from "@/context/PreviewEditContext";
import CourseDetailInner from "./CourseDetailInner";

interface CourseDetailContentProps {
    course: any; 
    relatedCourses: any[];
}

export default function CourseDetailContent({ course, relatedCourses }: CourseDetailContentProps) {
    const { user } = useAuth();
    
    // Check if current user is the instructor of this course
    // Adjust logic based on how user name/id is stored. 
    // Ideally compare IDs, but here we might need to rely on what's available.
    // course.instructor is likely an ID, course.instructor_name is string.
    // user.username or user.full_name might match.
    // Best practice: match ID. user.id === course.instructor
    // Assuming course.instructor is the ID.
    const isOwner = user?.username === course.instructor_name || user?.full_name === course.instructor_name || (user?.id && course.instructor && user.id === course.instructor); 

    return (
        <PreviewEditProvider initialCourse={course} isOwner={!!isOwner}>
            <CourseDetailInner relatedCourses={relatedCourses} isOwner={!!isOwner} />
        </PreviewEditProvider>
    );
}
