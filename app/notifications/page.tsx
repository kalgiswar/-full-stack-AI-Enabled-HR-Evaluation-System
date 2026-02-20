"use client";

import React, { useEffect, useState } from "react";
import { db } from "@database/firebase/client";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "@backend/lib/actions/auth.action";
import { Bell, CheckCircle2, XCircle, Info, Clock, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ClientDashboardWrapper from "@/Client/components/ClientDashboardWrapper";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "success" | "rejection" | "info";
    createdAt: any;
    read: boolean;
    analysisId?: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function fetchUser() {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.id)
            // Removed orderBy to avoid index errors on new environments
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log(`[Debug Client] Notification ${doc.id} type:`, data.type);
                return {
                    id: doc.id,
                    ...data
                } as Notification;
            });

            // Sort in memory: Newest first
            fetched.sort((a, b) => {
                const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
                const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
                return tB - tA;
            });

            setNotifications(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Listener Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const docRef = doc(db, "notifications", id);
            await updateDoc(docRef, { read: true });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const formatTime = (ts: any) => {
        if (!ts) return "Recently";
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + date.toLocaleDateString();
    };

    return (
        <ClientDashboardWrapper user={user} isLoading={loading}>
            <div className="max-w-4xl mx-auto flex flex-col gap-8 py-8 animate-fadeIn">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <Link href="/" className="text-light-100 hover:text-white flex items-center gap-2 mb-4 transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-4">
                            Your Notifications
                            {notifications.some(n => !n.read) && (
                                <span className="bg-primary-200 text-white text-[10px] px-2 py-1 rounded-full animate-pulse uppercase tracking-widest">New Update</span>
                            )}
                        </h1>
                        <p className="text-light-100 italic mt-2 opacity-70">Track your application status and AI feedback.</p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setLoading(true);
                            if (user) {
                                // The effect will re-run because of state change or just use the sync
                                window.location.reload();
                            }
                        }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-bold text-sm"
                    >
                        <Clock size={16} className="text-primary-200" /> Refresh Sync
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                             <div className="w-10 h-10 border-4 border-primary-200/20 border-t-primary-200 rounded-full animate-spin"></div>
                             <p className="text-light-100 animate-pulse">Syncing updates with AI engine...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="card-border border-dashed py-24 flex flex-col items-center justify-center text-center bg-white/[0.01] rounded-[40px]">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/20">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No updates yet</h3>
                            <p className="text-light-100 max-w-sm italic opacity-60 mb-8">You haven't received any automated feedback yet. Try submitting your resume again!</p>
                            
                            <Link href="/" className="btn-primary px-8"> Browse Jobs Now </Link>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => !notif.read && markAsRead(notif.id)}
                                className={cn(
                                    "card p-6 border transition-all relative overflow-hidden flex gap-5 group cursor-pointer",
                                    notif.read ? "border-white/5 bg-dark-200/20" : "border-primary-200/30 bg-primary-200/[0.03] shadow-[0_0_20px_rgba(130,103,248,0.05)]"
                                )}
                            >
                                {/* Left Indicator */}
                                <div className={cn(
                                    "w-1 absolute left-0 top-0 h-full transition-all",
                                    notif.type === "success" ? "bg-success-100" : 
                                    notif.type === "rejection" ? "bg-destructive-100" : "bg-primary-200"
                                )} />

                                {/* Icon */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                    notif.type === "success" ? "bg-success-100/10 text-success-100 border-success-100/20" : 
                                    notif.type === "rejection" ? "bg-destructive-100/10 text-destructive-100 border-destructive-100/20" : 
                                    "bg-primary-200/10 text-primary-200 border-primary-200/20"
                                )}>
                                    {notif.type === "success" && <CheckCircle2 size={24} />}
                                    {notif.type === "rejection" && <XCircle size={24} />}
                                    {notif.type === "info" && <Info size={24} />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={cn("font-bold text-lg", notif.read ? "text-white/80" : "text-white")}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-light-100/40 font-medium whitespace-nowrap">
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-light-100/70 leading-relaxed mb-4">
                                        {notif.message}
                                    </p>
                                    
                                    {notif.analysisId && (
                                        <Link 
                                            href={`/resume-shortlist`} 
                                            className="inline-flex items-center gap-2 text-xs font-bold text-primary-200 hover:text-white transition-all uppercase tracking-widest"
                                        >
                                            View Analysis Report &rarr;
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ClientDashboardWrapper>
    );
}
