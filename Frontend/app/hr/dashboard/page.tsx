"use client";

import React, { useEffect, useState } from "react";
import { HR_STATS } from "@backend/lib/hr-mock-data"; 
import { Search, Filter, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { db } from "@database/firebase/client"; 
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { deleteCandidate } from "@backend/HR/actions/resume.action";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Candidate {
    id: string;
    candidateName: string;
    category: "High Match" | "Potential" | "Reject";
    matchScore: number;
    createdAt?: Timestamp;
    jobDescription?: string;
    experienceSummary?: string;
}

export default function HRDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Real-time listener for resume_analyses
        // Using a simple collection reference and client-side sorting to avoid index requirements
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
            
            // Sort by createdAt descending
            fetchedCandidates.sort((a, b) => {
                const tA = a.createdAt?.seconds || 0;
                const tB = b.createdAt?.seconds || 0;
                return tB - tA;
            });

            setCandidates(fetchedCandidates);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching candidates:", error);
            // In a production app, we might show a toast here
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

  // Helper to format date
  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "Just now";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-5">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-200 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-2xl">
                    <Image src="/hr-profile.jpg" alt="Muthuraman R" width={80} height={80} className="object-cover" />
                </div>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Welcome back, Muthuraman R</h1>
                <p className="text-light-100 italic opacity-80">"Delivering Excellence" • PMP® Certified HR Analytics</p>
                <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-primary-200/10 text-primary-200 border border-primary-200/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">HR Manager</span>
                    <span className="text-[10px] bg-success-100/10 text-success-100 border border-success-100/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Premium Account</span>
                </div>
            </div>
        </div>
        <Link href="/hr/create-job">
            <button className="bg-primary-200 hover:bg-primary-200/90 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(130,103,248,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                <span className="text-xl leading-none">+</span> Post New Job
            </button>
        </Link>
      </div>

      {/* Stats Grid - Keeping Mock stats for layout, can be made real later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {HR_STATS.map((stat, i) => (
            <div key={i} className="card p-6 border border-white/5 bg-dark-200/40 backdrop-blur-sm hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-light-100 font-medium">{stat.label}</span>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        stat.trend === "up" ? "bg-success-100/10 text-success-100 border-success-100/20" : 
                        stat.trend === "neutral" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-destructive-100/10 text-destructive-100 border-destructive-100/20"
                    )}>
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
            </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pipeline Table (Left 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Candidates</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-100/50" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search candidates..." 
                            className="bg-dark-200 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-200 w-64"
                        />
                    </div>
                    <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 text-light-100">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="card-border overflow-hidden">
                <div className="card p-0">
                    {loading ? (
                        <div className="p-8 text-center text-light-100">Loading candidates...</div>
                    ) : candidates.length === 0 ? (
                        <div className="p-8 text-center text-light-100">No candidates found. Upload a resume to get started!</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-light-100 text-sm">
                                    <th className="p-4 font-medium pl-6">Candidate</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium hidden sm:table-cell">Stage</th>
                                    <th className="p-4 font-medium">Match</th>
                                    <th className="p-4 font-medium hidden sm:table-cell">Status</th>
                                    <th className="p-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => (
                                    <tr key={candidate.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                    {(candidate.candidateName || "Unknown").split(' ').map(n => n[0]).join('').substring(0,2)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{candidate.candidateName || "Unknown Candidate"}</div>
                                                    <div className="text-xs text-light-100">{formatDate(candidate.createdAt)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-light-100 text-sm">
                                            {/* Role is often in JD, for now displaying generic or truncated JD */}
                                            {candidate.jobDescription ? candidate.jobDescription.split(' ').slice(0, 3).join(' ') + "..." : "Applicant"}
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                                                candidate.category === "High Match" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                candidate.category === "Reject" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {candidate.category === "High Match" && <CheckCircle2 size={12} />}
                                                {candidate.category === "Reject" && <XCircle size={12} />}
                                                {candidate.category === "Potential" && <Clock size={12} />}
                                                {candidate.category === "High Match" ? "Interview" : candidate.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-dark-300 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full rounded-full", candidate.matchScore >= 80 ? "bg-success-100" : candidate.matchScore >= 50 ? "bg-yellow-400" : "bg-destructive-100")} 
                                                        style={{ width: `${candidate.matchScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-white">{candidate.matchScore}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-light-100 hidden sm:table-cell">{candidate.category}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/hr/candidate/${candidate.id}`} className="text-light-100 hover:text-white p-2 hover:bg-white/5 rounded-lg inline-block opacity-0 group-hover:opacity-100 transition-all font-medium text-sm">
                                                    View &rarr;
                                                </Link>
                                                <button 
                                                    onClick={(e) => handleDeleteCandidate(e, candidate.id)}
                                                    className="p-2 text-destructive-100 hover:bg-destructive-100/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* Right Sidebar (Analytics/Tasks) */}
        <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white">Analytics</h3>
            
            {/* Chart Placeholder */}
            <div className="card-border">
                <div className="card p-6 flex flex-col gap-4">
                    <h4 className="text-lg font-bold text-white">Skill Distribution</h4>
                    <div className="flex flex-col gap-4 pt-2">
                        {[
                            { label: "React / Frontend", val: 75, color: "bg-blue-500" },
                            { label: "Node.js / Backend", val: 60, color: "bg-purple-500" },
                            { label: "Python / Data", val: 40, color: "bg-green-500" },
                            { label: "UI / UX Design", val: 30, color: "bg-pink-500" }
                        ].map((skill) => (
                            <div key={skill.label} className="space-y-1">
                                <div className="flex justify-between text-xs text-light-100">
                                    <span>{skill.label}</span>
                                    <span>{skill.val}%</span>
                                </div>
                                <div className="w-full h-2 bg-dark-300 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${skill.color} animate-pulse`} style={{ width: `${skill.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-border">
                  <div className="card p-6 bg-gradient-to-br from-primary-200/20 to-purple-600/10 border-primary-200/20">
                    <h4 className="text-lg font-bold text-white mb-2">Upgrade to Pro</h4>
                    <p className="text-sm text-light-100 mb-4">Unlock advanced AI analytics and unlimited resume parsing.</p>
                    <Link href="/hr/settings" className="block w-full">
                        <button className="w-full bg-primary-200 text-white font-bold py-3 rounded-xl hover:bg-primary-200/90 transition-all shadow-[0_4px_15px_rgba(130,103,248,0.4)] active:scale-[0.98] group flex items-center justify-center gap-2">
                            View Plans
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                        </button>
                    </Link>
                  </div>
            </div>

        </div>

      </div>
    </div>
  );
}
