"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CourseCarousel from './CourseCarousel';
import Link from 'next/link';

interface TabData {
    id: string;
    label: string;
    description: string;
    btnText: string;
}

interface CourseContentTabsProps {
    title: string;
    description: string;
    tabs: TabData[];
    allCourses: any[]; // We will filter this mock list for demo purposes
}

const CourseContentTabs: React.FC<CourseContentTabsProps> = ({ title, description, tabs, allCourses }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

    // Logic to filter courses based on tab. 
    // In a real app, you might fetch specific data. 
    // Here we'll just slice/shuffle for potential variety or filter if categories match mock data.
    const getCoursesForTab = (tabId: string) => {
        // Map tab IDs to category names used in the backend/seed data
        const categoryMap: { [key: string]: string } = {
            "python": "Python",
            "excel": "Excel",
            "web-development": "Web Development",
            "javascript": "JavaScript",
            "data-science": "Data Science",
            "aws-certification": "IT & Software", // Fallback/Approx mapping if specific cat doesn't exist
            "drawing": "Design"
        };

        const targetCategory = categoryMap[tabId];

        // Filter courses by category_name if it exists in the course object
        // The API returns 'category_name' in the Course interface
        if (targetCategory) {
            // Updated to check category_path for hierarchical filtering
            // e.g. "Web Development" tab will include courses with path ["Development", "Web Development", "Python"]
            const filtered = allCourses.filter(c => 
                c.category_name === targetCategory || 
                (c.category_path && c.category_path.includes(targetCategory))
            );
            return filtered.length > 0 ? filtered : allCourses;
        }

        // Fallback to title search if no mapping found
        const filtered = allCourses.filter(c => c.title.toLowerCase().includes(tabId));
        return filtered.length > 0 ? filtered : allCourses; 
    };

    const activeTabData = tabs.find(t => t.id === activeTab);

    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                 <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
                 <p className="text-lg text-gray-600 mb-8">{description}</p>

                 {/* Tabs Header */}
                 <div className="flex overflow-x-auto gap-4 mb-6 pb-2 border-b border-gray-200 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap px-4 py-2 font-bold text-lg transition-colors border-b-2 ${
                                activeTab === tab.id 
                                ? 'text-gray-900 border-gray-900' 
                                : 'text-gray-500 border-transparent hover:text-gray-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                 </div>

                 {/* Tab Content */}
                 <div className="bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-lg">
                    {activeTabData && (
                        <div className="mb-8 max-w-2xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Mở rộng kỹ năng {activeTabData.label} của bạn
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {activeTabData.description}
                            </p>
                            <Link href={`/categories/${activeTabData.id}`}>
                                <Button variant="outline" className="font-bold border-gray-900 text-gray-900 hover:bg-gray-100">
                                    {activeTabData.btnText}
                                </Button>
                            </Link>
                        </div>
                    )}
                    
                    {/* Carousel */}
                    <CourseCarousel courses={getCoursesForTab(activeTab)} />
                 </div>
            </div>
        </section>
    );
};

export default CourseContentTabs;
