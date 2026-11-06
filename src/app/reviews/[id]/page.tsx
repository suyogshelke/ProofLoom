import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { FindingCard } from "@/components/finding-card";
import { formatRelative } from "@/lib/utils";
export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await Promise.resolve(params);

  const review = await prisma.reviewRequest.findUnique({
    where: { id },
    include: {
      findings: { include: { rule: true, decidedBy: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } },
      submittedBy: { select: { name: true, email: true } },
    },
  });
  if (!review) redirect("/reviews");

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{review.title}</h1>
            <p className="text-sm text-muted-foreground">
              {review.channel} · {review.market} · {review.campaign} · submitted {formatRelative(review.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              review.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
              review.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" :
              review.status === "PENDING_APPROVAL" ? "bg-amber-500/10 text-amber-400" :
              "bg-slate-500/10 text-slate-400"
            }`}>
              {review.status.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="card">
              <h3 className="text-sm font-bold mb-3">Source content</h3>
              <div className="glass p-4 rounded-xl border border-white/20 font-mono text-xs whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">
                {review.content ?? "(no content)"}
              </div>
            </div>
            <div className="card mt-4 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Meta</h3>
              <p className="text-sm text-muted-foreground">Author: {review.submittedBy?.name ?? review.submittedBy?.email}</p>
              <p className="text-sm text-muted-foreground">Status: {review.status}</p>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            {review.findings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-muted-foreground">No findings. The content passed all compiled rules.</p>
              </div>
            ) : (
              review.findings.map((f) => <FindingCard key={f.id} finding={f} onUpdate={() => {}} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
