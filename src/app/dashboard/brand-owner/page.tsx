import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Users, ShieldCheck, List, Clock, Sparkles, Eye, ArrowRight } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function BrandOwnerDashboard() {
  const session = await getSession();
  if (!session || (session.role !== "BRAND_OWNER" && session.role !== "ADMIN")) redirect("/login");

  const [contracts, rules] = await Promise.all([
    prisma.brandContract.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.rule.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:w-3/5 space-y-4">
          <StatCard title="Brand contracts" value={contracts.length} icon={<ShieldCheck className="w-6 h-6" />} accent="indigo" />
          <StatCard title="Compiled rules" value={rules.length} icon={<List className="w-6 h-6" />} accent="slate" />
          <StatCard title="Rules awaiting approval" value={rules.filter((r) => !r.owner).length} icon={<Clock className="w-6 h-6" />} accent="amber" />
        </div>
        <div className="lg:w-2/5 space-y-4">
          {/* Ambiguity Miner Alert Card */}
          <div className="card p-5 space-y-2.5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border border-amber-500/25">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Ambiguity Miner Alert
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                Clarification Ready
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              High Reviewer Waiver Rate on FACT-NUM-04
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Reviewers repeatedly grant exemptions for historical figures. A sharper wording draft has been mined.
            </p>
            <Link
              href="/ambiguity"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
            >
              Inspect & Adopt Clarification <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <PolicyCard />
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Brand contracts</h2>
          <div className="flex items-center gap-3">
            <Link href="/visual" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-500">
              <Eye className="w-3.5 h-3.5" /> Visual Asset Inspector
            </Link>
            <Link href="/contracts/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              <Users className="w-4 h-4" /> New contract
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                <th className="pb-3 pr-2 pl-6">Name</th>
                <th className="pb-3">Brand</th>
                <th className="pb-3">Version</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6">
                    <Link href={`/contracts/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                  </td>
                  <td className="py-4 pr-2 text-muted-foreground">{c.brand}</td>
                  <td className="py-4 pr-2">{c.version}</td>
                  <td className="py-4 pr-2"><StatusBadge status={c.status} /></td>
                  <td className="py-4 pr-2 text-muted-foreground">{formatDate(c.updatedAt)}</td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No contracts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Latest rules</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                <th className="pb-3 pr-2 pl-6">Rule ID</th>
                <th className="pb-3">Family</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Mode</th>
                <th className="pb-3">Source page</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6 font-mono text-xs">{r.ruleId}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{r.family}</td>
                  <td className="py-4 pr-2"><SeverityBadge severity={r.severity} /></td>
                  <td className="py-4 pr-2 text-xs text-muted-foreground">{r.mode}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{r.sourcePage != null ? `p.${r.sourcePage}` : "—"}</td>
                </tr>
              ))}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    draft: { bg: "bg-slate-500/10", text: "text-slate-400" },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    archived: { bg: "bg-rose-500/10", text: "text-rose-400" },
  };
  const m = map[status.toLowerCase()] || map.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.bg} ${m.text}`}>
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    ADVISORY: "bg-slate-500/10 text-slate-400",
    MINOR: "bg-indigo-500/10 text-indigo-400",
    MAJOR: "bg-amber-500/10 text-amber-400",
    BLOCK: "bg-rose-500/10 text-rose-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[severity]}`}>
      {severity}
    </span>
  );
}

function PolicyCard() {
  return (
    <div className="card">
      <h3 className="text-sm font-bold mb-3">Brand owner policy</h3>
      <p className="text-xs text-muted-foreground mb-3">Compile guidelines into a versioned, human-signed Brand Contract before reviewers rely on it.</p>
      <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
        <li>Every rule needs a verbatim quote and page citation.</li>
        <li>Promote rules to "block" only with a named owner.</li>
        <li>Facts ledger entries carry validity windows.</li>
      </ul>
    </div>
  );
}
