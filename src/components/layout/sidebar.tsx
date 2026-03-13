"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  LogOut,
  User,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SidebarProps = {
  user: { name: string; email: string; role: Role };
};

const navByRole: Record<Role, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  EMPLOYEE: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims", label: "My Claims", icon: FileText },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims", label: "Department Claims", icon: FileText },
    { href: "/dashboard/approvals", label: "Approval Inbox", icon: Inbox },
  ],
  C_LEVEL: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims", label: "All Claims", icon: FileText },
    { href: "/dashboard/approvals", label: "Approval Inbox", icon: Inbox },
  ],
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const nav = navByRole[user.role];
  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="font-semibold text-foreground">Expense Claim</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post" className="mt-1">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
