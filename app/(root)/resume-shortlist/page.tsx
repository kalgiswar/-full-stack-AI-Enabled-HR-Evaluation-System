"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { analyzeResume } from "@backend/HR/actions/resume.action";
import { Loader2, CheckCircle, XCircle, AlertCircle, Upload } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@backend/lib/actions/auth.action";

export default function ResumeShortlistPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("Looking for a Senior Frontend Developer with expertise in React, Next.js, and TypeScript. Experience with Tailwind CSS and AI integration is a plus.");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jd) {
      toast.error("Please provide both a resume and a job description");
      return;
    }

    setIsLoading(true);
    
    let userId = null;
    try {
        const user = await getCurrentUser();
        if (user) userId = user.id;
    } catch (e) {
        console.error("Auth check failed:", e);
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jd);
    if (userId) formData.append("userId", userId);

    const response = await analyzeResume(formData);
    
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      toast.success("Resume analyzed successfully!");
    } else {
      toast.error(response.error || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full my-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Smart Resume Shortlisting</h1>
            <p className="text-light-100">Upload your resume and the job description to get an instant evaluation.</p>
        </div>

        {/* Input Form */}
        <div className="card-border">
            <div className="card p-8 flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Label className="text-lg font-semibold text-white">Job Description (JD)</Label>
                        <textarea 
                            className="bg-dark-200 rounded-2xl w-full p-4 min-h-[150px] text-white focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder:text-light-100/50"
                            placeholder="Paste the Job Description here..."
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-lg font-semibold text-white">Upload Resume (PDF)</Label>
                        <div className="relative group">
                            <Input 
                                type="file" 
                                accept=".pdf" 
                                onChange={handleFileChange}
                                className="cursor-pointer file:text-primary-200 file:font-semibold text-white opacity-0 absolute inset-0 z-10 h-full"
                            />
                            <div className={cn(
                                "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all",
                                file ? "border-success-100 bg-success-100/10" : "border-white/10 bg-dark-200"
                            )}>
                                {file ? (
                                    <>
                                        <CheckCircle className="text-success-100" size={24} />
                                        <span className="text-white font-medium">{file.name}</span>
                                        <span className="text-[10px] text-success-100 uppercase font-bold">File selected</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-light-100/40" size={24} />
                                        <span className="text-light-100/60 text-sm">Click to upload your resume</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="btn-primary w-full md:w-fit self-end">
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                        ) : (
                            "Analyze Match"
                        )}
                    </Button>
                </form>
            </div>
        </div>

        {/* Results */}
        {result && (
            <div className="flex flex-col gap-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-white">Evaluation Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="card-border">
                        <div className="card p-6 flex flex-col items-center justify-center gap-2 h-full">
                            <h3 className="text-light-100">Match Score</h3>
                            <div className={cn(
                                "text-5xl font-extrabold",
                                result.matchScore >= 80 ? "text-success-100" :
                                result.matchScore >= 50 ? "text-yellow-400" : "text-destructive-100"
                            )}>
                                {result.matchScore}%
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-sm font-bold",
                                result.category === "High Match" ? "bg-success-100/20 text-success-100" :
                                result.category === "Potential" ? "bg-yellow-400/20 text-yellow-400" : "bg-destructive-100/20 text-destructive-100"
                            )}>
                                {result.category}
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="card-border md:col-span-2">
                         <div className="card p-6 flex flex-col gap-4 h-full justify-center">
                            <div>
                                <h3 className="text-light-100 text-sm">Candidate Name</h3>
                                <p className="text-xl font-bold text-white">{result.candidateName || "Unknown"}</p>
                            </div>
                            <div>
                                <h3 className="text-light-100 text-sm">Experience Summary</h3>
                                <p className="text-white">{result.experienceSummary}</p>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-border">
                        <div className="card p-6 flex flex-col gap-4 h-full">
                            <div className="flex items-center gap-2 text-success-100">
                                <CheckCircle size={20} />
                                <h3 className="font-bold">Skills Found</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.skillsFound.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-dark-300 rounded-full text-sm text-light-100 border border-white/10">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card-border">
                        <div className="card p-6 flex flex-col gap-4 h-full">
                            <div className="flex items-center gap-2 text-destructive-100">
                                <AlertCircle size={20} />
                                <h3 className="font-bold">Missing / Recommended</h3>
                            </div>
                             <div className="flex flex-wrap gap-2">
                                {result.missingSkills.length > 0 ? (
                                    result.missingSkills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-destructive-100/10 rounded-full text-sm text-destructive-100 border border-destructive-100/20">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-light-100">None detected</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reasoning */}
                <div className="card-border">
                    <div className="card p-6 flex flex-col gap-4">
                         <h3 className="text-xl font-bold text-white">AI Analysis & Reasoning</h3>
                         <p className="text-light-100 leading-relaxed text-justify">
                            {result.reasoning}
                         </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <Button className="btn-secondary" onClick={() => {setResult(null); setFile(null); setJd("");}}>
                        Process Another Resume
                    </Button>
                    <Button className="btn-primary" asChild>
                        <Link href="/assessment/demo-candidate">
                            Proceed to Assessment
                        </Link>
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}
