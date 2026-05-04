'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  MoreHorizontal, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Mock Data for Assignments
const MOCK_ASSIGNMENTS = [
  { id: 1, title: 'AWS Certified Solutions Architect', type: 'Certification', assignedTo: 'DeepMind Team', assignType: 'Team', dueDate: '2024-05-15', progress: 45, status: 'In Progress' },
  { id: 2, title: 'React Advanced Patterns', type: 'Course', assignedTo: 'Alice Johnson', assignType: 'User', dueDate: '2024-04-30', progress: 80, status: 'In Progress' },
  { id: 3, title: 'Cybersecurity Fundamentals', type: 'Course', assignedTo: 'Sales Team', assignType: 'Team', dueDate: '2024-06-01', progress: 10, status: 'In Progress' },
  { id: 4, title: 'Data Science 101', type: 'Learning Path', assignedTo: 'Bob Smith', assignType: 'User', dueDate: '2024-03-15', progress: 100, status: 'Completed' },
  { id: 5, title: 'Communication Skills', type: 'Course', assignedTo: 'New Hires', assignType: 'Team', dueDate: '2024-04-10', progress: 5, status: 'Overdue' },
];

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
           <p className="text-muted-foreground text-gray-500">
             Track and manage learning content assigned to your organization.
           </p>
        </div>
        <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
           <Plus className="mr-2 h-4 w-4" /> Assign Content
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
         <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input 
              placeholder="Search assignments..." 
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-9 border-gray-300 w-full sm:w-auto">
               <Filter className="mr-2 h-4 w-4" /> Filter Status
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-gray-300 w-full sm:w-auto">
               <BookOpen className="mr-2 h-4 w-4" /> Content Type
            </Button>
         </div>
      </div>

      {/* Assignments Table */}
      <div className="rounded-md border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                  <th className="px-6 py-3 font-medium text-gray-500">Content</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Assigned To</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Due Date</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Progress</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {MOCK_ASSIGNMENTS.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold
                              ${item.type === 'Certification' ? 'bg-purple-600' : 
                                item.type === 'Learning Path' ? 'bg-green-600' : 'bg-blue-600'}`}>
                              {item.type === 'Certification' ? 'Cr' : item.type === 'Learning Path' ? 'LP' : 'Co'}
                           </div>
                           <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-xs text-gray-500">{item.type}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              item.assignType === 'Team' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                           }`}>
                              {item.assignType === 'Team' ? 'T' : 'U'}
                           </div>
                           <span className="text-gray-700">{item.assignedTo}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-gray-500">
                        {new Date(item.dueDate).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-2 bg-gray-100 rounded-full w-24 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                    item.status === 'Overdue' ? 'bg-red-500' : 
                                    item.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'
                                }`} 
                                style={{ width: `${item.progress}%` }}
                              ></div>
                           </div>
                           <span className="text-xs font-medium text-gray-600">{item.progress}%</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {item.status === 'Completed' && (
                           <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                              Completed
                           </Badge>
                        )}
                        {item.status === 'In Progress' && (
                           <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none">
                              In Progress
                           </Badge>
                        )}
                        {item.status === 'Overdue' && (
                           <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-none">
                              Overdue
                           </Badge>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <MoreHorizontal className="h-4 w-4" />
                        </Button>
                     </td>
                  </tr>
               ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
