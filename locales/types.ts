export interface Tab {
  id: string;
  label: string;
  description: string;
  btnText: string;
}

export interface Testimonial {
  id: number;
  content: string;
  author: string;
  course: string;
}

export interface Banner {
  title: string;
  description: string;
  cta: string;
  image: string;
}

export interface CaseStudyData {
  company: string;
  title: string;
  quote: string;
  logo: string;
  image: string;
}

export interface LocaleData {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    imageUrl: string;
  };
  broadSelection: {
    title: string;
    description: string;
    tabs: Tab[];
  };
  trustedCompanies: { name: string; logo: string }[];
  testimonials: Testimonial[];
  banners: {
    aiEra: Banner;
    certification: Banner;
    trendsReport: Banner;
  };
  instructorPromo: {
    title: string;
    description: string;
    cta: string;
    image: string;
  };
  businessSection: {
    title: string;
    description: string;
    cta: string;
    image: string;
  };
  caseStudy: CaseStudyData;
  popularSkills: { name: string; slug: string }[];
  categories: string[];
  
  // New UI strings
  home: {
    transformSkills: string;
    trendingCourses: string;
    businessBanner: string;
    exploreTopSkills: string;
    viewAll: string;
    readFullStory: string;
  };
  course: {
    bestseller: string;
    students: string;
    ratings: string;
    createdBy: string;
    lastUpdated: string;
    whatYouWillLearn: string;
    content: string;
    sections: string;
    lectures: string;
    length: string;
    expandAll: string;
    requirements: string;
    description: string;
    studentsAlsoBought: string;
    preview: string;
  };
  navbar: {
    searchPlaceholder: string;
    teachOn: string;
    myLearning: string;
    myCart: string;
    login: string;
    signup: string;
    logout: string;
    categories: string;
  };
  footer: {
    about: string;
    careers: string;
    blog: string;
    help: string;
    investors: string;
    terms: string;
    privacy: string;
    settings: string;
    copyright: string;
  };
}
