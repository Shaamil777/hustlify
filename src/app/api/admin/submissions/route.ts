import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SubmissionRecord } from "@/types/assessment";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key") || request.nextUrl.searchParams.get("key");
    const configuredKey = process.env.ADMIN_PASSWORD || "admin123";

    if (!adminKey || adminKey !== configuredKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataFilePath = path.join(process.cwd(), "data", "submissions.json");
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ submissions: [] });
    }

    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    const submissions: SubmissionRecord[] = JSON.parse(fileContent);

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load submissions" },
      { status: 500 }
    );
  }
}
