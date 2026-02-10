"use client";

import React, { useState } from "react";
import AuthForm from "@/components/AuthForm";

export default function DashboardAuth() {
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  const toggleMode = () => {
    setAuthMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"));
  };

  return (
    <div className="flex w-full min-h-[80vh] items-center justify-center">
        <AuthForm type={authMode} onToggleMode={toggleMode} />
    </div>
  );
}
