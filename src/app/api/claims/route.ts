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

    if (user.role === "EMPLOYEE") {
      const claims = await prisma.claimRequest.findMany({
        where: { employeeId: user.id },
        include: { employee: true, manager: true, cLevel: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: claims });
    }

    if (user.role === "MANAGER") {
      const claims = await prisma.claimRequest.findMany({
        where: {
          status: ClaimStatus.PENDING_MANAGER,
          employee: { department: user.department },
        },
        include: { employee: true, manager: true, cLevel: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: claims });
    }

    if (user.role === "C_LEVEL") {
      const claims = await prisma.claimRequest.findMany({
        where: { status: ClaimStatus.PENDING_C_LEVEL },
        include: { employee: true, manager: true, cLevel: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: claims });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("GET /api/claims error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
