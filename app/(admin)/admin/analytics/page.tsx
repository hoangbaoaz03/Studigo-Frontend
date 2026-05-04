"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api";
import { SummaryCards } from "@/components/admin/analytics/SummaryCards";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { UserGrowthChart } from "@/components/admin/analytics/UserGrowthChart";
import { TopCoursesTable } from "@/components/admin/analytics/TopCoursesTable";
import { CategoryChart } from "@/components/admin/analytics/CategoryChart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportAdminAnalytics } from "@/lib/api";

export default function AdminAnalyticsPage() {
    const { toast } = useToast();
    const [period, setPeriod] = useState("30d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await getAdminAnalytics(period);
            setData(result);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error fetching analytics",
                description: "Could not load dashboard data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            toast({
                title: "Đang xuất báo cáo...",
                description: "Vui lòng chờ trong giây lát.",
            });
            const blob = await exportAdminAnalytics(period);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `financial_report_${period}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
            toast({
                title: "Lỗi xuất file",
                description: "Không thể tải xuống báo cáo.",
                variant: "destructive",
            });
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-black min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Thống kê và Báo cáo (Analytics & Reporting)</h1>
                    <p className="text-gray-400 mt-1">
                        Tổng quan về doanh thu, kiểm soát chi phí và hiệu suất nền tảng.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
                        <TabsList className="bg-gray-900 border border-gray-800">
                            <TabsTrigger value="7d">7 Ngày</TabsTrigger>
                            <TabsTrigger value="30d">30 Ngày</TabsTrigger>
                            <TabsTrigger value="90d">3 Tháng</TabsTrigger>
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={handleExport} variant="outline" className="border-gray-800 bg-gray-900 hover:bg-gray-800 text-white">
                        <Download className="mr-2 h-4 w-4" /> Xuất Báo cáo
                    </Button>
                </div>
            </div>

            {data && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <SummaryCards data={data.summary} />

                    {/* Charts Row 1 */}
                    <div className="grid gap-4 md:grid-cols-7">
                        <RevenueChart data={data.trend} />
                        <UserGrowthChart data={data.trend} />
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <TopCoursesTable data={data.top_courses} />
                        <CategoryChart data={data.category_distribution} />
                    </div>
                </div>
            )}
        </div>
    );
}
