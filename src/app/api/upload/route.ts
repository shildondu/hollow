import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await saveFile(file);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);

    const message = error instanceof Error ? error.message : "Failed to upload file";
    const status = message.includes("not allowed") || message.includes("exceeds") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
