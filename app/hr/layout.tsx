"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, LogOut } from "lucide-react";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background text-light-100 overflow-hidden font-jakarta">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-dark-200/50 backdrop-blur-xl border-r border-white/5 flex flex-col hidden md:flex">
        {/* Logo */}
        <Link href="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="Company Logo" width={32} height={32} className="rounded" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-primary-200 bg-clip-text text-transparent">
            HireGuard<span className="text-xs ml-1 text-light-100 border border-white/20 px-1 rounded italic">PRO</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
            <NavLink href="/hr/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === "/hr/dashboard"} />
            <NavLink href="/hr/candidates" icon={<Users size={20} />} label="Candidates" active={pathname === "/hr/candidates"} />
            <NavLink href="/hr/jobs" icon={<FileText size={20} />} label="Job Postings" active={pathname === "/hr/jobs"} />
            <NavLink href="/hr/settings" icon={<Settings size={20} />} label="Settings" active={pathname === "/hr/settings"} />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
            <Link href="/hr/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                <div className="w-10 h-10 rounded-full border border-primary-200/30 overflow-hidden shrink-0">
                    <Image src="/hr-profile.jpg" alt="Muthuraman R" width={40} height={40} className="object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">Muthuraman R</h4>
                    <p className="text-[10px] text-light-100/60 truncate uppercase tracking-tighter">HR Manager • PMP®</p>
                </div>
                <LogOut size={14} className="text-light-100/30 hover:text-destructive-100" />
            </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {/* Top Header (Mobile Only / Breadcrumbs) */}
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-dark-200/30 backdrop-blur-md sticky top-0 z-50">
            <h2 className="text-lg font-semibold text-white">
                {pathname === "/hr/dashboard" ? "Dashboard Overview" : 
                 pathname === "/hr/candidates" ? "Candidate Pipeline" :
                 pathname === "/hr/jobs" ? "Job Openings" :
                 pathname === "/hr/settings" ? "Account Settings" : "HR Command Center"}
            </h2>
             <div className="flex items-center gap-6">
                 <span className="text-xs text-light-100 bg-white/5 px-3 py-1 rounded-full border border-white/5 hidden sm:inline-block">
                    Live Updates Active
                 </span>
                 <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-bold text-white">Muthuraman R</span>
                        <span className="text-[10px] text-primary-200 font-bold uppercase tracking-tight">Pro Admin</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-primary-200/30 overflow-hidden shrink-0 shadow-lg">
                        <Image src="/hr-profile.jpg" alt="Profile" width={32} height={32} className="object-cover" />
                    </div>
                 </div>
             </div>
        </header>

        <div className="p-8 pb-20">
            {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                active 
                ? "bg-primary-200/10 text-primary-200 border border-primary-200/20" 
                : "text-light-100 hover:bg-white/5 hover:text-white"
            }`}
        >
            <span className={active ? "text-primary-200" : "text-light-100/70 group-hover:text-white"}>
                {icon}
            </span>
            <span className="font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-200 shadow-[0_0_8px_rgba(130,103,248,0.8)]" />}
        </Link>
    );
}

