import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

/**
 * Upload receipt to Vercel Blob.
 * Requires BLOB_READ_WRITE_TOKEN in env (set when you add a Blob store in Vercel).
 * POST with multipart/form-data, field name: "receipt"
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured", code: "NO_TOKEN" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("receipt");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid file (field: receipt)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 4MB" },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Allowed: images (JPEG, PNG, WebP, GIF) or PDF" },
        { status: 400 }
      );
    }

    const pathname = `receipts/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("upload-receipt error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
