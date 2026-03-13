import { getMockUser } from "@/lib/auth-mock";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";
import type { DashboardSummary } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const user = await getMockUser();
  if (!user) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseWhere = {
    ...(user.role === "EMPLOYEE" ? { employeeId: user.id } : {}),
    ...(user.role === "MANAGER"
      ? { employee: { department: user.department } }
      : {}),
  };

  const [approvedThisMonth, pendingClaims, allApproved] = await Promise.all([
    prisma.claimRequest.aggregate({
      where: {
        ...baseWhere,
        status: ClaimStatus.APPROVED,
        updatedAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.claimRequest.count({
      where: {
        ...baseWhere,
        status: {
          in: [ClaimStatus.PENDING_MANAGER, ClaimStatus.PENDING_C_LEVEL],
        },
      },
    }),
    prisma.claimRequest.findMany({
      where: {
        ...baseWhere,
        status: ClaimStatus.APPROVED,
        updatedAt: { gte: startOfMonth },
      },
      select: { category: true, project: true, amount: true },
    }),
  ]);

  const byCategory = Object.entries(
    allApproved.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + c.amount;
      return acc;
    }, {})
  ).map(([category, total]) => ({ category, total }));

  const byProject = Object.entries(
    allApproved.reduce<Record<string, number>>((acc, c) => {
      acc[c.project] = (acc[c.project] ?? 0) + c.amount;
      return acc;
    }, {})
  ).map(([project, total]) => ({ project, total }));

  return {
    totalApprovedThisMonth: approvedThisMonth._sum.amount ?? 0,
    totalPending: pendingClaims,
    byCategory,
    byProject,
  };
}
