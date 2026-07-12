"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  children,
  showAdmin
}: {
  children: React.ReactNode;
  showAdmin: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-hero-grid">
      <div
        className="flex min-h-screen flex-col lg:grid"
        style={{
          gridTemplateColumns: sidebarCollapsed ? "96px minmax(0,1fr)" : "300px minmax(0,1fr)"
        }}
      >
        <div className="lg:sticky lg:top-0 lg:h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((current) => !current)}
            showAdmin={showAdmin}
          />
        </div>
        <div className="space-y-4 px-4 py-4 lg:space-y-6 lg:px-8 lg:py-6">
          <Topbar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
