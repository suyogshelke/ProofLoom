import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { Role } from "@/generated/enums";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Plus, Database, Clock } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function FactsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const facts = await prisma.factLedger.findMany({ orderBy: { key: "asc" } });
  const canManage = session.role === "BRAND_OWNER" || session.role === "ADMIN";
  const now = new Date();

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Facts ledger</h1>
          <p className="text-sm text-muted-foreground">Approved values with validity windows. Grounds every numeric claim.</p>
        </div>
        {canManage && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition">
            <Plus className="w-4 h-4" /> Add fact
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
              <th className="pb-3 pr-2 pl-6">Key</th>
              <th className="pb-3">Value</th>
              <th className="pb-3">Owner</th>
              <th className="pb-3">Verified</th>
              <th className="pb-3">Expires</th>
              <th className="pb-3">State</th>
            </tr>
          </thead>
          <tbody>
            {facts.map((f) => {
              const expired = f.expiresAt && f.expiresAt < now;
              return (
                <tr key={f.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                  <td className="py-4 pr-2 pl-6 font-mono text-xs">{f.key}</td>
                  <td className="py-4 pr-2">{f.value}</td>
                  <td className="py-4 pr-2 text-muted-foreground text-sm">{f.owner ?? "—"}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{f.verifiedAt ? new Date(f.verifiedAt).toLocaleDateString() : "—"}</td>
                  <td className="py-4 pr-2 text-muted-foreground">{f.expiresAt ? new Date(f.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="py-4 pr-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${expired ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {expired ? "Expired" : "Current"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {facts.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No facts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



