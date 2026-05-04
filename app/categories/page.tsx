"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Code, Palette, TrendingUp, Music, Camera, Heart, Globe } from "lucide-react";

// Map category names to icons
const categoryIcons: { [key: string]: any } = {
  "development": Code,
  "business": TrendingUp,
  "design": Palette,
  "marketing": TrendingUp,
  "music": Music,
  "photography": Camera,
  "health": Heart,
  "language": Globe,
};

function getCategoryIcon(slug: string) {
  const IconComponent = categoryIcons[slug.toLowerCase()] || BookOpen;
  return <IconComponent className="h-8 w-8" />;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Categories</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse our wide range of courses organized by category. Find the perfect course to advance your skills.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No categories available</h2>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {getCategoryIcon(category.slug)}
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description || "Explore courses in this category"}
                  </p>
                  {category.course_count !== undefined && (
                    <p className="text-sm font-medium text-primary mt-2">
                      {category.course_count} courses
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
