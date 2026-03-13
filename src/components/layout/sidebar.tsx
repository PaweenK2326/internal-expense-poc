"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  Inbox,
  LogOut,
  User,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SidebarProps = {
  user: { name: string; email: string; role: Role };
  open?: boolean;
  onClose?: () => void;
};

const navByRole: Record<Role, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  EMPLOYEE: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims", label: "Submit Claim", icon: FileText },
    { href: "/dashboard/claims/history", label: "Claim History", icon: History },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims/history", label: "Department Claims", icon: FileText },
    { href: "/dashboard/approvals", label: "Approval Inbox", icon: Inbox },
  ],
  C_LEVEL: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/claims/history", label: "All Claims", icon: FileText },
    { href: "/dashboard/approvals", label: "Approval Inbox", icon: Inbox },
  ],
};

export function Sidebar({ user, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const nav = navByRole[user.role];

  return (
    <aside
      className={cn(
        "flex w-56 shrink-0 flex-col border-r border-border bg-card shadow-sm transition-transform duration-200 ease-out",
        "fixed inset-y-0 left-0 z-50 h-screen md:relative md:h-screen md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4 md:h-16">
        <div className="flex items-center gap-2">
          <Image
            src="/app-logo.png"
            alt="i2 Enterprise"
            width={36}
            height={36}
            className="shrink-0 object-contain"
          />
          <span className="truncate text-sm font-semibold text-foreground">
            Expense Claim
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-auto p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
            >
              <span
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
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
