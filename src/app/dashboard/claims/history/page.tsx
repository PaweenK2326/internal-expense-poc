import Link from "next/link";
import { getMockUser } from "@/lib/auth-mock";
import { getClaimHistoryForCurrentUser } from "@/lib/claims";
import { ClaimsTable } from "@/components/claims/claims-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ClaimHistoryPage() {
  const user = await getMockUser();
  if (!user) return null;

  const claims = await getClaimHistoryForCurrentUser();

  const title =
    user.role === "EMPLOYEE"
      ? "Claim history"
      : user.role === "MANAGER"
        ? "Department claims"
        : "All claims";

  const emptyMessage =
    user.role === "EMPLOYEE"
      ? "You have not submitted any claims yet."
      : "No claims to show.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/claims" aria-label="Back to claims">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClaimsTable claims={claims} emptyMessage={emptyMessage} />
        </CardContent>
      </Card>
    </div>
  );
}
