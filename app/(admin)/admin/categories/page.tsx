"use client";

import { useState, useEffect } from "react";
import { 
    getAdminCategories, 
    createAdminCategory, 
    updateAdminCategory, 
    deleteAdminCategory, 
    toggleAdminCategoryActive, 
    reorderAdminCategories, 
    moveCoursesToCategory 
} from "@/lib/api";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    EyeOff, 
    Eye, 
    FolderTree, 
    ChevronRight, 
    ChevronDown, 
    ArrowUp, 
    ArrowDown,
    MoreVertical,
    AlertTriangle,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [flatCategories, setFlatCategories] = useState<any[]>([]); // Useful for dropdowns
    const [loading, setLoading] = useState(true);
    
    const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Delete state
    const [deleteInfo, setDeleteInfo] = useState<{requiresMove: boolean, courseCount: number}>({requiresMove: false, courseCount: 0});
    const [targetCategoryId, setTargetCategoryId] = useState<string>("");

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        name_vi: "",
        slug: "",
        description: "",
        icon: "",
        parent: "" as string | null
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const flattenCategories = (nodes: any[], level = 0): any[] => {
        let result: any[] = [];
        nodes.forEach(node => {
            result.push({ ...node, level });
            if (node.children && node.children.length > 0) {
                result = result.concat(flattenCategories(node.children, level + 1));
            }
        });
        return result;
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAdminCategories();
            setCategories(data);
            setFlatCategories(flattenCategories(data));
        } catch (error) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setFormData({
            name: "",
            name_vi: "",
            slug: "",
            description: "",
            icon: "",
            parent: null
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (category: any) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            name_vi: category.name_vi || "",
            slug: category.slug,
            description: category.description || "",
            icon: category.icon || "",
            parent: category.parent ? category.parent.toString() : null
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = async (category: any) => {
        setSelectedCategory(category);
        setTargetCategoryId("");
        
        // Try to delete immediately to check if there are courses
        try {
            await deleteAdminCategory(category.id);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error: any) {
            if (error.response?.data?.requires_move) {
                setDeleteInfo({
                    requiresMove: true,
                    courseCount: error.response.data.courses_count
                });
                setIsDeleteModalOpen(true);
            } else {
                toast.error("Failed to delete category");
            }
        }
    };

    const handleSaveCategory = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                parent: formData.parent && formData.parent !== "none" ? parseInt(formData.parent) : null
            };

            if (selectedCategory) {
                await updateAdminCategory(selectedCategory.id, payload);
                toast.success("Category updated successfully");
            } else {
                await createAdminCategory(payload);
                toast.success("Category created successfully");
            }
            setIsEditModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.slug?.[0] || "Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteWithMove = async () => {
        if (!targetCategoryId) {
            toast.error("Please select a target category");
            return;
        }

        setIsSubmitting(true);
        try {
            await moveCoursesToCategory(selectedCategory.id, parseInt(targetCategoryId));
            await deleteAdminCategory(selectedCategory.id);
            toast.success("Courses moved and category deleted");
            setIsDeleteModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to move courses and delete category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (category: any) => {
        try {
            await toggleAdminCategoryActive(category.id);
            toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to toggle status");
        }
    };

    const handleReorder = async (category: any, direction: 'up' | 'down', siblings: any[]) => {
        const index = siblings.findIndex(s => s.id === category.id);
        if (
            (direction === 'up' && index === 0) || 
            (direction === 'down' && index === siblings.length - 1)
        ) {
            return;
        }

        const newSiblings = [...siblings];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap orders
        const tempOrder = newSiblings[index].order;
        newSiblings[index].order = newSiblings[swapIndex].order;
        newSiblings[swapIndex].order = tempOrder;

        try {
            await reorderAdminCategories([
                { id: newSiblings[index].id, order: newSiblings[index].order },
                { id: newSiblings[swapIndex].id, order: newSiblings[swapIndex].order }
            ]);
            toast.success("Order updated");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to update order");
        }
    };

    const renderTreeNodes = (nodes: any[], level = 0) => {
        return nodes.map((node, index) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedNodes[node.id] || false;

            return (
                <div key={node.id} className="flex flex-col">
                    <div 
                        className={`flex items-center p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                            !node.is_active ? 'opacity-60' : ''
                        }`}
                        style={{ paddingLeft: `${(level * 2) + 1}rem` }}
                    >
                        <div className="flex items-center gap-2 w-8 shrink-0">
                            {hasChildren && (
                                <button 
                                    onClick={() => toggleExpand(node.id)}
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center shrink-0">
                                {node.icon ? <i className={`${node.icon} text-gray-400 text-sm`}></i> : <FolderTree size={16} className="text-gray-400" />}
                            </div>
                            <div>
                                <div className="font-medium text-gray-200">{node.name}</div>
                                {node.name_vi && <div className="text-xs text-gray-500">{node.name_vi}</div>}
                            </div>
                        </div>

                        <div className="w-24 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                                {node.course_count || 0} courses
                            </span>
                        </div>

                        <div className="w-24 text-center">
                            {node.is_active ? (
                                <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                                    <Check size={12} /> Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                                    <EyeOff size={12} /> Hidden
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 w-32 justify-end">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-400 hover:text-white"
                                onClick={() => handleReorder(node, 'up', nodes)}
                                disabled={index === 0}
                            >
                                <ArrowUp size={16} />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-400 hover:text-white"
                                onClick={() => handleReorder(node, 'down', nodes)}
                                disabled={index === nodes.length - 1}
                            >
                                <ArrowDown size={16} />
                            </Button>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                        <MoreVertical size={16} className="text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800 text-gray-200">
                                    <DropdownMenuItem onClick={() => handleOpenEdit(node)} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(node)} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                                        {node.is_active ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                        {node.is_active ? 'Hide from public' : 'Show to public'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenDelete(node)} className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete category
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    
                    {hasChildren && isExpanded && (
                        <div className="flex flex-col">
                            {renderTreeNodes(node.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Category Management</h1>
                    <p className="text-gray-400">Organize and structure your course catalog</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center p-4 border-b border-gray-800 bg-gray-800/50 text-sm font-medium text-gray-400">
                    <div className="w-8 shrink-0"></div>
                    <div className="flex-1">Category Name</div>
                    <div className="w-24 text-center">Courses</div>
                    <div className="w-24 text-center">Status</div>
                    <div className="w-32 text-right pr-4">Actions</div>
                </div>
                
                {categories.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No categories found. Create your first category to get started.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {renderTreeNodes(categories)}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-gray-200 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Categories help organize courses making them easier to find.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name (English) <span className="text-red-500">*</span></Label>
                            <Input 
                                id="name" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-gray-800 border-gray-700"
                                placeholder="e.g. Web Development"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name_vi">Name (Vietnamese)</Label>
                            <Input 
                                id="name_vi" 
                                value={formData.name_vi}
                                onChange={(e) => setFormData({...formData, name_vi: e.target.value})}
                                className="bg-gray-800 border-gray-700"
                                placeholder="e.g. Phát triển Web"
                            />
                        </div>
                        {selectedCategory && (
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input 
                                    id="slug" 
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    className="bg-gray-800 border-gray-700 font-mono text-sm"
                                    placeholder="auto-generated-if-empty"
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="parent">Parent Category</Label>
                            <Select 
                                value={formData.parent || "none"} 
                                onValueChange={(val) => setFormData({...formData, parent: val})}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200 max-h-[300px]">
                                    <SelectItem value="none" className="font-semibold">-- None (Root Category) --</SelectItem>
                                    {flatCategories.map(cat => (
                                        <SelectItem 
                                            key={cat.id} 
                                            value={cat.id.toString()}
                                            disabled={selectedCategory && (cat.id === selectedCategory.id || cat.parent === selectedCategory.id)}
                                        >
                                            {"\u00A0".repeat(cat.level * 4)}
                                            {cat.level > 0 && "└ "}
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="icon">Icon Class (Optional)</Label>
                            <Input 
                                id="icon" 
                                value={formData.icon}
                                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                className="bg-gray-800 border-gray-700"
                                placeholder="e.g. fas fa-code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea 
                                id="description" 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="bg-gray-800 border-gray-700 min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Save Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal with Move option */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-gray-900 border-red-900/50 text-gray-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Cannot Delete Category Directly
                        </DialogTitle>
                        <DialogDescription className="text-gray-300 pt-2 text-base">
                            The category <strong>"{selectedCategory?.name}"</strong> contains {deleteInfo.courseCount} course(s). 
                            To ensure data integrity, you must move these courses to another category before deleting.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-500 font-medium">Action Required:</p>
                            <p className="text-sm text-gray-400 mt-1">Select a destination category for the existing courses.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Move courses to:</Label>
                            <Select 
                                value={targetCategoryId} 
                                onValueChange={setTargetCategoryId}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue placeholder="Select destination category" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200 max-h-[250px]">
                                    {flatCategories
                                        .filter(cat => cat.id !== selectedCategory?.id && cat.parent !== selectedCategory?.id)
                                        .map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {"\u00A0".repeat(cat.level * 4)}
                                                {cat.level > 0 && "└ "}
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteWithMove} 
                            disabled={!targetCategoryId || isSubmitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Move Courses & Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
