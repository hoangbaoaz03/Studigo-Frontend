'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, TrendingUp, Users, Globe } from 'lucide-react';

const RISING_SKILLS = [
  { name: 'Generative AI', growth: 85 },
  { name: 'Cybersecurity', growth: 72 },
  { name: 'Sustainable Tech', growth: 65 },
  { name: 'Data Storytelling', growth: 60 },
  { name: 'Cloud Computing', growth: 55 },
];

const SKILL_DISTRIBUTION = [
  { name: 'Tech', value: 40, color: 'text-blue-600', bg: 'bg-blue-600' },
  { name: 'Business', value: 30, color: 'text-purple-600', bg: 'bg-purple-600' },
  { name: 'Creative', value: 20, color: 'text-pink-600', bg: 'bg-pink-600' },
  { name: 'Soft Skills', value: 10, color: 'text-orange-600', bg: 'bg-orange-600' },
];

export default function TrendsReportSection() {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Text & Insights */}
          <div className="lg:w-1/3 space-y-8">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm">
                2026 Forecast
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Global Learning & Skills Trends Report 2026
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                As AI reshapes the workforce, human-centric skills and technical fluency are converging. 
                Our data from 50 million learners reveals the critical shifts defining the future of work.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Key Insights
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">1</div>
                  <p className="text-sm text-gray-600"><strong>AI Literacy is the new English.</strong> Proficiency in LLMs is becoming a baseline requirement across 70% of white-collar roles.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5">2</div>
                  <p className="text-sm text-gray-600"><strong>Green Skills gap widens.</strong> Demand for sustainability expertise is outpacing supply by 3:1.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0 mt-0.5">3</div>
                  <p className="text-sm text-gray-600"><strong>Soft skills premium.</strong> Leadership and adaptability remain the top differentiators for improved earning potential.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Charts & Data */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Top Rising Skills (Bar Chart) */}
            <Card className="md:col-span-2 shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Top Rising Skills in 2026</CardTitle>
                <CardDescription>Year-over-year growth in course enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RISING_SKILLS.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{skill.name}</span>
                        <span className="text-gray-500">+{skill.growth}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                          style={{ width: `${skill.growth}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Skill Demand Growth (Line Chart - Simple SVG) */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Demand Trajectory</CardTitle>
                <CardDescription>Aggregate skill demand (2023-2026)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full flex items-end justify-between px-2 gap-4">
                   {/* 2023 */}
                   <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                      <div className="w-full flex justify-center items-end gap-1 h-[80%]">
                         <div className="w-3 md:w-6 bg-blue-200 rounded-t-sm h-[40%]" title="Soft Skills: 40%"></div>
                         <div className="w-3 md:w-6 bg-blue-600 rounded-t-sm h-[45%]" title="Tech: 45%"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">2023</span>
                   </div>

                   {/* 2024 */}
                   <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                      <div className="w-full flex justify-center items-end gap-1 h-[80%]">
                         <div className="w-3 md:w-6 bg-blue-200 rounded-t-sm h-[50%]" title="Soft Skills: 50%"></div>
                         <div className="w-3 md:w-6 bg-blue-600 rounded-t-sm h-[60%]" title="Tech: 60%"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">2024</span>
                   </div>

                   {/* 2025 */}
                   <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                      <div className="w-full flex justify-center items-end gap-1 h-[80%]">
                         <div className="w-3 md:w-6 bg-blue-200 rounded-t-sm h-[65%]" title="Soft Skills: 65%"></div>
                         <div className="w-3 md:w-6 bg-blue-600 rounded-t-sm h-[80%]" title="Tech: 80%"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">2025</span>
                   </div>

                   {/* 2026 */}
                   <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                      <div className="w-full flex justify-center items-end gap-1 h-[80%]">
                         <div className="w-3 md:w-6 bg-blue-200 rounded-t-sm h-[85%]" title="Soft Skills: 85%"></div>
                         <div className="w-3 md:w-6 bg-blue-600 rounded-t-sm h-[95%]" title="Tech: 95%"></div>
                      </div>
                      <span className="text-xs text-gray-500 font-bold text-blue-700">2026</span>
                   </div>
                </div>
                
                <div className="flex gap-6 mt-4 justify-center text-xs text-gray-500">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-200"></div>
                      <span>Soft Skills</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                       <span>Tech Skills</span>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Distribution (Donut Chart - SVG) */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                 <CardTitle className="text-lg">Industry Distribution</CardTitle>
                 <CardDescription>Learning hours by sector</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                 <div className="relative w-32 h-32 mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                       {/* Segments - Simplified calculation for demo */}
                       {/* Circle circumference ~= 314 */}
                       
                       {/* Tech: 40% (125.6) */}
                       <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#2563eb" strokeDasharray="125.6 314" />
                       
                       {/* Business: 30% (94.2), starts at 40% */}
                       <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#9333ea" strokeDasharray="94.2 314" strokeDashoffset="-125.6" />
                       
                       {/* Creative: 20% (62.8), starts at 70% */}
                       <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#db2777" strokeDasharray="62.8 314" strokeDashoffset="-219.8" />
                       
                       {/* Other: 10% (31.4), starts at 90% */}
                       <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#ea580c" strokeDasharray="31.4 314" strokeDashoffset="-282.6" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-gray-900">50M+</span>
                        <span className="text-[10px] text-gray-500 uppercase">Learners</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs">
                    {SKILL_DISTRIBUTION.map(item => (
                       <div key={item.name} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.bg}`}></div>
                          <span className="text-gray-600">{item.name} ({item.value}%)</span>
                       </div>
                    ))}
                 </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
}
