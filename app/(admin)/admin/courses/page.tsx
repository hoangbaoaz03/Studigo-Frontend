"use client";

import { useEffect, useState } from "react";
import { getAdminCourses } from "@/lib/api";
import { CourseTable } from "@/components/admin/courses/CourseTable";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, FilterX, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function AdminCoursesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]); // simplified, assuming API returns array
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    const [page, setPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(search, 500);

    const loadCourses = async () => {
        setLoading(true);
        try {
            // Adjust params based on backend API expectation
            const params: any = { page };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

            const result = await getAdminCourses(params);
            
            // Handle pagination if backend returns { results: [...] }
            if (result.results) {
                setData(result.results);
                setTotalItems(result.count);
                // Assuming default page size is 20
                setTotalPages(Math.ceil(result.count / 20));
            } else if (Array.isArray(result)) {
                setData(result);
                setTotalItems(result.length);
                setTotalPages(1);
            } else {
                setData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to load courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset to page 1 when filters change
        setPage(1);
        setPageInput("1");
    }, [debouncedSearch, statusFilter]);

    useEffect(() => {
        setPageInput(page.toString());
        loadCourses();
    }, [page, debouncedSearch, statusFilter]);

    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(pageInput);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            setPage(pageNum);
        } else {
            setPageInput(page.toString());
        }
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setPage(1);
    };

    // Optimistic update handler
    const handleUpdateCourse = (id: number, updates: any) => {
        setData(prevData => 
            prevData.map(course => 
                course.id === id ? { ...course, ...updates } : course
            )
        );
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-black min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Courses & Content</h1>
                    <p className="text-gray-400 mt-1">
                        Manage all courses, review submissions, and control visibility. {totalItems > 0 && `(${totalItems} total)`}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by title or instructor..."
                        className="pl-8 bg-gray-900 border-gray-700 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                </Select>

                {(search || statusFilter !== 'all') && (
                    <Button 
                        variant="ghost" 
                        onClick={handleClearFilters}
                        className="text-gray-400 hover:text-white"
                    >
                        <FilterX className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <>
                    {data.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No courses found matching your criteria.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <CourseTable 
                                data={data} 
                                onRefresh={loadCourses} 
                                onUpdate={handleUpdateCourse}
                            />
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-end gap-2 py-4">
                                    <div className="text-sm text-gray-400 mr-4">
                                        Total {totalItems} items
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(1)}
                                        disabled={page === 1}
                                        className="h-8 w-8 bg-gray-900 border-gray-800 text-white hover:bg-gray-800 disabled:opacity-50"
                                        title="First Page"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    
                                     <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="h-8 w-8 bg-gray-900 border-gray-800 text-white hover:bg-gray-800 disabled:opacity-50"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2 mx-2">
                                        <span className="text-sm text-gray-400">Page</span>
                                        <Input
                                            type="text"
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            className="h-8 w-12 text-center bg-gray-900 border-gray-700 text-white p-0"
                                        />
                                        <span className="text-sm text-gray-400">of {totalPages}</span>
                                    </form>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        className="h-8 w-8 bg-gray-900 border-gray-800 text-white hover:bg-gray-800 disabled:opacity-50"
                                        title="Next Page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={page === totalPages}
                                        className="h-8 w-8 bg-gray-900 border-gray-800 text-white hover:bg-gray-800 disabled:opacity-50"
                                        title="Last Page"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
