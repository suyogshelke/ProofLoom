import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mineGuidelineAmbiguity } from "@/lib/ambiguityMiner";
import { Role } from "@/generated/enums";
import { z } from "zod";

const adoptSchema = z.object({
  ruleId: z.string().min(1),
  newStatement: z.string().min(5),
  reason: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const reports = await mineGuidelineAmbiguity();
    return NextResponse.json({ reports });
  } catch (err: any) {
    console.error("Ambiguity GET error:", err);
    return NextResponse.json({ error: "Failed to mine ambiguity" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const allowed: Role[] = [Role.BRAND_OWNER, Role.ADMIN];
    if (!allowed.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: Only Brand Owners can adopt rule clarifications" }, { status: 403 });
    }

    const body = await req.json();
    const { ruleId, newStatement, reason } = adoptSchema.parse(body);

    const rule = await prisma.rule.findFirst({ where: { ruleId } });
    if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

    // Update rule with incremented version and sharper statement
    const updated = await prisma.rule.update({
      where: { id: rule.id },
      data: {
        statement: newStatement,
        version: rule.version + 1,
        approvedAt: new Date(),
        owner: user.email,
      },
    });

    // Record decision log
    await prisma.decisionLog.create({
      data: {
        actorId: user.id,
        action: "rule_clarification_adopted",
        entityType: "rule",
        entityId: rule.id,
        ruleVersion: String(updated.version),
        details: {
          ruleId,
          previousStatement: rule.statement,
          newStatement,
          reason: reason || "Adopted via Ambiguity Miner to eliminate recurring review overrides.",
        },
      },
    });

    return NextResponse.json({ rule: updated, success: true });
  } catch (err: any) {
    console.error("Ambiguity POST error:", err);
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to adopt clarification", details: err?.message }, { status: 500 });
  }
}

