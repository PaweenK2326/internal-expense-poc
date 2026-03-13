import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ClaimCountByStatus } from "@/types";
import { FileQuestion, FileCheck, FileX, Clock } from "lucide-react";

const STATUS_CONFIG: Record<
  keyof ClaimCountByStatus,
  { label: string; icon: typeof Clock }
> = {
  PENDING_MANAGER: { label: "Pending Manager", icon: Clock },
  PENDING_C_LEVEL: { label: "Pending C-Level", icon: FileQuestion },
  APPROVED: { label: "Approved", icon: FileCheck },
  REJECTED: { label: "Rejected", icon: FileX },
};

export type ClaimStatusCardsProps = {
  countByStatus: ClaimCountByStatus;
};

export function ClaimStatusCards({ countByStatus }: ClaimStatusCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(STATUS_CONFIG) as (keyof ClaimCountByStatus)[]).map(
        (status) => {
          const { label, icon: Icon } = STATUS_CONFIG[status];
          const count = countByStatus[status];
          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        }
      )}
    </div>
  );
}
