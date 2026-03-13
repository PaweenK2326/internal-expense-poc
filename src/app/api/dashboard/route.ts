import { NextResponse } from "next/server";
import { getMockUser } from "@/lib/auth-mock";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getMockUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [approvedThisMonth, pendingClaims, allApproved] = await Promise.all([
      prisma.claimRequest.aggregate({
        where: {
          status: ClaimStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
          ...(user.role === "EMPLOYEE" ? { employeeId: user.id } : {}),
          ...(user.role === "MANAGER"
            ? { employee: { department: user.department } }
            : {}),
        },
        _sum: { amount: true },
      }),
      prisma.claimRequest.count({
        where: {
          status: { in: [ClaimStatus.PENDING_MANAGER, ClaimStatus.PENDING_C_LEVEL] },
          ...(user.role === "EMPLOYEE" ? { employeeId: user.id } : {}),
          ...(user.role === "MANAGER"
            ? { employee: { department: user.department } }
            : {}),
        },
      }),
      prisma.claimRequest.findMany({
        where: {
          status: ClaimStatus.APPROVED,
          updatedAt: { gte: startOfMonth },
          ...(user.role === "EMPLOYEE" ? { employeeId: user.id } : {}),
          ...(user.role === "MANAGER"
            ? { employee: { department: user.department } }
            : {}),
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

    return NextResponse.json({
      success: true,
      data: {
        totalApprovedThisMonth: approvedThisMonth._sum.amount ?? 0,
        totalPending: pendingClaims,
        byCategory,
        byProject,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
