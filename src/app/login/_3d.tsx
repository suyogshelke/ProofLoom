"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle, Sparkles, Database, Lock } from "lucide-react";

export default function Login3DScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto py-6 flex flex-col items-center justify-center">
      {/* Background glow orbs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Document Card */}
      <div className="relative w-full rounded-2xl glass border border-white/20 p-6 shadow-2xl backdrop-blur-xl animate-float">
        {/* Top header bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs font-mono text-slate-300 ml-2">BrandContract-v3.2.json</span>
          </div>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wide rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 inline" /> Verified
          </span>
        </div>

        {/* Mock Finding Card */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> FACT-NUM-04
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              MAJOR · GROUNDED
            </span>
          </div>
          <p className="text-xs text-slate-300 line-through decoration-rose-400 opacity-80">
            &ldquo;Trusted by 12,000 teams across 40 countries&rdquo;
          </p>
          <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>&rarr;</span>
            <span>Fix: &ldquo;Trusted by 9,400 teams across 40 countries&rdquo;</span>
          </p>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 border-t border-white/5 pt-2">
            <Database className="w-3 h-3 text-slate-500" />
            <span>Ledger: METRIC-CUSTOMERS (Q3 CRM extract) · Verified 30 Sep 2026</span>
          </div>
        </div>

        {/* Floating Mini Stat Chips */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-emerald-400 font-bold text-sm">98.4%</div>
            <div className="text-[10px] text-slate-400">Deterministic</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-indigo-400 font-bold text-sm">&lt; 10ms</div>
            <div className="text-[10px] text-slate-400">Review Latency</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-cyan-400 font-bold text-sm">100%</div>
            <div className="text-[10px] text-slate-400">Cited Spans</div>
          </div>
        </div>
      </div>
    </div>
  );
}
