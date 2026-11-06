import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "@/generated/enums";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "proofloom_session";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  brand?: string | null;
};

export function signSession(user: SessionUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, brand: user.brand },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: Role;
      brand?: string;
    };
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      brand: payload.brand ?? null,
      name: undefined,
    };
  } catch {
    return null;
  }
}

export function requireRole(allowed: Role[]) {
  return (user: SessionUser | null): SessionUser => {
    if (!user) throw new Error("Unauthenticated");
    if (!allowed.includes(user.role)) throw new Error("Forbidden");
    return user;
  };
}
