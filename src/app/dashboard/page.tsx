import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const roleToPath: Record<string, string> = {
  CREATOR: "/dashboard/creator",
  REVIEWER: "/dashboard/reviewer",
  BRAND_OWNER: "/dashboard/brand-owner",
  ADMIN: "/dashboard/creator",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const target = roleToPath[session.role] || "/dashboard/creator";
  redirect(target);
}
