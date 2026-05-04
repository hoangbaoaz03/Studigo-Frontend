import { LocaleData } from "./types";

export const en: LocaleData = {
  hero: {
    headline: "Huge sale today. Ends in a few hours!",
    subheadline: "Skills for your present (and future). Get started with us today and get a special offer on your first course. Don't miss out on this chance to advance your career at a shock price, available for a short time.",
    cta: "Sign up now",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop"
  },
  broadSelection: {
    title: "All the skills you need for work and life",
    description: "A constantly updated library to help you stay ahead in a changing world. Explore topics from basic coding to advanced project management, taught by industry experts. Whether you're starting out or upskilling, we have courses for you.",
    tabs: [
      { "id": "python", "label": "Python", "description": "Expand your career opportunities with Python. Whether inside machine learning, data science, or web development, Python skills are essential for automating tasks and analyzing complex data.", "btnText": "Explore Python" },
      { "id": "excel", "label": "Excel", "description": "Get the most out of your data with Excel. Analyze, visualize, and automate daily office tasks. From basic functions to advanced VBA, Excel is indispensable.", "btnText": "Explore Excel" },
      { "id": "web-development", "label": "Web Development", "description": "Build modern websites and dynamic web apps with the latest tech like React, Next.js, and Tailwind CSS. Become a sought-after Full-stack developer.", "btnText": "Explore Web Dev" },
      { "id": "javascript", "label": "JavaScript", "description": "The world's most popular programming language. Learn JavaScript to build interactive websites, backend servers, and cross-platform mobile apps. Master ES6+, async, and DOM manipulation.", "btnText": "Explore JavaScript" },
      { "id": "data-science", "label": "Data Science", "description": "Harness the power of data to make smarter decisions. Learn to collect, clean, and analyze big data to find valuable insights.", "btnText": "Explore Data Science" }
    ]
  },
  trustedCompanies: [
    { "name": "Google", "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { "name": "Netflix", "logo": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { "name": "Youtube", "logo": "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
    { "name": "Microsoft", "logo": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { "name": "FPT", "logo": "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg" }
  ],
  testimonials: [
    {
      "id": 1,
      "content": "I am proud to say that after a few months of taking this course... I passed the exam and am now an AWS Certified Developer! The content was very practical and easy to understand.",
      "author": "Nguyen Van A",
      "course": "AWS Certified Solutions Architect"
    },
    {
      "id": 2,
      "content": "This course helped me refresh my portfolio and land my dream job at a big tech company. The instructor was very detailed and supportive. The projects were extremely helpful.",
      "author": "Tran Thi B",
      "course": "The Complete 2026 Web Development Bootcamp"
    },
    {
      "id": 3,
      "content": "One of the best financial management courses I've taken. The knowledge is presented logically, with plenty of exercises to apply immediately effectively.",
      "author": "Le Hoang C",
      "course": "Financial Analysis and Valuation"
    }
  ],
  banners: {
    aiEra: {
      "title": "Reshape your career in the AI era",
      "description": "Develop skills to adapt and lead. The world is changing fast with AI; equip yourself with the latest knowledge in Prompt Engineering, Generative AI, and Machine Learning.",
      "cta": "Plan your learning",
      "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
    },
    certification: {
      "title": "Get certified, lead your career",
      "description": "Prepare for top IT and project management certifications like PMP, AWS, Cisco, Microsoft Azure. We provide expert-designed exam prep courses.",
      "cta": "View exam prep",
      "image": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
    },
    trendsReport: {
        "title": "Global Learning & Skills Trends Report 2026",
        "description": "Discover the skills appearing in the future of work. Read our in-depth report to understand market needs and rising skills.",
        "cta": "Download report",
        "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
    }
  },
  instructorPromo: {
    "title": "Ready to share knowledge?",
    "description": "Your skills are valuable experience for others. Start teaching today to spread knowledge and create a sustainable passive income stream.",
    "cta": "Start teaching",
    "image": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80"
  },
  businessSection: {
    "title": "Upskill your team and organization",
    "description": "Unlimited access to 10,000+ top courses for your team. Enhance your business competitiveness with the world's #1 online training platform.",
    "cta": "Get Studigo Business",
    "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"
  },
  caseStudy: {
      "company": "FPT Corporation",
      "title": "FPT Corporation builds a world-class tech team",
      "quote": "Studigo Business is a strategic partner helping us train thousands of software engineers with the latest technologies. Thanks to it, we can meet global client needs quickly.",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
      "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
  },
  popularSkills: [
    { "name": "Python", "slug": "python" },
    { "name": "Excel", "slug": "excel" },
    { "name": "Web Development", "slug": "web-development" },
    { "name": "JavaScript", "slug": "javascript" },
    { "name": "Data Science", "slug": "data-science" },
    { "name": "AWS Certification", "slug": "aws-certification" },
    { "name": "Drawing", "slug": "drawing" },
     { "name": "SQL", "slug": "sql" }
  ],
  categories: [
      "Development", "Business", "Finance & Accounting", "IT & Software", "Office Productivity", "Personal Development", "Design", "Marketing"
  ],
  home: {
    transformSkills: "Skills to transform your career and life",
    trendingCourses: "Trending courses",
    businessBanner: "Top companies choose Studigo Business to build in-demand career skills.",
    exploreTopSkills: "Explore top skills",
    viewAll: "View all",
    readFullStory: "Read full story",
  },
  course: {
    bestseller: "Bestseller",
    students: "students",
    ratings: "ratings",
    createdBy: "Created by",
    lastUpdated: "Last updated",
    whatYouWillLearn: "What you'll learn",
    content: "Course content",
    sections: "sections",
    lectures: "lectures",
    length: "total length",
    expandAll: "Expand all sections",
    requirements: "Requirements",
    description: "Description",
    studentsAlsoBought: "Students also bought",
    preview: "Preview",
  },
  navbar: {
    searchPlaceholder: "Search for anything",
    teachOn: "Teach on Studigo",
    myLearning: "My Learning",
    myCart: "My Cart",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    categories: "Categories"
  },
  footer: {
    about: "About Us",
    careers: "Careers",
    blog: "Blog",
    help: "Help and Support",
    investors: "Investors",
    terms: "Terms",
    privacy: "Privacy Policy",
    settings: "Cookie Settings",
    copyright: "© 2026 Studigo, Inc."
  }
};
