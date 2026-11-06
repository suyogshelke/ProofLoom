import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Plus, FileText, ShieldCheck } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rules = await prisma.rule.findMany({ include: { contract: true }, orderBy: { createdAt: "desc" } });
  const canManage = session.role === "BRAND_OWNER" || session.role === "ADMIN";

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Compiled rules</h1>
          <p className="text-sm text-muted-foreground">Typed, versioned, cited rules the review engine enforces.</p>
        </div>
        {canManage && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition">
            <Plus className="w-4 h-4" /> Add rule
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
              <th className="pb-3 pr-2 pl-6">Rule ID</th>
              <th className="pb-3">Statement</th>
              <th className="pb-3">Family</th>
              <th className="pb-3">Severity</th>
              <th className="pb-3">Mode</th>
              <th className="pb-3">Source</th>
              <th className="pb-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                <td className="py-4 pr-2 pl-6 font-mono text-xs">{r.ruleId}</td>
                <td className="py-4 pr-2">{r.statement}</td>
                <td className="py-4 pr-2 text-muted-foreground">{r.family}</td>
                <td className="py-4 pr-2"><SeverityBadge severity={r.severity} /></td>
                <td className="py-4 pr-2 text-xs text-muted-foreground">{r.mode}</td>
                <td className="py-4 pr-2 text-muted-foreground text-xs">{r.sourceDoc ?? "—"} {r.sourcePage != null ? `p.${r.sourcePage}` : ""}</td>
                <td className="py-4 pr-2 text-right"><ShieldCheck className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No rules yet. Compile a Brand Contract first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[severity]}`}>{severity}</span>
  );
}



