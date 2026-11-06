import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { z } from "zod";

const factSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  owner: z.string().optional(),
  source: z.string().optional(),
  verifiedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  successorId: z.string().optional().nullable(),
  brand: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const facts = await prisma.factLedger.findMany({
      where: user.role === Role.BRAND_OWNER || user.role === Role.ADMIN ? { brand: user.brand } : {},
      orderBy: { key: "asc" },
    });
    return NextResponse.json({ facts });
  } catch {
    return NextResponse.json({ error: "Failed to load facts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    requireRole([Role.BRAND_OWNER, Role.ADMIN])(user);

    const body = await req.json();
    const data = factSchema.parse(body);

    const fact = await prisma.factLedger.create({
      data: {
        key: data.key,
        value: data.value,
        owner: data.owner ?? user.email,
        source: data.source,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        successorId: data.successorId ?? null,
        brand: data.brand ?? user.brand,
      },
    });

    return NextResponse.json({ fact }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create fact" }, { status: 500 });
  }
}



