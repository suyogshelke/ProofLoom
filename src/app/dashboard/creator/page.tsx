import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatDate, formatRelative } from "@/lib/utils";
import Link from "next/link";
import { Plus, Clock, FileText, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function CreatorDashboard() {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") redirect("/login");

  const [reviews, sigs] = await Promise.all([
    prisma.reviewRequest.findMany({
      where: { submittedById: session.id },
      orderBy: { submittedAt: "desc" },
      take: 8,
      include: { _count: { select: { findings: true } } },
    }),
    prisma.signature.findFirst({ where: { userId: session.id } }),
  ]);

  const total = reviews.length;
  const drafts = reviews.filter((r) => r.status === "DRAFT").length;
  const pending = reviews.filter((r) => r.status === "PENDING_APPROVAL").length;
  const approved = reviews.filter((r) => r.status === "APPROVED").length;
  const rejected = reviews.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:w-3/5 space-y-4">
          <StatCard
            title="Total reviews"
            value={total}
            icon={<FileText className="w-6 h-6" />}
            accent="indigo"
          />
          <StatCard
            title="Drafts"
            value={drafts}
            icon={<Clock className="w-6 h-6" />}
            accent="slate"
          />
          <StatCard
            title="Pending approval"
            value={pending}
            icon={<AlertCircle className="w-6 h-6" />}
            accent="amber"
          />
          <StatCard
            title="Approved"
            value={approved}
            icon={<CheckCircle className="w-6 h-6" />}
            accent="emerald"
          />
          <StatCard
            title="Rejected"
            value={rejected}
            icon={<AlertCircle className="w-6 h-6" />}
            accent="rose"
          />
        </div>
        <div className="lg:w-2/5 space-y-4">
          <QuickActionCard session={session} />
          <SignatureCard hasSignature={!!sigs} />
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Recent reviews</h2>
            <p className="text-sm text-muted-foreground">Your submissions and their review state.</p>
          </div>
          <Link
            href="/reviews/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-4 h-4" /> Create review
          </Link>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                <th className="pb-3 pr-2 pl-6">Title</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Findings</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6">
                    <Link href={`/reviews/${r.id}`} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-4 pr-2 text-muted-foreground">{r.channel ?? "—"}</td>
                  <td className="py-4 pr-2"><StatusBadge status={r.status} /></td>
                  <td className="py-4 pr-2">{r._count.findings}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{formatRelative(r.submittedAt)}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No reviews yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, accent }: { title: string; value: number; icon: React.ReactNode; accent: string }) {
  const accentMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <div className={`glass p-5 rounded-xl border border-white/20 flex items-center gap-4 ${accentMap[accent]}`}>
      <div className="p-3 rounded-lg bg-white/10">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: "bg-slate-500/10", text: "text-slate-400" },
    SUBMITTED: { bg: "bg-indigo-500/10", text: "text-indigo-400" },
    PENDING_APPROVAL: { bg: "bg-amber-500/10", text: "text-amber-400" },
    APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    REJECTED: { bg: "bg-rose-500/10", text: "text-rose-400" },
  };
  const m = map[status] || map.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.bg} ${m.text}`}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

function QuickActionCard({ session }: { session: any }) {
  return (
    <div className="card">
      <h3 className="text-sm font-bold mb-3">Quick actions</h3>
      <div className="space-y-2">
        <Link
          href="/reviews/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-white/10 transition block"
        >
          <FileText className="w-4 h-4 text-muted-foreground" /> Draft a new review
        </Link>
        <Link
          href="/reviews"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-white/10 transition block"
        >
          <Clock className="w-4 h-4 text-muted-foreground" /> View all my reviews
        </Link>
        {!session.brand && (
          <Link
            href="/contracts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-white/10 transition block"
          >
            <DollarSign className="w-4 h-4 text-muted-foreground" /> Browse Brand Contracts
          </Link>
        )}
      </div>
    </div>
  );
}

function SignatureCard({ hasSignature }: { hasSignature: boolean }) {
  return (
    <div className="card">
      <h3 className="text-sm font-bold mb-3">Employee signature</h3>
      <p className="text-xs text-muted-foreground mb-3">A signature is required before a review can be submitted.</p>
      <div className="p-4 rounded-xl border border-dashed border-white/20 text-center text-sm">
        {hasSignature ? (
          <>
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Signature on file</p>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No signature uploaded</p>
          </>
        )}
      </div>
    </div>
  );
}
