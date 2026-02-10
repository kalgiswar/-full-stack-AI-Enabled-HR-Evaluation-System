import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { Bell } from "lucide-react";
import { redirect } from "next/navigation";

import HeaderAuth from "@/components/HeaderAuth";
import { getCurrentUser } from "@backend/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  /* 
  // Removing hard redirect to allow inline-login on Dashboard
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  */
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">Hireguard</h2>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-light-100 hover:text-white relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-200 rounded-full"></span>
          </Link>
          <HeaderAuth userId={user?.id} />
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
