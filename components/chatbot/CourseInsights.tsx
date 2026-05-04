"use client";

import { useState } from "react";
import { getCourseChatInsights } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseInsights({ courseId }: { courseId: number }) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourseChatInsights(courseId);
      if (data.report) {
        setReport(data.report);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate AI insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Student Insights
        </CardTitle>
        <CardDescription>
          Analyze all recent questions your students have asked the AI Chatbot to instantly discover gaps in your curriculum and common pain points.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!report && !loading && (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed rounded-lg">
             <Button onClick={handleGenerate} size="lg" className="gap-2">
                 <Sparkles className="h-4 w-4" />
                 Generate Insights Report
             </Button>
             <p className="text-sm text-gray-500 mt-4 text-center max-w-sm">
                 Gemini 1.5 will read the last 100 student questions and synthesize an actionable report for you.
             </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
             <p className="text-gray-500 font-medium">Aggregating chat history and analyzing AI output...</p>
          </div>
        )}

        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleGenerate} className="ml-auto bg-white">Retry</Button>
            </div>
        )}

        {report && !loading && (
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md border text-sm">
                  <span className="text-gray-600">Generated successfully! Look below for your insights.</span>
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2">
                      <Sparkles className="h-4 w-4" /> Refresh Insights
                  </Button>
               </div>
               
               <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-white p-6 border rounded-lg shadow-sm">
                  <ReactMarkdown>{report}</ReactMarkdown>
               </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
