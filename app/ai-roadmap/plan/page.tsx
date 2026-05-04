'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Rocket } from 'lucide-react';
import { AI_ROADMAP_DATA } from '@/data/ai-roadmap';

const STEPS = [
  {
    id: 1,
    title: "What represents your current role?",
    options: [
      { id: 'student', label: 'Student / Researcher', icon: '🎓' },
      { id: 'dev', label: 'Software Developer', icon: '💻' },
      { id: 'manager', label: 'Manager / Executive', icon: '💼' },
      { id: 'non-tech', label: 'Non-Technical Professional', icon: '🚀' }
    ]
  },
  {
    id: 2,
    title: "What is your primary AI goal?",
    options: [
      { id: 'build', label: 'Build AI Products', description: 'Coding & Engineering' },
      { id: 'boost', label: 'Boost Productivity', description: 'Tools & Automation' },
      { id: 'lead', label: 'Lead AI Strategy', description: 'Governance & Management' }
    ]
  },
  {
    id: 3,
    title: "How would you rate your coding skills?",
    options: [
      { id: 'none', label: 'No Coding Experience' },
      { id: 'basic', label: 'Basic (Python/JS)' },
      { id: 'advanced', label: 'Advanced Developer' }
    ]
  }
];

const STORAGE_KEY = 'ai_roadmap_saved_plan';

export default function AIRoadmapPlanner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Load saved roadmap on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.result) {
          setResult(parsed.result);
          if (parsed.answers) setAnswers(parsed.answers);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generatePlan();
    }
  };

  const generatePlan = () => {
    setIsGenerating(true);
    // Simulate API/Logic delay
    setTimeout(() => {
       const role = answers[0];
       const goal = answers[1];
       const coding = answers[2];

       // 1. Determine Recommended Tier
       let recommendedTierId = 1;
       let baseReason = "Starting with foundations is key for everyone.";

       if (coding === 'advanced' && goal === 'build') {
           recommendedTierId = 2;
           baseReason = "Your coding background allows you to jump straight into building AI applications.";
       } else if (goal === 'lead') {
           recommendedTierId = 3;
           baseReason = "You're focused on strategy, so we'll emphasize governance and high-level concepts.";
       }

       // 2. Generate Capability Profile
       const capabilities = [
           { skill: "AI Literacy", level: "Basic", progress: 30 },
           { skill: "Prompt Engineering", level: "Beginner", progress: 10 },
           { 
             skill: "Applied AI Development", 
             level: coding === 'advanced' ? "Intermediate" : "Not Started", 
             progress: coding === 'advanced' ? 50 : 0 
           },
           { 
             skill: "AI Strategy", 
             level: goal === 'lead' ? "Beginner" : "Not Started", 
             progress: 0 
           }
       ];

       // 3. Enrich Course Recommendations
       const recommendedData = AI_ROADMAP_DATA.find(t => t.id === recommendedTierId);
       
       const enrichedCourses = recommendedData?.courses?.map(course => {
           let why = "Essential for your current level.";
           let gain = ["Core concepts", "Practical application"];
           let outcome = "Solid understanding of the topic.";

           // Mock logic for enrichment
           if (course.slug.includes('generative-ai')) {
               why = `As a ${role === 'student' ? 'learner' : 'professional'}, you need to understand the 'why' and 'how' behind LLMs before using them.`;
               gain = ["Understand LLM architecture", "Identify use cases", "Navigate ethical risks"];
               outcome = "Speak confidently about Generative AI concepts.";
           } else if (course.slug.includes('prompt')) {
               why = "Prompting is the new coding. This is critical to boost your productivity immediately.";
               gain = ["Zero-shot vs Few-shot techniques", "Chain-of-thought prompting", "Reducing hallucinations"];
               outcome = "Writing prompts that get perfect results 99% of the time.";
           } else if (course.slug.includes('langchain')) {
               why = `Since your goal is to ${goal === 'build' ? 'build products' : 'innovate'}, LangChain is the industry standard framework you must know.`;
               gain = ["Chaining LLM calls", "Memory management", "Agent basics"];
               outcome = "Build your own custom AI chatbot from scratch.";
           } else if (course.slug.includes('strategy')) {
                why = "To lead effectively, you need a framework for evaluating ROI and risk, not just technical jargon.";
                gain = ["AI Maturity Models", "Buy vs Build Frameworks", "Risk Governance"];
                outcome = "Create a 12-month AI adoption roadmap for your team.";
           }

           return { ...course, why, gain, outcome };
       }) || [];

       const generatedResult = {
           tier: recommendedTierId,
           tierName: recommendedData?.title || "Unknown Tier",
           reason: baseReason,
           weeks: recommendedTierId === 2 ? "8 Weeks" : "4 Weeks",
           courses: enrichedCourses,
           capabilities
       };
       setResult(generatedResult);
       setIsGenerating(false);

       // Save to localStorage
       try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify({ result: generatedResult, answers }));
       } catch (e) { /* storage full */ }
    }, 1500);
  };

  if (result) {
      return (
          <div className="min-h-screen bg-white flex items-center justify-center p-4">
              <div className="max-w-3xl w-full space-y-12 animate-fade-in py-12">
                  
                  {/* Header */}
                  <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Rocket className="h-10 w-10 text-green-600" />
                      </div>
                      <h2 className="text-4xl font-bold text-gray-900">Your Personalized Learning Plan</h2>
                      <p className="text-gray-600 text-lg max-w-xl mx-auto">{result.reason}</p>
                  </div>

                  {/* 1. Capability Assessment */}
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                      <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                          Your Current AI Capability
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                          {result.capabilities.map((cap: any, idx: number) => (
                              <div key={idx}>
                                  <div className="flex justify-between mb-2">
                                      <span className="font-medium text-gray-700">{cap.skill}</span>
                                      <span className="text-sm text-gray-500">{cap.level}</span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${cap.progress}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-6 italic">
                          *Assessment based on your self-reported role and experience level.
                      </p>
                  </div>

                  {/* 2. Primary Recommendation (Tier) */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
                      <div className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Recommended Starting Point</div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                          <div>
                              <h3 className="text-3xl font-bold mb-2">Tier {result.tier}: {result.tierName}</h3>
                              <p className="text-blue-100 text-sm opacity-90">Focus on mastering these core competencies first.</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-bold border border-white/30">
                              ⏱ {result.weeks}
                          </div>
                      </div>
                  </div>

                  {/* 3. Detailed Course Recommendations */}
                  <div className="space-y-6">
                      <h3 className="font-bold text-gray-900 text-2xl pl-1">Recommended Courses</h3>
                      <div className="grid gap-6">
                          {result.courses?.map((course: any) => (
                              <Link key={course.id} href={`/course/${course.slug}`}>
                                <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative flex-shrink-0">
                                        <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                            RECOMMENDED
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                    {course.title}
                                                </h4>
                                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 italic mb-3">
                                                   "{course.why}"
                                                </p>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold text-gray-900 uppercase">You will gain:</div>
                                                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                                            {course.gain?.map((g: string, i: number) => (
                                                                <li key={i}>{g}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                        <div className="text-xs font-bold text-green-800 uppercase mb-1">Outcome</div>
                                                        <p className="text-xs text-green-700 font-medium leading-relaxed">
                                                            {course.outcome}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-xs text-gray-400 font-medium pt-3 border-t border-gray-100">
                                            <span className="mr-3">{course.level}</span> • <span className="mx-3">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                              </Link>
                          ))}
                      </div>
                  </div>

                   <div className="flex justify-center gap-4 pt-8 pb-12">
                       <Button
                         variant="outline"
                         onClick={() => {
                           localStorage.removeItem(STORAGE_KEY);
                           setResult(null);
                           setAnswers({});
                           setCurrentStep(0);
                         }}
                         className="text-gray-500 hover:text-gray-900 border-gray-300"
                       >
                           🔄 Retake Assessment
                       </Button>
                       <Link href="/ai-roadmap">
                           <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
                               View Full Roadmap
                           </Button>
                       </Link>
                   </div>
              </div>
          </div>
      )
  }

  const stepData = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
       {/* Simple Header */}
       <div className="p-6 flex justify-between items-center max-w-4xl mx-auto w-full z-10">
           <Link href="/ai-roadmap" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Exit
           </Link>
           <div className="text-sm text-gray-400">Step {currentStep + 1} of {STEPS.length}</div>
       </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full z-10 pb-20">
           
           <div className="w-full mb-12">
               <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-blue-600 transition-all duration-500 ease-out"
                      style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                   ></div>
               </div>
           </div>

           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 leading-tight">
               {stepData.title}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
               {stepData.options.map((option: any) => (
                   <div 
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`
                         cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 flex flex-col gap-2 relative
                         ${answers[currentStep] === option.id 
                            ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]' 
                            : 'border-white bg-white hover:border-gray-300 hover:shadow-sm shadow-sm'
                         }
                      `}
                   >
                       <div className="text-2xl mb-1">{option.icon}</div>
                       <div className="font-bold text-gray-900 text-lg">{option.label}</div>
                       {option.description && <div className="text-sm text-gray-500">{option.description}</div>}
                       
                       {answers[currentStep] === option.id && (
                           <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                               <Check className="w-4 h-4 text-white" />
                           </div>
                       )}
                   </div>
               ))}
           </div>

           <div className="mt-12 flex justify-end w-full">
               <Button 
                 size="lg" 
                 onClick={handleNext} 
                 disabled={!answers[currentStep] || isGenerating}
                 className="h-14 px-8 text-lg font-bold rounded-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
               >
                   {isGenerating ? 'Analyzing...' : 'Continue'}
                   {!isGenerating && <ArrowRight className="ml-2 w-5 h-5" />}
               </Button>
           </div>

       </div>
    </div>
  );
}
