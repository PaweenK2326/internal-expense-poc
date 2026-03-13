import { getApprovalInboxClaims } from "@/lib/claims";
import { ApprovalInboxTable } from "@/components/approval/approval-inbox-table";

export default async function ApprovalsPage() {
  const claims = await getApprovalInboxClaims();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Approval inbox</h1>
      <ApprovalInboxTable
        claims={claims}
        emptyMessage="No claims pending your approval."
      />
    </div>
  );
}
