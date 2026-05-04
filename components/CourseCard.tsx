"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Users, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCourseThumbnail } from "@/lib/image-utils";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface CourseCardProps {
  id: string;
  title: string;
  title_vi?: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: string;
  oldPrice?: string;
  image: string;
  slug: string;
  level: string;
  students: number;
  bestseller?: boolean;
  isNew?: boolean;
  className?: string;
}

export function CourseCard({
  id,
  title,
  title_vi,
  instructor,
  rating,
  reviews,
  price,
  oldPrice,
  image,
  slug,
  level,
  students,
  bestseller,
  isNew,
  className
}: CourseCardProps) {
  const displayImage = getCourseThumbnail(id, image);
  const { locale } = useLanguage();

  const displayTitle = (locale === 'vi' && title_vi) ? title_vi : title;

  return (
    <Link href={`/course/${slug}`} className={cn("group h-full block", className)}>
      <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 relative">
        
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
            <Image
                src={displayImage}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 gap-2">
            
            {/* Title */}
            <h3 className="font-bold text-base leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {displayTitle}
            </h3>

            {/* Instructor */}
            <p className="text-xs text-gray-500 truncate font-medium">
                {instructor}
            </p>

            {/* Rating Row */}
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
                <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} 
                        />
                    ))}
                </div>
                <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
            </div>

            {/* Meta Info: Level & Students */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-50">
                 <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{students.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <BarChart className="h-3.5 w-3.5" />
                    <span className="capitalize">{level}</span>
                 </div>
            </div>

            {/* Footer: Price & Badges */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">{price}</span>
                    {oldPrice && (
                        <span className="text-xs text-gray-500 line-through font-normal">
                            {oldPrice}
                        </span>
                    )}
                </div>
                
                {/* Badges */}
                <div className="flex gap-1.5">
                    {bestseller && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none font-semibold px-2 py-0.5 text-[10px] uppercase">
                            Bestseller
                        </Badge>
                    )}
                    {isNew && !bestseller && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none font-semibold px-2 py-0.5 text-[10px] uppercase">
                            New
                        </Badge>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}
