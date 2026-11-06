import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShieldCheck, FileText, Plus } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const contracts = await prisma.brandContract.findMany({
    include: { _count: { select: { rules: true } }, owner: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const canManage = session.role === "BRAND_OWNER" || session.role === "ADMIN";

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brand contracts</h1>
          <p className="text-sm text-muted-foreground">Compiled, versioned, human-signed representations of brand truth.</p>
        </div>
        {canManage && (
          <Link href="/contracts/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4" /> New contract
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
              <th className="pb-3 pr-2 pl-6">Name</th>
              <th className="pb-3">Brand</th>
              <th className="pb-3">Version</th>
              <th className="pb-3">Rules</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Owner</th>
              <th className="pb-3">Updated</th>
              <th className="pb-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                <td className="py-4 pr-2 pl-6">
                  <Link href={`/contracts/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                </td>
                <td className="py-4 pr-2 text-muted-foreground">{c.brand}</td>
                <td className="py-4 pr-2 font-mono text-xs">{c.version}</td>
                <td className="py-4 pr-2">{c._count.rules}</td>
                <td className="py-4 pr-2"><ContractStatus status={c.status} /></td>
                <td className="py-4 pr-2 text-muted-foreground text-sm">{c.owner?.name ?? c.owner?.email}</td>
                <td className="py-4 pr-2 text-muted-foreground">{formatDate(c.updatedAt)}</td>
                <td className="py-4 pr-2 text-right">
                  <Link href={`/contracts/${c.id}`} className="text-sm text-muted-foreground hover:text-indigo-400">Open</Link>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No contracts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-500/10 text-slate-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    archived: "bg-rose-500/10 text-rose-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status.toLowerCase()] || map.draft}`}>
      {status}
    </span>
  );
}



