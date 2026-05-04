"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
    data: { date: string; revenue: number; b2c_revenue: number; b2b_revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Card className="col-span-4 border-gray-800 bg-gray-900/50">
            <CardHeader>
                <CardTitle className="text-white">Xu hướng Doanh thu (B2C & B2B)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorB2C" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="b2c_revenue" 
                                name="B2C"
                                stackId="1"
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorB2C)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="b2b_revenue" 
                                name="B2B"
                                stackId="1"
                                stroke="#10b981" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorB2B)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
