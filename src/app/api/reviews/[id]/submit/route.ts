import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Role, ReviewStatus } from "@/generated/enums";
import { z } from "zod";
import { runCascade } from "@/lib/reviewEngine";

const submitSchema = z.object({
  content: z.string().min(1),
  contractId: z.string(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { content, contractId } = submitSchema.parse(body);

    const review = await prisma.reviewRequest.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (review.submittedById !== user.id && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.reviewRequest.update({
      where: { id },
      data: { status: ReviewStatus.PENDING_APPROVAL, content },
    });

    const { findings, dropCount, totalRaw } = await runCascade({
      reviewId: id,
      text: content,
      contractId,
      channel: review.channel,
      market: review.market,
    });

    await prisma.decisionLog.create({
      data: {
        actorId: user.id,
        action: "review_submitted",
        entityType: "review",
        entityId: id,
        details: { contentLength: content.length, contractId, totalRaw, dropCount, findings: findings.length },
      },
    });

    return NextResponse.json({
      reviewId: id,
      status: ReviewStatus.PENDING_APPROVAL,
      findings,
      dropCount,
      totalRaw,
    });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}



