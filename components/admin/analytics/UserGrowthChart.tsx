"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserGrowthChartProps {
    data: { date: string; new_users: number }[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    return (
        <Card className="col-span-3 border-gray-800 bg-gray-900/50">
            <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#9ca3af" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                            />
                            <YAxis 
                                stroke="#9ca3af" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip 
                                cursor={{ fill: '#374151', opacity: 0.2 }}
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar 
                                dataKey="new_users" 
                                fill="#22c55e" 
                                radius={[4, 4, 0, 0]} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
