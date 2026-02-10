"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Clock, CheckCircle2, XCircle, ArrowUpDown, ChevronRight, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db } from "@database/firebase/client"; 
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { deleteCandidate } from "@backend/HR/actions/resume.action";
import { toast } from "sonner";

interface Candidate {
    id: string;
    candidateName: string;
    category: "High Match" | "Potential" | "Reject";
    matchScore: number;
    createdAt?: Timestamp;
    jobDescription?: string;
    experienceSummary?: string;
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("All");

    const handleDeleteCandidate = async (e: React.MouseEvent, candidateId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this candidate record?")) return;

        try {
            const res = await deleteCandidate(candidateId);
            if (res.success) {
                toast.success("Candidate record deleted successfully");
            } else {
                toast.error(res.error || "Failed to delete candidate");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the candidate");
        }
    };

    useEffect(() => {
        const q = collection(db, "resume_analyses");

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCandidates: Candidate[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    candidateName: data.candidateName,
                    category: data.category,
                    matchScore: data.matchScore,
                    createdAt: data.createdAt,
                    jobDescription: data.jobDescription,
                    experienceSummary: data.experienceSummary
                } as Candidate;
            });
            
            fetchedCandidates.sort((a, b) => {
                const tA = a.createdAt?.seconds || 0;
                const tB = b.createdAt?.seconds || 0;
                return tB - tA;
            });

            setCandidates(fetchedCandidates);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching candidates:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = (c.candidateName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (c.jobDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterCategory === "All" || c.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    const formatDate = (ts?: Timestamp) => {
        if (!ts) return "Recently";
        return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Candidates</h1>
                    <p className="text-light-100 text-sm">Manage and track all applicants in your pipeline.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-100/50" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or role..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-dark-200 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-200 w-full md:w-80 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
                {["All", "High Match", "Potential", "Reject"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                            filterCategory === cat 
                            ? "bg-primary-200 text-white border-primary-200 shadow-[0_0_15px_rgba(130,103,248,0.3)]"
                            : "bg-white/5 text-light-100 border-white/5 hover:border-white/10"
                        )}
                    >
                        {cat}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-xs text-light-100 italic">
                    <ArrowUpDown size={14} />
                    Sorted by most recent
                </div>
            </div>

            {/* Candidate Cards Grid / Table */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary-200/20 border-t-primary-200 rounded-full animate-spin"></div>
                        <p className="text-light-100">Loading candidate pool...</p>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="card-border border-dashed py-20 flex flex-col items-center justify-center text-center">
                        <Users className="text-white/10 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-white">No candidates found</h3>
                        <p className="text-light-100 max-w-xs">We couldn't find any candidates matching your current filters or search.</p>
                    </div>
                ) : (
                    filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="relative group">
                            <Link 
                                href={`/hr/candidate/${candidate.id}`}
                                className="block"
                            >
                                <div className="card p-4 md:p-6 border border-white/5 bg-dark-200/40 backdrop-blur-sm hover:border-primary-200/30 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Left Section: Profile Info */}
                                    <div className="flex items-center gap-4 min-w-[300px]">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-200/20 to-purple-500/10 flex items-center justify-center border border-white/5 group-hover:border-primary-200/20 transition-all">
                                            <div className="text-xl font-bold bg-gradient-to-r from-primary-200 to-purple-400 bg-clip-text text-transparent">
                                                {(candidate.candidateName || "U").split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary-200 transition-colors">
                                                {candidate.candidateName || "Unknown Candidate"}
                                            </h3>
                                            <p className="text-sm text-light-100 flex items-center gap-2">
                                                {candidate.jobDescription ? candidate.jobDescription.split(' ').slice(0, 4).join(' ') : "General Applicant"}
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                {formatDate(candidate.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle Section: Stats */}
                                    <div className="flex-1 flex flex-wrap gap-8 items-center md:justify-center">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-light-100/50 font-bold">Match Score</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full rounded-full transition-all duration-1000", 
                                                            candidate.matchScore >= 80 ? "bg-success-100 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : 
                                                            candidate.matchScore >= 50 ? "bg-yellow-400" : "bg-destructive-100"
                                                        )} 
                                                        style={{ width: `${candidate.matchScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-white">{candidate.matchScore}%</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wider text-light-100/50 font-bold">Category</span>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                candidate.category === "High Match" ? "bg-success-100/10 text-success-100 border-success-100/20" :
                                                candidate.category === "Reject" ? "bg-destructive-100/10 text-destructive-100 border-destructive-100/20" :
                                                "bg-primary-200/10 text-primary-200 border-primary-200/20"
                                            )}>
                                                {candidate.category === "High Match" && <CheckCircle2 size={12} />}
                                                {candidate.category === "Reject" && <XCircle size={12} />}
                                                {candidate.category === "Potential" && <Clock size={12} />}
                                                {candidate.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Section: Action */}
                                    <div className="flex items-center justify-end md:w-24 gap-2">
                                        <button 
                                            onClick={(e) => handleDeleteCandidate(e, candidate.id)}
                                            className="p-3 text-destructive-100 hover:bg-destructive-100/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-light-100 group-hover:bg-primary-200 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
