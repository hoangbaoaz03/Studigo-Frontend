
// Verified high-quality Unsplash image URLs for courses
const courseImages = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop", // Coding
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop", // Laptop
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop", // Coding dark
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop", // Setup
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=400&fit=crop", // Coding minimal
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop", // Code screen
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop", // Business
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop", // Notebook
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop", // Data
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop", // Data analysis
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop", // Matrix code
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop", // React
  "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=600&h=400&fit=crop", // IDE
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop", // Finance
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop", // Meeting
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop", // AI
  "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=600&h=400&fit=crop", // Financial chart
  "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&h=400&fit=crop", // Marketing
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop", // Graphic Design
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop", // Color palette
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop", // UX Design
];

const specificCourseImages: Record<string, string> = {
  "238": "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?auto=format&fit=crop&q=80&w=800", // ML
  "155": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800", // DL
  "84": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800", // Business
};

/**
 * Generates a consistent course thumbnail based on the course ID.
 * If a valid thumbnail URL is provided, it returns that.
 * Otherwise, it uses a predefined list of verified high-quality Unsplash images.
 */
export function getCourseThumbnail(courseId: number | string, thumbnail: string | null | undefined): string {
  const id = typeof courseId === 'string' ? parseInt(courseId) : courseId;
  const safeId = (!id || isNaN(id)) ? 1 : Math.abs(id);

  // 1. Check specific hardcoded mapping
  if (specificCourseImages[safeId.toString()]) {
    return specificCourseImages[safeId.toString()];
  }

  // 2. Use existing thumbnail if valid
  if (thumbnail) {
    if (thumbnail.startsWith('http')) {
        return thumbnail;
    }
    // Handle relative path from backend (Media URL)
    if (thumbnail.startsWith('/')) {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
        // Force 127.0.0.1 to avoid node/python ipv4/6 mismatch
        apiUrl = apiUrl.replace("localhost", "127.0.0.1");
        
        // Remove '/api' suffix to get base URL
        const baseUrl = apiUrl.replace(/\/api\/?$/, ""); 
        return `${baseUrl}${thumbnail}`;
    }
  }
  
  // 3. Fallback to deterministic selection
  return courseImages[safeId % courseImages.length];
}
