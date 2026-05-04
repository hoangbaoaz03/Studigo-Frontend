"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CreditCard, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { getCourses, purchaseB2BCourse } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function BulkPurchaseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState(10);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  
  // Billing Details
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  useEffect(() => {
    if (isOpen) {
      getCourses().then(data => {
        setCourses(data.results || data);
        if (data.results && data.results.length > 0) {
          setSelectedCourseId(data.results[0].id);
        }
      }).catch(err => {
        console.error(err);
      });
    }
  }, [isOpen]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const coursePrice = selectedCourse ? parseFloat(selectedCourse.current_price || selectedCourse.price || 0) : 0;

  // Discount calculation based on B2B tier
  let discountPercent = 0;
  if (seats >= 100) discountPercent = 30;
  else if (seats >= 50) discountPercent = 20;
  else if (seats >= 10) discountPercent = 10;

  const originalTotal = seats * coursePrice;
  const discountAmount = originalTotal * (discountPercent / 100);
  const finalTotal = originalTotal - discountAmount;

  const handleCheckout = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      await purchaseB2BCourse({
        course_id: selectedCourseId as number,
        seats,
      });
      setStep(3); // Show success step
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể gửi yêu cầu mua khóa học.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSeats(10);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Mua số lượng lớn</DialogTitle>
              <DialogDescription>
                Mua chỗ (seats) số lượng lớn cho nhân viên để nhận chiết khấu doanh nghiệp.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div>
                <Label>Chọn khóa học</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (${parseFloat(c.current_price || c.price).toFixed(2)}/seat)</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Số lượng (Seats)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={seats} 
                  onChange={(e) => setSeats(parseInt(e.target.value) || 1)} 
                  className="mt-1 text-lg font-medium"
                />
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-1 rounded ${seats >= 10 && seats < 50 ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>10+ (10% off)</span>
                  <span className={`px-2 py-1 rounded ${seats >= 50 && seats < 100 ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>50+ (20% off)</span>
                  <span className={`px-2 py-1 rounded ${seats >= 100 ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>100+ (30% off)</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính ({seats} seats)</span>
                  <span className="font-medium">${originalTotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Chiết khấu ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Hủy</Button>
              <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700" disabled={!selectedCourseId}>
                Tiếp tục thanh toán <ShoppingCart className="ml-2 w-4 h-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Thông tin thanh toán</DialogTitle>
              <DialogDescription>
                Cung cấp thông tin để hệ thống xuất hóa đơn.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Tên Công Ty</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="companyName" className="pl-9" placeholder="Công ty ABC" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxCode">Mã số thuế</Label>
                <Input id="taxCode" placeholder="0101234567" value={taxCode} onChange={e => setTaxCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" placeholder="Số 1, Đường X, TP. Y" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} />
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mt-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Số tiền cần thanh toán: ${finalTotal.toFixed(2)}</div>
                  <p>Sau khi xác nhận, yêu cầu của bạn sẽ được gửi tới bộ phận quản trị hệ thống để phê duyệt và cấp quyền truy cập.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Quay lại</Button>
              <Button onClick={handleCheckout} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác nhận mua
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Gửi yêu cầu thành công!</h2>
            <p className="text-gray-500 max-w-[300px]">
              Yêu cầu mua {seats} chỗ của bạn đã được gửi. Bạn sẽ nhận được quyền truy cập ngay khi Admin phê duyệt.
            </p>
            <div className="pt-4">
              <Button onClick={handleClose} variant="outline">Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
