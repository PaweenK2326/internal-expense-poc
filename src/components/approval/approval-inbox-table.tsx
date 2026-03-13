"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import type { ClaimWithRelations } from "@/types";
import { approveClaimAction } from "@/app/actions/claim-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

export type ApprovalInboxTableProps = {
  claims: ClaimWithRelations[];
  emptyMessage?: string;
};

/** Data URLs as-is. Public blob URLs work directly; private blobs go through the proxy. */
function getReceiptViewUrl(url: string): string {
  if (url.startsWith("data:")) return url;
  if (url.includes("public.blob.vercel-storage.com")) return url;
  return `/api/receipt?url=${encodeURIComponent(url)}`;
}

/** Images can be shown in the dialog; PDFs open in new tab. */
function isImageUrl(url: string): boolean {
  if (url.startsWith("data:image/")) return true;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || url.includes("blob.vercel-storage.com");
}

export function ApprovalInboxTable({
  claims,
  emptyMessage = "No claims pending approval",
}: ApprovalInboxTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [receiptView, setReceiptView] = useState<{ url: string; name?: string } | null>(null);
  const [receiptLoadError, setReceiptLoadError] = useState(false);

  function handleAction(id: string, action: "approve" | "reject") {
    startTransition(async () => {
      const res = await approveClaimAction({ id, action });
      if (res.success) {
        toast.success(action === "approve" ? "Claim approved." : "Claim rejected.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Action failed.");
      }
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
            <th className="px-4 py-3 font-medium">Receipt</th>
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
              <td className="px-4 py-3">
                {c.receiptUrl ? (
                  isImageUrl(c.receiptUrl) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary hover:text-primary/90"
                      onClick={() => {
                        setReceiptLoadError(false);
                        setReceiptView({ url: getReceiptViewUrl(c.receiptUrl!) });
                      }}
                    >
                      View receipt
                    </Button>
                  ) : (
                    <a
                      href={getReceiptViewUrl(c.receiptUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View receipt
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
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

      <Dialog
        open={!!receiptView}
        onOpenChange={(open) => {
          if (!open) {
            setReceiptView(null);
            setReceiptLoadError(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receiptView && (
            <div className="flex flex-col items-center gap-3">
              {!receiptLoadError ? (
                <img
                  src={receiptView.url}
                  alt="Receipt"
                  className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border object-contain"
                  onError={() => setReceiptLoadError(true)}
                />
              ) : null}
              {receiptLoadError ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  <p>Could not load image in dialog.</p>
                  <a
                    href={receiptView.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Open receipt in new tab
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
