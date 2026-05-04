"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseBySlug, CourseDetail, updateCourse, softDeleteCourse, api, Category } from "@/lib/api";
import { Loader2, ArrowLeft, LayoutDashboard, Settings, Upload, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurriculumBuilder from "@/components/instructor/CurriculumBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CourseInsights from "@/components/chatbot/CourseInsights";

export default function CourseManagePage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        category: "",
        description: "",
        price: "0",
        level: "beginner",
        language: "en",
        welcome_message: "",
        congratulations_message: ""
    });
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([""]);
    const [requirements, setRequirements] = useState<string[]>([""]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const slug = params?.slug as string;
                if (!slug) {
                    setError("No course slug provided");
                    setLoading(false);
                    return;
                }
                
                // Fetch Categories
                try {
                    const catRes = await api.get("/courses/categories/");
                    setCategories(catRes.data.results || catRes.data);
                } catch (e) {
                    console.error("Failed to fetch categories", e);
                }

                // Fetch Course
                const data = await getCourseBySlug(slug);
                if (user?.id !== data.instructor_id) {
                     setError("You don't have permission to edit this course");
                }
                
                setCourse(data);
                
                // Populate Form
                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    category: data.category?.toString() || "",
                    description: data.description || "",
                    price: data.price?.toString() || "0",
                    level: data.level || "beginner",
                    language: data.language || "en",
                    welcome_message: data.welcome_message || "",
                    congratulations_message: data.congratulations_message || ""
                });
                
                if (data.thumbnail) {
                    setThumbnailPreview(typeof data.thumbnail === 'string' ? data.thumbnail : null);
                }
                
                if (data.what_you_will_learn && Array.isArray(data.what_you_will_learn)) {
                    setWhatYouWillLearn(data.what_you_will_learn.length > 0 ? data.what_you_will_learn : [""]);
                }
                
                if (data.requirements && Array.isArray(data.requirements)) {
                    setRequirements(data.requirements.length > 0 ? data.requirements : [""]);
                }

            } catch (error: any) {
                console.error("Failed to load course", error);
                if (error.response?.status === 404) {
                    setError("Course not found.");
                } else {
                    setError("Failed to load course.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, params, router]);

    const handlePublish = async () => {
        if (!course) return;
        
        // If it's already published or pending, clicking the button will unpublish (revert to draft)
        // If it's draft, clicking will request publish (set to pending)
        const isPublishedOrPending = course.status === 'published' || course.status === 'pending';
        const newStatus = isPublishedOrPending ? 'draft' : 'pending';
        const actionText = isPublishedOrPending ? "unpublish" : "request publish";
        
        if (!confirm(`Are you sure you want to ${actionText} this course?`)) return;
        
        const toastId = toast.loading(`${isPublishedOrPending ? "Unpublishing" : "Requesting publish"}...`);
        try {
            await updateCourse(course.slug, { status: newStatus });
            setCourse({ ...course, status: newStatus });
            toast.success(`Course ${isPublishedOrPending ? "unpublished" : "publish request submitted"} successfully!`, { id: toastId });
        } catch (error) {
            console.error(`Failed to ${actionText}`, error);
            toast.error(`Failed to ${actionText} course`, { id: toastId });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleListChange = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => {
            const newList = [...prev];
            newList[index] = value;
            return newList;
        });
    };

    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ""]);
    };

    const removeListItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => {
            if (prev.length === 1) return [""];
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;
        
        setSaving(true);
        const toastId = toast.loading("Saving settings...");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            
            if (thumbnail) {
                data.append("thumbnail", thumbnail);
            }

            const learnItems = whatYouWillLearn.filter(item => item.trim() !== "");
            const reqItems = requirements.filter(item => item.trim() !== "");

            data.append("what_you_will_learn", JSON.stringify(learnItems));
            data.append("requirements", JSON.stringify(reqItems));

            const updatedCourse = await updateCourse(course.slug, data);
            
            // Refetch full course data to ensure we have relational data like sections
            // which updateCourse response might lack
            const fullCourse = await getCourseBySlug(updatedCourse.slug);
            setCourse(fullCourse);
            
            toast.success("Course settings saved!", { id: toastId });
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h2 className="text-2xl font-bold mb-4">{error || "Course not found"}</h2>
                <Button onClick={() => router.push("/instructor/dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" size="icon" onClick={() => router.push("/instructor/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{course.title}</h1>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                course.status === 'published' 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : course.status === 'pending'
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}>
                                {course.status === 'published' ? "Published" : course.status === 'pending' ? "Pending Review" : "Draft"}
                            </span>
                        </div>
                        <p className="text-muted-foreground">Manage your course content</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" onClick={() => window.open(`/course/${params.slug}`, '_blank')}>Preview</Button>
                     <Button onClick={handlePublish} variant={course.status === 'published' || course.status === 'pending' ? "outline" : "default"}>
                        {course.status === 'published' ? "Unpublish (Pause)" : course.status === 'pending' ? "Cancel Publish Request" : "Request Publish"}
                     </Button>
                </div>
            </div>
            
            <Separator className="my-6" />

            <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="curriculum" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="curriculum">
                    <CurriculumBuilder courseId={course.id} initialSections={course.sections || []} />
                </TabsContent>
                
                <TabsContent value="settings">
                    <div className="grid gap-6">
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                                <div className="space-y-2">
                                    <Label>Course Title</Label>
                                    <Input name="title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input name="subtitle" value={formData.subtitle} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Level</Label>
                                        <Select value={formData.level} onValueChange={(val) => handleSelectChange('level', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                <SelectItem value="all_levels">All Levels</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" rows={5} value={formData.description} onChange={handleChange} />
                                </div>
                            </div>

                             {/* Media */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Course Media</h3>
                                <div className="space-y-2">
                                    <Label>Course Image</Label>
                                    <div className="flex items-center gap-4">
                                         <div className="w-40 h-24 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                                             {thumbnailPreview ? (
                                                 <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                             ) : (
                                                 <Upload className="text-gray-400" />
                                             )}
                                         </div>
                                         <Input type="file" accept="image/*" onChange={handleFileChange} className="max-w-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Outcomes & Requirements */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">Outcomes & Requirements</h3>
                                <div className="space-y-4">
                                    <Label>What will students learn?</Label>
                                    {whatYouWillLearn.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(idx, e.target.value, setWhatYouWillLearn)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(idx, setWhatYouWillLearn)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setWhatYouWillLearn)}><Plus className="h-4 w-4 mr-2" /> Add Outcome</Button>
                                </div>
                                
                                <div className="space-y-4">
                                    <Label>Requirements</Label>
                                    {requirements.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(idx, e.target.value, setRequirements)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(idx, setRequirements)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setRequirements)}><Plus className="h-4 w-4 mr-2" /> Add Requirement</Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Course Messages</h3>
                                <div className="space-y-2">
                                    <Label>Welcome Message</Label>
                                    <Textarea name="welcome_message" placeholder="Sent when students enroll..." rows={3} value={formData.welcome_message} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Congratulations Message</Label>
                                    <Textarea name="congratulations_message" placeholder="Sent when students complete course..." rows={3} value={formData.congratulations_message} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" size="lg" disabled={saving}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>

                        {/* Danger Zone */}
                         <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
                             <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                             <p className="text-sm text-gray-600 mb-4">Deleting this course will move it to the trash.</p>
                             <Button variant="destructive" onClick={async () => {
                                 if (!confirm("Are you sure?")) return;
                                 const tId = toast.loading("Deleting...");
                                 try {
                                     await softDeleteCourse(course.slug);
                                     toast.success("Moved to trash", { id: tId });
                                     router.push("/instructor/dashboard");
                                 } catch (e) {
                                     toast.error("Failed to delete", { id: tId });
                                 }
                             }}>Delete Course</Button>
                         </div>
                         
                         {/* AI Insights Section */}
                         <div className="mt-4">
                             <CourseInsights courseId={course.id} />
                         </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
