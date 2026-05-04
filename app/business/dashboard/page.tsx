'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, Award, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock Data
const ASSIGNED_PATH = {
  title: "Senior React Developer Path",
  progress: 35,
  totalCourses: 5,
  completedCourses: 1,
  currentCourse: "Advanced State Management",
  nextMilestone: "Performance Optimization",
};

const ASSIGNED_COURSES = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect - Associate",
    provider: "Amazon Web Services",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300&h=200",
    progress: 45,
    totalModules: 12,
    completedModules: 5,
    lastAccessed: "2 days ago",
    status: "In Progress",
    dueDate: "2024-05-15"
  },
  {
    id: 2,
    title: "Enterprise Cybersecurity Awareness",
    provider: "Internal Security Team",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300&h=200",
    progress: 0,
    totalModules: 4,
    completedModules: 0,
    lastAccessed: "-",
    status: "Not Started",
    dueDate: "2024-04-01"
  }
];

const COMPLETED_COURSES = [
  {
    id: 3,
    title: "Agile Methodologies for Teams",
    provider: "Project Management Institute",
    completedDate: "2024-01-20",
    certificateUrl: "#"
  }
];

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Organization Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                 Ac
              </div>
              <div className="leading-tight">
                 <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Organization</div>
                 <div className="text-lg font-bold text-gray-900">Acme Corp</div>
              </div>
           </div>
           <div className="text-sm text-gray-600">
              Logged in as <span className="font-semibold text-gray-900">Alice Johnson</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Main Content */}
           <div className="flex-1 space-y-8">
              
              {/* Active Learning Path */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2">My Learning Path</h2>
                        <h3 className="text-3xl font-bold text-blue-400 mb-4">{ASSIGNED_PATH.title}</h3>
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                           <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {ASSIGNED_PATH.completedCourses}/{ASSIGNED_PATH.totalCourses} Courses Completed
                           </div>
                           <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Certificate upon completion
                           </div>
                        </div>
                    </div>
                    <div className="text-right">
                       <span className="text-4xl font-bold">{ASSIGNED_PATH.progress}%</span>
                       <div className="text-sm text-gray-400">Total Progress</div>
                    </div>
                 </div>
                 <div className="p-6">
                    <div className="mb-6">
                       <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Current Focus: {ASSIGNED_PATH.currentCourse}</span>
                          <span className="text-blue-600 font-medium cursor-pointer hover:underline">View Syllabus</span>
                       </div>
                       <Progress value={ASSIGNED_PATH.progress} className="h-3 bg-gray-100" />
                    </div>
                    <Link href={`/courses/resume`}>
                       <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          Resume Learning
                          <ArrowRight className="ml-2 h-4 w-4" />
                       </Button>
                    </Link>
                 </div>
              </div>

              {/* Assigned Courses Grid */}
              <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned to You</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ASSIGNED_COURSES.map((course) => (
                       <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                          <div className="relative h-40">
                             <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                             {course.status === 'In Progress' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                   <div className="h-full bg-blue-600" style={{ width: `${course.progress}%` }}></div>
                                </div>
                             )}
                             <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                   course.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                   {course.status}
                                </span>
                             </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                             <div className="text-xs font-semibold text-gray-500 mb-1">{course.provider}</div>
                             <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 flex-1">{course.title}</h3>
                             
                             <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                   <Clock className="h-3 w-3" />
                                   {course.dueDate ? `Due: ${new Date(course.dueDate).toLocaleDateString()}` : 'No deadline'}
                                </div>
                                <div>
                                   {course.completedModules}/{course.totalModules} Modules
                                </div>
                             </div>
                             
                             <Button size="sm" variant={course.status === 'Not Started' ? 'default' : 'outline'} className="w-full">
                                {course.status === 'Not Started' ? 'Start Course' : 'Continue'}
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>

           {/* Sidebar Stats */}
           <div className="lg:w-80 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-gray-900 mb-4">My Stats</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-gray-600 text-sm">Courses Completed</span>
                       <span className="font-bold text-gray-900">3</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-gray-600 text-sm">Learning Hours</span>
                       <span className="font-bold text-gray-900">12.5h</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-gray-600 text-sm">Certificates</span>
                       <span className="font-bold text-gray-900">1</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-gray-900 mb-4">Completed</h3>
                 <div className="space-y-4">
                    {COMPLETED_COURSES.map((course) => (
                       <div key={course.id} className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <div>
                             <div className="text-sm font-semibold text-gray-900 line-clamp-1">{course.title}</div>
                             <div className="text-xs text-gray-500">{course.completedDate}</div>
                             <a href={course.certificateUrl} className="text-xs text-blue-600 hover:underline">View Certificate</a>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
