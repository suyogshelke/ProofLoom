import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Role } from "@/generated/enums";

export async function GET(req: NextRequest, { params }: { params: Promise<{ role: string }> }) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { role } = await params;

    const total = await prisma.reviewRequest.count();
    const pending = await prisma.reviewRequest.count({ where: { status: "PENDING_APPROVAL" } });
    const approved = await prisma.reviewRequest.count({ where: { status: "APPROVED" } });
    const rejected = await prisma.reviewRequest.count({ where: { status: "REJECTED" } });
    const drafts = await prisma.reviewRequest.count({ where: { status: "DRAFT" } });

    let myVouchers = [];
    if (role === "creator") {
      myVouchers = await prisma.reviewRequest.findMany({
        where: { submittedById: user.id },
        orderBy: { submittedAt: "desc" },
        take: 10,
        include: { _count: { select: { findings: true } } },
      });
    } else if (role === "reviewer") {
      myVouchers = await prisma.reviewRequest.findMany({
        where: { status: "PENDING_APPROVAL" },
        orderBy: { submittedAt: "asc" },
        take: 10,
        include: { submittedBy: { select: { name: true, email: true } } },
      });
    } else {
      myVouchers = await prisma.reviewRequest.findMany({
        orderBy: { submittedAt: "desc" },
        take: 10,
        include: { submittedBy: { select: { name: true, email: true } } },
      });
    }

    return NextResponse.json({
      role,
      stats: { total, pending, approved, rejected, drafts },
      recent: myVouchers,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}




