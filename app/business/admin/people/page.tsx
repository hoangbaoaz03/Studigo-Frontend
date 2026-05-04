'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Shield, Loader2, Users, Pencil, Key, Trash2, BookOpen } from 'lucide-react';
import { 
  getB2BMembers, getB2BTeamsList, createB2BTeam, updateMemberRole, 
  getTeamPermissions, grantTeamPermission, revokeTeamPermission, getB2BLicenses 
} from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function PeoplePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [members, setMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Create Team Modal
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Edit Member Modal
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editRole, setEditRole] = useState('');
  const [editTeamId, setEditTeamId] = useState<number | string>('');
  const [savingMember, setSavingMember] = useState(false);

  // Team Permissions Modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permTeam, setPermTeam] = useState<any>(null);
  const [teamPerms, setTeamPerms] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [allLicenses, setAllLicenses] = useState<any[]>([]);
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('');
  const [grantingPerm, setGrantingPerm] = useState(false);
  const [revokingPermId, setRevokingPermId] = useState<number | null>(null);

  // Fetch members
  const fetchMembers = async (search?: string) => {
    setLoadingMembers(true);
    try {
      const data = await getB2BMembers(search);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch teams
  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const data = await getB2BTeamsList();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTeams();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(searchQuery || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Handlers ───

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      await createB2BTeam({ name: newTeamName.trim(), description: newTeamDesc.trim() });
      toast({ title: 'Thành công', description: 'Đã tạo phòng ban mới.' });
      setIsCreateTeamOpen(false);
      setNewTeamName('');
      setNewTeamDesc('');
      fetchTeams();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.detail || 'Không thể tạo phòng ban.', variant: 'destructive' });
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleEditMemberClick = (member: any) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditTeamId(member.team_id || '');
    setIsEditMemberOpen(true);
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSavingMember(true);
    try {
      await updateMemberRole(editingMember.id, {
        role: editRole,
        team_id: editTeamId === '' ? 0 : Number(editTeamId),
      });
      toast({ title: 'Thành công', description: 'Đã cập nhật thành viên.' });
      setIsEditMemberOpen(false);
      fetchMembers(searchQuery || undefined);
      fetchTeams();
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.detail || 'Không thể cập nhật.', variant: 'destructive' });
    } finally {
      setSavingMember(false);
    }
  };

  const handleOpenPermissions = async (team: any) => {
    setPermTeam(team);
    setIsPermModalOpen(true);
    setLoadingPerms(true);
    setSelectedLicenseId('');
    try {
      const [perms, lics] = await Promise.all([
        getTeamPermissions(team.id),
        getB2BLicenses(),
      ]);
      setTeamPerms(perms);
      setAllLicenses(lics.results || lics);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu.', variant: 'destructive' });
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!permTeam || !selectedLicenseId) return;
    setGrantingPerm(true);
    try {
      await grantTeamPermission(permTeam.id, Number(selectedLicenseId));
      toast({ title: 'Thành công', description: 'Đã cấp quyền khóa học.' });
      setSelectedLicenseId('');
      const perms = await getTeamPermissions(permTeam.id);
      setTeamPerms(perms);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.detail || 'Không thể cấp quyền.', variant: 'destructive' });
    } finally {
      setGrantingPerm(false);
    }
  };

  const handleRevokePermission = async (permId: number) => {
    if (!permTeam) return;
    setRevokingPermId(permId);
    try {
      await revokeTeamPermission(permTeam.id, permId);
      toast({ title: 'Thành công', description: 'Đã thu hồi quyền.' });
      const perms = await getTeamPermissions(permTeam.id);
      setTeamPerms(perms);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: 'Không thể thu hồi quyền.', variant: 'destructive' });
    } finally {
      setRevokingPermId(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-amber-100 text-amber-800';
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter licenses not already granted
  const availableLicenses = allLicenses.filter(
    (lic) => !teamPerms.some((p) => p.license_id === lic.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nhân sự</h2>
          <p className="text-gray-500">Quản lý thành viên trong tổ chức và phân nhóm theo phòng ban.</p>
        </div>
        {activeTab === 'teams' && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsCreateTeamOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tạo phòng ban
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Thành viên ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teams' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Phòng ban ({teams.length})
          </button>
        </nav>
      </div>

      {/* ═══════════════════════ TAB: Members ═══════════════════════ */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                placeholder="Tìm theo tên hoặc email..."
                className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white overflow-hidden shadow-sm">
            {loadingMembers ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center text-gray-500">Chưa có thành viên nào.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500">Tên</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Vai trò</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Phòng ban</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Trạng thái</th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeClass(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{member.team}</td>
                      <td className="px-6 py-4">
                        {member.is_active ? (
                          <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditMemberClick(member)} title="Chỉnh sửa vai trò & phòng ban">
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Teams ═══════════════════════ */}
      {activeTab === 'teams' && (
        <div>
          {loadingTeams ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleOpenPermissions(team)} title="Quản lý quyền khóa học">
                      <Key className="h-4 w-4 mr-1" /> Quyền
                    </Button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{team.name}</h3>
                  {team.description && <p className="text-xs text-gray-400 mb-2">{team.description}</p>}
                  <p className="text-sm text-gray-500 mb-4">
                    <Users className="inline h-3.5 w-3.5 mr-1" />{team.members} thành viên
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Leader</span>
                    <span className="font-medium text-gray-900">{team.manager}</span>
                  </div>
                </div>
              ))}

              {teams.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500">Chưa có phòng ban nào. Bấm "Tạo phòng ban" để bắt đầu.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ MODAL: Create Team ═══════════════════════ */}
      <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phòng ban mới</DialogTitle>
            <DialogDescription>Thêm phòng ban để phân nhóm và quản lý nhân viên hiệu quả hơn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="team-name">Tên phòng ban *</Label>
              <Input id="team-name" placeholder="VD: Engineering, Marketing..." value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="team-desc">Mô tả</Label>
              <Input id="team-desc" placeholder="Mô tả ngắn gọn (tùy chọn)" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateTeam} disabled={creatingTeam || !newTeamName.trim()}>
              {creatingTeam && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo phòng ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════ MODAL: Edit Member ═══════════════════════ */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
            <DialogDescription>
              {editingMember?.name} — {editingMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Vai trò</Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LEARNER">LEARNER (Học viên)</option>
                <option value="MANAGER">MANAGER (Leader phòng ban)</option>
                <option value="ADMIN">ADMIN (Quản trị viên)</option>
              </select>
              {editRole === 'MANAGER' && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Leader có thể thêm nhân viên vào các khóa học mà Admin đã cấp quyền cho phòng ban.
                </p>
              )}
            </div>
            <div>
              <Label>Phòng ban</Label>
              <select
                value={editTeamId}
                onChange={(e) => setEditTeamId(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chưa phân phòng ban</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveMember} disabled={savingMember}>
              {savingMember && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════ MODAL: Team Permissions ═══════════════════════ */}
      <Dialog open={isPermModalOpen} onOpenChange={setIsPermModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quyền khóa học — {permTeam?.name}</DialogTitle>
            <DialogDescription>
              Cấp quyền cho Leader của phòng ban này để có thể thêm nhân viên vào các khóa học cụ thể.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Grant new permission */}
            <div className="flex gap-2">
              <select
                value={selectedLicenseId}
                onChange={(e) => setSelectedLicenseId(e.target.value)}
                className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Chọn khóa học để cấp quyền —</option>
                {availableLicenses.map((lic) => (
                  <option key={lic.id} value={lic.id}>{lic.course_title} ({lic.available} chỗ trống)</option>
                ))}
              </select>
              <Button className="bg-green-600 hover:bg-green-700 text-white shrink-0" disabled={!selectedLicenseId || grantingPerm} onClick={handleGrantPermission}>
                {grantingPerm ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Cấp quyền</>}
              </Button>
            </div>

            {/* Current permissions list */}
            <div className="max-h-[40vh] overflow-y-auto">
              {loadingPerms ? (
                <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : teamPerms.length === 0 ? (
                <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Chưa có quyền khóa học nào. Chọn khóa học ở trên để cấp quyền.
                </div>
              ) : (
                <div className="space-y-3">
                  {teamPerms.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{p.course_title}</div>
                        <div className="text-xs text-gray-500">
                          {p.seats_used}/{p.seats_total} chỗ đã dùng · Cấp bởi {p.granted_by}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={revokingPermId === p.id}
                        onClick={() => handleRevokePermission(p.id)}
                      >
                        {revokingPermId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
