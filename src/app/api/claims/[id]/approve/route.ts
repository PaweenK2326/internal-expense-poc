import { NextRequest, NextResponse } from "next/server";
import { approveClaimAction } from "@/app/actions/claim-actions";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const result = await approveClaimAction({ id, action: body.action });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/claims/[id]/approve error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
