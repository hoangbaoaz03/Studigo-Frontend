"use client";

import Link from "next/link";
import { Search, ShoppingCart, Globe, Menu, LogOut, User as UserIcon, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { MegaMenu } from "@/components/MegaMenu";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLearning } from "@/context/LearningContext";
import { useState, useEffect, useCallback, useRef } from "react";
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

// Helper: relative timestamp
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const { course, toggleSidebar } = useLearning();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await getNotifications();
          setNotifications(res.results || res);
          const countRes = await getUnreadNotificationCount();
          setUnreadCount(countRes.count);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  // Real-time WebSocket listener
  const handleWsMessage = useCallback(async (data: any) => {
    if (data.event === "new_notification") {
      try {
        const res = await getNotifications();
        setNotifications(res.results || res);
        const countRes = await getUnreadNotificationCount();
        setUnreadCount(countRes.count);
      } catch (error) {
        console.error("Failed to refresh notifications", error);
      }
    }
  }, []);

  useWebSocket({
    path: "/ws/notifications/",
    onMessage: handleWsMessage,
    enabled: !!user,
  });

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    setIsNotifOpen(false);
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  // ==================== NOTIFICATION BELL + PANEL ====================
  const NotificationBell = () => (
    <div ref={notifRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsNotifOpen(!isNotifOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isNotifOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden"
          style={{
            animation: "notifSlideIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 20).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 ${
                      !notif.is_read
                        ? "bg-blue-50/70 hover:bg-blue-100/70"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {/* Icon / Avatar */}
                    <div className={`mt-0.5 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      notif.notification_type === 'learning' ? 'bg-purple-500' :
                      notif.notification_type === 'course' ? 'bg-blue-500' :
                      notif.notification_type === 'review' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {notif.notification_type === 'learning' ? '💬' :
                       notif.notification_type === 'course' ? '📢' :
                       notif.notification_type === 'review' ? '⭐' : '🔔'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className={`text-xs mt-1 ${!notif.is_read ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        {notif.created_at ? timeAgo(notif.created_at) : ''}
                      </p>
                    </div>

                    {/* Unread Dot */}
                    {!notif.is_read && (
                      <div className="mt-2 flex-shrink-0">
                        <span className="block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100">
              <Link
                href="/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="block text-center py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes notifSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );

  // ==================== CLEAN AVATAR DROPDOWN (no notifications) ====================
  const AvatarDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profile_photo || ""} />
            <AvatarFallback className="bg-indigo-600 text-white font-bold">
              {user?.first_name?.[0] || user?.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.full_name || user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="w-full">Profile Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/my-courses" className="w-full">{t.navbar.myLearning}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/cart" className="w-full">{t.navbar.myCart}</Link>
        </DropdownMenuItem>
        {user?.is_instructor && (
          <DropdownMenuItem>
            <Link href="/instructor/dashboard" className="w-full text-indigo-600 font-medium">Instructor Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.navbar.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
            {course ? (
                <Menu className="h-6 w-6 cursor-pointer" onClick={toggleSidebar} />
            ) : (
                <Sheet>
                    <SheetTrigger asChild>
                        <Menu className="h-6 w-6 cursor-pointer" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle className="text-left font-serif italic font-bold text-xl">Studigo</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col h-full bg-white">
                             {/* Mobile Search */}
                             <div className="p-4 border-b">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="search" 
                                        placeholder={t.navbar.searchPlaceholder}
                                        className="w-full pl-10 rounded-md bg-gray-50 border-gray-200"
                                    />
                                </div>
                             </div>

                             {/* Mobile Links */}
                             <div className="flex-1 overflow-y-auto py-2">
                                <nav className="flex flex-col px-2 space-y-1">
                                    {!user && (
                                        <div className="flex flex-col gap-2 p-2 mb-4 border-b">
                                            <Link href="/login" className="w-full">
                                                <Button variant="outline" className="w-full justify-center">{t.navbar.login}</Button>
                                            </Link>
                                            <Link href="/register" className="w-full">
                                                <Button className="w-full justify-center bg-gray-900 text-white">{t.navbar.signup}</Button>
                                            </Link>
                                        </div>
                                    )}

                                    <Link href="/" className="px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-md">
                                        Home
                                    </Link>
                                    <Link href="/categories" className="px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-md">
                                        Categories
                                    </Link>
                                    {user && (
                                        <Link href="/my-courses" className="px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-md">
                                            {t.navbar.myLearning}
                                        </Link>
                                    )}
                                    <Link href="/teach" className="px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-md">
                                        {t.navbar.teachOn}
                                    </Link>
                                    <Link href="/business" className="px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-md">
                                        Studigo Business
                                    </Link>
                                </nav>
                             </div>

                             {/* Mobile Bottom Actions */}
                             <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                     <LanguageSwitcher />
                                </div>
                                {user && (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.profile_photo || ""} />
                                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{user.full_name || user.username}</div>
                                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={logout} className="text-red-500">
                                            <LogOut className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}
                             </div>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold italic font-serif text-gray-900">
            Studigo
          </span>
        </Link>

        {course ? (
            /* Learning Mode Content */
            <>
                <div className="h-6 w-[1px] bg-gray-300 mx-2 hidden md:block"></div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xs md:text-md font-medium truncate max-w-xl text-gray-900 ml-2">
                        {course.title}
                    </h1>
                </div>
                
                {/* Learning specific right actions */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                     <div className="text-xs text-right hidden sm:block">
                        <div className="text-gray-500">Your Progress</div>
                        <div className="font-bold text-indigo-600">{Math.round(course.progress)}%</div>
                    </div>

                    {/* Notification Bell */}
                    {user && <NotificationBell />}

                    {/* User Avatar */}
                    {user && <AvatarDropdown />}
                </div>
            </>
        ) : (
            /* Standard Mode Content */
            <>
                {/* Categories - Desktop Only */}
                <div className="hidden md:block">
                   <MegaMenu />
                </div>

                {/* Search Bar - Desktop Only */}
                <div className="hidden md:flex flex-1 max-w-2xl relative">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder={t.navbar.searchPlaceholder}
                            className="w-full pl-10 rounded-full bg-gray-50 border-gray-900/10 focus-visible:ring-gray-900/20"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    
                    {/* Mobile Search Toggle */}
                    <div className="md:hidden">
                        <Search className="h-5 w-5 text-gray-600" /> 
                    </div>

                    {/* Instructor Mode - Desktop Only */}
                    <Link href="/teach">
                      <Button variant="ghost" className="hidden lg:flex text-sm font-normal">
                          {t.navbar.teachOn}
                      </Button>
                    </Link>

                    {/* Cart - Always Visible */}
                    <Link href="/cart">
                      <Button variant="ghost" size="icon" className="relative">
                          <ShoppingCart className="h-5 w-5" />
                          {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {itemCount}
                            </span>
                          )}
                      </Button>
                    </Link>

                    {/* Desktop Auth State */}
                    <div className="hidden md:flex items-center gap-2 pl-2">
                        {user ? (
                          <>
                            <Link href="/my-courses" className="text-sm font-medium text-gray-700 hover:text-indigo-600 mr-2">
                              {t.navbar.myLearning}
                            </Link>

                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* User Avatar (clean - no notifications) */}
                            <AvatarDropdown />
                          </>
                        ) : (
                          <>
                              <Link href="/login">
                                <Button variant="outline" className="font-bold border-gray-900 text-gray-900 hover:bg-gray-100">
                                    {t.navbar.login}
                                </Button>
                              </Link>
                              <Link href="/register">
                                <Button className="font-bold bg-gray-900 text-white hover:bg-gray-800">
                                    {t.navbar.signup}
                                </Button>
                              </Link>
                              <LanguageSwitcher />
                          </>
                        )}
                    </div>
                </div>
            </>
        )}
      </div>
    </header>
  );
}
