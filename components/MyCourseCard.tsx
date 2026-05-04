import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle } from "lucide-react";
import { getCourseThumbnail } from "@/lib/image-utils";

interface MyCourseCardProps {
  course: any;
}

export default function MyCourseCard({ course }: MyCourseCardProps) {
  // Safe access to course data, handling potential missing fields
  const courseData = course.course || course; 
  const progress = course.progress_percent || 0;
  
  const displayImage = getCourseThumbnail(courseData.id, courseData.thumbnail);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        <img
          src={displayImage}
          alt={courseData.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
          {courseData.title}
        </CardTitle>
        <p className="text-sm text-gray-500">{courseData.instructor_name}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/course/${courseData.slug}/learn`} className="w-full">
            <Button className="w-full" variant={progress > 0 ? "default" : "outline"}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {progress > 0 ? "Continue Learning" : "Start Course"}
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
