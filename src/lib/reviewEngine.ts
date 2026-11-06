import { prisma } from "@/lib/prisma";
import { FindingStatus, Severity, Verdict } from "@/generated/enums";

type Rule = {
  id: string;
  ruleId: string;
  family: string;
  statement: string;
  scope: any;
  severity: Severity;
  mode: string;
  isBlocking: boolean;
  sourceDoc?: string | null;
  sourcePage?: number | null;
  sourceQuote?: string | null;
  version: number;
  exceptions?: string[];
};

type Fact = {
  id: string;
  key: string;
  value: string;
  expiresAt: Date | null;
  successorId?: string | null;
};

type DetectorResult = {
  ruleId: string;
  family: string;
  statement: string;
  severity: Severity;
  mode: string;
  sourceDoc?: string | null;
  sourcePage?: number | null;
  sourceQuote?: string | null;
  version: number;
  verdict: Verdict | null;
  confidence: number;
  spanText: string | null;
  spanStart: number | null;
  spanEnd: number | null;
  evidenceRecord: string | null;
  suggestedFix: string | null;
  intentAnchor: string | null;
};

/**
 * Scoping helper: checks if a rule applies to the requested channel and market (Plan §2.1 & §5.6)
 */
export function matchesScope(scope: any, channel?: string | null, market?: string | null): boolean {
  if (!scope || typeof scope !== "object") return true;

  // Check channel scope
  if (channel && Array.isArray(scope.channels) && scope.channels.length > 0) {
    const cNorm = channel.toLowerCase();
    const matchesChannel = scope.channels.some(
      (c: string) => c.toLowerCase() === cNorm || c.toLowerCase() === "all" || c.toLowerCase() === "global"
    );
    if (!matchesChannel) return false;
  }

  // Check market scope
  if (market && Array.isArray(scope.markets) && scope.markets.length > 0) {
    const mNorm = market.toUpperCase();
    const matchesMarket = scope.markets.some(
      (m: string) =>
        m.toUpperCase() === mNorm ||
        m.toUpperCase() === "ALL" ||
        m.toUpperCase() === "GL" ||
        m.toUpperCase() === "GLOBAL"
    );
    if (!matchesMarket) return false;
  }

  return true;
}

/**
 * Elevates severity for regulated markets (Plan §2.1 & §5.6)
 * E.g., India (CCPA Guidelines ₹10L fine) or EU (EAA / EU AI Act)
 */
export function getScopedSeverity(rule: Rule, market?: string | null): Severity {
  const m = market?.toUpperCase();
  if (m === "IN" && (rule.family.includes("claims") || rule.family.includes("numeric"))) {
    return Severity.BLOCK; // CCPA strictly mandates claim substantiation
  }
  if (m === "EU" && rule.family.includes("accessibility")) {
    return Severity.BLOCK; // European Accessibility Act enforcement
  }
  return rule.severity;
}

/**
 * Deterministic detectors: terminology, numeric/dates, accessibility mechanical subset.
 * Returns candidate findings bound to rule IDs and spans.
 */
function deterministicScan(text: string, rules: Rule[], market?: string | null): DetectorResult[] {
  const findings: DetectorResult[] = [];
  const lower = text.toLowerCase();

  for (const rule of rules) {
    if (rule.mode !== "deterministic") continue;
    const family = rule.family;
    const effectiveSeverity = getScopedSeverity(rule, market);

    if (family === "terminology" || family === "naming") {
      const scope = rule.scope || {};
      const banned = Array.isArray(scope.banned) ? scope.banned : [];
      const preferred = Array.isArray(scope.preferred) ? scope.preferred : [];
      for (const term of banned) {
        const idx = lower.indexOf(term.toLowerCase());
        if (idx !== -1) {
          findings.push({
            ruleId: rule.ruleId,
            family,
            statement: rule.statement,
            severity: effectiveSeverity,
            mode: rule.mode,
            sourceDoc: rule.sourceDoc,
            sourcePage: rule.sourcePage,
            sourceQuote: rule.sourceQuote,
            version: rule.version,
            verdict: null,
            confidence: 0.99,
            spanText: text.slice(idx, idx + term.length),
            spanStart: idx,
            spanEnd: idx + term.length,
            evidenceRecord: `Banned term "${term}" (${market ? `Market: ${market}` : "Global"})`,
            suggestedFix: preferred[0] ? `Replace "${term}" with "${preferred[0]}"` : null,
            intentAnchor: null,
          });
        }
      }
    }

    if (family === "numeric" || family === "dates") {
      const numRegex = /\b\d[\d,]*\.?\d*\b/g;
      let m;
      while ((m = numRegex.exec(text))) {
        findings.push({
          ruleId: rule.ruleId,
          family,
          statement: rule.statement,
          severity: effectiveSeverity,
          mode: rule.mode,
          sourceDoc: rule.sourceDoc,
          sourcePage: rule.sourcePage,
          sourceQuote: rule.sourceQuote,
          version: rule.version,
          verdict: null,
          confidence: 0.9,
          spanText: m[0],
          spanStart: m.index,
          spanEnd: m.index + m[0].length,
          evidenceRecord: `Numeric token "${m[0]}" requires ledger match`,
          suggestedFix: null,
          intentAnchor: null,
        });
      }
    }
  }

  return findings;
}

/**
 * Grounded pass: match numeric tokens and claim-ish spans against the facts ledger.
 */
function groundedScan(text: string, rules: Rule[], facts: Fact[], market?: string | null): DetectorResult[] {
  const findings: DetectorResult[] = [];
  const byKey = new Map<string, Fact>();
  for (const f of facts) byKey.set(f.key, f);

  const numRegex = /\b\d[\d,]*\.?\d*\b/g;
  let m;
  while ((m = numRegex.exec(text))) {
    const token = m[0];
    let matched: Fact | null = null;
    for (const f of facts) {
      if (f.value === token || f.value.replace(/,/g, "") === token.replace(/,/g, "")) {
        matched = f;
        break;
      }
    }

    const now = new Date();
    const effectiveSeverity = market?.toUpperCase() === "IN" ? Severity.BLOCK : Severity.MAJOR;

    if (matched) {
      const stale = matched.expiresAt && matched.expiresAt < now;
      findings.push({
        ruleId: "FACT-NUM-04",
        family: "claims.numeric",
        statement: "Numeric claims must map to an approved metric value.",
        severity: effectiveSeverity,
        mode: "grounded",
        sourceDoc: null,
        sourcePage: null,
        sourceQuote: null,
        version: 1,
        verdict: stale ? Verdict.CONTRADICTED : Verdict.SUPPORTED,
        confidence: 0.97,
        spanText: token,
        spanStart: m.index,
        spanEnd: m.index + token.length,
        evidenceRecord: stale
          ? `Superseded: ${matched.key} = ${matched.value} expired ${matched.expiresAt} (Market: ${market ?? "GL"})`
          : `Ledger: ${matched.key} = ${matched.value}`,
        suggestedFix: stale && matched.successorId
          ? `Replace with current value ${byKey.get(matched.successorId)?.value ?? matched.value}`
          : null,
        intentAnchor: null,
      });
    } else {
      findings.push({
        ruleId: "FACT-NUM-04",
        family: "claims.numeric",
        statement: "Numeric claims must map to an approved metric value.",
        severity: effectiveSeverity,
        mode: "grounded",
        sourceDoc: null,
        sourcePage: null,
        sourceQuote: null,
        version: 1,
        verdict: Verdict.UNSUPPORTED,
        confidence: 0.92,
        spanText: token,
        spanStart: m.index,
        spanEnd: m.index + token.length,
        evidenceRecord: `No ledger entry matches "${token}" (Market: ${market ?? "GL"})`,
        suggestedFix: null,
        intentAnchor: null,
      });
    }
  }

  return findings;
}

/**
 * Judged pass: evaluates subjective rules (tone, voice, unverified claims)
 * using NVIDIA Nemotron (OpenAI-compatible) or Google Gemini.
 */
async function judgedScan(text: string, rules: Rule[], market?: string | null): Promise<DetectorResult[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!openaiKey && !geminiKey) return [];

  const judgedRules = rules.filter((r) => r.mode === "judged");
  if (judgedRules.length === 0) return [];

  const findings: DetectorResult[] = [];

  for (const rule of judgedRules) {
    try {
      const effectiveSeverity = getScopedSeverity(rule, market);
      const prompt = `You are ProofLoom's Brand Governance Adjudicator.
Analyze this content against the following brand rule:
Rule ID: ${rule.ruleId}
Rule Statement: ${rule.statement}
Family: ${rule.family}
Market Scope: ${market ?? "Global"}

Content:
"${text}"

If there is a breach, return a JSON object with:
{
  "violationFound": true,
  "quotedSpan": "exact short substring from the content that violates the rule",
  "reason": "short explanation of the violation",
  "suggestedFix": "minimal replacement phrase"
}
If no breach, return:
{ "violationFound": false }

Respond only with valid JSON.`;

      let rawResponseText = "";

      if (openaiKey) {
        const baseUrl = process.env.OPENAI_BASE_URL || "https://integrate.api.nvidia.com/v1";
        const model = process.env.OPENAI_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          rawResponseText = data?.choices?.[0]?.message?.content || "";
        }
      } else if (geminiKey) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      if (!rawResponseText) continue;

      const cleanJson = rawResponseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.violationFound && parsed.quotedSpan) {
        const idx = text.indexOf(parsed.quotedSpan);
        if (idx !== -1) {
          findings.push({
            ruleId: rule.ruleId,
            family: rule.family,
            statement: rule.statement,
            severity: effectiveSeverity,
            mode: "judged",
            sourceDoc: rule.sourceDoc,
            sourcePage: rule.sourcePage,
            sourceQuote: rule.sourceQuote,
            version: rule.version,
            verdict: null,
            confidence: 0.94,
            spanText: parsed.quotedSpan,
            spanStart: idx,
            spanEnd: idx + parsed.quotedSpan.length,
            evidenceRecord: parsed.reason || "Adjudicated by NVIDIA Nemotron",
            suggestedFix: parsed.suggestedFix || null,
            intentAnchor: null,
          });
        }
      }
    } catch (e) {
      console.warn("judgedScan notice for rule:", rule.ruleId, e);
    }
  }

  return findings;
}

/**
 * Verifier: drop any finding lacking a rule ID or a span that exists in source.
 * Drops are counted but never silently hidden (reported via dropCount).
 */
export function verify(findings: DetectorResult[], sourceText: string) {
  const kept: DetectorResult[] = [];
  let dropCount = 0;
  for (const f of findings) {
    const hasRule = Boolean(f.ruleId);
    const hasSpan = f.spanText && f.spanStart != null && f.spanEnd != null;
    const spanExists = hasSpan && sourceText.includes(f.spanText!);
    if (hasRule && hasSpan && spanExists) {
      kept.push(f);
    } else {
      dropCount++;
    }
  }
  return { kept, dropCount };
}

export async function runCascade({
  reviewId,
  text,
  contractId,
  channel,
  market,
}: {
  reviewId: string;
  text: string;
  contractId: string;
  channel?: string | null;
  market?: string | null;
}) {
  const [allRules, facts] = await Promise.all([
    prisma.rule.findMany({ where: { contractId } }),
    prisma.factLedger.findMany(),
  ]);

  // Filter rules by Channel & Market Profile
  const scopedRules = (allRules as Rule[]).filter((r) => matchesScope(r.scope, channel, market));

  const deterministic = deterministicScan(text, scopedRules, market);
  const grounded = groundedScan(text, scopedRules, facts as Fact[], market);
  const judged = await judgedScan(text, scopedRules, market);
  const raw = [...deterministic, ...grounded, ...judged];

  const { kept, dropCount } = verify(raw, text);

  // Create finding records
  const created = await Promise.all(
    kept.map((f) =>
      prisma.finding.create({
        data: {
          reviewId,
          ruleId: f.ruleId,
          family: f.family,
          severity: f.severity,
          verdict: f.verdict,
          confidence: f.confidence,
          spanText: f.spanText ?? null,
          spanStart: f.spanStart ?? null,
          spanEnd: f.spanEnd ?? null,
          sourcePage: f.sourcePage ?? null,
          evidenceRecord: f.evidenceRecord ?? null,
          suggestedFix: f.suggestedFix ?? null,
          intentAnchor: f.intentAnchor ?? null,
          status: FindingStatus.OPEN,
        },
      })
    )
  );

  // Audit log entries
  await prisma.decisionLog.createMany({
    data: kept.map((f) => ({
      actorId: "system",
      action: "finding_created",
      entityType: "finding",
      ruleVersion: String(f.version),
      details: {
        family: f.family,
        verdict: f.verdict,
        dropCount,
        channel: channel ?? "all",
        market: market ?? "global",
      },
    })),
  });

  return { findings: created, dropCount, totalRaw: raw.length };
}

export { deterministicScan, groundedScan, judgedScan, type DetectorResult };
