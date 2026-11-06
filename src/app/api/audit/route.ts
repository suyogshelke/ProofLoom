import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const logs = await prisma.decisionLog.findMany({
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 200,
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}




