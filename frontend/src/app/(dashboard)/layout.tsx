import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-snow dark:bg-slate-900 transition-colors duration-300">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[256px] pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
