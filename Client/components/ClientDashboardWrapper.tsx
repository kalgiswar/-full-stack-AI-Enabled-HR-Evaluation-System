"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@database/firebase/client";
import DashboardAuth from "@/components/DashboardAuth";
import { Loader2 } from "lucide-react";

export default function ClientDashboardWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex w-full h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-100" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <DashboardAuth />;
  }

  return <>{children}</>;
}
