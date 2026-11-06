"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Edit2, AlertCircle, Loader2, SendHorizontal, Flag } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Finding = {
  id: string;
  ruleId?: string | null;
  family: string;
  verdict: "SUPPORTED" | "UNSUPPORTED" | "CONTRADICTED" | null;
  severity: "ADVISORY" | "MINOR" | "MAJOR" | "BLOCK";
  confidence: number | null;
  spanText?: string | null;
  spanStart?: number | null;
  spanEnd?: number | null;
  sourcePage?: number | null;
  evidenceRecord?: string | null;
  suggestedFix?: string | null;
  status: "OPEN" | "ACCEPTED" | "EDITED" | "WAIVED" | "ESCALATED";
  decidedAt?: Date | string | null;
  decidedBy?: { name?: string | null; email?: string | null } | null;
  rule?: {
    ruleId: string;
    statement: string;
    sourceDoc?: string | null;
    sourcePage?: number | null;
    sourceQuote?: string | null;
  } | null;
};

type Props = { finding: Finding; onUpdate: () => void };

export function FindingCard({ finding, onUpdate }: Props) {
  const router = useRouter();
  const [deciding, setDeciding] = useState<"accept" | "edit" | "waive" | "escalate" | null>(null);
  const [waiverText, setWaiverText] = useState("");
  const [editText, setEditText] = useState(finding.suggestedFix ?? "");

  const sev: Record<string, string> = {
    ADVISORY: "text-slate-400 border-slate-500/20 bg-slate-500/10",
    MINOR: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    MAJOR: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    BLOCK: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  };
  const ver: Record<string, string> = {
    SUPPORTED: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    UNSUPPORTED: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    CONTRADICTED: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  };

  async function handleDecision(status: "ACCEPTED" | "EDITED" | "WAIVED" | "ESCALATED") {
    const action = status === "ACCEPTED" ? "accept" : status === "EDITED" ? "edit" : status === "WAIVED" ? "waive" : "escalate";
    setDeciding(action);
    try {
      const body: any = { status, actorId: "me" };
      if (status === "WAIVED") body.waiverReason = waiverText || "Waived by reviewer";
      if (status === "EDITED") body.waiverReason = editText;
      await fetch(`/api/findings/${finding.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onUpdate();
      router.refresh();
    } finally {
      setDeciding(null);
    }
  }

  if (finding.status !== "OPEN") {
    return (
      <div className="card p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="mt-0.5"><Check className="w-5 h-5 text-emerald-400" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                {finding.status}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {finding.decidedAt ? formatDate(finding.decidedAt) : "—"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Finding resolved — {finding.status.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sev[finding.severity]}`}>
            {finding.severity}
          </span>
          {finding.verdict && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ver[finding.verdict]}`}>
              {finding.verdict}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto lg:ml-0">
          {finding.confidence != null && <span>Confidence {Math.round(finding.confidence * 100)}%</span>}
        </div>
      </div>

      <div className="border border-white/10 rounded-xl p-4 mb-4 bg-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule</span>
          <span className="font-mono text-sm">{finding.rule?.ruleId || finding.ruleId || "—"}</span>
        </div>
        <p className="text-sm">{finding.rule?.statement || finding.family}</p>
        {finding.rule?.sourceDoc && (
          <p className="text-xs text-muted-foreground mt-1">
            Source: {finding.rule.sourceDoc}
            {finding.rule.sourcePage != null && <span>, p.{finding.rule.sourcePage}</span>}
            {finding.rule.sourceQuote && (
              <>
                <br />
                <span className="italic">"{finding.rule.sourceQuote}"</span>
              </>
            )}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold">Flagged text</span>
        </div>
        <div className="glass p-4 rounded-xl border border-white/20 font-mono text-xs text-left overflow-x-auto whitespace-pre-wrap break-all">
          "{finding.spanText}"
          {finding.spanStart != null && finding.spanEnd != null && (
            <span className="text-xs text-muted-foreground ml-2">span [{finding.spanStart}-{finding.spanEnd}]</span>
          )}
        </div>
      </div>

      {finding.evidenceRecord && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evidence</span>
          </div>
          <div className="glass p-3 rounded-xl border border-white/20 text-xs italic">
            {finding.evidenceRecord}
          </div>
        </div>
      )}

      {finding.suggestedFix && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suggested fix (intent-preserved)
            </span>
          </div>
          <div className="glass p-3 rounded-xl border border-white/20 font-mono text-xs whitespace-pre-wrap">
            {finding.suggestedFix}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <button
          onClick={() => handleDecision("ACCEPTED")}
          disabled={deciding === "accept"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition disabled:opacity-50"
        >
          {deciding === "accept" ? <Loader2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          Accept fix
        </button>
        <button
          onClick={() => handleDecision("EDITED")}
          disabled={deciding === "edit"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => handleDecision("WAIVED")}
          disabled={deciding === "waive"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
        >
          <Flag className="w-4 h-4" /> Waive with reason
        </button>
        <button
          onClick={() => handleDecision("ESCALATED")}
          disabled={deciding === "escalate"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
        >
          <SendHorizontal className="w-4 h-4" /> Escalate
        </button>
        {deciding === "waive" && (
          <div className="flex items-center gap-2">
            <input
              value={waiverText}
              onChange={(e) => setWaiverText(e.target.value)}
              placeholder="Reason"
              className="glass rounded-lg px-3 py-2 text-sm w-48"
            />
            <button
              onClick={() => handleDecision("WAIVED")}
              disabled={!waiverText}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
        {deciding === "edit" && (
          <div className="flex items-center gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Your edit"
              className="glass rounded-lg px-3 py-2 text-sm w-48"
            />
            <button
              onClick={() => handleDecision("EDITED")}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
