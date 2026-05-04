"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCoursesByCategory, Course, getCategories, Category } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Users, Clock, ArrowLeft } from "lucide-react";

import { getCourseThumbnail } from "@/lib/image-utils";
import { formatPrice } from "@/lib/utils";

import { CourseCard } from "@/components/CourseCard";

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getCoursesByCategory(slug),
          getCategories()
        ]);
        
        setCourses(coursesData.results || []);
        setNextUrl(coursesData.next);
        setTotalCount(coursesData.count);

        const foundCategory = (categoriesData as any[]).find((c: Category) => c.slug === slug);
        setCategory(foundCategory || null);
      } catch (error) {
        console.error("Failed to fetch category data", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const handleLoadMore = async () => {
      if (!nextUrl) return;
      setLoadingMore(true);
      try {
          const response = await fetch(nextUrl, {
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
              }
          });
          const data = await response.json();
          
          setCourses(prev => [...prev, ...data.results]);
          setNextUrl(data.next);
      } catch (error) {
          console.error("Failed to load more courses", error);
      } finally {
          setLoadingMore(false);
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/categories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> All Categories
          </Button>
        </Link>
        <div className="flex justify-between items-end border-b pb-4">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                {category?.name || slug} Courses
                </h1>
                {category?.description && (
                <p className="text-gray-600 max-w-2xl">{category.description}</p>
                )}
            </div>
            <div className="text-right">
                 <p className="text-sm text-gray-500">
                    Showing {courses.length} of {totalCount} courses
                </p>
            </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No courses in this category yet</h2>
          <p className="text-gray-600 mb-6">Check back later or explore other categories.</p>
          <Link href="/categories">
            <Button>Browse Categories</Button>
          </Link>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {courses.map((course) => (
                <CourseCard 
                    key={course.id} 
                    id={course.id.toString()}
                    title={course.title}
                    title_vi={course.title_vi}
                    instructor={course.instructor_name || "Unknown"}
                    rating={Number(course.average_rating)}
                    reviews={course.total_reviews}
                    price={formatPrice(course.current_price)}
                    oldPrice={course.has_discount ? formatPrice(course.price) : undefined}
                    image={getCourseThumbnail(course.id, course.thumbnail)}
                    slug={course.slug}
                    level={course.level}
                    students={course.total_enrollments}
                    bestseller={course.average_rating > 4.5 && course.total_reviews > 10}
                    isNew={new Date(course.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                />
            ))}
            </div>
            
            {nextUrl && (
                <div className="flex justify-center mt-8">
                    <Button 
                        onClick={handleLoadMore} 
                        disabled={loadingMore}
                        variant="outline"
                        size="lg"
                        className="min-w-[200px]"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                            </>
                        ) : (
                            "Load More Courses"
                        )}
                    </Button>
                </div>
            )}
        </>
      )}
    </div>
  );
}
