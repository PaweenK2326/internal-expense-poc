import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const BLOB_DOMAIN = "blob.vercel-storage.com";

/**
 * Proxy Vercel Blob receipts so the browser can view them (for private blobs).
 * GET /api/receipt?url=<encoded-blob-url>
 * Public blob URLs can be used directly; this route is for private or when direct load fails.
 */
export async function GET(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 503 }
    );
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!decoded.includes(BLOB_DOMAIN)) {
    return NextResponse.json(
      { error: "Invalid receipt URL" },
      { status: 400 }
    );
  }

  const isPublicUrl = decoded.includes("public.blob.vercel-storage.com");

  try {
    const result = await get(decoded, {
      access: isPublicUrl ? "public" : "private",
    });

    if (!result) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const stream = (result as { stream?: ReadableStream }).stream;
    const contentType =
      (result as { blob?: { contentType?: string } }).blob?.contentType ??
      "application/octet-stream";

    if (!stream) {
      return NextResponse.json(
        { error: "Receipt unavailable" },
        { status: 500 }
      );
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("receipt proxy error:", error);
    return NextResponse.json(
      { error: "Failed to load receipt" },
      { status: 500 }
    );
  }
}
