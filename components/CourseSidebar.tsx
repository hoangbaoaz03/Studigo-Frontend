"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { CourseDetail, enrollCourse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText, Globe, Award, Loader2, ShoppingCart, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getCourseThumbnail } from "@/lib/image-utils";
import { formatPrice } from "@/lib/utils";
import EditablePrice from "@/components/instructor/preview/EditablePrice";
import EditableImage from "@/components/instructor/preview/EditableImage";
import { usePreviewEdit } from "@/context/PreviewEditContext";

interface CourseSidebarProps {
    course: CourseDetail;
    displayTitle?: string;
    displaySubtitle?: string;
}

export function CourseSidebar({ course, displayTitle, displaySubtitle }: CourseSidebarProps) {
    const { user } = useAuth();
    const { addToCart, isInCart, setCheckoutSelection } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Use PreviewEditContext if available, otherwise fallback.
    // Since this is inside CourseDetailInner which is inside PreviewEditProvider, it should work.
    let isEditMode = false;
    let saveCourseField: any = async () => {};
    let saveCourseImage: any = async () => {};
    
    try {
        const context = usePreviewEdit();
        isEditMode = context.isEditMode;
        saveCourseField = context.saveCourseField;
        saveCourseImage = context.saveCourseImage;
    } catch (e) {
        // Fallback for outside context usage (e.g. strict mode or other pages)
        // console.warn("CourseSidebar used outside PreviewEditProvider");
    }

    // Use passed display title or fallback to course title
    const effectiveTitle = displayTitle || course.title;
    
    // State to track enrollment confirmation on client side
    // Because server component might not know user's enrollment status
    const [isEnrolled, setIsEnrolled] = useState(course.is_enrolled);
    const inCart = isInCart(course.id);

    useEffect(() => {
        // If user is logged in but server says not enrolled, re-check (or trust list)
        // A simpler way: Check if this course is in "My Courses" list if we have access to it
        // Or just rely on the fact that if we buy it, we get redirected. 
        // Better: Fetch fresh enrollment status if user is present.
        const checkEnrollment = async () => {
            if (user && !isEnrolled) {
                try {
                    const { getCourseBySlug } = await import('@/lib/api');
                    // This call will happen on client, so it includes the token
                    const freshData = await getCourseBySlug(course.slug);
                    if (freshData.is_enrolled) {
                        setIsEnrolled(true);
                    }
                } catch (e) {
                    console.error("Failed to check enrollment", e);
                }
            }
        };
        checkEnrollment();
    }, [user, course.slug]);

    const handleEnroll = async () => {
        if (!user) {
            router.push(`/login?redirect=/course/${course.slug}`);
            return;
        }

        setIsLoading(true);
        try {
            await enrollCourse(course.id);
            router.push(`/course/${course.slug}/learn`);
        } catch (error: any) {
            console.error("Enrollment failed", error);
            if (error.response?.status === 400) {
                 // Likely already enrolled or validation error
                 alert("You are likely already enrolled in this course. Redirecting...");
                 router.push(`/course/${course.slug}/learn`);
            } else {
                alert("Failed to enroll. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToCourse = () => {
        router.push(`/course/${course.slug}/learn`);
    };

    const handleBuyNow = () => {
         // Add to cart if not present
         if (!inCart) {
             addToCart({
                id: course.id,
                slug: course.slug,
                title: effectiveTitle,
                instructor_name: course.instructor_name,
                thumbnail: course.thumbnail,
                price: course.price,
                current_price: course.current_price,
                has_discount: course.has_discount,
                discount_price: course.discount_price,
            });
         }
         // Set SELECTION to only this course
         setCheckoutSelection([course.id]);
         // Go to checkout
         router.push('/checkout');
    };

    const handleAddToCart = () => {
        addToCart({
            id: course.id,
            slug: course.slug,
            title: effectiveTitle, // Use localized title
            instructor_name: course.instructor_name,
            thumbnail: course.thumbnail,
            price: course.price,
            current_price: course.current_price,
            has_discount: course.has_discount,
            discount_price: course.discount_price,
        });
    };

// in Component
    const displayImage = getCourseThumbnail(course.id, course.thumbnail);

    return (
        <div className="w-full lg:w-[340px] relative">
            <div className="lg:sticky lg:top-24 bg-white shadow-xl lg:border border-white lg:mb-8">
                {/* Video Preview / Image */}
                <div className="relative">
                    <EditableImage 
                        currentImage={displayImage}
                        onSave={saveCourseImage}
                        className="aspect-video w-full bg-black cursor-pointer group"
                    />
                    {!isEditMode && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="bg-white/90 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                                <PlayCircle className="h-8 w-8 text-black" fill="currentColor" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                             {course.is_free ? "Free" : (
                                <EditablePrice 
                                    value={Number(course.price)} // We edit the original price, not current_price (current_price is calculated)
                                    onSave={(val) => saveCourseField('price', val)}
                                    className="font-bold"
                                />
                             )}
                        </span>
                        {course.has_discount && (
                            <span className="text-lg text-gray-500 line-through font-normal">{formatPrice(course.price)}</span>
                        )}
                        {course.has_discount && (
                            <span className="text-sm font-bold text-gray-900">{course.discount_percentage}% off</span>
                        )}
                    </div>

                    {isEnrolled ? (
                         <Button 
                            onClick={handleGoToCourse}
                            size="lg" 
                            className="w-full font-bold h-12 text-base bg-black hover:bg-gray-800 text-white rounded-none"
                        >
                            Go to My Learning
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                             <Button 
                                onClick={handleBuyNow}
                                disabled={isLoading}
                                size="lg" 
                                className="w-full font-bold h-12 text-base bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Buy Now"}
                            </Button>
                             {inCart ? (
                                <Link href="/cart" className="w-full">
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="w-full font-bold h-12 text-base border-green-600 text-green-600 hover:bg-green-50 rounded-none"
                                    >
                                        <Check className="mr-2 h-5 w-5" />
                                        Go to Cart
                                    </Button>
                                </Link>
                             ) : (
                                <Button 
                                    onClick={handleAddToCart}
                                    size="lg" 
                                    variant="outline" 
                                    className="w-full font-bold h-12 text-base border-gray-900 text-gray-900 hover:bg-gray-100 rounded-none"
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </Button>
                             )}
                        </div>
                    )}
                   

                    <div className="text-center text-xs text-gray-500 pt-2">
                        30-Day Money-Back Guarantee
                    </div>

                    <div className="flex flex-col gap-2 pt-2 text-sm text-gray-700">
                        <span className="font-bold">This course includes:</span>
                        <div className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4" />
                            <span>{Math.round(course.total_duration / 3600)} hours on-demand video</span>
                        </div>
                            <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{course.total_lectures} articles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Access on mobile and TV</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>Certificate of completion</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
