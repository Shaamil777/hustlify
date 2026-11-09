import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const field = (formData.get("field") as string) || "audio";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const timestamp = Date.now();
    const filename = `voice-notes/${field}_${timestamp}.webm`;

    // 1. If Vercel Blob token is configured, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });

      return NextResponse.json({
        url: blob.url,
        size: file.size,
        contentType: file.type,
      });
    }

    // 2. Local development fallback: save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilename = `${field}_${timestamp}.webm`;
    const localFilePath = path.join(uploadsDir, localFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(localFilePath, buffer);

    // Return relative public path in local dev
    const localUrl = `/uploads/${localFilename}`;

    return NextResponse.json({
      url: localUrl,
      size: file.size,
      contentType: file.type,
      note: "Saved to local storage (set BLOB_READ_WRITE_TOKEN for Vercel Blob)",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload audio" },
      { status: 500 }
    );
  }
}
