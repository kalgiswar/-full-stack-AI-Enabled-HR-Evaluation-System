"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { analyzeResume } from "@backend/HR/actions/resume.action";
import { getJobById } from "@backend/HR/actions/job.action";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, CheckCircle, Briefcase, MapPin, Building2, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@backend/lib/actions/auth.action";
import { cn } from "@/lib/utils";

export default function ApplyJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Job from PostgreSQL
                const jobData = await getJobById(jobId);
                if (jobData) {
                    setJob(jobData);
                }

                // Fetch User
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Error fetching application data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [jobId]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to apply");
            return;
        }

        if (!selectedFile) {
            toast.error("Please upload your resume");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("resume", selectedFile);
        formData.append("jobId", jobId);
        formData.append("userId", user.id);
        formData.append("jobDescription", job.jobDescription);

        try {
            toast.loading("Analyzing your resume...");
            const res = await analyzeResume(formData);
            toast.dismiss();

            if (res.success) {
                toast.success("Resume submitted! Proceeding to assessment...");
                // Redirect to MCQ assessment instead of home
                router.push(`/assessment/${jobId}`);
            } else {
                toast.error(res.error || "Failed to submit application");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("An error occurred during application");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark-100 gap-4">
             <div className="w-12 h-12 border-4 border-primary-200/20 border-t-primary-200 rounded-full animate-spin"></div>
             <p className="text-light-100">Loading job details...</p>
        </div>
    );

    if (!job) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark-100 gap-4">
            <h2 className="text-2xl font-bold text-white">Job Not Found</h2>
            <Link href="/" className="text-primary-200">Return Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-100 text-light-100 py-12 px-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-10">
                
                {/* Back Button */}
                <Link href="/" className="flex items-center gap-2 text-light-100 hover:text-white transition-all w-fit group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Jobs</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Job Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-dark-200/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                    <Briefcase size={32} />
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-success-100/10 text-success-100 border border-success-100/20 text-xs font-bold uppercase tracking-widest">
                                    Active Hiring
                                </span>
                            </div>
                            
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-3">{job.title}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-light-100/60 font-medium">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        <Building2 size={14} /> {job.department}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        <MapPin size={14} /> {job.location}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText size={18} className="text-primary-200" />
                                    Job Description
                                </h3>
                                <p className="text-light-100 leading-relaxed opacity-80 text-sm whitespace-pre-wrap">
                                    {job.jobDescription}
                                </p>
                            </div>

                            {job.criteria && (
                                <div className="space-y-4 p-6 bg-primary-200/5 border border-primary-200/10 rounded-2xl">
                                    <h3 className="text-lg font-bold text-primary-200 flex items-center gap-2">
                                        <LayoutGrid size={18} />
                                        Selection Criteria
                                    </h3>
                                    <p className="text-sm italic text-light-100 opacity-90">
                                        {job.criteria}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Application Form */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-dark-200/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sticky top-6 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-2">Apply Now</h2>
                            <p className="text-sm text-light-100/50 mb-8 italic">Submit your resume for instant AI screening.</p>

                            <form onSubmit={handleApply} className="flex flex-col gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-white uppercase tracking-widest">
                                        Upload Resume (PDF)
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <input 
                                            name="resume"
                                            type="file" 
                                            accept=".pdf"
                                            required
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                        <div className={cn(
                                            "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all text-center",
                                            selectedFile 
                                                ? "border-success-100 bg-success-100/5" 
                                                : "border-white/10 group-hover:border-primary-200/50 group-hover:bg-primary-200/5"
                                        )}>
                                            {selectedFile ? (
                                                <>
                                                    <CheckCircle className="text-success-100 animate-bounce" size={32} />
                                                    <div>
                                                        <p className="text-sm font-bold text-white truncate max-w-[200px]">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-[10px] text-success-100/70 uppercase">Ready to submit</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-light-100/50 group-hover:text-primary-200 transition-colors" size={32} />
                                                    <p className="text-xs font-medium text-light-100/60 group-hover:text-white transition-colors">
                                                        Click to upload or drag & drop
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-light-100/30 text-center">Supported: .pdf (Max 2MB)</p>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={uploading}
                                    className="w-full bg-primary-200 hover:bg-primary-200/90 text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(130,103,248,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </button>
                                
                                <div className="flex items-center gap-2 justify-center mt-4">
                                    <CheckCircle size={14} className="text-success-100" />
                                    <span className="text-[10px] font-bold text-light-100/50 uppercase tracking-tighter">AI Powered Recruitment</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
