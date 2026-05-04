'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, UserCheck, Clock } from 'lucide-react';

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87</div>
              <p className="text-xs text-muted-foreground">70% engagement rate</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Enrollments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-muted-foreground">+24 since last week</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,204h</div>
              <p className="text-xs text-muted-foreground">Avg 9.7h per user</p>
            </CardContent>
         </Card>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="col-span-1">
             <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-200 text-gray-400">
                    [Line Chart Placeholder]
                </div>
             </CardContent>
         </Card>
         <Card className="col-span-1">
             <CardHeader>
                <CardTitle>Top Skills</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                    {['React', 'Python', 'AWS', 'Project Management', 'Data Science'].map((skill, i) => (
                        <div key={skill} className="flex items-center">
                            <span className="w-32 text-sm font-medium">{skill}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${85 - (i * 10)}%` }}></div>
                            </div>
                            <span className="ml-4 text-sm text-gray-500">{85 - (i * 10)}%</span>
                        </div>
                    ))}
                </div>
             </CardContent>
         </Card>
      </div>
    </div>
  );
}
