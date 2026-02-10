"use client";

import { signOut as firebaseSignOut } from "firebase/auth";
import { signOut as serverSignOut } from "@backend/lib/actions/auth.action";
import { auth } from "@database/firebase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function HeaderAuth({ userId }: { userId?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // 1. Clear Server Cookie
      await serverSignOut();
      // 2. Clear Firebase Client Auth
      await firebaseSignOut(auth);
      
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error", error);
      toast.error("Failed to sign out");
    }
  };

  if (userId) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-light-100 hidden sm:flex gap-2">
            <User size={18} />
            My Profile
        </Button>
        <Button 
            onClick={handleSignOut} 
            variant="ghost" 
            className="text-destructive-100 hover:text-destructive-100 hover:bg-destructive-100/10 gap-2"
        >
            <LogOut size={18} />
            Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
        <Link href="/sign-in" className="text-light-100 hover:text-white font-medium">
            Sign In
        </Link>
        <Button asChild className="btn-primary h-9 px-6">
            <Link href="/sign-up">Sign Up</Link>
        </Button>
    </div>
  );
}
