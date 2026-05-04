"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, TrendingUp, Brain, HandCoins, Store, Briefcase } from "lucide-react";

interface SummaryData {
    gross_revenue: number;
    net_revenue: number;
    b2c_revenue: number;
    b2b_revenue: number;
    instructor_commission: number;
    ai_tokens_used: number;
    total_users: number;
    active_courses: number;
}

interface SummaryCardsProps {
    data: SummaryData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);
    };

    const cards = [
        {
            title: "Tổng Doanh Thu Thô (Gross)",
            value: formatCurrency(data.gross_revenue),
            icon: DollarSign,
            color: "text-purple-500",
            desc: "Tổng tất cả giao dịch"
        },
        {
            title: "Doanh Thu Thuần (Net)",
            value: formatCurrency(data.net_revenue),
            icon: TrendingUp,
            color: "text-green-500",
            desc: "Doanh thu sau khi chia sẻ"
        },
        {
            title: "Doanh Thu B2C (Lẻ)",
            value: formatCurrency(data.b2c_revenue),
            icon: Store,
            color: "text-blue-400",
            desc: "Mua khóa học cá nhân"
        },
        {
            title: "Doanh Thu B2B (Doanh Nghiệp)",
            value: formatCurrency(data.b2b_revenue),
            icon: Briefcase,
            color: "text-indigo-400",
            desc: "Gói thanh toán doanh nghiệp"
        },
        {
            title: "Đối Soát Hoa Hồng",
            value: formatCurrency(data.instructor_commission),
            icon: HandCoins,
            color: "text-orange-400",
            desc: "Cần trả cho giảng viên"
        },
        {
            title: "Kiểm Soát Chi Phí AI",
            value: data.ai_tokens_used?.toLocaleString() || "0",
            icon: Brain,
            color: "text-pink-500",
            desc: "Tokens API tiêu thụ"
        },
        {
            title: "Tổng Người Dùng",
            value: data.total_users?.toLocaleString() || "0",
            icon: Users,
            color: "text-blue-500",
            desc: "Tài khoản trên hệ thống"
        },
        {
            title: "Khóa Học Active",
            value: data.active_courses?.toLocaleString() || "0",
            icon: BookOpen,
            color: "text-orange-500",
            desc: "Đang xuất bản"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Card key={index} className="border-gray-800 bg-gray-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-200">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
