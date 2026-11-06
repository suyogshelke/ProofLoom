import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Role, FindingStatus, Severity } from "@/generated/enums";
import { z } from "zod";

const decideSchema = z.object({
  status: z.enum(["ACCEPTED", "EDITED", "WAIVED", "ESCALATED"]),
  waiverReason: z.string().optional(),
  actorId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, waiverReason, actorId } = decideSchema.parse(body);

    const finding = await prisma.finding.findUnique({ where: { id }, include: { review: true } });
    if (!finding) return NextResponse.json({ error: "Finding not found" }, { status: 404 });

    const actor = actorId || user.id;
    const allowedRoles: Role[] = [Role.REVIEWER, Role.BRAND_OWNER, Role.ADMIN];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: only reviewers/brand owners can decide" }, { status: 403 });
    }

    const updated = await prisma.finding.update({
      where: { id },
      data: {
        status: status as FindingStatus,
        waiverReason: waiverReason ?? null,
        decidedById: actor,
        decidedAt: new Date(),
      },
    });

    await prisma.decisionLog.create({
      data: {
        actorId: actor,
        action: `finding_${status.toLowerCase()}`,
        entityType: "finding",
        entityId: id,
        reviewId: finding.reviewId,
        findingId: id,
        details: { waiverReason, previousStatus: finding.status },
      },
    });

    return NextResponse.json({ finding: updated });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to decide finding" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const finding = await prisma.finding.findUnique({
      where: { id },
      include: { rule: true, review: true, decidedBy: { select: { id: true, name: true, email: true } } },
    });
    if (!finding) return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    return NextResponse.json({ finding });
  } catch {
    return NextResponse.json({ error: "Failed to load finding" }, { status: 500 });
  }
}
