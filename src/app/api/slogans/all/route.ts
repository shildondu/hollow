import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const slogans = await prisma.slogan.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(slogans);
}
