"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyInstructorApplication, submitInstructorApplication, updateInstructorApplication } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ApplyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [application, setApplication] = useState<any>(null);
    
    const [qualifications, setQualifications] = useState("");
    const [certFile, setCertFile] = useState<File | null>(null);
    const [demoFile, setDemoFile] = useState<File | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login?redirect=/teach/apply");
            return;
        }
        if (user.is_instructor) {
            router.push("/instructor/dashboard");
            return;
        }

        const fetchApplication = async () => {
            try {
                const data = await getMyInstructorApplication();
                setApplication(data);
                if (data && (data.status === 'needs_update' || data.status === 'rejected')) {
                    setQualifications(data.qualifications || "");
                }
            } catch (error: any) {
                // 404 means no application exists, which is fine
                if (error.response?.status !== 404) {
                    console.error("Failed to fetch application", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!qualifications) {
            toast.error("Please provide your qualifications");
            return;
        }

        if (!application && !demoFile) {
            toast.error("A demo video is required for your first application");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Submitting application...");

        try {
            const formData = new FormData();
            formData.append("qualifications", qualifications);
            if (certFile) formData.append("certifications", certFile);
            if (demoFile) formData.append("demo_video", demoFile);

            let result;
            if (application && (application.status === 'needs_update' || application.status === 'rejected')) {
                result = await updateInstructorApplication(formData);
            } else {
                result = await submitInstructorApplication(formData);
            }
            
            setApplication(result);
            toast.success("Application submitted successfully!", { id: toastId });
        } catch (error: any) {
            console.error("Submission failed", error);
            toast.error(error.response?.data?.error || "Failed to submit application", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Render status views if application exists and isn't needs_update/rejected
    if (application && (application.status === 'pending' || application.status === 'approved')) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link href="/teach"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Teach Page</Link>
                    </Button>
                    
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="text-center pb-8">
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-yellow-100 text-yellow-600">
                                {application.status === 'pending' ? <Clock className="h-8 w-8" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
                            </div>
                            <CardTitle className="text-2xl">
                                {application.status === 'pending' ? 'Application Under Review' : 'Application Approved!'}
                            </CardTitle>
                            <CardDescription className="text-lg mt-2">
                                {application.status === 'pending' 
                                    ? "We've received your instructor application and our team is currently reviewing it. We'll get back to you soon."
                                    : "Congratulations! You are now an instructor. You can start creating courses."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            {application.status === 'approved' && (
                                <Button size="lg" asChild>
                                    <Link href="/instructor/dashboard">Go to Instructor Dashboard</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link href="/teach"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                </Button>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Apply to Teach</CardTitle>
                        <CardDescription>
                            Join our community of expert instructors. Tell us about your experience and show us how you teach.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {application && (application.status === 'needs_update' || application.status === 'rejected') && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-800">
                                        {application.status === 'needs_update' ? "Action Required" : "Application Rejected"}
                                    </h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        {application.admin_note || "Please update your application and try again."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg font-semibold">Qualifications & Experience *</Label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Detail your professional experience, degrees, and any previous teaching experience.
                                    </p>
                                    <Textarea 
                                        rows={6}
                                        placeholder="I have 5 years of experience in..."
                                        value={qualifications}
                                        onChange={(e) => setQualifications(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="p-4 border rounded-lg bg-white">
                                    <Label className="text-base font-semibold">Certifications (Optional)</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Upload a PDF or image of your most relevant degree or certification.
                                    </p>
                                    <Input 
                                        type="file" 
                                        accept=".pdf,image/*"
                                        onChange={(e) => setCertFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                    {application?.certifications && !certFile && (
                                        <p className="text-xs text-blue-600 mt-2">Current file uploaded. Selecting a new file will replace it.</p>
                                    )}
                                </div>

                                <div className="p-4 border rounded-lg bg-white">
                                    <Label className="text-base font-semibold">Demo Teaching Video {(!application) && "*"}</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Upload a short 1-3 minute video showing your teaching style.
                                    </p>
                                    <Input 
                                        type="file" 
                                        accept="video/*"
                                        onChange={(e) => setDemoFile(e.target.files ? e.target.files[0] : null)}
                                        required={!application}
                                    />
                                    {application?.demo_video && !demoFile && (
                                        <p className="text-xs text-blue-600 mt-2">Current video uploaded. Selecting a new video will replace it.</p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                {application ? "Resubmit Application" : "Submit Application"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
