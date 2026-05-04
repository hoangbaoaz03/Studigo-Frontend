import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Course {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  title_vi?: string;
  subtitle: string;
  subtitle_vi?: string;
  instructor_id?: number;
  instructor_name: string;
  category_name: string;
  category_path: string[];
  thumbnail: string | null;
  price: string;
  discount_price: string | null;
  current_price: number;
  has_discount: boolean;
  discount_percentage: number;
  is_free: boolean;
  level: string;
  language: string;
  total_lectures: number;
  total_duration: number;
  total_enrollments: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  status: string; // 'draft' | 'published' | 'pending' | 'archived'
}

export type LectureType = 'video' | 'article' | 'file' | 'quiz';
export type LectureStatus = 'draft' | 'published' | 'processing' | 'scheduled' | 'paused';
export type VideoSource = 'upload' | 'youtube' | 'vimeo' | 'external';

export interface Lecture {
  id: number;
  title: string;
  order: number;
  lecture_type: LectureType;
  status: LectureStatus;
  video_source?: VideoSource;
  video_file?: string; // URL to file
  video_url?: string;
  asset_id?: string;
  duration?: number;
  content?: string; // Summary or text content
  article_content?: string;
  is_preview: boolean;
  completed?: boolean;
  admin_note?: string;
  published_at?: string;
  created_at: string;
}

export interface Section {
  id: number;
  title: string;
  order: number;
  lectures: Lecture[];
  lecture_count: number;
  total_duration?: number;
}

export interface CourseDetail extends Course {
  description: string;
  description_vi?: string;
  subcategory_name: string;
  what_you_will_learn: string[];
  what_you_will_learn_vi?: string[];
  requirements: string[];
  requirements_vi?: string[];
  target_audience: string[];
  target_audience_vi?: string[];
  sections: Section[];
  updated_at: string;
  is_enrolled: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_instructor: boolean;
  profile_photo: string | null;
  headline: string;
  bio: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_business?: boolean;
  website?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor: Attach token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 & Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
         return Promise.reject(error); // Cannot refresh on server side via localStorage
      }
      
      // SKIP refresh logic for login requests (which return 401 on wrong password)
      if (originalRequest.url?.includes("/token/")) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Call refresh endpoint directly using axios to avoid loops
        const { data } = await axios.post<AuthResponse>(
          `${API_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        // Update tokens
        localStorage.setItem("accessToken", data.access);
        // Sometimes refresh endpoint returns a new refresh token too, check formatting
        if (data.refresh) {
            localStorage.setItem("refreshToken", data.refresh);
        }

        // Update authorization header for retry
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (expired or invalid), force logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getCourses = async (): Promise<PaginatedResponse<Course>> => {
  const response = await api.get("/courses/courses/");
  return response.data;
};

export const getCourseBySlug = async (slug: string): Promise<any> => {
    const response = await api.get(`/courses/courses/${slug}/`);
    return response.data;
}

export const updateCourse = async (slug: string, data: any) => {
    const response = await api.patch(`/courses/courses/${slug}/`, data);
    return response.data;
}

export const getCoursePlayer = async (slug: string): Promise<any> => {
    const response = await api.get(`/learning/player/${slug}/`);
    return response.data;
}

// Course Trash/Delete
export const softDeleteCourse = async (slug: string) => {
    const response = await api.delete(`/courses/courses/${slug}/`);
    return response.data;
}

export const getTrashedCourses = async () => {
    const response = await api.get("/courses/courses/trash/");
    return response.data;
}

export const restoreCourse = async (slug: string) => {
    const response = await api.post(`/courses/courses/${slug}/restore/`);
    return response.data;
}

export const permanentDeleteCourse = async (slug: string) => {
    const response = await api.delete(`/courses/courses/${slug}/permanent_delete/`);
    return response.data;
}

// Learning Progress
export const updateLectureProgress = async (lectureId: number, completed: boolean = true) => {
    const response = await api.post(`/learning/lecture/${lectureId}/complete/`, { completed });
    return response.data;
}

// Notes
export const saveNote = async (data: { lecture_id: number, content: string, timestamp: number, id?: number }) => {
    const response = await api.post(`/learning/notes/`, data);
    return response.data;
}

export const getNotes = async (courseSlug: string) => {
    const response = await api.get(`/learning/course/${courseSlug}/notes/`);
    return response.data;
}

export const getRelatedCourses = async (slug: string): Promise<Course[]> => {
    const response = await api.get(`/courses/courses/${slug}/related/`);
    return response.data;
}

export const enrollCourse = async (courseId: number): Promise<any> => {
    const response = await api.post("/learning/enrollments/", { course: courseId });
    return response.data;
}



export const getMyCourses = async (): Promise<any> => {
    const response = await api.get("/learning/my-learning/");
    return response.data;
}

// Category types and functions
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string;
  course_count?: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  name_vi?: string;
  slug: string;
  icon: string | null;
  children: CategoryTree[];
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get("/courses/categories/");
    // API returns paginated response, extract results array
    return response.data.results || response.data;
}

export const getCategoryTree = async (): Promise<CategoryTree[]> => {
    const response = await api.get("/courses/categories/tree/");
    return response.data;
}

export const getCoursesByCategory = async (slug: string): Promise<PaginatedResponse<Course>> => {
    const response = await api.get(`/courses/categories/${slug}/courses/`);
    return response.data;
}

export const createQuestion = async (data: { course_id: number, lecture_id: number, title: string, content: string }) => {
    const payload = {
        lecture: data.lecture_id,
        title: data.title,
        question: data.content
    };
    const response = await api.post(`/learning/questions/`, payload);
    return response.data;
}

export const createAnswer = async (data: { question_id: number, answer: string }) => {
    const payload = {
        question: data.question_id,
        answer: data.answer
    };
    const response = await api.post(`/learning/answers/`, payload);
    return response.data;
}

export const createReview = async (data: { course_id: number, rating: number, comment: string }) => {
    // Map course_id to course for backend serializer
    const payload = {
        course: data.course_id,
        rating: data.rating,
        comment: data.comment,
        title: "" // Optional but explicit
    };
    const response = await api.post(`/learning/reviews/`, payload);
    return response.data;
}

export const getCourseQuestions = async (courseId: number) => {
    const response = await api.get(`/learning/questions/?course=${courseId}`);
    return response.data.results || response.data;
}

export const getCourseReviews = async (courseId: number) => {
    const response = await api.get(`/learning/reviews/?course=${courseId}`);
    return response.data.results || response.data;
}

export const getAnnouncements = async (courseId: number) => {
    const response = await api.get(`/courses/announcements/?course_id=${courseId}`);
    return response.data.results || response.data;
}

export const createAnnouncement = async (courseId: number, title: string, content: string) => {
    const response = await api.post(`/courses/announcements/`, { course_id: courseId, title, content });
    return response.data;
}

export const updateAnnouncement = async (id: number, title: string, content: string) => {
    const response = await api.patch(`/courses/announcements/${id}/`, { title, content });
    return response.data;
}

export const deleteAnnouncement = async (id: number) => {
    const response = await api.delete(`/courses/announcements/${id}/`);
    return response.data;
}

// Admin Lecture Management
export const getAdminLectures = async (params: any = {}) => {
  const { data } = await api.get("/admin/lectures/", { params });
  return data;
};

export const updateLectureNote = async (id: number, note: string) => {
  const { data } = await api.patch(`/admin/lectures/${id}/update_note/`, { admin_note: note });
  return data;
};

// Instructor Course Management
export const createSection = async (data: { course: number, title: string, objective?: string, order?: number }) => {
    const response = await api.post("/courses/sections/", data);
    return response.data;
}

// Image update helper
export const uploadCourseImage = async (slug: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    // Explicitly set Content-Type to undefined to let browser set boundary
    const response = await api.patch(`/courses/courses/${slug}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const updateSection = async (id: number, data: { title?: string, objective?: string, order?: number }) => {
    const response = await api.patch(`/courses/sections/${id}/`, data);
    return response.data;
}

export const deleteSection = async (id: number) => {
    const response = await api.delete(`/courses/sections/${id}/`);
    return response.data;
}

export const createLecture = async (data: any) => {
    const response = await api.post("/courses/lectures/", data);
    return response.data;
}

export const updateLecture = async (id: number, data: any) => {
    const response = await api.patch(`/courses/lectures/${id}/`, data);
    return response.data;
}

export const deleteLecture = async (id: number) => {
    const response = await api.delete(`/courses/lectures/${id}/`);
    return response.data;
}

export const reorderSections = async (data: { course_id: number, section_ids: number[] }) => {
    const response = await api.post("/courses/sections/reorder/", data);
    return response.data;
}

export const reorderLectures = async (data: { section_id: number, lecture_ids: number[] }) => {
    const response = await api.post("/courses/lectures/reorder/", data);
    return response.data;
}

export const getUploadUrl = async (lectureId: number, filename: string) => {
    const response = await api.post(`/courses/lectures/${lectureId}/upload_video/`, { filename });
    return response.data;
}

export const getInstructorDashboard = async (): Promise<any> => {
    const response = await api.get("/instructor/dashboard/");
    return response.data;
}

export const getAdminStats = async () => {
    const response = await api.get("/admin/stats/overview/");
    return response.data;
}

export const getAdminCourses = async (params?: { status?: string, search?: string, page?: number }) => {
    const response = await api.get("/admin/courses/", { params });
    return response.data;
}

export const approveCourse = async (id: number) => {
    const response = await api.post(`/admin/courses/${id}/approve/`);
    return response.data;
}

export const rejectCourse = async (id: number, reason: string) => {
    const response = await api.post(`/admin/courses/${id}/reject/`, { reason });
    return response.data;
}

export const toggleCourseActive = async (id: number) => {
    const response = await api.post(`/admin/courses/${id}/toggle_active/`);
    return response.data;
}

export const getAdminUsers = async (params?: { role?: string, search?: string }) => {
    const response = await api.get("/admin/users/", { params });
    return response.data;
}

export const toggleUserStatus = async (id: number) => {
    const response = await api.post(`/admin/users/${id}/toggle_active/`);
    return response.data;
}

export const verifyInstructor = async (id: number) => {
    const response = await api.post(`/admin/users/${id}/verify_instructor/`);
    return response.data;
}

export const getAdminTransactions = async (params?: { status?: string, search?: string, payment_method?: string, page?: number }) => {
    const response = await api.get("/admin/finance/transactions/", { params });
    return response.data;
}

export const refundTransaction = async (id: number, reason: string) => {
    const response = await api.post(`/admin/finance/${id}/refund_transaction/`, { reason });
    return response.data;
}

export const getAdminPayouts = async (params?: { status?: string }) => {
    const response = await api.get("/admin/finance/payouts/", { params });
    return response.data;
}

export const processPayout = async (id: number, payoutStatus: string) => {
    const response = await api.post(`/admin/finance/${id}/process_payout/`, { status: payoutStatus });
    return response.data;
}

export const getAdminB2BPayments = async (params?: { status?: string }) => {
    const response = await api.get("/admin/b2b-payments/", { params });
    return response.data;
}

export const approveB2BPayment = async (id: number, note?: string) => {
    const response = await api.post(`/admin/b2b-payments/${id}/approve/`, { note });
    return response.data;
}

export const rejectB2BPayment = async (id: number, reason: string) => {
    const response = await api.post(`/admin/b2b-payments/${id}/reject/`, { reason });
    return response.data;
}

export const getAdminSettings = async () => {
    const response = await api.get("/admin/settings/");
    return response.data;
}

export const updateAdminSetting = async (key: string, value: any) => {
    const response = await api.patch(`/admin/settings/${key}/`, { value });
    return response.data;
}

export const getAdminReports = async (params?: any) => {
    const response = await api.get("/admin/reports/", { params });
    return response.data;
}

export const createReport = async (data: any) => {
    const response = await api.post("/admin/reports/", data);
    return response.data;
}

export const assignReport = async (id: number) => {
    const response = await api.post(`/admin/reports/${id}/assign/`);
    return response.data;
}

export const resolveReport = async (id: number, data: { resolution: string, note: string }) => {
    const response = await api.post(`/admin/reports/${id}/resolve/`, data);
    return response.data;
}

// Notifications
export const getNotifications = async () => {
    const response = await api.get('/notifications/');
    return response.data;
}

export const getUnreadNotificationCount = async () => {
    const response = await api.get('/notifications/unread_count/');
    return response.data;
}

export const markNotificationAsRead = async (id: number) => {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
}

export const markAllNotificationsAsRead = async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
}

export const getAdminAnalytics = async (period: string = '30d') => {
    const response = await api.get("/analytics/dashboard/", { params: { period } });
    return response.data;
}

export const exportAdminAnalytics = async (period: string = '30d') => {
    const response = await api.get("/analytics/export_report/", {
        params: { period },
        responseType: 'blob',
    });
    return response.data;
}

// Chat API
export const getChatHistory = async (courseId: number): Promise<any> => {
    const response = await api.get(`/chat/widget/?course_id=${courseId}`);
    return response.data;
}

export const sendChatMessage = async (courseId: number, message: string): Promise<any> => {
    const response = await api.post(`/chat/widget/`, { course_id: courseId, message });
    return response.data;
}

export const streamChatMessage = async (courseId: number, message: string): Promise<Response> => {
    let accessToken = "";
    if (typeof window !== "undefined") {
        accessToken = localStorage.getItem("accessToken") || "";
    }
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // We use raw fetch here because axios doesn't support stream consumption in browsers easily
    return fetch(`${API_URL}/chat/widget/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ course_id: courseId, message })
    });
}

export const getSalesChatHistory = async (): Promise<any> => {
    const response = await api.get(`/chat/sales-widget/`);
    return response.data;
}

export const streamSalesChatMessage = async (message: string): Promise<Response> => {
    let accessToken = "";
    if (typeof window !== "undefined") {
        accessToken = localStorage.getItem("accessToken") || "";
    }
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return fetch(`${API_URL}/chat/sales-widget/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
    });
}

export const getCourseChatInsights = async (courseId: number): Promise<any> => {
    const response = await api.get(`/chat/course-insights/?course_id=${courseId}`);
    return response.data;
}

/** Returns video URL, duration and metadata for a lecture — used for timestamp deep links */
export const getLectureVideoInfo = async (lectureId: number): Promise<{
    lecture_id: number;
    title: string;
    video_url: string;
    course_slug: string;
    video_source: string;
    duration: number;
}> => {
    const response = await api.get(`/chat/lecture-video/${lectureId}/`);
    return response.data;
}
// Instructor Application APIs
export const getMyInstructorApplication = async () => {
    const response = await api.get('/auth/instructor-application/');
    return response.data;
}

export const submitInstructorApplication = async (data: FormData) => {
    const response = await api.post('/auth/instructor-application/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const updateInstructorApplication = async (data: FormData) => {
    const response = await api.put('/auth/instructor-application/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// Admin Instructor Application APIs
export const getAdminInstructorApplications = async (params?: { status?: string }) => {
    const response = await api.get('/admin/instructor-applications/', { params });
    return response.data;
}

export const approveInstructorApplication = async (id: number) => {
    const response = await api.post(`/admin/instructor-applications/${id}/approve/`);
    return response.data;
}

export const rejectInstructorApplication = async (id: number, reason: string) => {
    const response = await api.post(`/admin/instructor-applications/${id}/reject/`, { reason });
    return response.data;
}

export const requestUpdateInstructorApplication = async (id: number, reason: string) => {
    const response = await api.post(`/admin/instructor-applications/${id}/request_update/`, { reason });
    return response.data;
}

// Change Password
export const changePassword = async (data: { old_password: string; new_password: string; new_password2: string }) => {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
}

// ---------------------------------------------------------
// Quiz APIs
// ---------------------------------------------------------

export const previewQuizFromDoc = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/courses/lectures/preview-quiz/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getQuizData = async (lectureId: number) => {
    const response = await api.get(`/learning/quiz/${lectureId}/`);
    return response.data;
};

export const submitQuizAnswers = async (lectureId: number, answers: Record<string, string>) => {
    const response = await api.post(`/learning/quiz/${lectureId}/submit/`, { answers });
    return response.data;
};

// ---------------------------------------------------------
// Admin Category Management APIs
// ---------------------------------------------------------

export const getAdminCategories = async () => {
    const response = await api.get('/admin/categories/');
    return response.data;
};

export const createAdminCategory = async (data: any) => {
    const response = await api.post('/admin/categories/', data);
    return response.data;
};

export const updateAdminCategory = async (id: number, data: any) => {
    const response = await api.patch(`/admin/categories/${id}/`, data);
    return response.data;
};

export const deleteAdminCategory = async (id: number) => {
    const response = await api.delete(`/admin/categories/${id}/`);
    return response.data;
};

export const reorderAdminCategories = async (items: { id: number; order: number }[]) => {
    const response = await api.post('/admin/categories/reorder/', { items });
    return response.data;
};

export const toggleAdminCategoryActive = async (id: number) => {
    const response = await api.post(`/admin/categories/${id}/toggle_active/`);
    return response.data;
};

export const moveCoursesToCategory = async (fromId: number, toId: number) => {
    const response = await api.post(`/admin/categories/${fromId}/move_courses/`, {
        target_category_id: toId
    });
    return response.data;
};

// ---------------------------------------------------------
// B2B Business Portal APIs
// ---------------------------------------------------------

export const purchaseB2BCourse = async (data: { course_id: number; seats: number }) => {
    const response = await api.post('/business/b2b/bulk-order/', data);
    return response.data;
};

export const getB2BLicenses = async () => {
    const response = await api.get('/business/b2b/licenses/');
    return response.data;
};

export const assignLicenseSeat = async (licenseId: number, email: string) => {
    const response = await api.post(`/business/b2b/licenses/${licenseId}/assign/`, { email });
    return response.data;
};

export const getLicenseEmployees = async (licenseId: number) => {
    const response = await api.get(`/business/b2b/licenses/${licenseId}/employees/`);
    return response.data;
};

export const revokeLicenseSeat = async (licenseId: number, data: { employee_id?: number, user_id?: number }) => {
    const response = await api.post(`/business/b2b/licenses/${licenseId}/revoke/`, data);
    return response.data;
};

export const getB2BLearnersProgress = async (params?: Record<string, any>) => {
    const response = await api.get('/business/b2b/learners-progress/', { params });
    return response.data;
};

export const getOrganizationTeams = async () => {
    const response = await api.get('/business/teams/');
    return response.data;
};

export const getB2BAnalytics = async () => {
    const response = await api.get('/business/b2b/analytics/');
    return response.data;
};

export const getB2BMembers = async (search?: string) => {
    const response = await api.get('/business/b2b/members/', { params: search ? { search } : {} });
    return response.data;
};

export const getB2BTeamsList = async () => {
    const response = await api.get('/business/b2b/teams-list/');
    return response.data;
};

export const createB2BTeam = async (data: { name: string; description?: string }) => {
    const response = await api.post('/business/b2b/teams-list/', data);
    return response.data;
};

export const updateMemberRole = async (memberId: number, data: { role?: string; team_id?: number | string }) => {
    const response = await api.put(`/business/b2b/members/${memberId}/update-role/`, data);
    return response.data;
};

export const getTeamPermissions = async (teamId: number) => {
    const response = await api.get(`/business/b2b/teams/${teamId}/permissions/`);
    return response.data;
};

export const grantTeamPermission = async (teamId: number, licenseId: number) => {
    const response = await api.post(`/business/b2b/teams/${teamId}/permissions/`, { license_id: licenseId });
    return response.data;
};

export const revokeTeamPermission = async (teamId: number, permissionId: number) => {
    const response = await api.delete(`/business/b2b/teams/${teamId}/permissions/`, { data: { permission_id: permissionId } });
    return response.data;
};

// Admin Permission Management
export const getMyAdminPermissions = async () => {
    const response = await api.get('/admin/permissions/my/');
    return response.data;
};

export const getAdminStaffList = async () => {
    const response = await api.get('/admin/permissions/');
    return response.data;
};

export const setUserStaff = async (email: string, isStaff: boolean) => {
    const response = await api.post('/admin/permissions/set-staff/', { email, is_staff: isStaff });
    return response.data;
};

export const updateAdminPermissions = async (userId: number, allowedModules: string[]) => {
    const response = await api.put(`/admin/permissions/${userId}/`, { allowed_modules: allowedModules });
    return response.data;
};

export const generateQuizFromDoc = async (sectionId: number, title: string, file: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    const response = await api.post(`/courses/sections/${sectionId}/generate-quiz/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
