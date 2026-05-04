"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, toggleUserStatus, verifyInstructor, getAdminStaffList, setUserStaff, updateAdminPermissions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Loader2, UserX, UserCheck, ShieldCheck, Mail, Calendar, Shield, Crown, Save, UserPlus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const MODULE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'Users',
    instructor_applications: 'Instructor Applications',
    business_leads: 'Business Leads',
    categories: 'Categories',
    courses: 'Courses & Content',
    finance: 'Finance & Payouts',
    reports: 'Reports & Issues',
    analytics: 'Analytics',
    settings: 'Settings',
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    // Admin permissions state
    const [adminUsers, setAdminUsers] = useState<any[]>([]);
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    // Add staff modal
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [addStaffEmail, setAddStaffEmail] = useState('');
    const [addingStaff, setAddingStaff] = useState(false);

    // Edit permissions modal
    const [isEditPermOpen, setIsEditPermOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<any>(null);
    const [editModules, setEditModules] = useState<string[]>([]);
    const [savingPerms, setSavingPerms] = useState(false);

    // ─── Fetch general users ───
    const fetchUsers = () => {
        setLoading(true);
        const params: any = {};
        if (roleFilter !== "all" && roleFilter !== "admin") params.role = roleFilter;
        if (searchQuery) params.search = searchQuery;

        getAdminUsers(params)
            .then((data) => {
                setUsers(data.results || data);
            })
            .catch((err) => {
                console.error(err);
                toast({ title: "Failed to load users", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // ─── Fetch admin staff list ───
    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const data = await getAdminStaffList();
            setAdminUsers(data.users || []);
            setAvailableModules(data.available_modules || []);
        } catch (error) {
            console.error('Failed to load admin users', error);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        if (roleFilter === "admin") {
            fetchAdmins();
        } else {
            fetchUsers();
        }
    }, [roleFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (roleFilter === "admin") {
            fetchAdmins();
        } else {
            fetchUsers();
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await toggleUserStatus(id);
            toast({ title: `User ${currentStatus ? 'deactivated' : 'activated'}` });
            fetchUsers();
        } catch (error) {
            toast({ title: "Action failed", variant: "destructive" });
        }
    };

    const handleVerify = async (id: number) => {
        try {
            await verifyInstructor(id);
            toast({ title: "Instructor verified" });
            fetchUsers();
        } catch (error) {
            toast({ title: "Verification failed", variant: "destructive" });
        }
    };

    // ─── Admin permission handlers ───
    const handleAddStaff = async () => {
        if (!addStaffEmail.trim()) return;
        setAddingStaff(true);
        try {
            await setUserStaff(addStaffEmail.trim(), true);
            toast({ title: 'Thành công', description: 'Đã thêm admin mới.' });
            setIsAddStaffOpen(false);
            setAddStaffEmail('');
            fetchAdmins();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.response?.data?.detail || 'Không thể thêm admin.', variant: 'destructive' });
        } finally {
            setAddingStaff(false);
        }
    };

    const handleRemoveStaff = async (email: string) => {
        if (!confirm(`Bạn có chắc muốn thu hồi quyền admin của "${email}"?`)) return;
        try {
            await setUserStaff(email, false);
            toast({ title: 'Thành công', description: 'Đã thu hồi quyền admin.' });
            fetchAdmins();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: 'Không thể thu hồi quyền.', variant: 'destructive' });
        }
    };

    const handleEditPermClick = (u: any) => {
        setEditingAdmin(u);
        setEditModules([...u.allowed_modules]);
        setIsEditPermOpen(true);
    };

    const toggleModule = (mod: string) => {
        setEditModules((prev) =>
            prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
        );
    };

    const handleSavePermissions = async () => {
        if (!editingAdmin) return;
        setSavingPerms(true);
        try {
            await updateAdminPermissions(editingAdmin.id, editModules);
            toast({ title: 'Thành công', description: 'Đã cập nhật phân quyền.' });
            setIsEditPermOpen(false);
            fetchAdmins();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: 'Không thể cập nhật.', variant: 'destructive' });
        } finally {
            setSavingPerms(false);
        }
    };

    const isSuperUser = currentUser?.is_superuser;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                {roleFilter === "admin" && isSuperUser && (
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsAddStaffOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Thêm Admin
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-[500px]">
                    <TabsList className="bg-gray-800 text-gray-400">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="instructor">Instructors</TabsTrigger>
                        <TabsTrigger value="student">Students</TabsTrigger>
                        <TabsTrigger value="business">Business</TabsTrigger>
                        <TabsTrigger value="admin">Admins</TabsTrigger>
                    </TabsList>
                </Tabs>

                {roleFilter !== "admin" && (
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Search users..."
                            className="bg-gray-900 border-gray-700 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" variant="outline" className="border-gray-700 hover:bg-gray-800">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                )}
            </div>

            {/* ══════════════ Normal Users Table ══════════════ */}
            {roleFilter !== "admin" && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-800/50">
                            <TableRow className="hover:bg-transparent border-gray-800">
                                <TableHead className="w-[80px]">User</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.profile_photo || ""} />
                                                    <AvatarFallback className="bg-purple-900 text-purple-200">
                                                        {user.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-white">{user.full_name || user.username}</div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {user.is_staff && <Badge variant="destructive">Admin</Badge>}
                                                {user.is_instructor && <Badge className="bg-purple-600 hover:bg-purple-700">Instructor</Badge>}
                                                {user.is_business && <Badge className="bg-blue-600 hover:bg-blue-700">Business</Badge>}
                                                {(!user.is_staff && !user.is_instructor && !user.is_business) && <Badge variant="secondary">Student</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(user.date_joined).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? "outline" : "destructive"} className={user.is_active ? "text-green-500 border-green-900 bg-green-900/10" : ""}>
                                                {user.is_active ? "Active" : "Banned"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.is_instructor && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                        onClick={() => handleVerify(user.id)}
                                                        title="Verify Instructor"
                                                    >
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={`h-8 w-8 ${user.is_active ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-green-400 hover:text-green-300 hover:bg-green-900/20"}`}
                                                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                    title={user.is_active ? "Ban User" : "Activate User"}
                                                >
                                                    {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* ══════════════ Admins Tab ══════════════ */}
            {roleFilter === "admin" && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-800/50">
                            <TableRow className="hover:bg-transparent border-gray-800">
                                <TableHead>User</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead>Modules được phép</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingAdmins ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                                    </TableCell>
                                </TableRow>
                            ) : adminUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                        Chưa có admin nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                adminUsers.map((u) => (
                                    <TableRow key={u.id} className="border-gray-800 hover:bg-gray-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    u.is_superuser ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                    {u.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{u.full_name}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {u.is_superuser ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                    <Crown className="h-3 w-3" /> Super Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    <Shield className="h-3 w-3" /> Admin
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.is_superuser ? (
                                                <span className="text-xs text-gray-400 italic">Toàn quyền</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {u.allowed_modules.length === 0 ? (
                                                        <span className="text-xs text-gray-500">Chưa phân quyền</span>
                                                    ) : (
                                                        u.allowed_modules.map((mod: string) => (
                                                            <span key={mod} className="inline-block px-2 py-0.5 rounded text-[11px] bg-gray-700 text-gray-300">
                                                                {MODULE_LABELS[mod] || mod}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!u.is_superuser && isSuperUser && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                        onClick={() => handleEditPermClick(u)}
                                                    >
                                                        Phân quyền
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        onClick={() => handleRemoveStaff(u.email)}
                                                        title="Thu hồi quyền admin"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* ══════════════ MODAL: Add Staff ══════════════ */}
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm Admin mới</DialogTitle>
                        <DialogDescription>Nhập email của người dùng đã có tài khoản để cấp quyền admin.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="staff-email">Email người dùng</Label>
                        <Input id="staff-email" type="email" placeholder="user@example.com" value={addStaffEmail} onChange={(e) => setAddStaffEmail(e.target.value)} className="mt-1" onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>Hủy</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddStaff} disabled={addingStaff || !addStaffEmail.trim()}>
                            {addingStaff && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Thêm Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══════════════ MODAL: Edit Permissions ══════════════ */}
            <Dialog open={isEditPermOpen} onOpenChange={setIsEditPermOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Phân quyền — {editingAdmin?.full_name}</DialogTitle>
                        <DialogDescription>{editingAdmin?.email} — Chọn các module mà admin này được phép truy cập.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4">
                            <Label className="text-sm font-medium">Modules</Label>
                            <div className="flex gap-2">
                                <button onClick={() => setEditModules([...availableModules])} className="text-xs text-purple-400 hover:text-purple-300">Chọn tất cả</button>
                                <span className="text-gray-600">|</span>
                                <button onClick={() => setEditModules([])} className="text-xs text-gray-400 hover:text-gray-300">Bỏ chọn</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {availableModules.map((mod) => (
                                <label key={mod} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    editModules.includes(mod) ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'
                                }`}>
                                    <input type="checkbox" checked={editModules.includes(mod)} onChange={() => toggleModule(mod)} className="sr-only" />
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${editModules.includes(mod) ? 'border-purple-500 bg-purple-500' : 'border-gray-600'}`}>
                                        {editModules.includes(mod) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{MODULE_LABELS[mod] || mod}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Đã chọn {editModules.length}/{availableModules.length} modules</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditPermOpen(false)}>Hủy</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSavePermissions} disabled={savingPerms}>
                            {savingPerms ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Lưu phân quyền
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
