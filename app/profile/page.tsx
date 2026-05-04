"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Shield, Eye, EyeOff, Check, Camera, Trash2 } from "lucide-react";
import { api, changePassword, API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TabType = "profile" | "security";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    headline: "",
    bio: "",
    website: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        headline: user.headline || "",
        bio: user.bio || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
        youtube: user.youtube || "",
      });
    }
  }, [user, authLoading, router]);

  // Build the full profile photo URL
  const getProfilePhotoUrl = () => {
    if (photoPreview) return photoPreview;
    if (!user?.profile_photo) return null;
    // If already a full URL, use as is
    if (user.profile_photo.startsWith("http")) return user.profile_photo;
    // Otherwise, prepend the backend base URL
    const baseUrl = API_URL.replace("/api", "");
    return `${baseUrl}${user.profile_photo}`;
  };

  const profilePhotoUrl = getProfilePhotoUrl();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/auth/me/", formData);
      toast.success("Cập nhật hồ sơ thành công!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF).");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh phải nhỏ hơn 5MB.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      await api.patch("/auth/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ảnh đại diện đã được cập nhật!");
      // Reload to refresh user context with new photo
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error(error);
      toast.error("Cập nhật ảnh thất bại. Vui lòng thử lại.");
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await api.patch("/auth/me/", { profile_photo: null });
      toast.success("Đã xoá ảnh đại diện.");
      setPhotoPreview(null);
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error(error);
      toast.error("Xoá ảnh thất bại.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password2) {
      toast.error("Mật khẩu mới không khớp.");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePassword(passwordData);

      if (result.access && result.refresh) {
        localStorage.setItem("accessToken", result.access);
        localStorage.setItem("refreshToken", result.refresh);
      }

      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({ old_password: "", new_password: "", new_password2: "" });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      const data = error.response?.data;
      if (data) {
        const messages = Object.entries(data).map(([key, value]) => {
          const msg = Array.isArray(value) ? value.join(" ") : String(value);
          return msg;
        });
        toast.error(messages.join(" | "));
      } else {
        toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Yếu", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Trung bình", color: "bg-orange-500" };
    if (score <= 3) return { level: 3, label: "Khá", color: "bg-yellow-500" };
    if (score <= 4) return { level: 4, label: "Mạnh", color: "bg-green-500" };
    return { level: 5, label: "Rất mạnh", color: "bg-emerald-600" };
  };

  const passwordStrength = getPasswordStrength(passwordData.new_password);
  const passwordsMatch = passwordData.new_password && passwordData.new_password === passwordData.new_password2;

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Hồ sơ", icon: <UserIcon className="h-4 w-4" /> },
    { key: "security", label: "Bảo mật", icon: <Shield className="h-4 w-4" /> },
  ];

  // User initials for fallback avatar
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.username?.[0]?.toUpperCase() || "?";

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-6">Cài đặt tài khoản</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 ${
                activeTab === tab.key
                  ? "bg-slate-100 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Ảnh đại diện</CardTitle>
                  <CardDescription>
                    Ảnh này sẽ hiển thị trên hồ sơ của bạn và bên cạnh các bình luận, đánh giá.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    {/* Avatar Display */}
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 ring-4 ring-white shadow-lg flex-shrink-0">
                        {profilePhotoUrl ? (
                          <Image
                            src={profilePhotoUrl}
                            alt="Ảnh đại diện"
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Overlay on hover */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Info & Actions */}
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-slate-900">{user.full_name || user.username}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Camera className="mr-2 h-3.5 w-3.5" />
                          )}
                          Tải ảnh lên
                        </Button>
                        {profilePhotoUrl && !photoPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePhoto}
                            disabled={uploadingPhoto}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Xoá
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        JPG, PNG, WebP hoặc GIF. Tối đa 5MB.
                      </p>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Hồ sơ công khai</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân và cách nó hiển thị với người khác trên nền tảng.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Họ</Label>
                        <Input id="first_name" value={formData.first_name} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Tên</Label>
                        <Input id="last_name" value={formData.last_name} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headline">Tiêu đề</Label>
                      <Input
                        id="headline"
                        value={formData.headline}
                        onChange={handleChange}
                        placeholder="VD: Kỹ sư phần mềm cao cấp"
                      />
                      <p className="text-xs text-slate-500">Hiển thị bên dưới tên của bạn trên hồ sơ.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Tiểu sử</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Hãy kể một chút về bản thân bạn"
                      />
                    </div>

                    <h3 className="text-lg font-medium pt-4 border-t">Liên kết mạng xã hội</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input id="linkedin" type="url" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter / X</Label>
                        <Input id="twitter" value={formData.twitter} onChange={handleChange} placeholder="@username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube</Label>
                        <Input id="youtube" type="url" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/c/..." />
                      </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-600" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Đảm bảo tài khoản của bạn luôn an toàn bằng cách sử dụng mật khẩu mạnh.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  {/* Old Password */}
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        name="old_password"
                        type={showOldPassword ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        name="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                        required
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.new_password && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= passwordStrength.level ? passwordStrength.color : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          passwordStrength.level <= 1 ? "text-red-600" :
                          passwordStrength.level <= 2 ? "text-orange-600" :
                          passwordStrength.level <= 3 ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          Độ mạnh: {passwordStrength.label}
                        </p>
                        <ul className="text-xs text-slate-500 space-y-0.5">
                          <li className={`flex items-center gap-1.5 ${passwordData.new_password.length >= 8 ? "text-green-600" : ""}`}>
                            <Check className={`h-3 w-3 ${passwordData.new_password.length >= 8 ? "opacity-100" : "opacity-30"}`} />
                            Ít nhất 8 ký tự
                          </li>
                          <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(passwordData.new_password) ? "text-green-600" : ""}`}>
                            <Check className={`h-3 w-3 ${/[A-Z]/.test(passwordData.new_password) ? "opacity-100" : "opacity-30"}`} />
                            Có chữ hoa
                          </li>
                          <li className={`flex items-center gap-1.5 ${/[0-9]/.test(passwordData.new_password) ? "text-green-600" : ""}`}>
                            <Check className={`h-3 w-3 ${/[0-9]/.test(passwordData.new_password) ? "opacity-100" : "opacity-30"}`} />
                            Có số
                          </li>
                          <li className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(passwordData.new_password) ? "text-green-600" : ""}`}>
                            <Check className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(passwordData.new_password) ? "opacity-100" : "opacity-30"}`} />
                            Có ký tự đặc biệt
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new_password2">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="new_password2"
                        name="new_password2"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.new_password2}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        minLength={8}
                        className={`pr-10 ${
                          passwordData.new_password2
                            ? passwordsMatch
                              ? "border-green-400 focus-visible:ring-green-400"
                              : "border-red-400 focus-visible:ring-red-400"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordData.new_password2 && !passwordsMatch && (
                      <p className="text-xs text-red-600 animate-in fade-in duration-200">
                        Mật khẩu không khớp
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in duration-200">
                        <Check className="h-3 w-3" /> Mật khẩu khớp
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={changingPassword || !passwordData.old_password || !passwordsMatch}
                      className="w-full sm:w-auto"
                    >
                      {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
