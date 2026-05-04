"use client";

import Link from "next/link";
import { Code, TrendingUp, Palette, Monitor, DollarSign, Megaphone, BookOpen } from "lucide-react";
import { Course, Category } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

// Components
import HeroSection from "@/components/home/HeroSection";
import CourseContentTabs from "@/components/home/CourseContentTabs";
import Banner from "@/components/home/Banner";
import TrustedCompanies from "@/components/home/TrustedCompanies";
import Testimonials from "@/components/home/Testimonials";
import InstructorPromotional from "@/components/home/InstructorPromotional";
import BusinessSection from "@/components/home/BusinessSection";
import CaseStudy from "@/components/home/CaseStudy";
import BusinessLogoStrip from "@/components/home/BusinessLogoStrip";
import PopularSkills from "@/components/home/PopularSkills";
import CourseCarousel from "@/components/home/CourseCarousel";
import Section from "@/components/home/Section";
import TrendsReportSection from "@/components/home/TrendsReportSection";
import EnterpriseSuccessSection from "@/components/home/EnterpriseSuccessSection";
import ReshapeCareerSection from "@/components/home/ReshapeCareerSection";
import CertificationPromoSection from "@/components/home/CertificationPromoSection";

interface HomeContentProps {
  courses: Course[];
  categories: Category[];
}

// Map category names to icons
const categoryIcons: { [key: string]: any } = {
  "development": Code,
  "business": TrendingUp,
  "design": Palette,
  "it & software": Monitor,
  "finance & accounting": DollarSign,
  "marketing": Megaphone,
};

function getCategoryIcon(name: string) {
  const IconComponent = categoryIcons[name.toLowerCase()] || BookOpen;
  return <IconComponent className="h-6 w-6 mr-2" />;
}

export default function HomeContent({ courses, categories }: HomeContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      
      {/* 1. Featured Banner (Hero) - No top border */}
      <div className="w-full">
         <HeroSection 
            headline={t.hero.headline}
            subheadline={t.hero.subheadline}
            imageUrl={t.hero.imageUrl}
            ctaText={t.hero.cta}
        />
      </div>

      {/* 2. Learn essential career and life skills (Tabs) */}
      <Section hasBorder={false} className="bg-white">
          <CourseContentTabs 
            title={t.broadSelection.title}
            description={t.broadSelection.description}
            tabs={t.broadSelection.tabs}
            allCourses={courses}
        />
      </Section>

      {/* 3. Reshape your career in the AI era (New Feature Block) */}
      <ReshapeCareerSection />

      {/* 4. Skills to transform your career and life (Categories) */}
      <Section className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.home.transformSkills}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {categories.length > 0 ? (
                categories.slice(0, 8).map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                         <div className="h-24 flex flex-col items-center justify-center bg-white border border-gray-200 hover:border-purple-600 hover:shadow-md rounded-lg cursor-pointer transition-all p-2 text-center group">
                            <div className="mb-2 text-gray-500 group-hover:text-purple-600 transition-colors">
                                {getCategoryIcon(cat.name)}
                            </div>
                            <span className="font-semibold text-sm text-gray-800 line-clamp-2">{cat.name}</span>
                        </div>
                    </Link>
                ))
             ) : (
                 <p>Loading categories...</p>
             )}
        </div>
      </Section>

      {/* 5. Trusted by */}
      <Section className="bg-gray-50">
          <TrustedCompanies companies={t.trustedCompanies} title="Trusted by over 16,000 companies and millions of learners around the world" />
      </Section>

      {/* 6. Join others... (Testimonials) */}
      <Section className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Join others transforming their lives through learning</h2>
        <Testimonials testimonials={t.testimonials} />
      </Section>

      {/* 7. Get certified... (New Promo Section) */}
      <CertificationPromoSection />

      {/* 8. Ready to reimagine your career? (Instructor) */}
      <Section className="bg-white">
          <InstructorPromotional data={t.instructorPromo} />
      </Section>

      {/* 9. Trending courses (Carousel) */}
      <Section className="bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.home.trendingCourses}</h2>
        <CourseCarousel courses={courses} />
      </Section>

      {/* 10. Grow your team's skills... (Business) */}
      <Section className="bg-white">
          <BusinessSection data={t.businessSection} />
      </Section>

      {/* 11. Global Trends Visual Report */}
      <TrendsReportSection />

      {/* 12. Popular Skills */}
      <Section className="bg-white">
          <PopularSkills skills={t.popularSkills} />
      </Section>

      {/* 13. Enterprise Success Stories (FPT) */}
      <EnterpriseSuccessSection />

      {/* 14. Top companies choose... */}
      <Section className="bg-white">
          <BusinessLogoStrip />
      </Section>

    </div>
  );
}
