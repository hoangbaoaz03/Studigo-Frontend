'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Settings, BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  React.useEffect(() => {
      if (!loading && (!user || !user.is_business)) {
          router.push('/business');
      }
  }, [user, loading, router]);

  if (loading || !user || !user.is_business) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading workspace...</div>;
  }

  const navItems = [
    { name: 'Overview', href: '/business/admin', icon: LayoutDashboard },
    { name: 'People', href: '/business/admin/people', icon: Users },
    { name: 'Licenses & Seats', href: '/business/admin/licenses', icon: BookOpen },
    { name: 'Analytics', href: '/business/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/business/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/business" className="flex items-center gap-2">
             <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">S</div>
             <span className="font-bold text-lg tracking-tight">Studigo Business</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
           {navItems.map((item) => {
             const isActive = pathname === item.href || (item.href !== '/business/admin' && pathname?.startsWith(item.href));
             return (
               <Link key={item.name} href={item.href}>
                 <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                    <item.icon className="h-5 w-5" />
                    {item.name}
                 </div>
               </Link>
             );
           })}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <Button onClick={logout} variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Top Header (Mobile Toggle etc) */}
         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-800">
                {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
               <span className="text-sm text-gray-500">Acme Corp</span>
               <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                 A
               </div>
            </div>
         </header>

         {/* Page Content */}
         <main className="flex-1 overflow-y-auto p-6">
            {children}
         </main>
      </div>
    </div>
  );
}
