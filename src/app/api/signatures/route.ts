import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { z } from "zod";

const sigSchema = z.object({
  userId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { userId, fileUrl, fileName, mimeType } = sigSchema.parse(body);

    // Only allow users to upload their own signature unless admin
    if (userId !== user.id && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sig = await prisma.signature.create({ data: { userId, fileUrl, fileName, mimeType } });
    return NextResponse.json({ signature: sig }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to upload signature" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const sigs = await prisma.signature.findMany({
      where: userId ? { userId } : {},
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json({ signatures: sigs });
  } catch {
    return NextResponse.json({ error: "Failed to load signatures" }, { status: 500 });
  }
}

