import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
export const dynamic = "force-dynamic";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await Promise.resolve(params);

  const contract = await prisma.brandContract.findUnique({
    where: { id },
    include: { rules: { orderBy: { ruleId: "asc" } }, owner: { select: { name: true, email: true } } },
  });
  if (!contract) redirect("/contracts");

  const canManage = session.role === "BRAND_OWNER" || session.role === "ADMIN";

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{contract.name}</h1>
          <p className="text-sm text-muted-foreground">
            {contract.brand} · v{contract.version} · {contract.status} · owned by {contract.owner?.name ?? contract.owner?.email}
          </p>
        </div>
        {canManage && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-md">
            <span className="text-sm font-semibold">Approve contract</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
                <th className="pb-3 pr-2 pl-6">Rule ID</th>
                <th className="pb-3">Statement</th>
                <th className="pb-3">Family</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Mode</th>
                <th className="pb-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody>
              {contract.rules.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6 font-mono text-xs text-indigo-400 font-semibold">{r.ruleId}</td>
                  <td className="py-4 pr-2">{r.statement}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{r.family}</td>
                  <td className="py-4 pr-2"><SeverityBadge severity={r.severity} /></td>
                  <td className="py-4 pr-2 text-xs text-muted-foreground">{r.mode}</td>
                  <td className="py-4 pr-2 text-right text-muted-foreground text-xs">
                    {r.sourceDoc ?? "—"} {r.sourcePage != null ? `p.${r.sourcePage}` : ""}
                  </td>
                </tr>
              ))}
              {contract.rules.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No rules compiled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3">Contract status</h3>
            <p className="text-xs text-muted-foreground mb-3">A compiled contract must be human-signed before it governs reviews.</p>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              contract.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
            }`}>
              <span className="text-xs font-semibold capitalize">{contract.status}</span>
            </div>
          </div>
        </div>
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[severity] ?? "bg-slate-500/10 text-slate-400"}`}>
      {severity}
    </span>
  );
}
