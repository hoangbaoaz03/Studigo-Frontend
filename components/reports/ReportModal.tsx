"use client";

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { createReport } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Flag } from "lucide-react";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentType: string; // 'course', 'review', etc.
    objectId: number;
}

const REASONS = [
    { value: "spam", label: "Spam or Misleading" },
    { value: "harassment", label: "Harassment or Hate Speech" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "other", label: "Other" },
];

export function ReportModal({ isOpen, onClose, contentType, objectId }: ReportModalProps) {
    const { toast } = useToast();
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast({
                title: "Reason Required",
                description: "Please select a reason for reporting.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);
            await createReport({
                content_type: contentType,
                object_id: objectId,
                reason,
                description
            });
            
            toast({
                title: "Report Submitted",
                description: "Thank you. Our team will investigate this issue.",
            });
            
            // Reset and close
            setReason("");
            setDescription("");
            onClose();
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Could not submit report. Please try again.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-red-500" />
                        Report Content
                    </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select onValueChange={setReason} value={reason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="desc">Description (Optional)</Label>
                        <Textarea 
                            id="desc" 
                            placeholder="Please provide specific details..." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
