import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";
import { FileText, Clock, Search, Plus } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const reviews = await prisma.reviewRequest.findMany({
    include: { submittedBy: { select: { name: true, email: true } }, _count: { select: { findings: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Pre-publication review against the Brand Contract.</p>
        </div>
        <Link
          href="/reviews/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" /> New review
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews by title or author…"
              className="w-full pl-10 pr-4 py-2.5 text-sm glass rounded-xl border border-white/30 focus:ring-2 ring-indigo-500/50 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
              <th className="pb-3 pr-2 pl-6">Title</th>
              <th className="pb-3">Author</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Findings</th>
              <th className="pb-3">Updated</th>
              <th className="pb-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                <td className="py-4 pr-2 pl-6">
                  <Link href={`/reviews/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                </td>
                <td className="py-4 pr-2 text-sm">{r.submittedBy?.name ?? r.submittedBy?.email}</td>
                <td className="py-4 pr-2"><StatusBadge status={r.status} /></td>
                <td className="py-4 pr-2">{r._count.findings}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{formatRelative(r.submittedAt)}</td>
                <td className="py-4 pr-2 text-right">
                  <Link href={`/reviews/${r.id}`} className="text-sm text-muted-foreground hover:text-indigo-400">Open</Link>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No reviews yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-500/10 text-slate-400",
    SUBMITTED: "bg-indigo-500/10 text-indigo-400",
    PENDING_APPROVAL: "bg-amber-500/10 text-amber-400",
    APPROVED: "bg-emerald-500/10 text-emerald-400",
    REJECTED: "bg-rose-500/10 text-rose-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || map.DRAFT}`}>
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
