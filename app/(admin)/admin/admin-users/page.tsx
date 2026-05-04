'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ShieldCheck, UserPlus, Save, Crown, Shield, X } from 'lucide-react';
import { getAdminStaffList, setUserStaff, updateAdminPermissions } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { notFound } from 'next/navigation';

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
    const { user } = useAuth();
    const { toast } = useToast();

    // Only superusers can access this page
    if (user && !user.is_superuser) {
        notFound();
    }

    const [adminUsers, setAdminUsers] = useState<any[]>([]);
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Add staff modal
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addingStaff, setAddingStaff] = useState(false);

    // Edit permissions modal
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editModules, setEditModules] = useState<string[]>([]);
    const [savingPerms, setSavingPerms] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAdminStaffList();
            setAdminUsers(data.users || []);
            setAvailableModules(data.available_modules || []);
        } catch (error) {
            console.error('Failed to load admin users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddStaff = async () => {
        if (!addEmail.trim()) return;
        setAddingStaff(true);
        try {
            await setUserStaff(addEmail.trim(), true);
            toast({ title: 'Thành công', description: 'Đã thêm admin mới.' });
            setIsAddOpen(false);
            setAddEmail('');
            fetchData();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.response?.data?.detail || 'Không thể thêm admin.', variant: 'destructive' });
        } finally {
            setAddingStaff(false);
        }
    };

    const handleRemoveStaff = async (userId: number, email: string) => {
        if (!confirm(`Bạn có chắc muốn thu hồi quyền admin của "${email}"?`)) return;
        try {
            await setUserStaff(email, false);
            toast({ title: 'Thành công', description: 'Đã thu hồi quyền admin.' });
            fetchData();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: 'Không thể thu hồi quyền.', variant: 'destructive' });
        }
    };

    const handleEditClick = (u: any) => {
        setEditingUser(u);
        setEditModules([...u.allowed_modules]);
        setIsEditOpen(true);
    };

    const toggleModule = (mod: string) => {
        setEditModules((prev) =>
            prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
        );
    };

    const handleSelectAll = () => {
        setEditModules([...availableModules]);
    };

    const handleDeselectAll = () => {
        setEditModules([]);
    };

    const handleSavePermissions = async () => {
        if (!editingUser) return;
        setSavingPerms(true);
        try {
            await updateAdminPermissions(editingUser.id, editModules);
            toast({ title: 'Thành công', description: 'Đã cập nhật phân quyền.' });
            setIsEditOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: 'Lỗi', description: 'Không thể cập nhật.', variant: 'destructive' });
        } finally {
            setSavingPerms(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-purple-400" />
                        Quản lý Admin
                    </h1>
                    <p className="text-gray-400 mt-1">Phân quyền truy cập admin portal cho từng người dùng.</p>
                </div>
                <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setIsAddOpen(true)}
                >
                    <UserPlus className="h-4 w-4 mr-2" /> Thêm Admin
                </Button>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
            ) : (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800/50 border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-400">User</th>
                                <th className="px-6 py-4 font-medium text-gray-400">Vai trò</th>
                                <th className="px-6 py-4 font-medium text-gray-400">Modules được phép</th>
                                <th className="px-6 py-4 font-medium text-gray-400 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {adminUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
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
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_superuser ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                <Crown className="h-3 w-3" /> Super Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                <Shield className="h-3 w-3" /> Admin
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
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
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!u.is_superuser && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                    onClick={() => handleEditClick(u)}
                                                >
                                                    Phân quyền
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => handleRemoveStaff(u.id, u.email)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {adminUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-gray-500">
                                        Chưa có admin nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══════════ MODAL: Add Staff ═══════════ */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm Admin mới</DialogTitle>
                        <DialogDescription>
                            Nhập email của người dùng đã có tài khoản để cấp quyền admin. Họ sẽ có thể truy cập Admin Portal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="staff-email">Email người dùng</Label>
                        <Input
                            id="staff-email"
                            type="email"
                            placeholder="user@example.com"
                            value={addEmail}
                            onChange={(e) => setAddEmail(e.target.value)}
                            className="mt-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddStaff} disabled={addingStaff || !addEmail.trim()}>
                            {addingStaff && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Thêm Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══════════ MODAL: Edit Permissions ═══════════ */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Phân quyền cho {editingUser?.full_name}</DialogTitle>
                        <DialogDescription>
                            {editingUser?.email} — Chọn các module mà admin này được phép truy cập.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4">
                            <Label className="text-sm font-medium">Modules</Label>
                            <div className="flex gap-2">
                                <button onClick={handleSelectAll} className="text-xs text-purple-400 hover:text-purple-300">Chọn tất cả</button>
                                <span className="text-gray-600">|</span>
                                <button onClick={handleDeselectAll} className="text-xs text-gray-400 hover:text-gray-300">Bỏ chọn tất cả</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {availableModules.map((mod) => (
                                <label
                                    key={mod}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                        editModules.includes(mod)
                                            ? 'border-purple-500 bg-purple-500/10 text-white'
                                            : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={editModules.includes(mod)}
                                        onChange={() => toggleModule(mod)}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                        editModules.includes(mod)
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-gray-600'
                                    }`}>
                                        {editModules.includes(mod) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{MODULE_LABELS[mod] || mod}</span>
                                </label>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                            Đã chọn {editModules.length}/{availableModules.length} modules
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSavePermissions} disabled={savingPerms}>
                            {savingPerms ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Lưu phân quyền
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
