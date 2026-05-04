export interface CertificationProvider {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
}

export interface ExamModule {
  id: number;
  title: string;
  order: number;
  content: string;
  video_url: string | null;
  duration_minutes: number;
}

export interface PracticeExam {
  id: number;
  title: string;
  duration_minutes: number;
  passing_score: number;
  questions_count: number;
  is_randomized: boolean;
}

export interface Certification {
  id: number;
  title: string;
  slug: string;
  provider: CertificationProvider;
  level: 'Beginner' | 'Associate' | 'Professional' | 'Expert';
  description: string;
  price: number;
  estimated_prep_time: string;
  pass_rate: string;
  syllabus: string[];
  modules_count: number;
  exams_count: number;
  created_at: string;
  badge_image_url?: string | null;
}

export interface CertificationDetail extends Certification {
  modules: ExamModule[];
  practice_exams: PracticeExam[];
}
