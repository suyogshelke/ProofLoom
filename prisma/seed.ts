import { PrismaClient } from "../src/generated/client";
import { Role, FindingStatus, Severity, Verdict } from "../src/generated/enums";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = async (p: string) => bcrypt.hash(p, 10);

  const brandOwner = await prisma.user.upsert({
    where: { email: "brandowner@acme.com" },
    update: {},
    create: { email: "brandowner@acme.com", passwordHash: await hash("password"), name: "Dev Brand Owner", role: "BRAND_OWNER", brand: "acme" },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@acme.com" },
    update: {},
    create: { email: "creator@acme.com", passwordHash: await hash("password"), name: "Maya Content Marketer", role: "CREATOR", brand: "acme" },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: "reviewer@acme.com" },
    update: {},
    create: { email: "reviewer@acme.com", passwordHash: await hash("password"), name: "Dev Brand Manager", role: "REVIEWER", brand: "acme" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: { email: "admin@acme.com", passwordHash: await hash("password"), name: "Admin", role: "ADMIN", brand: "acme" },
  });

  const contract = await prisma.brandContract.create({
    data: {
      name: "Acme Brand Guidelines v3.2",
      brand: "acme",
      version: 3,
      status: "approved",
      ownerId: brandOwner.id,
      rules: {
        create: [
          {
            ruleId: "FACT-NUM-04",
            family: "claims.numeric",
            statement: "Numeric claims must map to an approved metric value.",
            scope: { brand: "acme", markets: ["IN", "AE"], channels: ["web", "email", "deck"] },
            severity: "MAJOR",
            mode: "grounded",
            isBlocking: true,
            sourceDoc: "brand-guidelines-v3.2.pdf",
            sourcePage: 7,
            sourceQuote: "all figures must be traceable to the facts ledger",
            owner: brandOwner.email,
            version: 3,
            exceptions: ["historical-figures-labelled-with-date"],
          },
          {
            ruleId: "TERM-01",
            family: "terminology",
            statement: "Use approved product name capitalisation and trademark symbols.",
            scope: { brand: "acme", markets: ["IN"], channels: ["web", "email"] },
            severity: "MINOR",
            mode: "deterministic",
            isBlocking: false,
            sourceDoc: "brand-guidelines-v3.2.pdf",
            sourcePage: 12,
            sourceQuote: "always write Acme™ with the trademark symbol",
            owner: brandOwner.email,
            version: 3,
          },
          {
            ruleId: "ACC-CONTRAST-01",
            family: "accessibility",
            statement: "Text contrast must meet WCAG 2.2 AA (4.5:1).",
            scope: { brand: "acme", markets: ["IN"], channels: ["web"] },
            severity: "MAJOR",
            mode: "deterministic",
            isBlocking: true,
            sourceDoc: "brand-guidelines-v3.2.pdf",
            sourcePage: 4,
            sourceQuote: "minimum contrast ratio 4.5:1 for normal text",
            owner: brandOwner.email,
            version: 3,
          },
        ],
      },
    },
    include: { rules: true },
  });

  await prisma.factLedger.create({
    data: {
      key: "METRIC-CUSTOMERS",
      value: "9,400",
      owner: "revops@acme",
      source: "Q3 CRM extract",
      verifiedAt: new Date("2026-09-30"),
      expiresAt: new Date("2026-12-31"),
      brand: "acme",
    },
  });

  await prisma.factLedger.create({
    data: {
      key: "METRIC-CUSTOMERS",
      value: "12,000",
      owner: "revops@acme",
      source: "Q2 CRM extract (superseded)",
      verifiedAt: new Date("2026-06-01"),
      expiresAt: new Date("2026-09-14"),
      successorId: "placeholder",
      brand: "acme",
    },
  });

  console.log("Seed complete:");
  console.log("  brand owner:", brandOwner.email, "(password)");
  console.log("  creator:", creator.email, "(password)");
  console.log("  reviewer:", reviewer.email, "(password)");
  console.log("  admin:", admin.email, "(password)");
  console.log("  contract:", contract.id, "with", contract.rules.length, "rules");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
