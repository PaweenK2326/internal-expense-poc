import type { ClaimRequest, User } from "@prisma/client";

export type ClaimWithRelations = ClaimRequest & {
  employee: User;
  manager?: User | null;
  cLevel?: User | null;
};

export type ClaimCountByStatus = {
  PENDING_MANAGER: number;
  PENDING_C_LEVEL: number;
  APPROVED: number;
  REJECTED: number;
};

export type DashboardSummary = {
  totalApprovedThisMonth: number;
  totalPending: number;
  countByStatus: ClaimCountByStatus;
  byCategory: { category: string; total: number }[];
  byProject: { project: string; total: number }[];
};
