import { Navbar } from "@/components/navbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe, Radio, ShieldCheck, AlertTriangle, Layers, CheckCircle2 } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const channelProfiles = [
    {
      id: "web",
      name: "Web & Landing Pages",
      tone: "Authoritative, clear, accessible",
      rulesApplied: ["FACT-NUM-04", "TERM-01", "ACC-CONTRAST-01", "VIS-COLOR-01"],
      regulations: "WCAG 2.2 AA, IS 17802 / GIGW 3.0",
      strictestSeverity: "BLOCK",
      description: "Direct customer and buyer destination; mandatory accessibility and contrast enforcement.",
    },
    {
      id: "email",
      name: "Lifecycle & Marketing Email",
      tone: "Conversational, direct, respectful",
      rulesApplied: ["FACT-NUM-04", "TERM-01", "VIS-COLOR-01"],
      regulations: "CAN-SPAM, GDPR consent",
      strictestSeverity: "MAJOR",
      description: "High-volume outbound communication; verified metric claims and trademark compliance.",
    },
    {
      id: "social",
      name: "Social Media & Paid Ads",
      tone: "Punchy, engaging, unexaggerated",
      rulesApplied: ["FACT-NUM-04", "TERM-01", "VIS-CLEARSPACE-02"],
      regulations: "CCPA Greenwashing, FTC 16 CFR",
      strictestSeverity: "MAJOR",
      description: "Short copy subject to high public scrutiny; superlative and green claims are strictly audited.",
    },
    {
      id: "deck",
      name: "Pitch Decks & Enablement",
      tone: "Strategic, metric-dense, professional",
      rulesApplied: ["FACT-NUM-04", "VIS-COLOR-01"],
      regulations: "Contractual disclosure & investor standards",
      strictestSeverity: "MAJOR",
      description: "Sales decks and RFP responses; numeric metrics must be bound to active CRM ledger records.",
    },
    {
      id: "packaging",
      name: "Product Packaging & Print",
      tone: "Essential, compliant, permanent",
      rulesApplied: ["FACT-NUM-04", "TERM-01", "VIS-COLOR-01", "VIS-CLEARSPACE-02"],
      regulations: "BIS, Legal Metrology, statutory notices",
      strictestSeverity: "BLOCK",
      description: "Physical print surfaces with irreversible correction costs. Highest governance bar.",
    },
  ];

  const marketProfiles = [
    {
      code: "IN",
      country: "India",
      regulator: "Central Consumer Protection Authority (CCPA)",
      mandates: "2022 Misleading Ad Guidelines & 2024 Greenwashing Rules",
      penalties: "₹10 Lakh initial penalty, ₹50 Lakh for repeat contraventions",
      severityRule: "Claims and numerical claims automatically promote to BLOCK severity.",
      status: "STRICT_ENFORCEMENT",
    },
    {
      code: "EU",
      country: "European Union",
      regulator: "European Commission / National DPAs",
      mandates: "EU AI Act Art. 50 (Aug 2026) & European Accessibility Act (June 2025)",
      penalties: "Up to 7% of global turnover or €35M",
      severityRule: "Accessibility non-conformance promotes to BLOCK. AI assistance disclosure mandatory.",
      status: "REGULATED",
    },
    {
      code: "US",
      country: "United States",
      regulator: "Federal Trade Commission (FTC)",
      mandates: "16 CFR Part 465 (Consumer Reviews & Testimonials, Oct 2024)",
      penalties: "Civil penalties up to $51,744 per violation",
      severityRule: "Testimonial and endorsement claims require dated customer consent on file.",
      status: "REGULATED",
    },
    {
      code: "AE",
      country: "UAE & Middle East",
      regulator: "National Media Council / Consumer Protection",
      mandates: "Commercial Advertising Standards",
      penalties: "Suspension of campaign advertising licenses",
      severityRule: "Comparative advertising and cultural voice guidelines strictly advisory.",
      status: "STANDARD",
    },
    {
      code: "GL",
      country: "Global (Baseline)",
      regulator: "Acme Global Governance Board",
      mandates: "Brand Guidelines v3.2 Core Contract",
      penalties: "Internal review veto & campaign hold",
      severityRule: "Default Brand Contract severity matrix.",
      status: "BASELINE",
    },
  ];

  return (
    <div className="page">
      <Navbar user={session} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded">
              Brand Contract · Scope Profiles
            </span>
            <span className="text-xs text-slate-400">Sections 2.1, 4.2 & 5.6 of Plan</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Channel & Market Governance Profiles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rules apply selectively per channel and jurisdiction. Regulatory markets automatically elevate severity thresholds.
          </p>
        </div>

        {/* Channel Profiles Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            Channel Profiles ({channelProfiles.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channelProfiles.map((cp) => (
              <div key={cp.id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase">
                    {cp.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    cp.strictestSeverity === "BLOCK"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {cp.strictestSeverity} FLOOR
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{cp.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {cp.description}
                  </p>
                </div>

                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <span className="text-slate-400">Tone Standard:</span>{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cp.tone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Applicable Rules:</span>{" "}
                    <span className="font-mono text-indigo-400 text-[11px]">{cp.rulesApplied.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Standards:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">{cp.regulations}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Scope & Regulatory Matrix */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            Market Scopes & Regulatory Jurisdiction Matrix ({marketProfiles.length})
          </h2>

          <div className="space-y-3">
            {marketProfiles.map((mp) => (
              <div key={mp.code} className="card p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold font-mono text-sm text-indigo-400">
                      {mp.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{mp.country}</h3>
                      <p className="text-xs text-slate-400">{mp.regulator} &middot; {mp.mandates}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    mp.status === "STRICT_ENFORCEMENT"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : mp.status === "REGULATED"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {mp.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Automated Elevation:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{mp.severityRule}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Statutory Penalties:</span>
                    <span className="text-rose-500 dark:text-rose-400 font-semibold">{mp.penalties}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

