"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/CourseCard';
import { getCourseThumbnail } from '@/lib/image-utils';
import { formatPrice } from '@/lib/utils';

interface CourseCarouselProps {
    courses: any[];
}

const CourseCarousel: React.FC<CourseCarouselProps> = ({ courses }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 600; // Adjust as needed
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    if (!courses || courses.length === 0) return null;

    return (
        <div className="relative group">
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 py-4 px-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {courses.filter(c => c).map((course) => (
                    <div key={course.id} className="min-w-[280px] w-[280px] flex-shrink-0 snap-start">
                         <CourseCard 
                            id={course.id.toString()}
                            title={course.title}
                            title_vi={course.title_vi}
                            instructor={course.instructor_name || "Unknown Instructor"}
                            rating={Number(course.average_rating)}
                            reviews={course.total_reviews}
                            price={formatPrice(course.current_price)}
                            oldPrice={course.has_discount ? formatPrice(course.price) : undefined}
                            image={getCourseThumbnail(course.id, course.thumbnail)}
                            slug={course.slug}
                            level={course.level}
                            students={course.total_enrollments}
                            bestseller={course.average_rating > 4.5 && course.total_reviews > 10}
                            isNew={new Date(course.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} // Created in last 30 days
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <Button 
                onClick={() => scroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 rounded-full h-10 w-10 p-0 shadow-lg bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-gray-700"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 rounded-full h-10 w-10 p-0 shadow-lg bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex hover:bg-gray-700"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
    );
};

export default CourseCarousel;
