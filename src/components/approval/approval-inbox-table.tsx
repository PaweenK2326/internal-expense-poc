"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ClaimWithRelations } from "@/types";
import { approveClaimAction } from "@/app/actions/claim-actions";
import { Button } from "@/components/ui/button";

export type ApprovalInboxTableProps = {
  claims: ClaimWithRelations[];
  emptyMessage?: string;
};

export function ApprovalInboxTable({
  claims,
  emptyMessage = "No claims pending approval",
}: ApprovalInboxTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAction(id: string, action: "approve" | "reject") {
    startTransition(async () => {
      const res = await approveClaimAction({ id, action });
      if (res.success) router.refresh();
    });
  }

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
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
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
              <td className="px-4 py-3">{c.employee.name}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => handleAction(c.id, "reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleAction(c.id, "approve")}
                  >
                    Approve
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
