import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { classifyColor, analyzeClearSpace, ACME_BRAND_PALETTE } from "@/lib/visualEngine";
import { z } from "zod";

const inspectSchema = z.object({
  assetName: z.string().default("uploaded-asset.png"),
  assetType: z.enum(["icon", "logo_horizontal", "banner"]).default("logo_horizontal"),
  colors: z.array(z.string()).min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { assetName, assetType, colors, width, height } = inspectSchema.parse(body);

    // 1. Color Delta E Analysis
    const colorResults = colors.map((hex) => ({
      hex,
      ...classifyColor(hex),
    }));

    // 2. Geometry & Clear-Space Analysis
    const geometryResult = analyzeClearSpace(width, height, assetType);

    // 3. Synthesize Findings
    const findings = [];

    // Check color drift
    for (const c of colorResults) {
      if (!c.isCompliant) {
        findings.push({
          ruleId: "VIS-COLOR-01",
          family: "visual.color",
          statement: "Assets must use approved brand color tokens with ΔE <= 5.0.",
          severity: "MAJOR",
          verdict: "CONTRADICTED",
          confidence: 0.96,
          spanText: c.hex,
          evidenceRecord: c.description,
          suggestedFix: `Re-map ${c.hex} to approved token ${c.nearestToken.name} (${c.nearestToken.hex})`,
          sourceDoc: "brand-guidelines-v3.2.pdf",
          sourcePage: 4,
          sourceQuote: "Off-palette color usage degrades cross-channel brand recognition.",
        });
      }
    }

    // Check geometry
    if (!geometryResult.isCompliant) {
      findings.push({
        ruleId: "VIS-CLEARSPACE-02",
        family: "visual.geometry",
        statement: "Logo lockups must preserve standard aspect ratio and minimum resolution.",
        severity: "MINOR",
        verdict: "UNSUPPORTED",
        confidence: 0.93,
        spanText: `${geometryResult.width}x${geometryResult.height}px (${geometryResult.aspectRatio}:1)`,
        evidenceRecord: geometryResult.recommendation,
        suggestedFix: "Adjust padding or render asset at approved scale floor.",
        sourceDoc: "brand-guidelines-v3.2.pdf",
        sourcePage: 6,
        sourceQuote: "Always maintain clear space around the primary mark equal to the cap-height of 'A'.",
      });
    }

    return NextResponse.json({
      assetName,
      assetType,
      isFullyCompliant: findings.length === 0,
      colorResults,
      geometryResult,
      approvedPalette: ACME_BRAND_PALETTE,
      findings,
    });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Visual inspection failed" }, { status: 500 });
  }
}

