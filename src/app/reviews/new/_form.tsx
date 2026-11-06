"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Paperclip, ArrowRight, Eye, ShieldCheck, Globe, Radio } from "lucide-react";
import Link from "next/link";

type Contract = { id: string; name: string; brand: string; version: number };

export default function NewReviewForm({ contracts }: { contracts: Contract[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("web");
  const [market, setMarket] = useState("IN");

  return (
    <div className="page">
      <Navbar user={{ name: "Maya Content Marketer", role: "CREATOR" }} />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Review Request</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Submit copy or assets for pre-publication verification against the Brand Contract.
            </p>
          </div>
          <Link
            href="/visual"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass hover:bg-white/10 transition border border-white/20 text-indigo-400"
          >
            <Eye className="w-3.5 h-3.5" /> Inspect Visual Logo / ΔE
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500">
            {error}
          </div>
        )}

        <div className="card p-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget as HTMLFormElement);
              const title = form.get("title") as string;
              const ch = form.get("channel") as string;
              const mkt = form.get("market") as string;
              const campaign = form.get("campaign") as string;
              const contractId = form.get("contractId") as string;
              const content = form.get("content") as string;

              setSubmitting(true);
              try {
                const res = await fetch("/api/reviews", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, channel: ch, market: mkt, campaign, content, contractId }),
                });
                if (!res.ok) throw new Error("Failed to create review draft");
                const data = await res.json();
                const sub = await fetch(`/api/reviews/${data.review.id}/submit`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content, contractId }),
                });
                if (!sub.ok) throw new Error("Failed to run review cascade");
                router.push(`/reviews/${data.review.id}`);
              } catch (err: any) {
                setSubmitting(false);
                setError(err.message);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Asset Title
              </label>
              <input
                name="title"
                defaultValue="Campaign copy — Q4 Global Launch"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none text-sm"
              />
            </div>

            {/* Channel & Market Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  Channel Profile
                </label>
                <select
                  name="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none text-sm"
                >
                  <option value="web">Web & Landing Pages (WCAG AA + SEO)</option>
                  <option value="email">Marketing & Lifecycle Email</option>
                  <option value="social">Social Media & Paid Ads</option>
                  <option value="deck">Sales Enablement & Pitch Decks</option>
                  <option value="packaging">Packaging & Retail Collateral</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Market Scope & Jurisdiction
                </label>
                <select
                  name="market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none text-sm"
                >
                  <option value="IN">India (IN) — CCPA 2022/2024 (Strict ₹10L Substantiation)</option>
                  <option value="AE">UAE & Middle East (AE)</option>
                  <option value="EU">European Union (EU) — EU AI Act & EAA Enforcement</option>
                  <option value="US">United States (US) — FTC 16 CFR Testimonial Rules</option>
                  <option value="GL">Global (GL) — Multi-market baseline</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Campaign Tag
                </label>
                <input
                  name="campaign"
                  defaultValue="Q4 2026 Enterprise"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Brand Contract
                </label>
                <select
                  name="contractId"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none text-sm"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.brand}) v{c.version}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scope profile notice */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                Active Profile: <strong>{channel.toUpperCase()}</strong> in jurisdiction <strong>{market}</strong>
              </span>
              <span className="text-indigo-400 font-medium">Rules automatically filtered</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Copy / Text Content to Review
              </label>
              <textarea
                name="content"
                defaultValue="We are trusted by 12,000 teams across 40 countries. Acme is the absolute best and most revolutionary AI platform on the market."
                rows={7}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 outline-none font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <ArrowRight className="w-4 h-4 animate-spin" />
                  Running Review Cascade...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Submit for Governance Review
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
