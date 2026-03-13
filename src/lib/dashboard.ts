import { getMockUser } from "@/lib/auth-mock";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";
import type { DashboardSummary } from "@/types";

export async function getDashboardSummary(
  year?: number,
  monthIndex0Based?: number
): Promise<DashboardSummary | null> {
  const user = await getMockUser();
  if (!user) return null;

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonthIndex = monthIndex0Based ?? now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonthIndex, 1);
  const startOfNextMonth = new Date(targetYear, targetMonthIndex + 1, 1);

  const monthDateFilter = {
    recordDate: {
      gte: startOfMonth,
      lt: startOfNextMonth,
    },
  };

  const baseWhere = {
    ...(user.role === "EMPLOYEE" ? { employeeId: user.id } : {}),
    ...(user.role === "MANAGER"
      ? { employee: { department: user.department } }
      : {}),
  };

  const [approvedThisMonth, pendingClaims, allApproved, countByStatus] = await Promise.all([
    prisma.claimRequest.aggregate({
      where: {
        ...baseWhere,
        status: ClaimStatus.APPROVED,
        ...monthDateFilter,
      },
      _sum: { amount: true },
    }),
    prisma.claimRequest.count({
      where: {
        ...baseWhere,
        ...monthDateFilter,
        status: {
          in: [ClaimStatus.PENDING_MANAGER, ClaimStatus.PENDING_C_LEVEL],
        },
      },
    }),
    prisma.claimRequest.findMany({
      where: {
        ...baseWhere,
        status: ClaimStatus.APPROVED,
        ...monthDateFilter,
      },
      select: { category: true, project: true, amount: true },
    }),
    prisma.claimRequest.groupBy({
      by: ["status"],
      where: {
        ...baseWhere,
        ...monthDateFilter,
      },
      _count: { id: true },
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

  const countByStatusMap = countByStatus.reduce(
    (acc, row) => {
      acc[row.status] = row._count.id;
      return acc;
    },
    {} as Record<ClaimStatus, number>
  );

  return {
    totalApprovedThisMonth: approvedThisMonth._sum.amount ?? 0,
    totalPending: pendingClaims,
    countByStatus: {
      PENDING_MANAGER: countByStatusMap[ClaimStatus.PENDING_MANAGER] ?? 0,
      PENDING_C_LEVEL: countByStatusMap[ClaimStatus.PENDING_C_LEVEL] ?? 0,
      APPROVED: countByStatusMap[ClaimStatus.APPROVED] ?? 0,
      REJECTED: countByStatusMap[ClaimStatus.REJECTED] ?? 0,
    },
    byCategory,
    byProject,
  };
}
