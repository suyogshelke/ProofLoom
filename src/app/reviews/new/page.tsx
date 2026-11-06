import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewReviewForm from "./_form";
export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
  const session = getSession();
  if (!session) redirect("/login");

  const contracts = await prisma.brandContract.findMany({
    select: { id: true, name: true, brand: true, version: true },
    orderBy: { updatedAt: "desc" },
  });

  return <NewReviewForm contracts={contracts} />;
}
