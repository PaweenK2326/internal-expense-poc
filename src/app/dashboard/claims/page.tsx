import Link from "next/link";
import { getMockUser } from "@/lib/auth-mock";
import { ClaimForm } from "@/components/claims/claim-form";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

export default async function ClaimsPage() {
  const user = await getMockUser();
  if (!user) return null;

  const isEmployee = user.role === "EMPLOYEE";
  const title =
    user.role === "EMPLOYEE"
      ? "Submit claim"
      : user.role === "MANAGER"
        ? "Department claims"
        : "All claims";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">
          {isEmployee ? "Submit claim" : title}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/claims/history" className="gap-2">
            <History className="h-4 w-4" />
            View claim history
          </Link>
        </Button>
      </div>

      {isEmployee && (
        <section>
          <ClaimForm />
        </section>
      )}

      {!isEmployee && (
        <p className="text-muted-foreground">
          View and manage claims in{" "}
          <Link
            href="/dashboard/claims/history"
            className="font-medium text-primary hover:underline"
          >
            claim history
          </Link>
          .
        </p>
      )}
    </div>
  );
}
