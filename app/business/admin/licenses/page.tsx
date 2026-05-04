"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Users, ShieldAlert, Settings, Loader2, UserMinus } from "lucide-react";
import BulkPurchaseModal from "@/components/business/BulkPurchaseModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getB2BLicenses, assignLicenseSeat, getLicenseEmployees, revokeLicenseSeat } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function LicenseManagementPage() {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Manage Employees Modal
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [licenseEmployees, setLicenseEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const fetchLicenses = async () => {
    try {
      const data = await getB2BLicenses();
      setLicenses(data.results || data);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách bản quyền", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleAssignClick = (lic: any) => {
    setSelectedLicense(lic);
    setAssignEmail("");
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignEmail || !selectedLicense) return;
    setAssigning(true);
    try {
      await assignLicenseSeat(selectedLicense.id, assignEmail);
      toast({ title: "Thành công", description: "Đã gán tài khoản vào khóa học." });
      setIsAssignModalOpen(false);
      fetchLicenses(); // reload stats
    } catch (error: any) {
      toast({ 
        title: "Thất bại", 
        description: error.response?.data?.detail || "Không thể gán chỗ.", 
        variant: "destructive" 
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleManageClick = async (lic: any) => {
    setSelectedLicense(lic);
    setIsManageModalOpen(true);
    setLoadingEmployees(true);
    try {
      const data = await getLicenseEmployees(lic.id);
      setLicenseEmployees(data.results || data);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách nhân viên", variant: "destructive" });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleRevoke = async (userId: number) => {
    if (!selectedLicense) return;
    setRevokingId(userId);
    try {
      await revokeLicenseSeat(selectedLicense.id, { user_id: userId });
      toast({ title: "Thành công", description: "Đã thu hồi quyền truy cập khóa học." });
      // Refresh both list and overall licenses
      const data = await getLicenseEmployees(selectedLicense.id);
      setLicenseEmployees(data.results || data);
      fetchLicenses();
    } catch (error: any) {
      toast({ title: "Lỗi", description: "Không thể thu hồi quyền.", variant: "destructive" });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Bản quyền (Licenses)</h2>
          <p className="text-gray-500">Quản lý số chỗ khóa học đã mua và gán quyền cho nhân viên.</p>
        </div>
        <Button onClick={() => setIsPurchaseModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Mua thêm chỗ (Seats)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : licenses.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500">
            Chưa có bản quyền khóa học nào. Bấm "Mua thêm chỗ" để bắt đầu.
          </div>
        ) : (
          licenses.map((lic) => (
            <Card key={lic.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                <CardTitle className="text-lg leading-tight line-clamp-2 h-10">
                  {lic.course_title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{lic.seats_used}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Đã dùng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{lic.available}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Còn trống</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-300">{lic.seats_total}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Tổng cộng</div>
                  </div>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                  <div 
                    className={`h-full ${lic.available === 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(lic.seats_used / lic.seats_total) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="w-1/2" disabled={lic.available === 0} onClick={() => handleAssignClick(lic)}>
                    <Users className="w-4 h-4 mr-2" />
                    Thêm
                  </Button>
                  <Button variant="outline" className="w-1/2" title="Manage Employees" onClick={() => handleManageClick(lic)}>
                    <Settings className="w-4 h-4 mr-2 text-gray-600" />
                    Quản lý
                  </Button>
                </div>
                
                {lic.available === 0 && (
                  <div className="mt-3 flex items-center text-xs text-red-500 font-medium justify-center">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Hết chỗ trống
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BulkPurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => {
          setIsPurchaseModalOpen(false);
          fetchLicenses(); // Reload after purchase (even if it's pending, but to be safe)
        }} 
      />

      {/* Assign Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gán quyền vào khóa học</DialogTitle>
            <DialogDescription>
              Khóa học: <span className="font-semibold text-gray-900">{selectedLicense?.course_title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email">Email Nhân Viên</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nhanvien@congty.com" 
              value={assignEmail} 
              onChange={e => setAssignEmail(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Lưu ý: Nhân viên cần có tài khoản trên hệ thống từ trước. Hệ thống sẽ tự động thêm khóa học này vào phần "My Learning" của họ.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={assigning}>Hủy</Button>
            <Button onClick={handleAssignSubmit} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={assigning}>
              {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Employees Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quản lý nhân viên đã gán</DialogTitle>
            <DialogDescription>
              Khóa học: <span className="font-semibold text-gray-900">{selectedLicense?.course_title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {loadingEmployees ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : licenseEmployees.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Chưa có nhân viên nào được gán vào khóa học này.</div>
            ) : (
              <div className="space-y-4">
                {licenseEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-900">{emp.user_name}</div>
                      <div className="text-sm text-gray-500">{emp.user_email}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      {emp.status === 'active' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Revoked</Badge>
                      )}
                      
                      {emp.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={revokingId === emp.user_id}
                          onClick={() => handleRevoke(emp.user_id)}
                        >
                          {revokingId === emp.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
