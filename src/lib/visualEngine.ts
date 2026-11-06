/**
 * Visual Rules Engine for ProofLoom
 * Computes CIE L*a*b* color coordinates, Delta E (ΔE CIE76) color distance,
 * and clear-space / aspect ratio geometry compliance.
 */

export type RgbColor = { r: number; g: number; b: number };
export type LabColor = { l: number; a: number; b: number };

export type PaletteToken = {
  name: string;
  hex: string;
  role: "primary" | "secondary" | "accent" | "neutral";
};

// Approved Acme Brand Guidelines v3.2 Palette Tokens
export const ACME_BRAND_PALETTE: PaletteToken[] = [
  { name: "Acme Royal Indigo", hex: "#4f46e5", role: "primary" },
  { name: "Acme Cyber Cyan", hex: "#06b6d4", role: "secondary" },
  { name: "Acme Violet Flame", hex: "#8b5cf6", role: "accent" },
  { name: "Acme Deep Navy", hex: "#0f172a", role: "neutral" },
  { name: "Acme Pure White", hex: "#ffffff", role: "neutral" },
];

/** Convert Hex to RGB */
export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Convert sRGB [0-255] to CIE XYZ using D65 illuminant */
export function rgbToXyz({ r, g, b }: RgbColor): { x: number; y: number; z: number } {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const toLinear = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);

  const lr = toLinear(sR) * 100;
  const lg = toLinear(sG) * 100;
  const lb = toLinear(sB) * 100;

  // D65 Standard Observer 2° matrix
  return {
    x: lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
    y: lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175,
    z: lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041,
  };
}

/** Convert CIE XYZ to CIE L*a*b* (D65 reference white) */
export function xyzToLab({ x, y, z }: { x: number; y: number; z: number }): LabColor {
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(x / refX);
  const fy = f(y / refY);
  const fz = f(z / refZ);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function hexToLab(hex: string): LabColor {
  return xyzToLab(rgbToXyz(hexToRgb(hex)));
}

/**
 * Calculate CIE Delta E (CIE76 Euclidean distance in Lab color space)
 * ΔE < 1.0: Imperceptible
 * ΔE 1.0 - 2.5: Perceptible through close inspection (Excellent)
 * ΔE 2.5 - 5.0: Perceptible at a glance (Acceptable tolerance)
 * ΔE > 5.0: Noticeable color shift (Brand Contract violation)
 */
export function calculateDeltaE(color1Hex: string, color2Hex: string): number {
  const c1 = hexToLab(color1Hex);
  const c2 = hexToLab(color2Hex);

  const dL = c1.l - c2.l;
  const da = c1.a - c2.a;
  const db = c1.b - c2.b;

  return Math.sqrt(dL * dL + da * da + db * db);
}

export type DeltaEClassification = {
  deltaE: number;
  nearestToken: PaletteToken;
  isCompliant: boolean;
  verdict: "MATCH" | "ACCEPTABLE_TOLERANCE" | "OFF_PALETTE_DRIFT";
  description: string;
};

/** Match a given hex color against the approved brand palette */
export function classifyColor(sampleHex: string, palette: PaletteToken[] = ACME_BRAND_PALETTE): DeltaEClassification {
  let minDistance = Infinity;
  let nearest = palette[0];

  for (const token of palette) {
    const dE = calculateDeltaE(sampleHex, token.hex);
    if (dE < minDistance) {
      minDistance = dE;
      nearest = token;
    }
  }

  const roundedDE = Math.round(minDistance * 10) / 10;

  if (roundedDE <= 2.5) {
    return {
      deltaE: roundedDE,
      nearestToken: nearest,
      isCompliant: true,
      verdict: "MATCH",
      description: `Exact brand match to ${nearest.name} (${nearest.hex}) with ΔE = ${roundedDE}.`,
    };
  }

  if (roundedDE <= 5.0) {
    return {
      deltaE: roundedDE,
      nearestToken: nearest,
      isCompliant: true,
      verdict: "ACCEPTABLE_TOLERANCE",
      description: `Within acceptable variance (ΔE = ${roundedDE}) of ${nearest.name} (${nearest.hex}).`,
    };
  }

  return {
    deltaE: roundedDE,
    nearestToken: nearest,
    isCompliant: false,
    verdict: "OFF_PALETTE_DRIFT",
    description: `Off-brand color drift: ΔE of ${roundedDE} exceeds maximum brand threshold (5.0) from nearest token ${nearest.name} (${nearest.hex}).`,
  };
}

export type ClearSpaceAnalysis = {
  width: number;
  height: number;
  aspectRatio: number;
  isCompliant: boolean;
  verdict: "PASS" | "FAIL";
  issues: string[];
  recommendation: string;
};

/**
 * Inspect visual geometry and clear-space compliance:
 * - Minimum height: 32px for digital icons, 64px for brand mark
 * - Aspect ratio check against standard logo ratios (1:1 mark, 3:1 to 5:1 horizontal lockup)
 */
export function analyzeClearSpace(width: number, height: number, assetType: "icon" | "logo_horizontal" | "banner"): ClearSpaceAnalysis {
  const issues: string[] = [];
  const aspectRatio = Math.round((width / height) * 100) / 100;

  if (assetType === "icon") {
    if (width < 32 || height < 32) issues.push(`Asset dimensions (${width}x${height}px) fail minimum legibility floor of 32x32px.`);
    if (Math.abs(aspectRatio - 1.0) > 0.15) issues.push(`Icon aspect ratio (${aspectRatio}:1) drifts from approved 1:1 square geometry.`);
  } else if (assetType === "logo_horizontal") {
    if (height < 40) issues.push(`Logo height (${height}px) fails minimum brand lockup requirement of 40px.`);
    if (aspectRatio < 2.0 || aspectRatio > 6.0) issues.push(`Horizontal lockup ratio (${aspectRatio}:1) violates approved clear-space bounding box.`);
  } else if (assetType === "banner") {
    if (width < 300) issues.push(`Banner width (${width}px) is too small for campaign publishing.`);
  }

  const isCompliant = issues.length === 0;

  return {
    width,
    height,
    aspectRatio,
    isCompliant,
    verdict: isCompliant ? "PASS" : "FAIL",
    issues,
    recommendation: isCompliant
      ? "Asset dimensions and clear-space ratios meet Brand Guidelines v3.2 Section 4.5."
      : issues.join(" "),
  };
}

