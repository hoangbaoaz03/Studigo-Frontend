export interface RoadmapSkill {
  name: string;
  description: string;
}

export interface RoadmapProject {
  title: string;
  description: string;
}

export interface RoadmapCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  image: string;
  slug: string; // Linking to real course pages
}

export interface RoadmapTier {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  outcome: string;
  skills: RoadmapSkill[];
  tools: string[];
  projects: RoadmapProject[];
  courses: RoadmapCourse[]; // New field
  color: string;
}

export const AI_ROADMAP_DATA: RoadmapTier[] = [
  {
    id: 1,
    title: "Foundations & Literacy",
    subtitle: "The Essentials",
    description: "Build a solid understanding of how AI works, its capabilities, limitations, and ethical considerations. Perfect for everyone.",
    outcome: "AI-Literate Professional",
    color: "blue",
    skills: [
        { name: "LLM Basics", description: "How Large Language Models work" },
        { name: "Prompt Engineering", description: "Crafting effective inputs" },
        { name: "AI Ethics", description: "Bias, safety, and responsible use" },
        { name: "AI Tools Proficiency", description: "ChatGPT, Claude, Midjourney" }
    ],
    tools: ["ChatGPT", "Claude", "Bing Chat", "Midjourney"],
    projects: [
        { title: "Personal AI Assistant", description: "Configure a custom instruction set for daily productivity." },
        { title: "Ethical AI Audit", description: "Analyze a generated output for potential biases." }
    ],
    courses: [
        {
            id: "deep-learning-3",
            title: "Deep Learning Mastery: Level 3",
            description: "Master the fundamentals of Neural Networks and Deep Learning architectures.",
            duration: "8 hours",
            level: "Intermediate",
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
            slug: "deep-learning-mastery-level-3" // Real existing slug
        },
        {
            id: "machine-learning-4",
            title: "Machine Learning Mastery: Level 4",
            description: "Advanced Machine Learning algorithms and practical implementation.",
            duration: "10 hours",
            level: "Advanced",
            image: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?auto=format&fit=crop&q=80&w=800",
            slug: "machine-learning-mastery-level-4" // Real existing slug
        }
    ]
  },
  {
    id: 2,
    title: "Applied AI Development",
    subtitle: "The Builder",
    description: "Learn to build AI-powered applications. Integrate LLMs into your code and create custom solutions.",
    outcome: "AI Application Developer",
    color: "purple",
    skills: [
        { name: "Python for AI", description: "Core syntax and data handling" },
        { name: "LangChain", description: "Chaining LLM calls and memory" },
        { name: "RAG Networks", description: "Retrieval Augmented Generation" },
        { name: "API Integration", description: "OpenAI & Anthropic APIs" }
    ],
    tools: ["Python", "OpenAI API", "LangChain", "Vector Databases"],
    projects: [
        { title: "Custom Knowledge Chatbot", description: "Build a bot that answers questions from your own PDF documents." },
        { title: "AI Agent", description: "Create an autonomous agent that can browse the web." }
    ],
    courses: [
        {
            id: "machine-learning-4-applied",
            title: "Machine Learning Mastery: Level 4",
            description: "Apply ML concepts to build intelligent applications and systems.",
            duration: "12 hours",
            level: "Advanced",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
            slug: "machine-learning-mastery-level-4" // Real existing slug
        },
        {
            id: "deep-learning-3-rag",
            title: "Deep Learning Mastery: Level 3",
            description: "Build advanced neural networks for natural language processing tasks.",
            duration: "8 hours",
            level: "Advanced",
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
            slug: "deep-learning-mastery-level-3" // Real existing slug
        }
    ]
  },
  {
    id: 3,
    title: "Leadership & Strategy",
    subtitle: "The Strategist",
    description: "Drive organizational change. Learn to evaluate AI opportunities, manage risks, and lead AI adoption strategies.",
    outcome: "AI Transformation Leader",
    color: "pink",
    skills: [
        { name: "AI Strategy", description: "Identifying high-value use cases" },
        { name: "Governance & Risk", description: "Compliance and security" },
        { name: "Change Management", description: "Upskilling workforce and culture" },
        { name: "ROI Evaluation", description: "Measuring AI impact" }
    ],
    tools: ["Strategic Frameworks", "Risk Assessment Templates", "Adoption Roadmaps"],
    projects: [
        { title: "Enterprise AI Roadmap", description: "Draft a 12-month adoption plan for a company." },
        { title: "Governance Policy", description: "Create a policy document for secure AI usage." }
    ],
    courses: [
        {
            id: "business-strategy-4",
            title: "Business Strategy Mastery: Level 4",
            description: "Strategic decision making and execution for AI transformation.",
            duration: "5 hours",
            level: "Advanced",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
            slug: "business-strategy-mastery-level-4" // Real existing slug
        }
    ]
  }
];
// End of data
