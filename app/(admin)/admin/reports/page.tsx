"use client";

import { useEffect, useState } from "react";
import { getAdminReports, assignReport, resolveReport } from "@/lib/api";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, UserPlus, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Report {
    id: number;
    reason: string;
    description: string;
    status: string;
    reporter_name: string;
    content_type_str: string;
    content_object_str: string;
    assigned_to_name: string;
    created_at: string;
}

export default function AdminReportsPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("open");

    // Resolve Dialog
    const [resolveId, setResolveId] = useState<number | null>(null);
    const [resolutionNote, setResolutionNote] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadReports();
    }, [activeTab]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const statusFilter = activeTab === 'all' ? undefined : activeTab;
            // API filtering logic should ideally handle comma-separated values or 'open' implies 'open,investigating'
            // For simplicity, we just fetch and let backend or frontend filter, 
            // but let's assume backend supports `?status=open`
            const data = await getAdminReports({ status: activeTab === 'history' ? 'resolved' : 'open' }); 
            setReports(data.results || data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (id: number) => {
        try {
            await assignReport(id);
            toast({ title: "Report Assigned", description: "You are now investigating this report." });
            loadReports();
        } catch (error) {
            toast({ title: "Error", description: "Failed to assign report", variant: "destructive" });
        }
    };

    const handleResolve = async () => {
        if (!resolveId) return;
        
        try {
            setProcessing(true);
            await resolveReport(resolveId, { 
                resolution: 'resolved', 
                note: resolutionNote 
            });
            toast({ title: "Report Resolved", description: "Case closed successfully." });
            setResolveId(null);
            setResolutionNote("");
            loadReports();
        } catch (error) {
            toast({ title: "Error", description: "Failed to resolve report", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-500/10 text-red-500';
            case 'investigating': return 'bg-yellow-500/10 text-yellow-500';
            case 'resolved': return 'bg-green-500/10 text-green-500';
            case 'dismissed': return 'bg-gray-500/10 text-gray-500';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reports & Issues</h1>
            
            <Tabs defaultValue="open" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-gray-900 border border-gray-800">
                    <TabsTrigger value="open">Active Issues</TabsTrigger>
                    <TabsTrigger value="history">Resolved History</TabsTrigger>
                </TabsList>
                
                <div className="mt-6 rounded-md border border-gray-800 bg-gray-900/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-gray-900">
                                <TableHead className="text-gray-400">Wait Time</TableHead>
                                <TableHead className="text-gray-400">Type / ID</TableHead>
                                <TableHead className="text-gray-400">Reason</TableHead>
                                <TableHead className="text-gray-400">Details</TableHead>
                                <TableHead className="text-gray-400">Reporter</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500" />
                                    </TableCell>
                                </TableRow>
                            ) : reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id} className="border-gray-800 hover:bg-gray-800/50 text-gray-300">
                                        <TableCell className="font-mono text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(report.created_at))} ago
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-gray-700 bg-gray-900">
                                                {report.content_type_str} #{report.id}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-white">
                                            {report.reason}
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate text-xs text-gray-400">
                                            {report.description || report.content_object_str}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {report.reporter_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(report.status)}>
                                                {report.status}
                                            </Badge>
                                            {report.assigned_to_name && (
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    Assigned: {report.assigned_to_name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {report.status !== 'resolved' && report.status !== 'dismissed' && (
                                                <div className="flex justify-end gap-2">
                                                    {!report.assigned_to_name && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300" onClick={() => handleAssign(report.id)}>
                                                            <UserPlus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:text-green-300" onClick={() => setResolveId(report.id)}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>

            <Dialog open={!!resolveId} onOpenChange={(open) => !open && setResolveId(null)}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Resolve Report #{resolveId}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label>Resolution Note</Label>
                        <Textarea 
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Explain how this issue was resolved..."
                            className="bg-black border-gray-800 min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setResolveId(null)}>Cancel</Button>
                        <Button onClick={handleResolve} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Resolved"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
