import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { z } from "zod";

const contractSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  version: z.number().int().positive().default(1),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const contracts = await prisma.brandContract.findMany({
      where: user.role === Role.BRAND_OWNER || user.role === Role.ADMIN ? { ownerId: user.id } : {},
      include: { _count: { select: { rules: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ contracts });
  } catch {
    return NextResponse.json({ error: "Failed to load contracts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    requireRole([Role.BRAND_OWNER, Role.ADMIN])(user);

    const body = await req.json();
    const { name, brand, version } = contractSchema.parse(body);

    const contract = await prisma.brandContract.create({
      data: { name, brand, version, ownerId: user.id, status: "draft" },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
  }
}




