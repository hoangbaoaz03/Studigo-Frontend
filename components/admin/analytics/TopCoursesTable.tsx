"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopCourse {
    id: number;
    title: string;
    revenue: number;
    enrollments: number;
}

interface TopCoursesTableProps {
    data: TopCourse[];
}

export function TopCoursesTable({ data }: TopCoursesTableProps) {
    return (
        <Card className="col-span-4 lg:col-span-3 border-gray-800 bg-gray-900/50">
            <CardHeader>
                <CardTitle className="text-white">Top Performing Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="w-[300px] text-gray-400">Course Name</TableHead>
                            <TableHead className="text-right text-gray-400">Enrollments</TableHead>
                            <TableHead className="text-right text-gray-400">Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-gray-500">
                                    No data available in this period
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((course) => (
                                <TableRow key={course.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-gray-200">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[250px]">{course.title}</span>
                                            <span className="text-xs text-gray-500">ID: #{course.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-white">
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                                            {course.enrollments}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-green-400 font-mono">
                                        ${Number(course.revenue).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
