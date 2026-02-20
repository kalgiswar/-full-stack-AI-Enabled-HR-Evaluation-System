"use client";

import React from "react";
import DashboardAuth from "@/components/DashboardAuth";
import { Loader2 } from "lucide-react";

interface ClientDashboardWrapperProps {
  children: React.ReactNode;
  user: any | null; // Accepting the user object (or null) from the server
  isLoading?: boolean;
}

export default function ClientDashboardWrapper({ 
  children, 
  user,
  isLoading = false
}: ClientDashboardWrapperProps) {

  // If the server is still loading (unlikely for server components, but good for safety)
  if (isLoading) {
    return (
      <div className="flex w-full h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-100" />
      </div>
    );
  }

  // If no user is authenticated, show the auth screen
  if (!user) {
    return <DashboardAuth />;
  }

  // Otherwise, show the dashboard content
  return <>{children}</>;
}
