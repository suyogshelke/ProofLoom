"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { AmbiguityReportItem } from "@/lib/ambiguityMiner";
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, MessageSquare, History, ShieldAlert, BookOpen } from "lucide-react";

export default function AmbiguityMinerPage() {
  const [reports, setReports] = useState<AmbiguityReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ambiguity");
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdopt = async (ruleId: string, newStatement: string) => {
    setAdoptingId(ruleId);
    try {
      const res = await fetch("/api/ambiguity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleId,
          newStatement,
          reason: "Clarification synthesized by Ambiguity Miner to eliminate repeated historical exemptions.",
        }),
      });
      if (res.ok) {
        setSuccessId(ruleId);
        setTimeout(() => setSuccessId(null), 4000);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdoptingId(null);
    }
  };

  const highAmbiguityCount = reports.filter((r) => r.isAmbiguous).length;
  const avgOverride = reports.length
    ? Math.round((reports.reduce((acc, r) => acc + r.overrideRate, 0) / reports.length) * 100)
    : 0;

  return (
    <div className="page">
      <Navbar user={{ name: "Dev Brand Owner", role: "BRAND_OWNER" }} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
                Learning Loop · S5 Feature
              </span>
              <span className="text-xs text-slate-400">Section 4.6 & 5.1 of Hackathon Plan</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Guideline Ambiguity Miner</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mines human-machine review disagreement and high waiver rates to surface vague guidelines and propose sharper rules.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl glass hover:bg-white/10 transition border border-white/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <span className="text-xs text-slate-400 font-medium">Rules Analyzed</span>
            <div className="text-2xl font-bold mt-1">{reports.length}</div>
            <span className="text-[10px] text-slate-500">Active Brand Contract rules</span>
          </div>

          <div className="card p-4 border-l-4 border-l-amber-500">
            <span className="text-xs text-amber-500 font-medium">Ambiguity Flags</span>
            <div className="text-2xl font-bold mt-1 text-amber-500">{highAmbiguityCount}</div>
            <span className="text-[10px] text-slate-500">High waiver / override frequency</span>
          </div>

          <div className="card p-4">
            <span className="text-xs text-slate-400 font-medium">Avg Override Rate</span>
            <div className="text-2xl font-bold mt-1">{avgOverride}%</div>
            <span className="text-[10px] text-slate-500">Across all reviewed assets</span>
          </div>

          <div className="card p-4 border-l-4 border-l-indigo-500">
            <span className="text-xs text-indigo-400 font-medium">Clarifications Ready</span>
            <div className="text-2xl font-bold mt-1 text-indigo-400">{highAmbiguityCount}</div>
            <span className="text-[10px] text-slate-500">NVIDIA Nemotron synthesized</span>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="card p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>The Compounding Effect (Plan §4.6):</strong> Content review improves one asset. Fixing the guideline improves every future asset across all markets. The Ambiguity Miner identifies rules where authors and reviewers repeatedly disagree, synthesizing clear exceptions directly into the versioned Brand Contract.
          </div>
        </div>

        {/* Ambiguity Reports List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Mined Rule Conflicts & Proposed Clarifications
          </h2>

          {loading ? (
            <div className="card p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              <span>Analyzing DecisionLog telemetry across all reviews...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>No rule ambiguities detected. All rules have high agreement rates.</span>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.ruleId} className={`card p-6 space-y-4 transition-all ${
                r.isAmbiguous ? "border-l-4 border-l-amber-500" : ""
              }`}>
                {/* Rule Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {r.ruleId}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 capitalize">{r.family}</span>
                    <span className="text-xs text-slate-400">v{r.version}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      r.isAmbiguous ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {Math.round(r.overrideRate * 100)}% Human Override Rate ({r.waivedCount} waivers)
                    </span>
                  </div>
                </div>

                {/* Current Statement & Citation */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Rule Statement:
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {r.statement}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Citation: {r.sourceDoc ?? "brand-guidelines.pdf"} {r.sourcePage ? `p.${r.sourcePage}` : ""} &middot; Quote: &ldquo;{r.sourceQuote}&rdquo;
                  </p>
                </div>

                {/* Reviewer Waiver Feedback */}
                {r.waiverReasons.length > 0 && (
                  <div className="rounded-xl p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      Recorded Reviewer Waiver Reasons (Conflict Evidence):
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc">
                      {r.waiverReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI-Synthesized Proposed Clarification Draft */}
                {r.clarificationDraft && (
                  <div className="rounded-xl p-4 bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Proposed Clarification Draft (NVIDIA Nemotron):
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">Eliminates ambiguity</span>
                    </div>

                    <p className="text-xs text-slate-900 dark:text-slate-100 font-medium pl-3 border-l-2 border-indigo-500">
                      {r.clarificationDraft}
                    </p>

                    {r.clarificationRationale && (
                      <p className="text-[11px] text-slate-400 italic">
                        <strong>Rationale:</strong> {r.clarificationRationale}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      {successId === r.ruleId ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Clarification adopted as Rule v{r.version + 1}!
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Adopting will publish version {r.version + 1} to Brand Contract.
                        </span>
                      )}

                      <button
                        onClick={() => handleAdopt(r.ruleId, r.clarificationDraft)}
                        disabled={adoptingId === r.ruleId}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {adoptingId === r.ruleId ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Adopt Clarification
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

