"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/auth-mock";
import { claimFormSchema, approvePayloadSchema } from "@/lib/validations/claim-schema";
import { ClaimStatus } from "@prisma/client";

export type CreateClaimResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createClaimAction(
  formData: unknown,
  receiptUrl?: string | null
): Promise<CreateClaimResult> {
  try {
    const user = await getMockUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = claimFormSchema.safeParse(formData);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat().join(" ") || "Validation failed";
      return { success: false, error: msg };
    }

    const claim = await prisma.claimRequest.create({
      data: {
        employeeId: user.id,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        project: parsed.data.project,
        category: parsed.data.category,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
        receiptUrl: receiptUrl ?? null,
        status: ClaimStatus.PENDING_MANAGER,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/claims");
    return { success: true, id: claim.id };
  } catch (error) {
    console.error("createClaimAction error:", error);
    return { success: false, error: "Failed to create claim." };
  }
}

export type ApproveClaimResult =
  | { success: true }
  | { success: false; error: string };

export async function approveClaimAction(
  payload: unknown
): Promise<ApproveClaimResult> {
  try {
    const user = await getMockUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = approvePayloadSchema.safeParse(payload);
    if (!parsed.success)
      return { success: false, error: "Invalid request" };

    const claim = await prisma.claimRequest.findUnique({
      where: { id: parsed.data.id },
    });
    if (!claim) return { success: false, error: "Claim not found" };

    if (parsed.data.action === "reject") {
      await prisma.claimRequest.update({
        where: { id: parsed.data.id },
        data: { status: ClaimStatus.REJECTED },
      });
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/approvals");
      return { success: true };
    }

    if (claim.status === ClaimStatus.PENDING_MANAGER && user.role === "MANAGER") {
      const managerId = user.id;
      await prisma.claimRequest.update({
        where: { id: parsed.data.id },
        data: {
          status: ClaimStatus.PENDING_C_LEVEL,
          managerId,
        },
      });
    } else if (
      claim.status === ClaimStatus.PENDING_C_LEVEL &&
      user.role === "C_LEVEL"
    ) {
      await prisma.claimRequest.update({
        where: { id: parsed.data.id },
        data: {
          status: ClaimStatus.APPROVED,
          cLevelId: user.id,
        },
      });
    } else {
      return { success: false, error: "You cannot approve this claim." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/approvals");
    return { success: true };
  } catch (error) {
    console.error("approveClaimAction error:", error);
    return { success: false, error: "Failed to update claim." };
  }
}
