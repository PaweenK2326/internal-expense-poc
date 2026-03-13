"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { Role } from "@prisma/client";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";

export type DashboardLayoutClientProps = {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
};

export function DashboardLayoutClient({
  user,
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="fixed left-3 top-3 z-50 md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-0 flex-1 overflow-auto bg-background p-4 pt-12 md:pt-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
