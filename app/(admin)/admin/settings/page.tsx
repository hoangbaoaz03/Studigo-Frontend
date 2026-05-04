"use client";

import { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSetting } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Settings2, Edit2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface SystemKey {
    id: number;
    key: string;
    value: string;
    type: 'bool' | 'int' | 'float' | 'string' | 'json';
    description: string;
    updated_at: string;
}

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SystemKey[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edit State
    const [editingItem, setEditingItem] = useState<SystemKey | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getAdminSettings();
            setSettings(data.results || data); // Handle pagination if present
        } catch (error) {
            console.error("Failed to load settings", error);
            toast({
                title: "Error",
                description: "Failed to load system settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (item: SystemKey) => {
        // Optimistic update
        const newValue = item.value === 'true' ? 'false' : 'true';
        updateLocalState(item.key, newValue);

        try {
            await updateAdminSetting(item.key, newValue);
            toast({
                title: "Setting Updated",
                description: `${item.key} is now ${newValue}`
            });
        } catch (error) {
            // Revert
            updateLocalState(item.key, item.value);
            toast({
                title: "Error",
                description: "Failed to update setting",
                variant: "destructive"
            });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        try {
            await updateAdminSetting(editingItem.key, editValue);
            updateLocalState(editingItem.key, editValue);
            setIsOpen(false);
            toast({
                title: "Setting Updated",
                description: `${editingItem.key} updated successfully`
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Failed to update setting",
                variant: "destructive"
            });
        }
    };

    const updateLocalState = (key: string, val: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: val } : s));
    };

    const openEdit = (item: SystemKey) => {
        setEditingItem(item);
        setEditValue(item.value);
        setIsOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Settings</h1>
                    <p className="text-gray-400">Configure global platform behavior.</p>
                </div>
                <Button variant="outline" onClick={loadSettings} className="gap-2">
                    <Loader2 className="h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="rounded-md border border-gray-800 bg-gray-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900">
                            <TableHead className="text-gray-400">Key</TableHead>
                            <TableHead className="text-gray-400">Value</TableHead>
                            <TableHead className="text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-400">Description</TableHead>
                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No settings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            settings.map((item) => (
                                <TableRow key={item.key} className="border-gray-800 hover:bg-gray-800/50 text-gray-300">
                                    <TableCell className="font-mono text-sm font-medium text-purple-400">
                                        {item.key}
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {item.type === 'bool' ? (
                                            <Switch 
                                                checked={item.value === 'true'} 
                                                onCheckedChange={() => handleToggle(item)}
                                            />
                                        ) : (
                                            <span className="text-white bg-gray-950 px-2 py-1 rounded font-mono text-xs">
                                                {item.value}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs border-gray-700 text-gray-500">
                                            {item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-xs italic">
                                        {item.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.type !== 'bool' && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => openEdit(item)}
                                                className="hover:bg-gray-800 hover:text-white"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Setting: {editingItem?.key}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right text-gray-400">
                                Value ({editingItem?.type})
                            </Label>
                            {editingItem?.type === 'json' ? (
                                <textarea
                                    id="value"
                                    className="col-span-3 flex min-h-[120px] w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                />
                            ) : (
                                <Input
                                    id="value"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="col-span-3 bg-black border-gray-800"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-gray-800 text-gray-400">Cancel</Button>
                        <Button onClick={handleSaveEdit} className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
