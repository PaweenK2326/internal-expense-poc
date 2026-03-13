"use client";

import type { ClaimWithRelations } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type ClaimsTableProps = {
  claims: ClaimWithRelations[];
  emptyMessage?: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_MANAGER: "Pending Manager",
  PENDING_C_LEVEL: "Pending C-Level",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_VARIANT: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING_MANAGER: "secondary",
  PENDING_C_LEVEL: "default",
  APPROVED: "outline",
  REJECTED: "destructive",
};

export function ClaimsTable({ claims, emptyMessage = "No claims" }: ClaimsTableProps) {
  if (!claims.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium">Date range</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Employee</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                {format(new Date(c.startDate), "dd/MM/yyyy")} –{" "}
                {format(new Date(c.endDate), "dd/MM/yyyy")}
              </td>
              <td className="px-4 py-3">{c.project}</td>
              <td className="px-4 py-3">{c.category}</td>
              <td className="px-4 py-3">
                ฿{c.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </Badge>
              </td>
              <td className="px-4 py-3">{c.employee.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
