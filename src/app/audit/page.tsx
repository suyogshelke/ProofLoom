import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const logs = await prisma.decisionLog.findMany({
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <div className="page">
      <Navbar user={session} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-muted-foreground">Immutable, append-only decision trail.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted-foreground">
              <th className="pb-3 pr-2 pl-6">Time</th>
              <th className="pb-3">Actor</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Entity</th>
              <th className="pb-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition group">
                <td className="py-4 pr-2 pl-6 text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="py-4 pr-2 text-sm">{l.actor?.name ?? l.actor?.email}</td>
                <td className="py-4 pr-2 font-mono text-xs">{l.action}</td>
                <td className="py-4 pr-2 text-muted-foreground">{l.entityType} {l.entityId ? `· ${l.entityId.slice(-6)}` : ""}</td>
                <td className="py-4 pr-2 text-muted-foreground text-xs">{l.details ? JSON.stringify(l.details) : "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No decisions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
