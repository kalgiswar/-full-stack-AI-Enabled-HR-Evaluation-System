"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@database/firebase/client";
import { doc, getDoc, collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { ArrowLeft, Briefcase, MapPin, Building2, Calendar, Users, CheckCircle2, XCircle, Clock, ChevronRight, Search, LayoutDashboard, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

interface Candidate {
    id: string;
    candidateName: string;
    category: "High Match" | "Potential" | "Reject";
    matchScore: number;
    createdAt?: Timestamp;
}

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    
    const [job, setJob] = useState<Job | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            const docRef = doc(db, "jobs", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setJob({ id: docSnap.id, ...docSnap.data() } as Job);
            }
        };

        fetchJob();

        // Fetch candidates. 
        // Note: Realistically we'd filter by jobId, but since our current resume.action saves JD text, 
        // we'll just fetch all and filter client-side for this demo or just show the pool.
        const q = collection(db, "resume_analyses");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                candidateName: doc.data().candidateName,
                category: doc.data().category,
                matchScore: doc.data().matchScore,
                createdAt: doc.data().createdAt
            } as Candidate));
            
            // Sort by match score
            fetched.sort((a, b) => b.matchScore - a.matchScore);
            setCandidates(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
            <div className="w-12 h-12 border-4 border-primary-200/20 border-t-primary-200 rounded-full animate-spin"></div>
            <p className="text-light-100 italic">Opening job file...</p>
        </div>
    );

    if (!job) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
            <h2 className="text-2xl font-bold text-white">Job not found</h2>
            <Link href="/hr/jobs" className="bg-primary-200 text-white px-6 py-2 rounded-xl">Back to Jobs</Link>
        </div>
    );

    const filteredCandidates = candidates.filter(c => 
        c.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-fadeIn max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href="/hr/jobs" className="flex items-center gap-2 text-light-100 hover:text-white transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Job Board
                    </Link>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 mt-4">
                        <span className="flex items-center gap-2 text-primary-200 font-bold">
                            <Building2 size={18} /> {job.department}
                        </span>
                        <span className="flex items-center gap-2 text-light-100">
                            <MapPin size={18} className="text-light-100/50" /> {job.location}
                        </span>
                        <span className="flex items-center gap-2 text-light-100">
                            <Calendar size={18} className="text-light-100/50" /> 
                            Posted {job.createdAt instanceof Timestamp ? job.createdAt.toDate().toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                            job.status === 'active' ? "bg-success-100/10 text-success-100 border-success-100/20" : "bg-white/10 text-light-100 border-white/10"
                        )}>
                            {job.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">
                        Edit Posting
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-destructive-100/10 border border-destructive-100/20 text-destructive-100 font-bold hover:bg-destructive-100/20 transition-all">
                        Close Role
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Job Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card p-8 border border-white/5 bg-dark-200/40 backdrop-blur-sm rounded-3xl space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <FileText className="text-primary-200" size={20} />
                             Job Description
                        </h3>
                        <div className="text-light-100 leading-relaxed whitespace-pre-wrap text-sm italic opacity-80">
                            {job.jobDescription}
                        </div>
                    </div>

                    <div className="card p-8 border border-white/5 bg-gradient-to-br from-primary-200/10 to-transparent rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <LayoutDashboard className="text-primary-200" size={20} />
                            Quick Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-light-100/50 mb-1">Total Applicants</p>
                                <p className="text-2xl font-black text-white">{candidates.length}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-light-100/50 mb-1">High Matches</p>
                                <p className="text-2xl font-black text-success-100">{candidates.filter(c => c.category === 'High Match').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Applicants */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users className="text-primary-200" />
                            Applied Candidates
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-100/50" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter by name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-200 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-200 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredCandidates.length === 0 ? (
                            <div className="card-border border-dashed py-20 text-center">
                                <p className="text-light-100 italic">No candidates found for this role yet.</p>
                            </div>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <Link 
                                    key={candidate.id} 
                                    href={`/hr/candidate/${candidate.id}`}
                                    className="group block"
                                >
                                    <div className="card p-4 border border-white/5 bg-dark-200/40 backdrop-blur-sm hover:border-primary-200/30 hover:bg-white/[0.02] transition-all flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-200/20 to-purple-500/10 flex items-center justify-center font-bold text-white border border-white/5 group-hover:scale-110 transition-transform">
                                                {candidate.candidateName.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-primary-200 transition-colors uppercase tracking-tight">{candidate.candidateName}</h4>
                                                <p className="text-xs text-light-100/60">
                                                    Match: <span className={cn("font-black", candidate.matchScore >= 80 ? "text-success-100" : "text-yellow-400")}>{candidate.matchScore}%</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={cn(
                                                "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                                                candidate.category === "High Match" ? "bg-success-100/10 text-success-100 border-success-100/20" :
                                                candidate.category === "Reject" ? "bg-destructive-100/10 text-destructive-100 border-destructive-100/20" :
                                                "bg-primary-200/10 text-primary-200 border-primary-200/20"
                                            )}>
                                                {candidate.category === "High Match" && <CheckCircle2 size={12} />}
                                                {candidate.category === "Reject" && <XCircle size={12} />}
                                                {candidate.category === "Potential" && <Clock size={12} />}
                                                {candidate.category}
                                            </span>
                                            <ChevronRight className="text-light-100/30 group-hover:text-white transition-colors" size={20} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
