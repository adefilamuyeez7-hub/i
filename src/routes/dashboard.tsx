import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — ProofPass" },
      { name: "description", content: "View your ProofPass verification status and data usage." },
    ],
  }),
  component: Dashboard,
});

/* ---------- Dashboard Component ---------- */

function Dashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"overview" | "data" | "activity">("overview");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/users?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fallback data if not found or loading
  const displayData = userData || {
    verificationStatus: "Complete",
    tier: "Tier 2 — Full",
    token: "Token #00821",
    walletAddress: "0x8f3a...2c91...abc4def9",
    region: "Nigeria (NG)",
    expiresAt: "2027",
    verifiedAt: "May 15, 2026",
  };

  const dataMetrics = displayData?.dataMetrics || {
    timesViewed: 247,
    timesShared: 18,
    timesVerified: 5,
    lastViewedBy: "Flutterwave (May 20, 2026)",
    activeConnections: 3,
    allBanks: ["Flutterwave", "Stripe", "Opay"],
  };

  const activityLog = [
    { date: "May 20, 2026", action: "Verification data viewed", bank: "Flutterwave", status: "Success" },
    { date: "May 18, 2026", action: "KYC shared", bank: "Opay", status: "Success" },
    { date: "May 15, 2026", action: "Account verified", bank: "ProofPass", status: "Success" },
    { date: "May 14, 2026", action: "Identity uploaded", bank: "ProofPass", status: "Success" },
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
                Your Dashboard
              </h1>
            </div>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-sm font-semibold text-ink/60 hover:text-ink"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Status Card */}
        <div className="mb-12 rounded-3xl bg-white p-9 ring-1 ring-ink/5 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/60">
                Verification Status
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/70">Status</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-sm font-semibold text-ink">
                    <span className="size-2 rounded-full bg-mint animate-pulse" /> {displayData.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/70">Tier</span>
                  <span className="font-semibold text-ink">{displayData.tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/70">Region</span>
                  <span className="font-semibold text-ink">{displayData.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink/70">Expires</span>
                  <span className="font-semibold text-ink">{displayData.expiresAt}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-sky px-6 py-8">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/60">
                Your Soulbound NFT
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-white p-3">
                  <div className="font-mono text-[9px] text-ink/50 uppercase tracking-wide">Token ID</div>
                  <div className="mt-1 font-semibold text-ink">{displayData.token}</div>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="font-mono text-[9px] text-ink/50 uppercase tracking-wide">Wallet Address</div>
                  <div className="mt-1 font-mono text-xs text-ink">{displayData.walletAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-ink/10">
          {["overview", "data", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`pb-4 px-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                selectedTab === tab
                  ? "border-b-2 border-ink text-ink"
                  : "text-ink/50 hover:text-ink/70"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "data" && "Data Usage"}
              {tab === "activity" && "Activity"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Data Viewed Card */}
            <div className="rounded-3xl bg-white p-8 ring-1 ring-ink/5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                Data Visibility
              </div>
              <div className="mt-6">
                <div className="text-4xl font-extrabold text-ink">{dataMetrics.timesViewed}</div>
                <div className="mt-2 text-sm text-ink/70">times your data has been viewed</div>
                <div className="mt-4 rounded-lg bg-cream/40 px-3 py-2 text-xs text-ink/60">
                  Last viewed by {dataMetrics.lastViewedBy}
                </div>
              </div>
            </div>

            {/* Data Shared Card */}
            <div className="rounded-3xl bg-white p-8 ring-1 ring-ink/5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                Data Shared
              </div>
              <div className="mt-6">
                <div className="text-4xl font-extrabold text-ink">{dataMetrics.timesShared}</div>
                <div className="mt-2 text-sm text-ink/70">times data has been shared</div>
                <div className="mt-4 rounded-lg bg-cream/40 px-3 py-2 text-xs text-ink/60">
                  Across {dataMetrics.activeConnections} active banks
                </div>
              </div>
            </div>

            {/* Verifications Card */}
            <div className="rounded-3xl bg-white p-8 ring-1 ring-ink/5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                Total Verifications
              </div>
              <div className="mt-6">
                <div className="text-4xl font-extrabold text-ink">{dataMetrics.timesVerified}</div>
                <div className="mt-2 text-sm text-ink/70">successful verifications</div>
                <div className="mt-4 rounded-lg bg-cream/40 px-3 py-2 text-xs text-ink/60">
                  One-time verification used {dataMetrics.timesVerified} times
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "data" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 ring-1 ring-ink/5">
              <h3 className="text-lg font-bold text-ink">Data Availability</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-ink/10 p-4">
                  <div>
                    <div className="font-semibold text-ink">Identity Information</div>
                    <div className="text-sm text-ink/60">Verified and available</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-sm font-semibold text-ink">
                    <span className="size-2 rounded-full bg-mint" /> Available
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-ink/10 p-4">
                  <div>
                    <div className="font-semibold text-ink">Address Verification</div>
                    <div className="text-sm text-ink/60">Confirmed and active</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-sm font-semibold text-ink">
                    <span className="size-2 rounded-full bg-mint" /> Available
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-ink/10 p-4">
                  <div>
                    <div className="font-semibold text-ink">2FA Security</div>
                    <div className="text-sm text-ink/60">Active and verified</div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-sm font-semibold text-ink">
                    <span className="size-2 rounded-full bg-mint" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 ring-1 ring-ink/5">
              <h3 className="text-lg font-bold text-ink">Connected Banks</h3>
              <div className="mt-6 grid gap-4">
                {dataMetrics.allBanks.map((bank) => (
                  <div key={bank} className="flex items-center justify-between rounded-lg border border-ink/10 p-4">
                    <div className="font-semibold text-ink">{bank}</div>
                    <span className="text-xs font-mono text-ink/60">Connected</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === "activity" && (
          <div className="rounded-3xl bg-white ring-1 ring-ink/5 overflow-hidden">
            <div className="p-8 border-b border-ink/10">
              <h3 className="text-lg font-bold text-ink">Activity Log</h3>
            </div>
            <div className="divide-y divide-ink/10">
              {activityLog.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-cream/40">
                  <div>
                    <div className="font-semibold text-ink">{entry.action}</div>
                    <div className="mt-1 text-sm text-ink/60">{entry.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink/70">{entry.bank}</div>
                      <div className="mt-1 text-xs font-mono text-ink/50">{entry.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-ink p-12 text-center text-cream">
          <h3
            className="text-3xl font-extrabold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to Share Your Verification?
          </h3>
          <p className="mx-auto mt-4 max-w-md text-cream/80">
            Use your ProofPass identity to verify with any new neobank. It's instant.
          </p>
          <button className="mt-8 rounded-full bg-cream px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] text-ink hover:bg-cream/90">
            Share Verification
          </button>
        </div>
      </div>
    </div>
  );
}
