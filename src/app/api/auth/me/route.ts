import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clearSessionCookie } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      await clearSessionCookie();
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const full = await prisma.user.findUnique({ where: { id: user.id } });
    if (!full) {
      await clearSessionCookie();
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: full.id,
        email: full.email,
        name: full.name,
        role: full.role,
        brand: full.brand,
      },
    });
  } catch {
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
}

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
