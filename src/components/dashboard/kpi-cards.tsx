import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";

export type KpiCardsProps = {
  totalApprovedThisMonth: number;
  totalPending: number;
};

export function KpiCards({
  totalApprovedThisMonth,
  totalPending,
}: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Total Approved This Month
          </span>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ฿{totalApprovedThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Total Pending
          </span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalPending}</p>
        </CardContent>
      </Card>
    </div>
  );
}
