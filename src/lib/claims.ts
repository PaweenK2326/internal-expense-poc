import { getMockUser } from "@/lib/auth-mock";
import { prisma } from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";
import type { ClaimWithRelations } from "@/types";

export async function getClaimsForCurrentUser(): Promise<ClaimWithRelations[]> {
  const user = await getMockUser();
  if (!user) return [];

  if (user.role === "EMPLOYEE") {
    return prisma.claimRequest.findMany({
      where: { employeeId: user.id },
      include: { employee: true, manager: true, cLevel: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "MANAGER") {
    return prisma.claimRequest.findMany({
      where: {
        status: ClaimStatus.PENDING_MANAGER,
        employee: { department: user.department },
      },
      include: { employee: true, manager: true, cLevel: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "C_LEVEL") {
    return prisma.claimRequest.findMany({
      where: { status: ClaimStatus.PENDING_C_LEVEL },
      include: { employee: true, manager: true, cLevel: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}

export async function getApprovalInboxClaims(): Promise<ClaimWithRelations[]> {
  return getClaimsForCurrentUser();
}
