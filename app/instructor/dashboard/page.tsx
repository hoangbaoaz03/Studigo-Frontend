"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getInstructorDashboard, softDeleteCourse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Loader2, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star,
  Plus,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";
import { getCourseThumbnail } from "@/lib/image-utils";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  average_rating: number;
  courses: any[];
}

export default function InstructorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;
      
      if (!user.is_instructor) {
        setError("You need to be an instructor to access this page.");
        setLoading(false);
        return;
      }

      try {
        const dashboardData = await getInstructorDashboard();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchDashboard();
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">
            {!user?.is_instructor && "Become an instructor to start creating courses."}
          </p>
          <Link href="/teach">
            <Button>Learn About Teaching</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Courses",
      value: data?.total_courses || 0,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Total Students",
      value: data?.total_students || 0,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      title: "Total Revenue",
      value: formatPrice(data?.total_revenue || 0),
      icon: DollarSign,
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
    {
      title: "Average Rating",
      value: (data?.average_rating || 0).toFixed(1),
      icon: Star,
      color: "text-purple-600",
      bg: "bg-purple-100"
    }
  ];

  const handleDelete = async (slug: string) => {
      if (!confirm("Are you sure you want to delete this course? It will be moved to trash.")) return;
      const toastId = toast.loading("Deleting course...");
      try {
          await softDeleteCourse(slug);
          if (data) {
              setData({
                  ...data,
                  courses: data.courses.filter(c => c.slug !== slug)
              });
          }
          toast.success("Course moved to trash", { id: toastId });
      } catch (error) {
          console.error(error);
          toast.error("Failed to delete course", { id: toastId });
      }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || user?.username}!</p>
        </div>
        <div className="flex gap-2">
          <Link href="/instructor/trash">
            <Button variant="outline">
              <Trash2 className="mr-2 h-4 w-4" /> Trash
            </Button>
          </Link>
          <Link href="/instructor/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.courses && data.courses.length > 0 ? (
            <div className="space-y-4">

              {data.courses.map((course: any) => (
                <div 
                  key={course.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <Link 
                    href={`/course/${course.slug}/learn`}
                    className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={getCourseThumbnail(course.id, course.thumbnail)} 
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500">
                        {course.total_enrollments || 0} students • {course.status}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {(course.average_rating || 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">{formatPrice(course.price)}</p>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/instructor/courses/${course.slug}/manage`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Edit Content
                            </Button>
                        </Link>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(course.slug)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
              <Link href="/instructor/courses/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Course
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
