import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — ProofPass" },
      { name: "description", content: "Complete ProofPass documentation for users and developers." },
    ],
  }),
  component: Docs,
});

function Docs() {
  const [expandedSection, setExpandedSection] = useState<string | null>("getting-started");

  const docs = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🚀",
      items: [
        { name: "User Dashboard Login", desc: "How to access your verification dashboard", url: "https://github.com/Adefila-op/i/blob/main/USER_DASHBOARD_LOGIN.md" },
        { name: "Onboarding Guide", desc: "Step-by-step verification process", url: "https://github.com/Adefila-op/i/blob/main/DEPLOYMENT_COMPLETE.md" },
        { name: "Quick Start", desc: "Get verified in 5 minutes", url: "https://github.com/Adefila-op/i/blob/main/NEOBANK_QUICK_START.md" },
      ],
    },
    {
      id: "integration",
      title: "API Integration",
      icon: "⚙️",
      items: [
        { name: "Integration Guide", desc: "How to integrate ProofPass into your neobank", url: "https://github.com/Adefila-op/i/blob/main/API_INTEGRATION_GUIDE.md" },
        { name: "View-Only API", desc: "Query verification data without storing it", url: "https://github.com/Adefila-op/i/blob/main/VIEW_ONLY_API.md" },
        { name: "Neobank Integration", desc: "Complete neobank setup and best practices", url: "https://github.com/Adefila-op/i/blob/main/NEOBANK_INTEGRATION.md" },
        { name: "Flow Diagrams", desc: "Visual API flow and architecture", url: "https://github.com/Adefila-op/i/blob/main/API_FLOW_DIAGRAMS.md" },
      ],
    },
    {
      id: "technical",
      title: "Technical Docs",
      icon: "🔧",
      items: [
        { name: "Data Architecture", desc: "How ProofPass stores and manages data", url: "https://github.com/Adefila-op/i/blob/main/DATA_ARCHITECTURE.md" },
        { name: "API Audit", desc: "Complete API endpoint reference and testing", url: "https://github.com/Adefila-op/i/blob/main/API_AUDIT.md" },
        { name: "Advanced Features", desc: "ZK proofs, blockchain, and security details", url: "https://github.com/Adefila-op/i/blob/main/ADVANCED_FEATURES.md" },
      ],
    },
    {
      id: "your-question",
      title: "Your Question Answered",
      icon: "❓",
      items: [
        { name: "View-Only API Explained", desc: "Complete answer: How neobanks see data without storing it", url: "https://github.com/Adefila-op/i/blob/main/ANSWER_YOUR_QUESTION.md" },
        { name: "View-Only Details", desc: "Implementation guide and code examples", url: "https://github.com/Adefila-op/i/blob/main/VIEW_ONLY_DETAILED.md" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/"
                className="text-lg font-extrabold tracking-[0.25em] text-ink hover:opacity-70"
                style={{ fontFamily: "var(--font-display)" }}
              >
                PROOFPASS
              </Link>
              <h1 className="mt-2 text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                Documentation
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                Complete guides for users and developers
              </p>
            </div>
            <Link
              to="/"
              className="text-sm font-semibold text-ink/60 hover:text-ink"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-6 ring-1 ring-ink/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink/60 mb-4">
                Documentation
              </h3>
              <nav className="space-y-2">
                {docs.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      expandedSection === section.id
                        ? "bg-ink text-cream"
                        : "text-ink hover:bg-cream"
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {docs.map((section) => (
              <div key={section.id} className="rounded-2xl bg-white p-8 ring-1 ring-ink/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-ink/10 p-4 hover:border-ink/30 hover:bg-cream transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-ink hover:text-ink/70">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-ink/60">
                            {item.desc}
                          </p>
                        </div>
                        <span className="text-xl ml-4 flex-shrink-0">→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Links */}
            <div className="rounded-2xl bg-peach p-8">
              <h3 className="text-xl font-bold mb-4">Quick Navigation</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  to="/onboarding"
                  className="block rounded-xl bg-ink px-6 py-4 text-center font-bold text-cream hover:opacity-90 transition-opacity"
                >
                  Get Verified Now →
                </Link>
                <a
                  href="https://github.com/Adefila-op/i"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border-2 border-ink px-6 py-4 text-center font-bold text-ink hover:bg-ink/5 transition-colors"
                >
                  View on GitHub →
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl bg-white p-8 ring-1 ring-ink/5">
              <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="border-b border-ink/10 pb-4">
                  <h4 className="font-semibold text-ink mb-2">How do I access my dashboard?</h4>
                  <p className="text-sm text-ink/60">
                    Visit <code className="bg-cream px-2 py-1 rounded">/dashboard</code> after completing verification. See the{" "}
                    <a href="https://github.com/Adefila-op/i/blob/main/USER_DASHBOARD_LOGIN.md" target="_blank" rel="noopener noreferrer" className="text-ink hover:opacity-60 underline">
                      Dashboard Login Guide
                    </a>{" "}
                    for details.
                  </p>
                </div>
                <div className="border-b border-ink/10 pb-4">
                  <h4 className="font-semibold text-ink mb-2">What data does ProofPass store?</h4>
                  <p className="text-sm text-ink/60">
                    Only your ZK proof and verification status. ID photos and biometric data are encrypted and auto-deleted after 30 days. Learn more in{" "}
                    <a href="https://github.com/Adefila-op/i/blob/main/DATA_ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" className="text-ink hover:opacity-60 underline">
                      Data Architecture
                    </a>
                    .
                  </p>
                </div>
                <div className="border-b border-ink/10 pb-4">
                  <h4 className="font-semibold text-ink mb-2">How do banks use the View-Only API?</h4>
                  <p className="text-sm text-ink/60">
                    Banks call our API to verify your data without storing it. Read our{" "}
                    <a href="https://github.com/Adefila-op/i/blob/main/ANSWER_YOUR_QUESTION.md" target="_blank" rel="noopener noreferrer" className="text-ink hover:opacity-60 underline">
                      complete answer
                    </a>{" "}
                    about this architecture.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-2">Can I export my data?</h4>
                  <p className="text-sm text-ink/60">
                    Yes. From your dashboard, click "Export Data" to download your complete profile. All exports are encrypted and comply with GDPR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-white mt-20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <span
              className="text-base font-extrabold tracking-[0.25em] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PROOFPASS
            </span>
            <div className="flex gap-6 text-sm text-ink/65">
              <a href="https://github.com/Adefila-op/i" target="_blank" rel="noopener noreferrer" className="hover:text-ink">GitHub</a>
              <a href="#" className="hover:text-ink">Legal</a>
              <a href="#" className="hover:text-ink">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
