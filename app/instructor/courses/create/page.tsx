"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, Category } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateCoursePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    description: "",
    price: "0",
    level: "beginner",
    language: "en"
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/courses/categories/");
        setCategories(data.results || data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleListChange = (
      index: number, 
      value: string, 
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setter(prev => {
          const newList = [...prev];
          newList[index] = value;
          return newList;
      });
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter(prev => [...prev, ""]);
  };

  const removeListItem = (
      index: number, 
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setter(prev => {
          if (prev.length === 1) return [""]; // Keep at least one empty
          return prev.filter((_, i) => i !== index);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("level", formData.level);
      data.append("language", formData.language);
      
      if (thumbnail) {
          data.append("thumbnail", thumbnail);
      }

      // Filter out empty strings
      const learnItems = whatYouWillLearn.filter(item => item.trim() !== "");
      const reqItems = requirements.filter(item => item.trim() !== "");

      // Send as JSON string for JSONFields
      data.append("what_you_will_learn", JSON.stringify(learnItems));
      data.append("requirements", JSON.stringify(reqItems));

      // Create course
      const response = await api.post("/courses/courses/", data); // axios auto sets Content-Type to multipart/form-data
      
      toast.success("Course created successfully!");
      router.push(`/instructor/courses/${response.data.slug}/manage`);
    } catch (error) {
      console.error("Failed to create course", error);
      toast.error("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href="/instructor/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Course</CardTitle>
          <CardDescription>Start your journey as an instructor. Fill in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g. Complete Web Development Bootcamp" 
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input 
                    id="subtitle" 
                    name="subtitle" 
                    placeholder="Brief summary of your course" 
                    value={formData.subtitle}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(val) => handleSelectChange('category', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(val) => handleSelectChange('level', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
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
                   <Label htmlFor="description">Description (Markdown Supported)</Label>
                   <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Detailed description of your course..." 
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                   />
                </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Course Media</h3>
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
                         <Input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full max-w-sm"
                         />
                    </div>
                    <p className="text-sm text-gray-500">
                        Upload your course image here. Important guidelines: 750x422 pixels; .jpg, .jpeg,. gif, or .png. no text on the image.
                    </p>
                </div>
            </div>
            
            {/* Outcomes & Requirements */}
            <div className="space-y-6">
                 <div>
                     <Label className="text-lg block mb-2">What will students learn?</Label>
                     <div className="space-y-2">
                         {whatYouWillLearn.map((item, index) => (
                             <div key={index} className="flex gap-2">
                                 <Input 
                                    placeholder="e.g. Build fullstack apps with Next.js"
                                    value={item}
                                    onChange={(e) => handleListChange(index, e.target.value, setWhatYouWillLearn)}
                                 />
                                 <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeListItem(index, setWhatYouWillLearn)}
                                 >
                                     <X className="h-4 w-4" />
                                 </Button>
                             </div>
                         ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setWhatYouWillLearn)}>
                             <Plus className="h-4 w-4 mr-2" /> Add more
                         </Button>
                     </div>
                 </div>

                 <div>
                     <Label className="text-lg block mb-2">Requirements</Label>
                     <div className="space-y-2">
                         {requirements.map((item, index) => (
                             <div key={index} className="flex gap-2">
                                 <Input 
                                    placeholder="e.g. Basic understanding of JavaScript"
                                    value={item}
                                    onChange={(e) => handleListChange(index, e.target.value, setRequirements)}
                                 />
                                 <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeListItem(index, setRequirements)}
                                 >
                                     <X className="h-4 w-4" />
                                 </Button>
                             </div>
                         ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setRequirements)}>
                             <Plus className="h-4 w-4 mr-2" /> Add more
                         </Button>
                     </div>
                 </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium">Pricing</h3>
                 <div className="max-w-xs">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
