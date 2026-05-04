"use client";
import { useEffect, useState, useCallback } from "react";
import { getAdminTransactions, refundTransaction, getAdminPayouts, processPayout, getAdminB2BPayments, approveB2BPayment, rejectB2BPayment, getAdminStats } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, DollarSign, TrendingUp, Clock, RotateCcw, CheckCircle2, XCircle, Eye, RefreshCw, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const METHOD_LABELS: Record<string, string> = { stripe: "Stripe", paypal: "PayPal", momo: "MoMo", free: "Miễn phí" };

export default function PaymentManagementPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [b2bPayments, setB2bPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [txStatus, setTxStatus] = useState("all");
  const [txMethod, setTxMethod] = useState("all");
  const [payoutStatus, setPayoutStatus] = useState("all");
  const [b2bStatus, setB2bStatus] = useState("all");

  // Modals
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [selectedB2B, setSelectedB2B] = useState<any>(null);
  const [b2bAction, setB2bAction] = useState<"approve" | "reject" | null>(null);
  const [b2bNote, setB2bNote] = useState("");
  const [b2bLoading, setB2bLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    const params: any = {};
    if (search) params.search = search;
    if (txStatus !== "all") params.status = txStatus;
    if (txMethod !== "all") params.payment_method = txMethod;
    const data = await getAdminTransactions(params);
    setTransactions(data.results || data);
  }, [search, txStatus, txMethod]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsData, payoutsData, b2bData] = await Promise.all([getAdminStats(), getAdminPayouts(), getAdminB2BPayments()]);
        setStats(statsData);
        setPayouts(payoutsData);
        setB2bPayments(b2bData.results || b2bData);
        await fetchTransactions();
      } catch { toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchTransactions, 400);
    return () => clearTimeout(t);
  }, [search, txStatus, txMethod]);

  useEffect(() => {
    getAdminPayouts(payoutStatus !== "all" ? { status: payoutStatus } : {}).then(d => setPayouts(d));
  }, [payoutStatus]);

  useEffect(() => {
    getAdminB2BPayments(b2bStatus !== "all" ? { status: b2bStatus } : {}).then(d => setB2bPayments(d.results || d));
  }, [b2bStatus]);

  const handleRefund = async () => {
    if (!selectedTxn) return;
    setRefundLoading(true);
    try {
      await refundTransaction(selectedTxn.id, refundReason || "Theo yêu cầu khách hàng");
      toast({ title: "Hoàn tiền thành công" });
      setSelectedTxn(null);
      setRefundReason("");
      fetchTransactions();
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.response?.data?.error || "Hoàn tiền thất bại", variant: "destructive" });
    } finally { setRefundLoading(false); }
  };

  const handleB2BAction = async () => {
    if (!selectedB2B || !b2bAction) return;
    setB2bLoading(true);
    try {
      if (b2bAction === "approve") await approveB2BPayment(selectedB2B.id, b2bNote);
      else await rejectB2BPayment(selectedB2B.id, b2bNote || "Xác minh thất bại");
      toast({ title: b2bAction === "approve" ? "Đã phê duyệt" : "Đã từ chối" });
      setSelectedB2B(null); setB2bNote(""); setB2bAction(null);
      const d = await getAdminB2BPayments();
      setB2bPayments(d.results || d);
    } catch { toast({ title: "Lỗi", description: "Thao tác thất bại", variant: "destructive" }); }
    finally { setB2bLoading(false); }
  };

  const handlePayout = async (id: number, s: string) => {
    try {
      await processPayout(id, s);
      toast({ title: `Cập nhật thành công: ${s}` });
      const d = await getAdminPayouts();
      setPayouts(d);
    } catch { toast({ title: "Lỗi", variant: "destructive" }); }
  };

  const refundedCount = transactions.filter(t => t.status === "refunded").length;
  const pendingPayouts = payouts.filter(p => p.status === "pending").length;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Quản lý Thanh toán</h1>
          <p className="text-gray-400">Kiểm soát toàn bộ luồng tiền và giao dịch tài chính</p>
        </div>
        <Button variant="outline" className="border-gray-700 text-gray-300" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Tổng doanh thu", value: formatPrice(stats?.revenue?.total || 0), icon: DollarSign, color: "text-green-400" },
          { label: "Doanh thu nền tảng", value: formatPrice(stats?.revenue?.platform || 0), icon: TrendingUp, color: "text-purple-400" },
          { label: "Giao dịch hoàn tiền", value: `${refundedCount} GD`, icon: RotateCcw, color: "text-blue-400" },
          { label: "Payout chờ duyệt", value: `${pendingPayouts} lệnh`, icon: Clock, color: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-400">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600">Giao dịch B2C</TabsTrigger>
          <TabsTrigger value="b2b" className="data-[state=active]:bg-purple-600">Thanh toán B2B</TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-purple-600">Lệnh rút tiền</TabsTrigger>
        </TabsList>

        {/* Tab 1: B2C Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Tìm mã GD, email, khóa học..." className="pl-9 bg-gray-900 border-gray-700 text-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm" value={txStatus} onChange={e => setTxStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
            <select className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm" value={txMethod} onChange={e => setTxMethod(e.target.value)}>
              <option value="all">Tất cả cổng TT</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="momo">MoMo</option>
              <option value="free">Miễn phí</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  {["Mã giao dịch", "Học viên", "Khóa học", "Cổng TT", "Số tiền", "Phí NTT", "Trạng thái", "Ngày", ""].map(h => (
                    <TableHead key={h} className="text-gray-400 text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="h-24 text-center text-gray-500">Không có giao dịch nào.</TableCell></TableRow>
                ) : transactions.map(txn => (
                  <TableRow key={txn.id} className="border-gray-800 hover:bg-gray-800/40">
                    <TableCell className="font-mono text-xs text-gray-400 max-w-[120px] truncate">{txn.transaction_id}</TableCell>
                    <TableCell>
                      <div className="text-sm text-white">{txn.student_name || "—"}</div>
                      <div className="text-xs text-gray-500">{txn.student_email}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-300 max-w-[150px] truncate">{txn.course_title}</TableCell>
                    <TableCell><span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300">{METHOD_LABELS[txn.payment_method] || txn.payment_method}</span></TableCell>
                    <TableCell className="text-green-400 font-medium">{formatPrice(txn.gross_amount)}</TableCell>
                    <TableCell className="text-purple-400 text-sm">{formatPrice(txn.platform_fee)}</TableCell>
                    <TableCell><Badge className={`text-xs border ${STATUS_COLORS[txn.status] || ""}`}>{txn.status}</Badge></TableCell>
                    <TableCell className="text-gray-500 text-xs">{new Date(txn.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 text-gray-400 hover:text-white" onClick={() => { setSelectedTxn(txn); setRefundReason(""); }}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: B2B */}
        <TabsContent value="b2b" className="space-y-4">
          <div className="flex gap-3">
            <select className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm" value={b2bStatus} onChange={e => setB2bStatus(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  {["Tổ chức", "Loại", "Nội dung", "Số tiền", "Chứng từ", "Ghi chú", "Trạng thái", "Ngày", "Thao tác"].map(h => (
                    <TableHead key={h} className="text-gray-400 text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {b2bPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="h-24 text-center text-gray-500">Không có thanh toán B2B nào.</TableCell></TableRow>
                ) : b2bPayments.map(p => (
                  <TableRow key={p.id} className="border-gray-800 hover:bg-gray-800/40">
                    <TableCell>
                      <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-400" /><span className="text-white text-sm">{p.organization_name}</span></div>
                    </TableCell>
                    <TableCell><span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">{p.payment_type === 'COURSE' ? 'Mua Khóa học' : 'Nâng cấp Gói'}</span></TableCell>
                    <TableCell><span className="text-gray-300 text-sm max-w-[150px] truncate block">{p.payment_type === 'COURSE' ? `${p.seats} chỗ - ${p.course_title}` : p.plan_upgrade}</span></TableCell>
                    <TableCell className="text-green-400 font-semibold">{formatPrice(p.amount)}</TableCell>
                    <TableCell>{p.payment_proof ? <a href={p.payment_proof} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">Xem file</a> : <span className="text-gray-600 text-xs">—</span>}</TableCell>
                    <TableCell className="text-gray-400 text-xs max-w-[120px] truncate">{p.admin_note || "—"}</TableCell>
                    <TableCell><Badge className={`text-xs border ${STATUS_COLORS[p.status] || ""}`}>{p.status}</Badge></TableCell>
                    <TableCell className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 bg-green-700 hover:bg-green-600 text-white text-xs" onClick={() => { setSelectedB2B(p); setB2bAction("approve"); setB2bNote(""); }}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Duyệt
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 border-red-700 text-red-400 hover:bg-red-900/20 text-xs" onClick={() => { setSelectedB2B(p); setB2bAction("reject"); setB2bNote(""); }}>
                            <XCircle className="h-3.5 w-3.5 mr-1" />Từ chối
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Payouts */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex gap-3">
            <select className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm" value={payoutStatus} onChange={e => setPayoutStatus(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="paid">Đã trả</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  {["Giảng viên", "Kỳ", "Doanh thu", "Hoa hồng NTT", "Số tiền rút", "Trạng thái", "Ngày trả", "Thao tác"].map(h => (
                    <TableHead key={h} className="text-gray-400 text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-24 text-center text-gray-500">Không có lệnh rút tiền nào.</TableCell></TableRow>
                ) : payouts.map(p => (
                  <TableRow key={p.id} className="border-gray-800 hover:bg-gray-800/40">
                    <TableCell>
                      <div className="text-white text-sm">{p.instructor_name || "—"}</div>
                      <div className="text-gray-500 text-xs">{p.instructor_email}</div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">{String(p.period_month).padStart(2,"0")}/{p.period_year}</TableCell>
                    <TableCell className="text-gray-300">{formatPrice(p.total_revenue)}</TableCell>
                    <TableCell className="text-purple-400">{formatPrice(p.platform_fee)}</TableCell>
                    <TableCell className="text-green-400 font-semibold">{formatPrice(p.payout_amount)}</TableCell>
                    <TableCell><Badge className={`text-xs border ${STATUS_COLORS[p.status] || ""}`}>{p.status}</Badge></TableCell>
                    <TableCell className="text-gray-500 text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("vi-VN") : "—"}</TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 bg-blue-700 hover:bg-blue-600 text-white text-xs" onClick={() => handlePayout(p.id, "processing")}>
                            Đang xử lý
                          </Button>
                          <Button size="sm" className="h-7 bg-green-700 hover:bg-green-600 text-white text-xs" onClick={() => handlePayout(p.id, "paid")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Đã trả
                          </Button>
                        </div>
                      )}
                      {p.status === "processing" && (
                        <Button size="sm" className="h-7 bg-green-700 hover:bg-green-600 text-white text-xs" onClick={() => handlePayout(p.id, "paid")}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Xác nhận đã trả
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={v => !v && setSelectedTxn(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">Chi tiết Giao dịch</DialogTitle></DialogHeader>
          {selectedTxn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Mã GD", selectedTxn.transaction_id],
                  ["Gateway ID", selectedTxn.payment_provider_id || "—"],
                  ["Học viên", selectedTxn.student_name],
                  ["Email", selectedTxn.student_email],
                  ["Khóa học", selectedTxn.course_title],
                  ["Cổng TT", METHOD_LABELS[selectedTxn.payment_method] || selectedTxn.payment_method],
                  ["Tổng tiền", formatPrice(selectedTxn.gross_amount)],
                  ["Phí nền tảng", formatPrice(selectedTxn.platform_fee)],
                  ["Doanh thu GV", formatPrice(selectedTxn.instructor_revenue)],
                  ["Trạng thái", selectedTxn.status],
                  ["Ngày tạo", new Date(selectedTxn.created_at).toLocaleString("vi-VN")],
                  ["Lý do hoàn tiền", selectedTxn.refund_reason || "—"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="text-gray-500 text-xs">{k}</div>
                    <div className="text-white font-medium truncate">{v}</div>
                  </div>
                ))}
              </div>
              {selectedTxn.status === "completed" && (
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <p className="text-sm text-gray-400">Lý do hoàn tiền:</p>
                  <Textarea className="bg-gray-800 border-gray-700 text-white text-sm" rows={2} placeholder="Nhập lý do..." value={refundReason} onChange={e => setRefundReason(e.target.value)} />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedTxn(null)} className="text-gray-400">Đóng</Button>
            {selectedTxn?.status === "completed" && (
              <Button onClick={handleRefund} disabled={refundLoading} className="bg-red-700 hover:bg-red-600 text-white">
                {refundLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                Hoàn tiền
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* B2B Action Modal */}
      <Dialog open={!!selectedB2B && !!b2bAction} onOpenChange={v => !v && (setSelectedB2B(null), setB2bAction(null))}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{b2bAction === "approve" ? "Phê duyệt thanh toán B2B" : "Từ chối thanh toán B2B"}</DialogTitle>
          </DialogHeader>
          {selectedB2B && (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-800 space-y-1">
                <div className="text-gray-400">Tổ chức: <span className="text-white">{selectedB2B.organization_name}</span></div>
                <div className="text-gray-400">Loại: <span className="text-purple-300">{selectedB2B.payment_type === 'COURSE' ? 'Mua Khóa học' : 'Nâng cấp Gói'}</span></div>
                <div className="text-gray-400">Nội dung: <span className="text-white">{selectedB2B.payment_type === 'COURSE' ? `${selectedB2B.seats} chỗ - ${selectedB2B.course_title}` : selectedB2B.plan_upgrade}</span></div>
                <div className="text-gray-400">Số tiền: <span className="text-green-400 font-bold">{formatPrice(selectedB2B.amount)}</span></div>
              </div>
              <Textarea className="bg-gray-800 border-gray-700 text-white text-sm" rows={3}
                placeholder={b2bAction === "approve" ? "Ghi chú (tuỳ chọn)..." : "Lý do từ chối..."}
                value={b2bNote} onChange={e => setB2bNote(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setSelectedB2B(null); setB2bAction(null); }} className="text-gray-400">Huỷ</Button>
            <Button onClick={handleB2BAction} disabled={b2bLoading}
              className={b2bAction === "approve" ? "bg-green-700 hover:bg-green-600" : "bg-red-700 hover:bg-red-600"}>
              {b2bLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : b2bAction === "approve" ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              {b2bAction === "approve" ? "Phê duyệt" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
