"use client";

import { useEffect, useState } from "react";
import { getAdminStats, getAdminAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, GraduationCap, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { TopCoursesTable } from "@/components/admin/analytics/TopCoursesTable";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [statsData, analyticsData] = await Promise.all([
                    getAdminStats(),
                    getAdminAnalytics('30d')
                ]);
                setStats(statsData);
                setAnalytics(analyticsData);
            } catch (err: any) {
                console.error("Failed to load dashboard data", err);
                if (err.response && err.response.status === 403) {
                     setStats(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4 bg-black">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                <p className="text-gray-400">You do not have permission to view this page.</p>
                <p className="text-gray-500 text-sm">Please log in with an administrator account.</p>
                <Button onClick={() => router.push("/login")} variant="outline" className="mt-4">
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-black min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
            </div>
            
            {/* Key Stats Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.revenue.total.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Platform Fee: ${stats.revenue.platform.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            User Base
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.users.instructors} Instructors, {stats.users.students} Students
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Courses
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.courses.total}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.courses.published} Published, {stats.courses.pending} Pending Review
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Enrollments
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.enrollments.total.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Growth details in analytics
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Analytics Charts */}
            {analytics && (
                <div className="grid gap-6 md:grid-cols-7">
                    <RevenueChart data={analytics.trend} />
                    <TopCoursesTable data={analytics.top_courses} />
                </div>
            )}
        </div>
    );
}
