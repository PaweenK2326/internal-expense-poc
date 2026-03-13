import { getMockUser } from "@/lib/auth-mock";
import { getClaimsForCurrentUser } from "@/lib/claims";
import { ClaimForm } from "@/components/claims/claim-form";
import { ClaimsTable } from "@/components/claims/claims-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClaimsPage() {
  const user = await getMockUser();
  if (!user) return null;

  const claims = await getClaimsForCurrentUser();

  const isEmployee = user.role === "EMPLOYEE";
  const title =
    user.role === "EMPLOYEE"
      ? "My claims"
      : user.role === "MANAGER"
        ? "Department claims"
        : "All claims";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      {isEmployee && (
        <section>
          <ClaimForm />
        </section>
      )}

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{isEmployee ? "Claim history" : "Claims"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClaimsTable
              claims={claims}
              emptyMessage={
                isEmployee
                  ? "You have not submitted any claims yet."
                  : "No claims to show."
              }
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
