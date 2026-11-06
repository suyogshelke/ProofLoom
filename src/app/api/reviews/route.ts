import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { z } from "zod";
import { runCascade } from "@/lib/reviewEngine";

const reviewSchema = z.object({
  title: z.string().min(1),
  channel: z.string().optional(),
  market: z.string().optional(),
  campaign: z.string().optional(),
  content: z.string().min(1),
  contractId: z.string(),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const where =
      user.role === Role.CREATOR
        ? { submittedById: user.id }
        : user.role === Role.REVIEWER
        ? {}
        : {};

    const reviews = await prisma.reviewRequest.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { findings: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { title, channel, market, campaign, content, contractId } = reviewSchema.parse(body);

    const review = await prisma.reviewRequest.create({
      data: {
        title,
        channel,
        market,
        campaign,
        status: "DRAFT",
        content,
        submittedById: user.id,
      },
    });

    // Store content as a finding-less document; we attach it via a system finding or a separate store.
    // For MVP, persist content in an audit detail by creating the review then running cascade on submit.
    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}




