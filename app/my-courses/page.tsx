"use client";

import { useEffect, useState } from "react";
import { getMyCourses } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MyCourseCard from "@/components/MyCourseCard";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      if (user) {
        try {
          const data = await getMyCourses();
          console.log("My Courses Data:", data);
          setCourses(data.courses || []);
        } catch (error) {
          console.error("Failed to fetch my courses", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
          setLoading(false);
      }
    }

    if (!authLoading) {
        fetchCourses();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Please log in to view your courses</h2>
        <Link href="/login">
            <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Learning</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No courses enrolled yet</h2>
          <p className="text-gray-600 mb-6">Start learning by exploring our course catalog.</p>
          <Link href="/">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((enrollment) => (
            <MyCourseCard key={enrollment.enrollment_id} course={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
