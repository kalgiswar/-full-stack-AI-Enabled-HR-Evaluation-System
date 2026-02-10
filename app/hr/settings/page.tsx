"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Bell, Shield, Palette, HelpCircle, Save, LogOut, CreditCard, Check, Zap, Crown, Building } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("Account");

    return (
        <div className="flex flex-col gap-8 animate-fadeIn max-w-6xl">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-light-100 italic">Configure your workspace and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Tabs Sidebar */}
                <div className="md:col-span-1 flex flex-col gap-1">
                    <SettingTab icon={<User size={18} />} label="Account" active={activeTab === "Account"} onClick={() => setActiveTab("Account")} />
                    <SettingTab icon={<CreditCard size={18} />} label="Subscription" active={activeTab === "Subscription"} onClick={() => setActiveTab("Subscription")} />
                    <SettingTab icon={<Bell size={18} />} label="Notifications" active={activeTab === "Notifications"} onClick={() => setActiveTab("Notifications")} />
                    <SettingTab icon={<Shield size={18} />} label="Security" active={activeTab === "Security"} onClick={() => setActiveTab("Security")} />
                    <SettingTab icon={<Palette size={18} />} label="Appearance" active={activeTab === "Appearance"} onClick={() => setActiveTab("Appearance")} />
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    {activeTab === "Account" && (
                        <div className="space-y-6">
                            <div className="card p-8 border border-white/5 bg-dark-200/40 backdrop-blur-sm">
                                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Profile Information</h2>
                                
                                <div className="flex flex-col gap-6">
                                    <div className="relative mb-8 pt-4">
                                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-200/10 to-purple-600/10 rounded-2xl border border-white/5 opacity-50 overflow-hidden">
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("/pattern.png")', backgroundSize: '100px' }}></div>
                                        </div>
                                        <div className="px-6 flex items-end gap-6 relative z-10 pt-12">
                                            <div className="w-24 h-24 rounded-3xl bg-dark-100 p-1 ring-4 ring-dark-200 shadow-2xl overflow-hidden group">
                                                <Image src="/hr-profile.jpg" alt="Muthuraman R" width={96} height={96} className="object-cover w-full h-full rounded-2xl group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="pb-1">
                                                <button className="text-sm font-bold text-primary-200 hover:text-primary-200/80 transition-all border-b border-primary-200/20 hover:border-primary-200 uppercase tracking-widest px-1">Change Photo</button>
                                                <p className="text-[10px] text-light-100/40 mt-1 uppercase font-bold tracking-tighter">Verified HR Identity • AI Powered</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-light-100/70 uppercase tracking-wider ml-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue="Muthuraman R, PMP®"
                                                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-light-100/70 uppercase tracking-wider ml-1">Job Title</label>
                                            <input 
                                                type="text" 
                                                defaultValue="Human Resources Manager"
                                                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-light-100/70 uppercase tracking-wider ml-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                defaultValue="muthuraman@company.com"
                                                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-200 transition-all shadow-inner opacity-70 cursor-not-allowed"
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                                        <button className="px-6 py-2.5 rounded-xl border border-white/10 text-light-100 font-bold hover:bg-white/5 transition-all">
                                            Discard
                                        </button>
                                        <button className="bg-primary-200 hover:bg-primary-200/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(130,103,248,0.3)] transition-all flex items-center gap-2">
                                            <Save size={18} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-8 border border-white/5 bg-destructive-100/5 border-destructive-100/10">
                                <h2 className="text-xl font-bold text-destructive-100 mb-2">Danger Zone</h2>
                                <p className="text-sm text-light-100/60 mb-6 italic">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                <button className="text-destructive-100 border border-destructive-100/20 hover:bg-destructive-100/10 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2">
                                    <LogOut size={18} /> Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Subscription" && (
                        <div className="space-y-8">
                            {/* Current Plan Card */}
                            <div className="card p-6 border border-primary-200/20 bg-primary-200/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-200/20 flex items-center justify-center text-primary-200">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Free Tier Plan</h3>
                                        <p className="text-light-100/60 text-sm italic">Next billing date: Never (Free)</p>
                                    </div>
                                </div>
                                <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Active</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pro Plan */}
                                <PricingCard 
                                    title="Professional"
                                    price="$49"
                                    icon={<Crown className="text-yellow-400" />}
                                    description="Designed for high-growth startups and dedicated HR teams."
                                    features={[
                                        "Unlimited Resume Analyses",
                                        "Advanced AI Interview Scoring",
                                        "Proctoring & Integrity Shield",
                                        "Team Collaboration (up to 5 users)",
                                        "Priority Support"
                                    ]}
                                    highlight
                                />

                                {/* Enterprise Plan */}
                                <PricingCard 
                                    title="Enterprise"
                                    price="Custom"
                                    icon={<Building className="text-primary-200" />}
                                    description="Tailored solutions for large-scale hiring needs."
                                    features={[
                                        "Everything in Pro",
                                        "Custom AI Model Training",
                                        "Bulk API Access",
                                        "White-labeled Interface",
                                        "Dedicated Account Manager"
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                    
                    {activeTab !== "Account" && activeTab !== "Subscription" && (
                         <div className="card p-20 flex flex-col items-center justify-center text-center opacity-50 italic">
                             <h2 className="text-2xl font-bold text-white">Section Under Construction</h2>
                             <p className="text-light-100">This module is being optimized for the next update.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingTab({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                active ? "bg-primary-200/10 text-primary-200 border border-primary-200/20" : "text-light-100 hover:bg-white/5 hover:text-white"
            )}
        >
            <span className={active ? "text-primary-200" : "text-light-100/70 group-hover:text-white"}>{icon}</span>
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </button>
    );
}

function PricingCard({ title, price, icon, description, features, highlight = false }: any) {
    return (
        <div className={cn(
            "card p-8 border flex flex-col h-full transition-all hover:scale-[1.02]",
            highlight ? "border-primary-200 bg-primary-200/5 shadow-[0_0_30px_rgba(130,103,248,0.15)]" : "border-white/5 bg-dark-200/40"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-white">{price}</span>
                    {price !== "Custom" && <span className="text-light-100/50 text-xs ml-1">/mo</span>}
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-light-100/60 mb-6 italic">{description}</p>
            
            <div className="space-y-4 flex-1">
                {features.map((f: string) => (
                    <div key={f} className="flex gap-3 text-sm text-light-100">
                        <Check size={18} className="text-primary-200 shrink-0" />
                        <span>{f}</span>
                    </div>
                ))}
            </div>
            
            <button className={cn(
                "w-full py-3 rounded-xl font-bold mt-8 transition-all",
                highlight 
                ? "bg-primary-200 text-white shadow-lg hover:bg-primary-200/90" 
                : "bg-white/10 text-white hover:bg-white/20"
            )}>
                {price === "Custom" ? "Contact Sales" : "Upgrade Now"}
            </button>
        </div>
    );
}
