"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, Briefcase, MapPin, Building2, MoreVertical, LayoutGrid, List as ListIcon, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db } from "@database/firebase/client"; 
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { deleteJob } from "@backend/HR/actions/job.action";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    status: 'active' | 'closed' | 'draft';
    createdAt: any;
    applicantsCount: number;
    jobDescription: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");

    const handleDelete = async (e: React.MouseEvent, jobId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this job posting?")) return;

        try {
            const res = await deleteJob(jobId);
            if (res.success) {
                toast.success("Job posting deleted successfully");
            } else {
                toast.error(res.error || "Failed to delete job");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the job");
        }
    };

    useEffect(() => {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedJobs: Job[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Job));
            setJobs(fetchedJobs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredJobs = jobs.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        j.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        // Handle both Firestore Timestamp and JS Date
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="flex flex-col gap-8 animate-fadeIn">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Job Postings</h1>
                    <p className="text-light-100 italic">Manage your active job listings and review incoming applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-primary-200 text-white shadow-lg" : "text-light-100 hover:bg-white/5")}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-primary-200 text-white shadow-lg" : "text-light-100 hover:bg-white/5")}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                    <Link href="/hr/create-job">
                        <button className="bg-primary-200 hover:bg-primary-200/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(130,103,248,0.3)] transition-all">
                            <Plus size={20} /> Post New Job
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-100/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by job title, department..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-dark-200 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-200 w-full transition-all"
                    />
                </div>
                <select className="bg-dark-200 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-200 w-full md:w-48 appearance-none cursor-pointer">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                </select>
            </div>

            {/* Jobs Display */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <div className="w-12 h-12 border-4 border-primary-200/20 border-t-primary-200 rounded-full animate-spin"></div>
                     <p className="text-light-100">Fetching your job board...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="card-border border-dashed py-24 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/20">
                        <Briefcase size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No jobs posted yet</h3>
                    <p className="text-light-100 max-w-sm mb-8 italic">Get started by creating your first job posting. Our AI will help you find the best talent.</p>
                    <Link href="/hr/create-job">
                         <button className="bg-white text-dark-100 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all">
                            Create First Posting
                         </button>
                    </Link>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="relative group">
                            <Link href={`/hr/jobs/${job.id}`} className="block h-full">
                                <JobCard job={job} />
                            </Link>
                            <button 
                                onClick={(e) => handleDelete(e, job.id)}
                                className="absolute bottom-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                                title="Delete Posting"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                     {filteredJobs.map((job) => (
                        <div key={job.id} className="relative group">
                            <Link href={`/hr/jobs/${job.id}`} className="block">
                                <JobRow job={job} />
                            </Link>
                            <button 
                                onClick={(e) => handleDelete(e, job.id)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 mr-12"
                                title="Delete Posting"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function JobCard({ job }: { job: Job }) {
    return (
        <div className="card p-6 border border-white/5 bg-dark-200/40 backdrop-blur-sm hover:border-primary-200/30 transition-all group relative overflow-hidden flex flex-col h-full">
            {/* Background Accent */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-200/5 rounded-full blur-2xl group-hover:bg-primary-200/10 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 border border-primary-200/10">
                    <Briefcase size={20} />
                </div>
                <div className={cn(
                    "px-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                    job.status === 'active' ? "bg-success-100/10 text-success-100 border-success-100/20" : "bg-white/10 text-light-100 border-white/10"
                )}>
                    {job.status}
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-200 transition-colors">{job.title}</h3>
            
            <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-light-100">
                    <Building2 size={14} className="text-light-100/50" />
                    {job.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-light-100">
                    <MapPin size={14} className="text-light-100/50" />
                    {job.location}
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex flex-col">
                        <span className="text-light-100/50 uppercase text-[9px]">Posted</span>
                        <span className="text-white flex items-center gap-1">
                            <Calendar size={12} className="text-primary-200" />
                            {formatDateShort(job.createdAt)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-light-100/50 uppercase text-[9px]">Applicants</span>
                        <span className="text-white flex items-center gap-1 font-bold">
                            <Users size={12} className="text-primary-200" />
                            {job.applicantsCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function JobRow({ job }: { job: Job }) {
    return (
        <div className="card p-4 border border-white/5 bg-dark-200/40 backdrop-blur-sm hover:border-primary-200/30 transition-all group flex items-center gap-6">
            <div className="p-2 rounded-lg bg-primary-200/10 text-primary-200 shrink-0">
                <Briefcase size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate group-hover:text-primary-200 transition-colors uppercase tracking-tight">{job.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-light-100/70 flex items-center gap-1.5 font-medium italic">
                        <Building2 size={12} /> {job.department}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <span className="text-xs text-light-100/70 flex items-center gap-1.5 font-medium italic">
                        <MapPin size={12} /> {job.location}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-8 shrink-0">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] text-light-100/40 font-bold uppercase tracking-widest mb-1">Applicants</span>
                    <span className="text-white font-bold text-lg">{job.applicantsCount || 0}</span>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border shrink-0",
                    job.status === 'active' ? "bg-success-100/10 text-success-100 border-success-100/20" : "bg-white/10 text-light-100 border-white/10"
                )}>
                    {job.status.toUpperCase()}
                </div>
            </div>
        </div>
    );
}

function formatDateShort(date: any) {
    if (!date) return "N/A";
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
