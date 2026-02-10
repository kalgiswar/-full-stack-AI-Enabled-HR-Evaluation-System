"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@backend/HR/actions/job.action";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, MapPin, Building2, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        
        try {
            toast.loading("Publishing job...");
            const result = await createJob(formData);
            toast.dismiss();

            if (result.success) {
                toast.success("Job posting created successfully!");
                router.push("/hr/dashboard");
            } else {
                toast.error(result.error || "Failed to create job");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fadeIn max-w-4xl mx-auto w-full">
            {/* Header */}
            <div>
                <Link href="/hr/dashboard" className="text-light-100 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Create New Job Posting</h1>
                <p className="text-light-100">Find your next star employee.</p>
            </div>

            <div className="card-border">
                <div className="card p-8 bg-dark-200/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* Job Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                                <Briefcase size={16} className="text-primary-200" />
                                Job Title
                            </label>
                            <input 
                                name="title"
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                required
                                className="bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                                    <Building2 size={16} className="text-primary-200" />
                                    Department
                                </label>
                                <select 
                                    name="department"
                                    required
                                    className="bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled selected>Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Product">Product</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="HR">Human Resources</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                                    <MapPin size={16} className="text-primary-200" />
                                    Location
                                </label>
                                <input 
                                    name="location"
                                    type="text"
                                    placeholder="e.g. San Francisco, CA (Remote)"
                                    required
                                    className="bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                                <FileText size={16} className="text-primary-200" />
                                Job Description
                            </label>
                            <textarea 
                                name="jobDescription"
                                placeholder="Describe the role, responsibilities, and requirements..."
                                required
                                rows={6}
                                className="bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all placeholder:text-white/20 resize-none"
                            />
                        </div>

                        {/* Recruitment Criteria */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                                <Plus size={16} className="text-primary-200" />
                                Recruitment Criteria (for AI Matching)
                            </label>
                            <textarea 
                                name="criteria"
                                placeholder="Enter specific criteria like 'Must have 5 years React experience', 'PMP certification required', etc."
                                required
                                rows={4}
                                className="bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all placeholder:text-white/20 resize-none"
                            />
                            <p className="text-xs text-light-100/50 text-right">Our AI will strictly match candidates against these specific points.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                             <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-primary-200 hover:bg-primary-200/90 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(130,103,248,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? "Publishing..." : "Publish Job Posting"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
