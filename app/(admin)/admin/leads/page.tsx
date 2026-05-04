"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Loader2, CheckCircle2, Building2, Mail, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminBusinessLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchLeads = () => {
        setLoading(true);
        api.get("/admin/business-leads/")
            .then((res) => {
                setLeads(res.data.results || res.data);
            })
            .catch((err) => {
                console.error(err);
                toast({ title: "Failed to load leads", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAccept = async (id: number) => {
        try {
            const res = await api.post(`/admin/business-leads/${id}/accept/`);
            toast({ 
                title: "Account Created!", 
                description: `Username: ${res.data.username} | Password: ${res.data.password}`,
                duration: 10000 
            });
            fetchLeads();
        } catch (error: any) {
            toast({ 
                title: "Failed to accept lead", 
                description: error.response?.data?.message || "An error occurred.",
                variant: "destructive" 
            });
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Business Demo Requests</h1>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-800/50">
                        <TableRow className="hover:bg-transparent border-gray-800">
                            <TableHead>Contact</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Team Size</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                                </TableCell>
                            </TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No business leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell>
                                        <div className="font-medium text-white">{lead.full_name}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Mail className="h-3 w-3" />
                                            {lead.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            {lead.company_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Users className="h-4 w-4" />
                                            {lead.team_size}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm max-w-[200px] truncate" title={lead.message}>
                                        {lead.message || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={lead.status === 'NEW' ? "outline" : "default"} 
                                            className={
                                                lead.status === 'NEW' ? "text-yellow-500 border-yellow-900 bg-yellow-900/10" : 
                                                lead.status === 'CONVERTED' ? "bg-green-600 text-white" : ""
                                            }
                                        >
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {lead.status === 'NEW' && (
                                            <Button 
                                                size="sm" 
                                                className="bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleAccept(lead.id)}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Accept Request
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
