"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-hero-grid">
      <div
        className="container flex flex-col gap-4 py-4 lg:grid lg:gap-6 lg:py-6"
        style={{
          gridTemplateColumns: sidebarCollapsed ? "96px minmax(0,1fr)" : "300px minmax(0,1fr)"
        }}
      >
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
        </div>
        <div className="space-y-4 lg:space-y-6">
          <Topbar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
