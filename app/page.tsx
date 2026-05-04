import { getCourses, getCategories, Course, Category } from "@/lib/api";
import HomeContent from "./HomeContent";

export default async function Home() {
  let courses: Course[] = [];
  let categories: Category[] = [];
  
  try {
    const [coursesData, categoriesData] = await Promise.all([
      getCourses(),
      getCategories()
    ]);
    courses = coursesData.results || [];
    categories = categoriesData;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  return <HomeContent courses={courses} categories={categories} />;
}
