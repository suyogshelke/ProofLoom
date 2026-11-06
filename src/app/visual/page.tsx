"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { ACME_BRAND_PALETTE, classifyColor, analyzeClearSpace, DeltaEClassification, ClearSpaceAnalysis } from "@/lib/visualEngine";
import { Eye, ShieldCheck, AlertTriangle, CheckCircle2, Sliders, Palette, Maximize2, Sparkles, RefreshCw } from "lucide-react";

export default function VisualInspectorPage() {
  const [selectedColor, setSelectedColor] = useState("#4f46e5");
  const [customHex, setCustomHex] = useState("#3832c9");
  const [width, setWidth] = useState(240);
  const [height, setHeight] = useState(60);
  const [assetType, setAssetType] = useState<"logo_horizontal" | "icon" | "banner">("logo_horizontal");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Compute live visual metrics
  const colorAnalysis: DeltaEClassification = classifyColor(customHex);
  const geometryAnalysis: ClearSpaceAnalysis = analyzeClearSpace(width, height, assetType);

  const samplePresets = [
    { label: "Approved Brand Logo", hex: "#4f46e5", w: 240, h: 60, type: "logo_horizontal" as const },
    { label: "Slight Indigo Shift (Acceptable)", hex: "#4338ca", w: 240, h: 60, type: "logo_horizontal" as const },
    { label: "Off-Palette Blurple (Drift)", hex: "#2563eb", w: 240, h: 60, type: "logo_horizontal" as const },
    { label: "Wrong Clear-Space Aspect", hex: "#4f46e5", w: 100, h: 80, type: "logo_horizontal" as const },
    { label: "Acme Cyan Accent Mark", hex: "#06b6d4", w: 64, h: 64, type: "icon" as const },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImagePreview(src);

      // Load into hidden image element to extract natural dimensions and sample dominant color
      const img = new Image();
      img.onload = () => {
        setWidth(img.naturalWidth || 200);
        setHeight(img.naturalHeight || 60);

        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, 1, 1);
            const p = ctx.getImageData(0, 0, 1, 1).data;
            const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1)}`;
            setCustomHex(hex);
          }
        } catch {
          // ignore canvas taint
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page">
      <Navbar user={{ name: "Brand Designer", role: "REVIEWER" }} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded">
                Brand Contract · Visual Rules
              </span>
              <span className="text-xs text-slate-400">WCAG 2.2 AA & CIE L*a*b* ΔE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Visual Asset & Delta E (ΔE) Inspector</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deterministic geometry and mathematical color distance checking against Brand Contract tokens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              colorAnalysis.isCompliant && geometryAnalysis.isCompliant
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            }`}>
              {colorAnalysis.isCompliant && geometryAnalysis.isCompliant ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Fully Brand Compliant
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" /> Visual Rule Violations
                </>
              )}
            </span>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="card p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Preset Campaign Asset Tests:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCustomHex(p.hex);
                  setWidth(p.w);
                  setHeight(p.h);
                  setAssetType(p.type);
                  setImagePreview(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Live Controls & Real-Time Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Asset Upload & Config */}
          <div className="lg:col-span-5 space-y-5">
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                Asset Inspection Controls
              </h2>

              {/* Upload image */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Upload Logo or Banner (.png, .svg, .jpg)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* Asset Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Asset Classification
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none"
                >
                  <option value="logo_horizontal">Horizontal Logo Lockup (1.5x clear-space)</option>
                  <option value="icon">App Icon / Favicon (1:1 square)</option>
                  <option value="banner">Campaign Banner / Collateral</option>
                </select>
              </div>

              {/* Sample Hex Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Sampled Color (Hex)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{customHex}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customHex.startsWith("#") && customHex.length === 7 ? customHex : "#4f46e5"}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    placeholder="#4f46e5"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Geometry Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] bg-slate-50/50 dark:bg-slate-900/40 relative overflow-hidden">
                <div
                  className="rounded-lg shadow-md flex items-center justify-center transition-all duration-300 text-white font-bold text-xs"
                  style={{
                    backgroundColor: customHex,
                    width: Math.min(width, 280),
                    height: Math.min(height, 90),
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span>Acme™ Logo Lockup</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  {width} x {height}px · Ratio {geometryAnalysis.aspectRatio}:1
                </span>
              </div>
            </div>

            {/* Approved Brand Palette Tokens Reference */}
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Approved Brand Guidelines v3.2 Palette
              </h3>
              <div className="space-y-2">
                {ACME_BRAND_PALETTE.map((t) => (
                  <div key={t.hex} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-sm" style={{ backgroundColor: t.hex }} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">{t.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Mathematical Diagnostics & Findings */}
          <div className="lg:col-span-7 space-y-5">
            {/* Delta E Meter Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  CIE L*a*b* Delta E (ΔE) Color Difference
                </h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  colorAnalysis.verdict === "MATCH"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : colorAnalysis.verdict === "ACCEPTABLE_TOLERANCE"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}>
                  {colorAnalysis.verdict.replace(/_/g, " ")}
                </span>
              </div>

              {/* Progress bar visual for ΔE */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Delta E: {colorAnalysis.deltaE}</span>
                  <span className="text-slate-400">Threshold: Max 5.0 ΔE</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      colorAnalysis.deltaE <= 2.5
                        ? "bg-emerald-500"
                        : colorAnalysis.deltaE <= 5.0
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min((colorAnalysis.deltaE / 15) * 100, 100)}%` }}
                  />
                  {/* Marker at 5.0 */}
                  <div className="absolute top-0 bottom-0 left-[33.3%] w-0.5 bg-rose-400/80" title="Max Tolerance (5.0)" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.0 (Exact)</span>
                  <span>2.5 (Acceptable)</span>
                  <span>5.0 (Max Tolerance)</span>
                  <span>15.0+ (Extreme Drift)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {colorAnalysis.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Nearest Token:</span>
                  <span className="font-semibold text-indigo-400">{colorAnalysis.nearestToken.name} ({colorAnalysis.nearestToken.hex})</span>
                </div>
              </div>
            </div>

            {/* Clear-Space & Geometry Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-indigo-500" />
                  Clear-Space & Aspect Ratio Diagnostics
                </h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  geometryAnalysis.isCompliant
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}>
                  {geometryAnalysis.verdict}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Width</div>
                  <div className="font-bold text-sm font-mono mt-0.5">{width}px</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Height</div>
                  <div className="font-bold text-sm font-mono mt-0.5">{height}px</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-400">Ratio</div>
                  <div className="font-bold text-sm font-mono mt-0.5">{geometryAnalysis.aspectRatio}:1</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {geometryAnalysis.recommendation}
              </p>
            </div>

            {/* Simulated Generated Finding Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Generated Governance Finding Receipts
              </h3>

              {!colorAnalysis.isCompliant && (
                <div className="card p-5 border-l-4 border-l-rose-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">RULE: VIS-COLOR-01</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">MAJOR · DETERMINISTIC</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Assets must use approved brand color tokens with ΔE &le; 5.0.
                  </p>
                  <p className="text-xs text-slate-400">
                    Source: Brand Guidelines v3.2, p.4 §2.1 &middot; Quote: &ldquo;Off-palette color usage degrades cross-channel brand recognition.&rdquo;
                  </p>
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-xs text-rose-400 border border-rose-500/20">
                    <strong>Evidence:</strong> Sampled {customHex} exceeds maximum allowed color drift (ΔE = {colorAnalysis.deltaE}).
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">
                    &rarr; Suggested Fix: Remap to {colorAnalysis.nearestToken.name} ({colorAnalysis.nearestToken.hex}).
                  </p>
                </div>
              )}

              {!geometryAnalysis.isCompliant && (
                <div className="card p-5 border-l-4 border-l-amber-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">RULE: VIS-CLEARSPACE-02</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">MINOR · GEOMETRY</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Logo lockups must preserve standard aspect ratio and minimum resolution.
                  </p>
                  <p className="text-xs text-slate-400">
                    Source: Brand Guidelines v3.2, p.6 §2.4 &middot; Quote: &ldquo;Always maintain clear space around the primary mark.&rdquo;
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-xs text-amber-400 border border-amber-500/20">
                    <strong>Evidence:</strong> {geometryAnalysis.recommendation}
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">
                    &rarr; Suggested Fix: Adjust padding or render asset at approved scale floor.
                  </p>
                </div>
              )}

              {colorAnalysis.isCompliant && geometryAnalysis.isCompliant && (
                <div className="card p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Visual Violations</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    The asset meets both Color Delta E (ΔE &le; 5.0) and Clear-Space bounding box requirements. It is ready for campaign publication.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

