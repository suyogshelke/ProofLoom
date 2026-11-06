import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { z } from "zod";

const ruleSchema = z.object({
  contractId: z.string(),
  ruleId: z.string().min(1),
  family: z.string().min(1),
  statement: z.string().min(1),
  scope: z.any().optional(),
  severity: z.enum(["ADVISORY", "MINOR", "MAJOR", "BLOCK"]).default("MAJOR"),
  mode: z.string().default("grounded"),
  isBlocking: z.boolean().default(false),
  sourceDoc: z.string().optional(),
  sourcePage: z.number().int().optional(),
  sourceQuote: z.string().optional(),
  owner: z.string().optional(),
  version: z.number().int().positive().default(1),
  exceptions: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    const rules = await prisma.rule.findMany({
      where: contractId ? { contractId } : {},
      include: { contract: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ error: "Failed to load rules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    requireRole([Role.BRAND_OWNER, Role.ADMIN])(user);

    const body = await req.json();
    const data = ruleSchema.parse(body);

    const rule = await prisma.rule.create({
      data: {
        contractId: data.contractId,
        ruleId: data.ruleId,
        family: data.family,
        statement: data.statement,
        scope: data.scope ?? {},
        severity: data.severity,
        mode: data.mode,
        isBlocking: data.isBlocking,
        sourceDoc: data.sourceDoc,
        sourcePage: data.sourcePage,
        sourceQuote: data.sourceQuote,
        owner: data.owner ?? user.email,
        version: data.version,
        exceptions: data.exceptions ?? [],
      },
      include: { contract: true },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    if (err.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}

