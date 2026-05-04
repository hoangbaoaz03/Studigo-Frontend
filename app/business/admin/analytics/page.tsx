"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award, Users, Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getB2BAnalytics, getB2BLearnersProgress, getOrganizationTeams, getB2BLicenses } from "@/lib/api";

export default function EnterpriseAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Table state
  const [learners, setLearners] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [analyticsData, teamsData, licensesData] = await Promise.all([
          getB2BAnalytics(),
          getOrganizationTeams(),
          getB2BLicenses()
        ]);
        setData(analyticsData);
        setTeams(teamsData.results || teamsData);
        setCourses(licensesData.results || licensesData);
      } catch (error) {
        console.error("Failed to fetch overview stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const fetchTableData = async () => {
    setLoadingTable(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (teamFilter !== "all") params.team_id = teamFilter;
      if (courseFilter !== "all") params.course_id = courseFilter;
      
      const res = await getB2BLearnersProgress(params);
      setLearners(res);
    } catch (error) {
      console.error("Failed to fetch learners progress", error);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTableData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, teamFilter, courseFilter]);

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  const hoursWatched = data?.total_watched_seconds ? (data.total_watched_seconds / 3600).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Báo cáo & Phân tích Doanh nghiệp</h2>
        <p className="text-gray-500">Theo dõi tiến độ học tập, mức độ hoàn thành và kết quả của toàn bộ nhân viên.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Học viên đang học</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data?.active_learners || 0}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">Trên toàn hệ thống</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng giờ học</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{hoursWatched}h</div>
            <p className="text-xs text-gray-500 mt-1">Tổng thời gian xem video</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tiến độ trung bình</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data?.avg_progress_percent || 0}%</div>
            <Progress value={data?.avg_progress_percent || 0} className="h-2 mt-3 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Điểm Quiz trung bình</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{data?.avg_quiz_score || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Tổng hợp mọi bài test</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết tiến độ nhân viên</h3>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Tìm tên, email nhân viên..." 
                className="pl-9 bg-white" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <select 
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" 
              value={courseFilter} 
              onChange={e => setCourseFilter(e.target.value)}
            >
              <option value="all">Tất cả Khóa học</option>
              {courses.map(c => (
                <option key={c.id} value={c.course}>{c.course_title}</option>
              ))}
            </select>
            
            <select 
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" 
              value={teamFilter} 
              onChange={e => setTeamFilter(e.target.value)}
            >
              <option value="all">Tất cả Phòng ban</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto relative min-h-[300px]">
          {loadingTable ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <div className="text-gray-500">Đang tải danh sách...</div>
            </div>
          ) : null}
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead className="w-[150px]">Tiến độ</TableHead>
                <TableHead>Điểm TB</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Lần học cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {learners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">Không tìm thấy dữ liệu phù hợp.</TableCell>
                </TableRow>
              ) : (
                learners.map((lrn, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{lrn.student_name}</div>
                      <div className="text-xs text-gray-500">{lrn.student_email}</div>
                    </TableCell>
                    <TableCell><span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">{lrn.team_name}</span></TableCell>
                    <TableCell><span className="text-sm font-medium text-gray-800">{lrn.course_title}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={lrn.progress_percent} className="h-2 w-full" />
                        <span className="text-xs font-bold w-9">{lrn.progress_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${lrn.quiz_avg >= 80 ? 'text-green-600' : lrn.quiz_avg >= 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {lrn.quiz_avg}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {lrn.completed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hoàn thành</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang học</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(lrn.last_accessed).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
