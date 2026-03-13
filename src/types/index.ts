import type { ClaimRequest, User } from "@prisma/client";

export type ClaimWithRelations = ClaimRequest & {
  employee: User;
  manager?: User | null;
  cLevel?: User | null;
};

export type DashboardSummary = {
  totalApprovedThisMonth: number;
  totalPending: number;
  byCategory: { category: string; total: number }[];
  byProject: { project: string; total: number }[];
};
