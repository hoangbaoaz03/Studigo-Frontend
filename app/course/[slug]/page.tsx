import { getCourseBySlug, getRelatedCourses } from "@/lib/api";
import CourseDetailContent from "@/components/course/CourseDetailContent";
import CourseDraftPreview from "@/components/course/CourseDraftPreview";

export default async function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let course = null;
  let relatedCourses: any[] = [];
  
  try {
    // Fetch course and related courses in parallel
    const [fetchedCourse, fetchedRelated] = await Promise.all([
        getCourseBySlug(params.slug),
        getRelatedCourses(params.slug)
    ]);
    course = fetchedCourse;
    relatedCourses = fetchedRelated || [];
  } catch (error) {
    // If server fetch fails (e.g. 404 because course is draft and server has no token),
    // we fallback to the Client Component which will try to fetch with local token.
    return <CourseDraftPreview slug={params.slug} />;
  }

  return <CourseDetailContent course={course} relatedCourses={relatedCourses} />;
}
