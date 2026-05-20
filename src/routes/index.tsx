import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------- Floating icon (SVG) ---------- */

type Icon =
  | "shield"
  | "key"
  | "chain"
  | "id"
  | "check"
  | "dot"
  | "spark"
  | "wallet";

function FloatIcon({ kind, className = "" }: { kind: Icon; className?: string }) {
  const common = "drop-shadow-[0_8px_20px_rgba(33,28,120,0.18)]";
  const c = `${common} ${className}`;
  switch (kind) {
    case "shield":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <path
            d="M32 4 L56 14 V32 C56 46 44 56 32 60 C20 56 8 46 8 32 V14 Z"
            fill="#FF6B57"
          />
          <path d="M22 32 L29 39 L43 25" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <circle cx="22" cy="32" r="12" fill="#E9C46A" />
          <circle cx="22" cy="32" r="5" fill="#F5F1E6" />
          <rect x="32" y="29" width="26" height="6" fill="#E9C46A" />
          <rect x="50" y="29" width="4" height="10" fill="#E9C46A" />
          <rect x="56" y="29" width="4" height="8" fill="#E9C46A" />
        </svg>
      );
    case "chain":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <rect x="6" y="22" width="28" height="20" rx="10" fill="none" stroke="#3B82F6" strokeWidth="6" />
          <rect x="30" y="22" width="28" height="20" rx="10" fill="none" stroke="#3B82F6" strokeWidth="6" />
        </svg>
      );
    case "id":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <rect x="6" y="14" width="52" height="36" rx="6" fill="white" stroke="#211C78" strokeWidth="3" />
          <circle cx="20" cy="28" r="6" fill="#211C78" />
          <rect x="32" y="22" width="20" height="3" fill="#211C78" />
          <rect x="32" y="28" width="16" height="3" fill="#211C78" />
          <rect x="14" y="40" width="36" height="3" fill="#211C78" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <circle cx="32" cy="32" r="28" fill="#211C78" />
          <path d="M20 33 L29 42 L46 23" stroke="#F4EFE0" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <path d="M32 6 L36 28 L58 32 L36 36 L32 58 L28 36 L6 32 L28 28 Z" fill="#FFB85C" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 64 64" className={c}>
          <rect x="6" y="16" width="52" height="34" rx="6" fill="#211C78" />
          <rect x="36" y="28" width="22" height="10" rx="2" fill="#F4EFE0" />
          <circle cx="46" cy="33" r="3" fill="#211C78" />
        </svg>
      );
    case "dot":
    default:
      return <span className={`block size-2.5 rounded-full ${className}`} />;
  }
}

/* ---------- Page ---------- */

function Index() {
  return (
    <div className="min-h-screen bg-cream text-ink selection:bg-ink selection:text-cream">
      <Nav />
      <Hero />
      <Marquee />
      <SectionPeach />
      <SectionWhite />
      <SectionSky />
      <SectionHowItWorks />
      <SectionFeatures />
      <SectionPricing />
      <SectionCta />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <nav className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <span
          className="text-lg font-extrabold tracking-[0.25em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PROOFPASS
        </span>
        <div className="hidden items-center gap-9 text-sm font-semibold text-ink md:flex">
          <a href="#benefits" className="hover:opacity-60">Benefits</a>
          <a href="#security" className="hover:opacity-60">Security</a>
          <a href="#how" className="hover:opacity-60">Protocol</a>
          <a href="#pricing" className="hover:opacity-60">Pricing</a>
          <Link
            to="/docs"
            className="hover:opacity-60"
          >
            Docs
          </Link>
          <Link
            to="/onboarding"
            className="rounded-full bg-ink/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink/15"
          >
            Get verified
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <header className="relative overflow-hidden pt-32 pb-24">
      {/* Floating icons */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[8%] top-[24%] size-14 float" style={{ animationDelay: "0s" }}>
          <FloatIcon kind="shield" />
        </span>
        <span className="absolute left-[14%] top-[58%] size-12 float" style={{ animationDelay: "1.5s" }}>
          <FloatIcon kind="key" />
        </span>
        <span className="absolute right-[10%] top-[20%] size-14 float" style={{ animationDelay: "0.7s" }}>
          <FloatIcon kind="id" />
        </span>
        <span className="absolute right-[14%] top-[60%] size-12 float" style={{ animationDelay: "2.1s" }}>
          <FloatIcon kind="spark" />
        </span>
        <span className="absolute left-[22%] top-[36%] block size-2 rounded-full bg-ink pulse-dot" />
        <span className="absolute right-[22%] top-[44%] block size-2 rounded-full bg-tomato pulse-dot" style={{ animationDelay: "1s" }} />
        <span className="absolute left-[6%] top-[78%] block size-2 rounded-full bg-sun pulse-dot" style={{ animationDelay: "0.4s" }} />
        <span className="absolute right-[8%] top-[80%] block size-1.5 rounded-full bg-ink pulse-dot" style={{ animationDelay: "1.7s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          <span className="size-1.5 rounded-full bg-tomato pulse-dot" />
          Live on Polygon & Base
        </span>

        <h1
          className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.92] tracking-[-0.04em] md:text-8xl lg:text-[9.5rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Verify Once<span className="text-tomato">.</span>
          <br />
          Bank Anywhere<span className="text-tomato">.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-balance text-base text-ink/70 md:text-lg">
          The ZK-powered identity layer for neobanks. You own your KYC.
          Banks onboard you in seconds.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-cream shadow-[0_12px_30px_-12px_oklch(0.27_0.16_268)] transition-transform hover:-translate-y-0.5"
          >
            Get verified — free
          </Link>
          <a
            href="#how"
            className="rounded-full border border-ink/20 bg-white px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-ink hover:bg-ink/5"
          >
            API integration process
          </a>
        </div>

        {/* Floating ID card */}
        <div className="relative mx-auto mt-20 max-w-md">
          <div className="absolute inset-x-10 -bottom-6 h-12 rounded-full bg-ink/15 blur-2xl" />
          <NftCard />
        </div>
      </div>
    </header>
  );
}

function NftCard() {
  return (
    <div className="relative rounded-3xl bg-white p-6 text-left shadow-2xl ring-1 ring-ink/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
            ProofPass ID
          </div>
          <div
            className="mt-1 text-2xl font-extrabold tracking-tight text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Token #00821
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">
          <span className="size-1.5 rounded-full bg-mint" /> Soulbound
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Tile label="Tier" value="2 — Full" />
        <Tile label="Region" value="NG" />
        <Tile label="Expires" value="2027" mono />
      </div>

      <div className="mt-4 rounded-2xl bg-sky px-4 py-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60">
          ZK hash · name + DOB never stored
        </div>
        <div className="mt-1 truncate font-mono text-xs text-ink">
          zk:0x8f3a…2c91…abc4def9
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/50">
        {label}
      </div>
      <div className={`mt-0.5 text-sm font-bold text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

/* ---------- Marquee ---------- */

function Marquee() {
  const items = [
    "Zero-knowledge proofs",
    "Soulbound NFT",
    "One API call",
    "Works with any neobank",
    "GDPR · NDPR · FCA · FinCEN",
    "Sub-3s onboarding",
    "Zero data liability",
  ];
  const seq = [...items, ...items];
  return (
    <section className="border-y border-ink/10 bg-ink py-5 text-cream overflow-hidden">
      <div className="flex w-max marquee gap-12 whitespace-nowrap">
        {seq.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-12 text-sm font-bold uppercase tracking-[0.2em]"
          >
            {t}
            <span className="text-tomato">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------- Sectional bands ---------- */

function SectionPeach() {
  return (
    <section id="benefits" className="relative overflow-hidden bg-peach py-32">
      {/* float icons */}
      <span className="pointer-events-none absolute left-[10%] top-[18%] size-10 float"><FloatIcon kind="shield" /></span>
      <span className="pointer-events-none absolute right-[12%] top-[22%] size-12 float" style={{ animationDelay: "1.2s" }}><FloatIcon kind="wallet" /></span>
      <span className="pointer-events-none absolute left-[14%] bottom-[18%] size-10 float" style={{ animationDelay: "0.8s" }}><FloatIcon kind="key" /></span>
      <span className="pointer-events-none absolute right-[14%] bottom-[22%] size-12 float" style={{ animationDelay: "2s" }}><FloatIcon kind="id" /></span>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h2
          className="text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[6rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          It's Your Identity.
          <br />
          Stop Re-Verifying.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-ink/70 md:text-lg">
          One ZK proof, every neobank. No more passport scans, no more selfies, no more waiting days.
        </p>
      </div>
    </section>
  );
}

function SectionWhite() {
  const points = [
    ["No monthly fees,", "verification from $0.10"],
    ["Anonymous,", "no PII shared"],
    ["Onchain audit,", "every check logged"],
  ];
  return (
    <section className="bg-cream py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-3">
        {points.map(([a, b], i) => (
          <div key={i} className="flex gap-4">
            <span className="mt-2 size-2.5 shrink-0 rounded-full bg-ink" />
            <h3
              className="text-3xl font-extrabold leading-tight tracking-[-0.02em] md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {a}
              <br />
              <span className="text-ink/60">{b}</span>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionSky() {
  return (
    <section id="security" className="relative overflow-hidden bg-sky py-32">
      <span className="pointer-events-none absolute left-[16%] top-[20%] block size-2 rounded-full bg-ink pulse-dot" />
      <span className="pointer-events-none absolute right-[20%] bottom-[26%] size-10 float opacity-70"><FloatIcon kind="chain" /></span>
      <span className="pointer-events-none absolute left-[12%] bottom-[24%] size-8 float opacity-70" style={{ animationDelay: "1.4s" }}><FloatIcon kind="spark" /></span>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h2
          className="text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[6rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Security on
          <br />
          Your Terms.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-ink/70 md:text-lg">
          A 2-of-3 key vault. You hold one. Banks never touch your raw documents. Court orders are
          logged onchain — no silent surveillance, ever.
        </p>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-2">
          <Card
            kicker="Zero exposure"
            title="Proof without revelation"
            body="The bank API response is six fields. No name, no DOB, no document number. Math, not policy."
          />
          <Card
            kicker="Right to erasure"
            title="Delete and you're gone"
            body="Burn your key. The vault is permanently unrecoverable. GDPR & NDPR by construction."
          />
        </div>
      </div>
    </section>
  );
}

function Card({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-white p-7 ring-1 ring-ink/5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">{kicker}</div>
      <h3
        className="mt-2 text-2xl font-extrabold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{body}</p>
    </div>
  );
}

/* ---------- How it works ---------- */

const steps = [
  { n: "01", t: "Download any neobank app", b: "Tap \"Verify with ProofPass\" — that's the entry point.", tag: "User action" },
  { n: "02", t: "Connect your wallet", b: "We check for an existing KYC NFT. If you have one — instant access.", tag: "Onchain read" },
  { n: "03", t: "First time? Verify once.", b: "ID scan + liveness check. 3–5 minutes. Only ever done once.", tag: "Offchain KYC" },
  { n: "04", t: "Your soulbound NFT is minted", b: "A ZK proof is generated. The NFT is bound to your wallet. Raw data never touches chain.", tag: "ZK proof" },
  { n: "05", t: "You're onboarded — everywhere.", b: "Every neobank in the network now reads your proof. Future onboardings: instant.", tag: "Done ✓" },
];

function SectionHowItWorks() {
  return (
    <section id="how" className="bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <h2
            className="max-w-2xl text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How it works.
          </h2>
          <p className="max-w-sm text-ink/60">
            From first tap to onboarded — what every ProofPass user goes through, exactly once.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-3xl bg-white p-6 ring-1 ring-ink/5">
              <div
                className="text-5xl font-extrabold text-ink/15"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{s.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{s.b}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/70">
                {s.tag}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-cream hover:opacity-95"
          >
            Start your verification →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */

const features = [
  ["One-time verification", "Users verify once. Every future neobank reads the existing NFT — no repeat document submission, forever."],
  ["ZK selective disclosure", "Prove age, country, or tier without revealing the underlying data. Math-enforced, not policy."],
  ["Soulbound KYC NFT", "Non-transferable token on Polygon or Base. Only proof hashes inside. Revocable on fraud."],
  ["Drop-in neobank SDK", "React Native + Web. One button, one API call. Replace your KYC pipeline in an afternoon."],
  ["Network fraud signals", "Fraud caught on one bank revokes the NFT — locks the scammer out of every bank, instantly."],
  ["Multi-jurisdiction", "Correct KYC tier and rules per country. Nigeria (CBN/NDPR), EU (GDPR/eIDAS), UK (FCA), US (FinCEN)."],
];

function SectionFeatures() {
  return (
    <section className="bg-ink py-28 text-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h2
            className="max-w-2xl text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for banks.
            <br />
            <span className="text-cream/50">Designed for users.</span>
          </h2>
          <p className="max-w-sm text-cream/60">Six primitives. Everything else composes from them.</p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream/15 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([h, b], i) => (
            <div key={h} className="bg-ink p-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3
                className="mt-3 text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {h}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/65">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */

const pricing = [
  {
    name: "Starter",
    price: "$0.10",
    unit: "per API verification call",
    items: ["Wallet NFT check", "Tier + jurisdiction return", "Sanctions screening", "Up to 1k calls / month"],
    cta: "Start integrating",
    featured: false,
  },
  {
    name: "Growth",
    price: "$1.50",
    unit: "per new KYC issuance",
    items: ["Everything in Starter", "First-time verification flow", "SBT minting included", "ZK proof generation"],
    cta: "Get started",
    featured: true,
  },
  {
    name: "Network",
    price: "$500",
    unit: "per month — fraud signals",
    items: ["Cross-bank fraud signals", "Real-time revocation feed", "AML pattern alerts", "Unlimited API calls"],
    cta: "Contact sales",
    featured: false,
  },
];

function SectionPricing() {
  return (
    <section id="pricing" className="bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="mx-auto max-w-3xl text-center text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pay for what you use.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-center text-ink/65">
          No seats. No setup fees. Switch off any time.
        </p>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={
                "relative flex flex-col rounded-3xl p-9 " +
                (p.featured
                  ? "bg-ink text-cream ring-1 ring-ink shadow-2xl shadow-ink/20"
                  : "bg-white text-ink ring-1 ring-ink/5")
              }
            >
              {p.featured && (
                <span className="absolute -top-3 left-9 rounded-full bg-tomato px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-cream">
                  Most popular
                </span>
              )}
              <div
                className="text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {p.name}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className="text-6xl font-extrabold tracking-[-0.03em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.price}
                </span>
              </div>
              <div className={"mt-2 text-xs uppercase tracking-[0.15em] " + (p.featured ? "text-cream/60" : "text-ink/55")}>
                {p.unit}
              </div>
              <ul className={"my-10 space-y-3.5 " + (p.featured ? "text-cream/85" : "text-ink/80")}>
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3 text-sm">
                    <span className={p.featured ? "text-tomato" : "text-ink"}>✓</span>
                    {it}
                  </li>
                ))}
              </ul>
              <button
                className={
                  "mt-auto rounded-full py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-90 " +
                  (p.featured ? "bg-cream text-ink" : "bg-ink text-cream")
                }
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function SectionCta() {
  return (
    <section className="relative overflow-hidden bg-peach py-32 text-center">
      <span className="pointer-events-none absolute left-[12%] top-[24%] size-12 float"><FloatIcon kind="check" /></span>
      <span className="pointer-events-none absolute right-[16%] top-[20%] size-12 float" style={{ animationDelay: "1.2s" }}><FloatIcon kind="shield" /></span>
      <span className="pointer-events-none absolute left-[18%] bottom-[24%] size-10 float" style={{ animationDelay: "0.6s" }}><FloatIcon kind="key" /></span>
      <span className="pointer-events-none absolute right-[10%] bottom-[18%] size-12 float" style={{ animationDelay: "1.8s" }}><FloatIcon kind="wallet" /></span>

      <div className="relative mx-auto max-w-3xl px-6">
        <h2
          className="text-balance text-6xl font-extrabold leading-[0.92] tracking-[-0.04em] md:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Verify once.
          <br />
          You're done<span className="text-tomato">.</span>
        </h2>
        <div className="mt-10">
          <Link
            to="/onboarding"
            className="inline-flex rounded-full bg-ink px-9 py-5 text-sm font-bold uppercase tracking-[0.14em] text-cream shadow-2xl shadow-ink/20 hover:-translate-y-0.5 transition-transform"
          >
            Get verified now
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <span
          className="text-base font-extrabold tracking-[0.25em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PROOFPASS
        </span>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
          © 2026 ProofPass Protocol · Sovereign identity infrastructure
        </div>
        <div className="flex gap-6 text-sm text-ink/65">
          <Link to="/docs" className="hover:text-ink">Docs</Link>
          <a href="#" className="hover:text-ink">Legal</a>
          <a href="#" className="hover:text-ink">Status</a>
        </div>
      </div>
    </footer>
  );
}
