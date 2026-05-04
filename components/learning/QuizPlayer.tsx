"use client";

import { useState, useEffect } from "react";
import { getQuizData, submitQuizAnswers } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface QuizPlayerProps {
    lecture: any;
    onCompleted: () => void;
}

export function QuizPlayer({ lecture, onCompleted }: QuizPlayerProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quizData, setQuizData] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        loadQuiz();
    }, [lecture.id]);

    const loadQuiz = async () => {
        setLoading(true);
        try {
            const data = await getQuizData(lecture.id);
            setQuizData(data);
            setAnswers({});
            setResult(null);
        } catch (error) {
            console.error("Failed to load quiz", error);
            toast.error("Could not load quiz data");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: string, answerId: string) => {
        if (result) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleSubmit = async () => {
        if (!quizData) return;
        
        if (Object.keys(answers).length < quizData.questions.length) {
            toast.warning("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const resultData = await submitQuizAnswers(lecture.id, answers);
            setResult(resultData);
            
            if (resultData.is_passed) {
                toast.success(`Congratulations! You passed with ${resultData.score}%`);
                onCompleted();
            } else {
                toast.error(`You scored ${resultData.score}%. You need 70% to pass.`);
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            toast.error("Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData?.questions?.length || 0;

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center bg-[#0f1729] rounded-xl">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                    <p className="text-slate-400 text-sm">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        return (
            <div className="flex flex-col h-[400px] items-center justify-center bg-[#0f1729] rounded-xl">
                <Sparkles className="h-12 w-12 text-slate-500 mb-3" />
                <h3 className="text-xl text-slate-200 font-semibold mb-2">Quiz Unavailable</h3>
                <p className="text-slate-400">This quiz doesn&apos;t have any questions yet.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            {/* Header */}
            {!result && (
                <div className="mb-8 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 rounded-lg">
                            <Sparkles className="h-6 w-6 text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-100">{quizData.title || lecture.title}</h2>
                            <p className="text-sm text-slate-400">{totalQuestions} questions · 70% to pass</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-300">{answeredCount}</span>
                        <span className="text-slate-500 text-lg">/{totalQuestions}</span>
                        <p className="text-xs text-slate-500 mt-0.5">answered</p>
                    </div>
                </div>
            )}

            {/* Result Banner */}
            {result && (
                <div className={`mb-8 rounded-xl overflow-hidden ${result.is_passed ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 border border-emerald-500/40' : 'bg-gradient-to-r from-rose-600/25 to-red-600/15 border border-rose-500/40'}`}>
                    <div className="p-6 flex items-center gap-6">
                        <div className={`p-4 rounded-full shrink-0 ${result.is_passed ? 'bg-emerald-500/25' : 'bg-rose-500/25'}`}>
                            {result.is_passed 
                                ? <Trophy className="h-10 w-10 text-emerald-300" /> 
                                : <XCircle className="h-10 w-10 text-rose-300" />
                            }
                        </div>
                        <div className="flex-1">
                            <h2 className={`text-2xl font-bold mb-1 ${result.is_passed ? 'text-emerald-200' : 'text-rose-200'}`}>
                                {result.is_passed ? "🎉 Quiz Passed!" : "Quiz Not Passed"}
                            </h2>
                            <p className="text-slate-300 text-base">
                                You scored <span className={`font-bold text-lg ${result.is_passed ? 'text-emerald-300' : 'text-rose-300'}`}>{result.score}%</span> 
                                <span className="text-slate-400 ml-1">({result.correct_count}/{result.total_questions} correct)</span>
                            </p>
                        </div>
                        {!result.is_passed && (
                            <Button 
                                onClick={loadQuiz}
                                className="bg-white/10 hover:bg-white/20 text-slate-100 border border-white/20 shrink-0"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        )}
                    </div>
                    {/* Score bar */}
                    <div className="h-1.5 bg-slate-800/50">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out ${result.is_passed ? 'bg-emerald-400' : 'bg-rose-400'}`}
                            style={{ width: `${result.score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
                {quizData.questions.map((q: any, index: number) => {
                    const qResult = result?.details?.find((d: any) => d.question_id === q.id);
                    const isAnswered = !!answers[q.id.toString()];
                    
                    return (
                        <div 
                            key={q.id} 
                            className={`rounded-xl border transition-all duration-200 ${
                                result 
                                    ? 'bg-[#111827] border-slate-700/60' 
                                    : isAnswered 
                                        ? 'bg-[#111827] border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                                        : 'bg-[#0f1729] border-slate-700/40 hover:border-slate-600/60'
                            }`}
                        >
                            {/* Question header */}
                            <div className="px-6 py-4 border-b border-slate-700/30 flex items-start gap-3">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 mt-0.5 ${
                                    result 
                                        ? qResult?.is_correct 
                                            ? 'bg-emerald-500/20 text-emerald-300' 
                                            : 'bg-rose-500/20 text-rose-300'
                                        : isAnswered 
                                            ? 'bg-indigo-500/25 text-indigo-300' 
                                            : 'bg-slate-700/50 text-slate-400'
                                }`}>
                                    {index + 1}
                                </span>
                                <h3 className="text-[15px] font-medium text-slate-100 leading-relaxed">
                                    {q.question_text}
                                </h3>
                            </div>
                            
                            {/* Choices */}
                            <div className="px-6 py-4">
                                <RadioGroup 
                                    value={answers[q.id.toString()] || ""}
                                    onValueChange={(val) => handleAnswerSelect(q.id.toString(), val)}
                                    className="space-y-2.5"
                                >
                                    {q.choices.map((choice: any, cIdx: number) => {
                                        const isSelected = answers[q.id.toString()] === choice.id.toString();
                                        const isCorrectChoice = qResult?.correct_answer_id === choice.id;
                                        const letters = ['A', 'B', 'C', 'D'];

                                        let wrapperClass = "flex items-center gap-3 rounded-lg border p-3.5 transition-all cursor-pointer ";
                                        let letterClass = "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ";
                                        let textClass = "flex-1 text-sm ";
                                        let endIcon = null;

                                        if (result) {
                                            if (isCorrectChoice) {
                                                wrapperClass += "border-emerald-500/50 bg-emerald-500/10";
                                                letterClass += "bg-emerald-500/30 text-emerald-200";
                                                textClass += "text-emerald-100 font-medium";
                                                endIcon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
                                            } else if (isSelected && !isCorrectChoice) {
                                                wrapperClass += "border-rose-500/50 bg-rose-500/10";
                                                letterClass += "bg-rose-500/30 text-rose-200";
                                                textClass += "text-rose-200";
                                                endIcon = <XCircle className="h-5 w-5 text-rose-400 shrink-0" />;
                                            } else {
                                                wrapperClass += "border-slate-700/40 bg-transparent opacity-50";
                                                letterClass += "bg-slate-700/40 text-slate-500";
                                                textClass += "text-slate-500";
                                            }
                                        } else {
                                            if (isSelected) {
                                                wrapperClass += "border-indigo-500/60 bg-indigo-500/10 shadow-sm shadow-indigo-500/10";
                                                letterClass += "bg-indigo-500 text-white";
                                                textClass += "text-slate-100";
                                            } else {
                                                wrapperClass += "border-slate-700/40 hover:border-slate-500/60 hover:bg-slate-800/40";
                                                letterClass += "bg-slate-700/50 text-slate-400";
                                                textClass += "text-slate-300";
                                            }
                                        }

                                        return (
                                            <div key={choice.id} className={wrapperClass}>
                                                <RadioGroupItem 
                                                    value={choice.id.toString()} 
                                                    id={`q${q.id}-c${choice.id}`} 
                                                    className="sr-only"
                                                />
                                                <span className={letterClass}>{letters[cIdx] || cIdx + 1}</span>
                                                <Label 
                                                    htmlFor={`q${q.id}-c${choice.id}`} 
                                                    className={textClass}
                                                >
                                                    {choice.text}
                                                </Label>
                                                {endIcon}
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                            </div>

                            {/* Explanation */}
                            {result && qResult?.explanation && (
                                <div className="mx-6 mb-4 p-4 bg-sky-500/10 border border-sky-500/25 rounded-lg">
                                    <p className="text-sm text-sky-200 leading-relaxed">
                                        <span className="font-semibold text-sky-300">💡 Explanation: </span>
                                        {qResult.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            {!result && (
                <div className="mt-10 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {answeredCount === totalQuestions 
                            ? <span className="text-indigo-400">✓ All questions answered</span>
                            : `${totalQuestions - answeredCount} question(s) remaining`
                        }
                    </p>
                    <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        disabled={submitting || answeredCount < totalQuestions}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[200px] text-base font-semibold h-12 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                    >
                        {submitting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Grading...</>
                        ) : (
                            "Submit Answers"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
