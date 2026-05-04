"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    CreditCard, 
    Settings, 
    ShieldAlert,
    BarChart3,
    LogOut,
    UserCheck,
    FolderTree
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyAdminPermissions } from "@/lib/api";

// Map each sidebar link to a permission key
const allLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { href: "/admin/users", label: "Users", icon: Users, key: "users" },
    { href: "/admin/users/applications", label: "Instructor Applications", icon: UserCheck, key: "instructor_applications" },
    { href: "/admin/leads", label: "Business Leads", icon: Users, key: "business_leads" },
    { href: "/admin/categories", label: "Categories", icon: FolderTree, key: "categories" },
    { href: "/admin/courses", label: "Courses & Content", icon: BookOpen, key: "courses" },
    { href: "/admin/finance", label: "Finance & Payouts", icon: CreditCard, key: "finance" },
    { href: "/admin/reports", label: "Reports & Issues", icon: ShieldAlert, key: "reports" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, key: "analytics" },
    { href: "/admin/settings", label: "Settings", icon: Settings, key: "settings" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [allowedModules, setAllowedModules] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await getMyAdminPermissions();
                setAllowedModules(data.allowed_modules || []);
            } catch (error) {
                // If API fails, show only dashboard as fallback
                setAllowedModules(["dashboard"]);
            } finally {
                setLoaded(true);
            }
        };
        fetchPermissions();
    }, []);

    // Filter links based on permissions
    const visibleLinks = loaded
        ? allLinks.filter((link) => allowedModules.includes(link.key))
        : []; // Show nothing until loaded

    return (
        <div className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 h-screen sticky top-0 overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-purple-600 rounded flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <span className="font-bold text-white text-lg">Admin Portal</span>
                </Link>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                {visibleLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                    
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                    ? "bg-purple-600/10 text-purple-400" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 mb-2 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </button>
                <div className="px-3 py-2 text-xs text-gray-500">
                    Version 1.0.0
                </div>
            </div>
        </div>
    );
}
