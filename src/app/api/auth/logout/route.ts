import { NextResponse } from "next/server";
import { clearMockUser } from "@/lib/auth-mock";

export async function POST(request: Request) {
  try {
    await clearMockUser();
    const url = new URL(request.url);
    const base = url.origin;
    return NextResponse.redirect(new URL("/login", base));
  } catch {
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
