"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex min-h-screen bg-black text-white items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
    );
  }

  // Strict check: Must be logged in AND be Staff or Superuser
  if (!user || (!user.is_staff && !user.is_superuser)) {
    // Trigger 404 Not Found
    notFound(); 
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
