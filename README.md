# ProofLoom

> **Brand governance that can show its work.**  
> A pre-publication review platform that checks content against a compiled, versioned **Brand Contract**. Every finding carries the rule it broke, the page that rule came from, and an intent-preserving fix the author can accept or refuse.

---

### **Hackathon Submission**
- **Event:** Inkloom AI Brand Governance Hackathon — Round 1
- **Team:** Tushar Shinde & Suyog Shelke
- **Repository:** [suyogshelke/ProofLoom](https://github.com/suyogshelke/ProofLoom)
- **Live Concept:** *Every finding carries its receipt.*

---

## 1. Problem & Context

For two decades, brand governance relied on centralisation: a 90-page PDF brand book, a digital asset management system, and a single brand manager reviewing collateral at 11pm. Three structural shifts broke that model irreversibly:
1. **Authorship Fragmented:** Marketers, agencies, sales enablement, regional teams, and freelancers publish daily without knowing the brand team.
2. **Volume Outran Review:** Hundreds of multi-channel assets launch weekly across web, email, social, decks, packaging, and paid ads.
3. **Machines Joined the Team:** Generative AI tools produce fluent, plausible, yet ungrounded copy at zero marginal cost. Errors arrive pre-polished.

Existing grammar checkers only catch generic typos, while brand portals and PDFs remain unread. **ProofLoom solves the trust asymmetry** by compiling brand guidelines, approved facts, terminology, and assets into an executable, versioned **Brand Contract**.

---

## 2. The Core Review Cascade

ProofLoom replaces opaque "AI prompts" with a strict **4-stage review cascade** where LLMs are strictly confined and hallucinated findings are rejected:

```
[ Incoming Content (Web, Email, Social, Deck, Packaging) ]
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1: Deterministic Pass (< 10ms)                   │
│ • Regex tokenizers, terminology & glossary rules       │
│ • Trademark symbols, banned words, acronym expansion   │
│ • WCAG 2.2 contrast math & heading hierarchy           │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Grounded Pass (< 25ms)                        │
│ • Numeric claims matched against Facts Ledger          │
│ • Validity window checks (detects expired/stale facts) │
│ • Successor links (e.g. supersedes 12,000 → 9,400)    │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Judged Pass (NVIDIA Nemotron / Gemini)        │
│ • Tone & voice drift evaluation                        │
│ • Channel-specific register checks                     │
│ • Pinned prompts with structured JSON output           │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Stage 4: Verifier Gate (Honesty Metric)                │
│ • DROPS any finding lacking a live Rule ID             │
│ • DROPS any finding whose span cannot be located       │
│ • Enforces: "No finding without a receipt"             │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
[ Verified Findings with Citations, Page Numbers & One-Click Fixes ]
```

---

## 3. Implemented Features

### 📜 1. The Brand Contract
- **Machine-Executable Rules:** Rules are first-class, versioned database objects specifying category, channel scope, severity, mode (`deterministic`, `grounded`, `judged`), and blocking status.
- **Page-Level Grounding:** Every rule contains exact document citations: `sourceDoc`, `sourcePage`, and `sourceQuote` from the brand book PDF.
- **Human Sign-Offs:** Cryptographic/timestamped digital sign-offs by brand owners required before a contract becomes active.

### 📊 2. Temporal Facts Ledger
- **Validity Windows:** Metric values, customer counts, certifications, and pricing carry `verifiedAt` and `expiresAt` timestamps.
- **Staleness Detection:** Content claiming expired statistics is flagged with a `MAJOR` violation.
- **Successor Value Linking:** Outdated numbers automatically suggest their verified successor (e.g., *"12,000 teams"* $\to$ *"9,400 teams"* based on the Q3 CRM ledger).

### 🔍 3. Finding Card with Complete Receipt
- **Exact Span Highlighting:** Zero generic advice; highlights the exact phrase in the source copy.
- **Citations:** Links to the exact rule ID and brand book page.
- **Intent-Preserving Fixes:** Generates minimal diff corrections without injecting new unsupported claims.
- **Human Decision Buttons:** Authors can **Accept**, **Edit**, **Waive** (with required audit justification), or **Escalate** to brand leadership.

### 🧠 4. Ambiguity Miner (`/ambiguity`)
- **Telemetry Disagreement Analysis:** Aggregates waiver and manual override rates from the `DecisionLog` to identify which brand guidelines confuse creators.
- **AI Clarification Synthesis:** Uses **NVIDIA Nemotron 30B Reasoning** to rewrite vague rules into precise, enforceable specifications.
- **One-Click Adoption:** Brand owners can review the AI draft, accept the clarification, increment the rule version, and update the live contract with an immutable audit record.

### 🌐 5. Channel & Market Profiles (`/channels`)
- **Multi-Channel Matrix:** Separate governance standards for Web, Email, Social, Decks, and Packaging.
- **Cross-Border Regulatory Elevation:** Automatically elevates rule severities in regulated jurisdictions:
  - **EU Market:** Enforces EU AI Act Article 50 transparency and European Accessibility Act (EAA) compliance.
  - **US / California:** Enforces CCPA consumer claim disclosures and FTC Green Guides standards.
  - **India & Middle East:** Validated against regional regulatory standards.

### 🎨 6. Visual Rules Inspector (`/visual`)
- **CIE $L^*a^*b^*$ Delta E ($\Delta E$) Color Meter:** Mathematical color distance calculation comparing asset hex colors to official Acme brand tokens. Evaluates whether color drift is imperceptible ($\Delta E < 2.0$), acceptable ($\Delta E < 5.0$), or an off-brand violation ($\Delta E \ge 5.0$).
- **Clear-Space Geometry Diagnostics:** Validates logo aspect ratios and mandatory minimum margins to prevent distortion or crowding.
- **Visual Receipts:** Outputs formal governance receipts (`VIS-COLOR-01`, `VIS-CLEARSPACE-02`) citing page 3 of the visual identity manual.

### 🔒 7. Immutable Audit Trail & Decision Log (`/audit`)
- Append-only log recording every submission, finding status change, waiver justification, and human signature with timestamp and actor ID.

---

## 4. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** + React 19 + TypeScript | High-performance server components and typed API route handlers in a unified deployable. |
| **Styling** | **Tailwind CSS v4** + Glassmorphism Tokens | Modern dark/light UI with responsive 3D card presentation and high accessibility contrast. |
| **Database** | **PostgreSQL 16** via Docker + **Prisma ORM 6** | Relational integrity for temporal ledgers, rule hierarchies, and append-only audit trails. |
| **AI / LLMs** | **NVIDIA NIM** (`nemotron-3-nano-omni-30b-a3b-reasoning`) & **Google Gemini** | Pinned temperature $0$ inference for judged rules and ambiguity mining with structured JSON schemas. |
| **Math & Color** | **CIE76 Color Distance** & Vector geometry | Precise, deterministic $\Delta E$ calculations without model hallucination. |
| **Auth** | Stateless **JWT Session Cookies** | Role-based permissions (`BRAND_OWNER`, `REVIEWER`, `CREATOR`, `ADMIN`). |

---

## 5. Getting Started

### Prerequisites
- **Node.js:** v20+ or v22+
- **Docker:** for local PostgreSQL container (or an external Postgres instance)

### 1. Clone the Repository
```bash
git clone https://github.com/suyogshelke/ProofLoom.git
cd ProofLoom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
DATABASE_URL="postgresql://proofloom:proofloom@localhost:5432/proofloom?schema=public"
JWT_SECRET="your-secure-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-nvidia-nim-key"
OPENAI_BASE_URL="https://integrate.api.nvidia.com/v1"
OPENAI_MODEL="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"
```

### 4. Start PostgreSQL (Docker)
```bash
docker run --name proofloom-db \
  -e POSTGRES_USER=proofloom \
  -e POSTGRES_PASSWORD=proofloom \
  -e POSTGRES_DB=proofloom \
  -p 5432:5432 -d postgres:16-alpine
```

### 5. Run Database Migrations & Seed
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed  # or: node --env-file=.env ./node_modules/tsx/dist/cli.mjs prisma/seed.ts
```

### 6. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Demo Accounts & Seed Data

All test accounts use the password: `password`

| Role | Email | Purpose & Permissions |
| :--- | :--- | :--- |
| **Brand Owner** | `brandowner@acme.com` | Manages rules, signs contracts, adopts Ambiguity Miner clarifications. |
| **Reviewer** | `reviewer@acme.com` | Reviews creator submissions, adjudicates findings, approves or waives. |
| **Creator** | `creator@acme.com` | Submits marketing copy, accepts proposed intent-preserving fixes. |
| **Admin** | `admin@acme.com` | Full governance administration and system auditing. |

---

## 7. Application Navigation

| Page / Route | Description |
| :--- | :--- |
| `/login` | 3D glassmorphism authentication with 1-click demo role sign-in buttons. |
| `/dashboard` | Role-tailored dashboards for creators, reviewers, and brand owners. |
| `/reviews/new` | Multi-channel pre-publication review intake with market scope selection. |
| `/reviews` | Review queue with live status chips and detailed Finding Cards. |
| `/contracts` | Active Brand Contract compiler and rule browser with citations. |
| `/facts` | Approved Facts Ledger with validity windows and successor links. |
| `/ambiguity` | Ambiguity Miner: human/machine disagreement telemetry & AI rule synthesis. |
| `/channels` | Channel & Market regulatory profiles and statutory penalty matrix. |
| `/visual` | Visual Rules Inspector: CIE $L^*a^*b^*$ Delta E ($\Delta E$) meter & clear-space checks. |
| `/audit` | Immutable decision log of every waiver, signature, and approval. |

---

## 8. Responsible AI & Compliance

- **No AI-Detector Scoring:** ProofLoom deliberately rejects statistical "AI percentage" detectors that discriminate against non-native writers.
- **Confined Model Boundary:** LLMs never decide or publish autonomously; they only propose structured candidate findings that must survive the Verifier Gate.
- **Zero Training on Customer Data:** Customer content is never used to train or fine-tune public models.
- **Regulatory Mapping:** Built to comply with **EU AI Act Article 50** transparency mandates and **WCAG 2.2 AA** accessibility standards.

---

## 9. Team & Authors

- **Tushar Shinde** — Architecture, Review Cascade & Contract Engine
- **Suyog Shelke** — Frontend Engineering, Ambiguity Miner & Visual Geometry

*Inkloom AI Brand Governance Hackathon — Round 1 Submission.*
