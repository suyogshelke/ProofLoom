import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, List } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ReviewerDashboard() {
  const session = await getSession();
  if (!session || session.role !== "REVIEWER") redirect("/login");

  const pending = await prisma.reviewRequest.findMany({
    where: { status: "PENDING_APPROVAL" },
    orderBy: { submittedAt: "asc" },
    take: 10,
    include: { submittedBy: { select: { name: true, email: true } }, _count: { select: { findings: true } } },
  });

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:w-3/5 space-y-4">
          <StatCard title="Pending approvals" value={pending.length} icon={<List className="w-6 h-6" />} accent="amber" />
          <StatCard title="Needs your decision" value={pending.length} icon={<Clock className="w-6 h-6" />} accent="indigo" />
          <StatCard title="Open findings (all)" value={pending.reduce((a, r) => a + r._count.findings, 0)} icon={<FileText className="w-6 h-6" />} accent="slate" />
        </div>
        <div className="lg:w-2/5 space-y-4">
          <GuideCard />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4">Pending reviews</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                <th className="pb-3 pr-2 pl-6">Title</th>
                <th className="pb-3">Submitted by</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Findings</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6">
                    <Link href={`/reviews/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                  </td>
                  <td className="py-4 pr-2 text-sm">{r.submittedBy?.name ?? r.submittedBy?.email}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{r.channel ?? "—"}</td>
                  <td className="py-4 pr-2">{r._count.findings}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{formatRelative(r.submittedAt)}</td>
                  <td className="py-4 pr-2">
                    <Link href={`/reviews/${r.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No pending reviews.</td></tr>
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

function GuideCard() {
  return (
    <div className="card">
      <h3 className="text-sm font-bold mb-3">Reviewer guidance</h3>
      <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
        <li>Every finding carries a rule ID, source page and span.</li>
        <li>Fixes are proposals — authors accept or refuse.</li>
        <li>Waivers need a reason and expire in 14 days.</li>
        <li>Never block on tone; tone is advisory only.</li>
      </ul>
    </div>
  );
}
