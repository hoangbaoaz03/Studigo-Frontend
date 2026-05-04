"use client";

import { useEffect, useState } from "react";
import { getAdminInstructorApplications, approveInstructorApplication, rejectInstructorApplication, requestUpdateInstructorApplication } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Eye, CheckCircle, XCircle, AlertCircle, Video, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await getAdminInstructorApplications({ status: "pending" });
            setApplications(data.results || data);
        } catch (error) {
            toast({ title: "Failed to load applications", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleViewDetails = (app: any) => {
        setSelectedApp(app);
        setDialogOpen(true);
    };

    const handleAction = async (action: 'approve' | 'reject' | 'request_update', id: number) => {
        try {
            if (action === 'approve') {
                if (!confirm("Are you sure you want to approve this application and grant instructor rights?")) return;
                await approveInstructorApplication(id);
                toast({ title: "Application Approved", description: "The user is now an instructor." });
            } else if (action === 'reject') {
                const reason = window.prompt("Enter reason for rejection:");
                if (reason === null) return;
                await rejectInstructorApplication(id, reason || "Does not meet platform requirements");
                toast({ title: "Application Rejected" });
            } else if (action === 'request_update') {
                const reason = window.prompt("What information is missing?");
                if (reason === null) return;
                await requestUpdateInstructorApplication(id, reason || "Please provide more details in your application");
                toast({ title: "Update Requested" });
            }
            
            setDialogOpen(false);
            fetchApplications();
        } catch (error: any) {
            toast({ 
                title: "Action failed", 
                description: error.response?.data?.error || "Something went wrong", 
                variant: "destructive" 
            });
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Instructor Applications</h1>
                    <p className="text-gray-400 mt-1">Review and manage pending instructor requests.</p>
                </div>
                <Button variant="outline" onClick={fetchApplications}>Refresh List</Button>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-800/50">
                        <TableRow className="hover:bg-transparent border-gray-800">
                            <TableHead>Applicant</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No pending applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-white">
                                        {app.user_details?.full_name || app.user_details?.username}
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {app.user_details?.email}
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {app.created_at ? format(new Date(app.created_at), 'MMM dd, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-yellow-900/50 text-yellow-500 border-yellow-900">
                                            Pending Review
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                            onClick={() => handleViewDetails(app)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Review Application</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Review the applicant's details and demo content before deciding.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApp && (
                        <div className="space-y-6 my-4">
                            {/* Applicant Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                                <div className="h-12 w-12 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-xl">
                                    {selectedApp.user_details?.username?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedApp.user_details?.full_name || selectedApp.user_details?.username}</h3>
                                    <p className="text-gray-400">{selectedApp.user_details?.email}</p>
                                </div>
                            </div>

                            {/* Qualifications */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-200 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Qualifications & Experience
                                </h4>
                                <div className="p-4 bg-gray-950 rounded-lg text-gray-300 whitespace-pre-wrap text-sm border border-gray-800">
                                    {selectedApp.qualifications}
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedApp.certifications && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-200 text-sm">Certifications</h4>
                                        <a 
                                            href={selectedApp.certifications} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors text-sm text-blue-400"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View Document
                                        </a>
                                    </div>
                                )}
                                
                                {selectedApp.demo_video && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-200 text-sm">Demo Video</h4>
                                        <a 
                                            href={selectedApp.demo_video} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors text-sm text-blue-400"
                                        >
                                            <Video className="h-4 w-4" />
                                            Watch Video
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800 mt-6">
                                <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleAction('approve', selectedApp.id)}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve & Upgrade
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="border-yellow-600/50 text-yellow-500 hover:bg-yellow-900/20"
                                    onClick={() => handleAction('request_update', selectedApp.id)}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Request More Info
                                </Button>

                                <Button 
                                    variant="destructive"
                                    onClick={() => handleAction('reject', selectedApp.id)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
