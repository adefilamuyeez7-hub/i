import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get verified — ProofPass" },
      { name: "description", content: "Verify your identity once. Use it across every neobank in the ProofPass network." },
    ],
  }),
  component: Onboarding,
});

/* -------- Step model -------- */

type Step = {
  id: string;
  group: "Personal information" | "Identity verification" | "Address verification" | "Wallet & security" | "Done";
  title: string;
  subtitle?: string;
};

const STEPS: Step[] = [
  { id: "account", group: "Personal information", title: "Create your ProofPass account", subtitle: "Choose how you'd like to verify. You can switch later." },
  { id: "email", group: "Personal information", title: "Please confirm the validity of your email address", subtitle: "We'll send a verification link." },
  { id: "email-sent", group: "Personal information", title: "Check your email for a verification link", subtitle: "Didn't receive the email? Please check your spam folder or resend the link." },
  { id: "password", group: "Personal information", title: "Create a password", subtitle: "This will lock your encrypted vault. We can't recover it for you." },

  { id: "identity-doc", group: "Identity verification", title: "Verify your identity", subtitle: "Select the document type you'd like to use." },
  { id: "identity-upload", group: "Identity verification", title: "Upload a clear photo of your document", subtitle: "Both sides if your ID is two-sided." },
  { id: "identity-selfie", group: "Identity verification", title: "Confirm your address", subtitle: "Liveness check — a 3-second video, no instructions needed." },

  { id: "address", group: "Address verification", title: "Residential address", subtitle: "We need this for jurisdiction-aware tier assignment." },
  { id: "address-proof", group: "Address verification", title: "Confirm your address", subtitle: "Upload a utility bill, bank statement, or payroll check from the last 3 months." },

  { id: "2fa-qr", group: "Wallet & security", title: "Scan QR code", subtitle: "Use Google Authenticator or any 2FA app. Backup the secret key on the next step." },
  { id: "2fa-backup", group: "Wallet & security", title: "Backup secret key", subtitle: "This lets you recover 2FA if you lose or change your phone." },

  { id: "done", group: "Done", title: "You're almost here!", subtitle: "Your soulbound NFT is being minted." },
];

const GROUPS = ["Personal information", "Identity verification", "Address verification", "Wallet & security"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [closing, setClosing] = useState(false);
  const [userId] = useState(() => localStorage.getItem("userId") || `user_${Date.now()}`);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accountType: "personal",
    identityDoc: "passport",
    address: "",
    country: "",
  });

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  const step = STEPS[i];
  const progress = useMemo(() => ((i + 1) / STEPS.length) * 100, [i]);

  const next = () => setI((v) => Math.min(STEPS.length - 1, v + 1));
  const prev = () => setI((v) => Math.max(0, v - 1));

  const saveAndFinish = async () => {
    try {
      const userData = {
        id: userId,
        email: formData.email || `user_${userId}@proofpass.io`,
        accountType: formData.accountType,
        status: "Complete",
        tier: "Tier 2 — Full",
        region: "Nigeria (NG)",
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        token: `Token #${Math.floor(Math.random() * 100000)}`,
        walletAddress: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
        dataMetrics: {
          timesViewed: 0,
          timesShared: 0,
          timesVerified: 1,
        },
      };
      
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate({ to: "/dashboard" });
      } else {
        console.error("API error:", data);
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      console.error("Failed to save user data:", error);
      navigate({ to: "/dashboard" });
    }
  };

  const groupStatus = (g: string): "done" | "current" | "todo" => {
    const currentGroupIndex = GROUPS.indexOf(step.group as (typeof GROUPS)[number]);
    const idx = GROUPS.indexOf(g as (typeof GROUPS)[number]);
    if (idx < currentGroupIndex) return "done";
    if (idx === currentGroupIndex) return "current";
    return "todo";
  };

  if (closing) {
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-sky">
      {/* Top progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-ink/10">
        <div
          className="h-full bg-ink transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pt-8 pb-10 md:pt-14">
        {/* Top group tabs */}
        <div className="hidden items-center justify-between gap-4 px-2 md:flex">
          {GROUPS.map((g) => {
            const st = groupStatus(g);
            return (
              <div key={g} className="flex flex-1 items-center gap-2">
                <span
                  className={
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-bold " +
                    (st === "done"
                      ? "bg-ink text-cream"
                      : st === "current"
                        ? "bg-ink text-cream"
                        : "bg-ink/10 text-ink/40")
                  }
                >
                  {st === "done" ? "✓" : ""}
                </span>
                <span
                  className={
                    "text-xs font-semibold " +
                    (st === "todo" ? "text-ink/40" : "text-ink")
                  }
                >
                  {g}
                </span>
                <span
                  className={
                    "ml-2 h-px flex-1 " +
                    (st === "done" ? "bg-ink" : "bg-ink/15")
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="relative mx-auto mt-6 grid w-full flex-1 grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl shadow-ink/10 ring-1 ring-ink/5 md:mt-10 md:grid-cols-[300px_1fr]">
          {/* Close */}
          <button
            onClick={() => setClosing(true)}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 flex size-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Left rail */}
          <aside className="hidden flex-col justify-between border-r border-ink/10 bg-cream/40 p-8 md:flex">
            <div>
              <Link
                to="/"
                className="text-xs font-extrabold uppercase tracking-[0.25em] text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                PROOFPASS
              </Link>
              <div className="mt-10 space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
                  Step {i + 1} / {STEPS.length}
                </div>
                <div className="text-sm font-semibold text-ink">{step.group}</div>
              </div>

              <ul className="mt-10 space-y-3">
                {STEPS.map((s, idx) => {
                  const state =
                    idx < i ? "done" : idx === i ? "current" : "todo";
                  return (
                    <li key={s.id} className="flex items-start gap-3">
                      <span
                        className={
                          "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold " +
                          (state === "done"
                            ? "bg-ink text-cream"
                            : state === "current"
                              ? "ring-2 ring-ink bg-white"
                              : "bg-ink/10")
                        }
                      >
                        {state === "done" ? "✓" : ""}
                      </span>
                      <span
                        className={
                          "text-xs leading-tight " +
                          (state === "todo"
                            ? "text-ink/40"
                            : state === "current"
                              ? "font-semibold text-ink"
                              : "text-ink/70")
                        }
                      >
                        {shortLabel(s)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/5">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/50">
                Encrypted end-to-end
              </div>
              <p className="mt-1 text-xs text-ink/70">
                Documents are encrypted in your browser before upload. We never see the plaintext.
              </p>
            </div>
          </aside>

          {/* Right content */}
          <main className="flex flex-col p-8 md:p-12">
            <header className="mb-8 max-w-xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 md:hidden">
                Step {i + 1} / {STEPS.length} · {step.group}
              </div>
              <h1
                className="mt-2 text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h1>
              {step.subtitle && (
                <p className="mt-3 text-sm text-ink/65 md:text-base">{step.subtitle}</p>
              )}
            </header>

            <div className="max-w-2xl flex-1">
              <StepBody step={step.id} />
            </div>

            <footer className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
              <button
                onClick={prev}
                disabled={i === 0}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink/60 hover:text-ink disabled:opacity-30"
              >
                Previous
              </button>
              {i === STEPS.length - 1 ? (
                <button
                  onClick={saveAndFinish}
                  className="rounded-full bg-ink px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-cream hover:opacity-90"
                >
                  Finish ✓
                </button>
              ) : (
                <button
                  onClick={next}
                  className="rounded-full bg-ink px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-cream hover:opacity-90"
                >
                  {nextLabel(step.id)}
                </button>
              )}
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

function shortLabel(s: Step): string {
  switch (s.id) {
    case "account": return "Account type";
    case "email": return "Email address";
    case "email-sent": return "Verify email";
    case "password": return "Create password";
    case "identity-doc": return "Select document";
    case "identity-upload": return "Upload document";
    case "identity-selfie": return "Liveness check";
    case "address": return "Residential address";
    case "address-proof": return "Proof of address";
    case "2fa-qr": return "Scan 2FA QR";
    case "2fa-backup": return "Backup secret key";
    case "done": return "ProofPass minted";
  }
  return s.title;
}

function nextLabel(id: string): string {
  if (id === "email") return "Send link";
  if (id === "email-sent") return "Resend email";
  if (id === "2fa-qr") return "Next step";
  return "Continue";
}

/* -------- Step bodies -------- */

function StepBody({ step }: { step: string }) {
  switch (step) {
    case "account":
      return <AccountStep />;
    case "email":
      return (
        <Form>
          <Label>Email address</Label>
          <Input type="email" placeholder="danyjones@email.com" />
          <Hint>We need your email for security reasons and to keep technical communication.</Hint>
        </Form>
      );
    case "email-sent":
      return (
        <div className="space-y-5">
          <div className="rounded-2xl bg-cream/60 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">Verification link sent to</div>
            <div className="mt-1 font-semibold">danyjones@email.com</div>
          </div>
          <Hint>Didn't receive the email? Please check your spam folder or resend the link.</Hint>
        </div>
      );
    case "password":
      return (
        <div className="grid gap-8 md:grid-cols-[1fr_240px]">
          <Form>
            <Label>Your password</Label>
            <Input type="password" placeholder="Write your password" />
            <Label className="mt-5">Confirm password</Label>
            <Input type="password" placeholder="Re-enter your password" />
          </Form>
          <RuleBox
            title="Password recommendations"
            rules={[
              "Minimum 12 characters",
              "Maximum 32 characters",
              "At least 1 lowercase letter (a–z)",
              "At least 1 uppercase letter (A–Z)",
              "At least 1 number (0–9)",
              "At least 1 symbol (!@#&...)",
            ]}
          />
        </div>
      );
    case "identity-doc":
      return (
        <Form>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Select document type" value="Local Passport" />
            <SelectField label="Government & Country" value="United States" />
          </div>
          <div className="mt-6 rounded-2xl bg-cream/60 p-5 text-sm">
            <div className="font-semibold">The document must confirm</div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-ink/70">
              <span>Full name</span><span className="text-ink">Davy Jones</span>
              <span>Residence</span><span className="text-ink">United States</span>
              <span>Date of birth</span><span className="text-ink">Jan 12, 1976</span>
            </div>
            <a className="mt-3 inline-block text-xs font-semibold text-ink underline">Made mistake? Edit details</a>
          </div>
        </Form>
      );
    case "identity-upload":
      return (
        <div className="grid gap-8 md:grid-cols-[1fr_260px]">
          <Dropzone label="Drag file here to upload or" cta="choose file" />
          <RuleBox
            title="Image requirements"
            rules={[
              "File size: up to 3MB",
              "Colorful, clear and readable file",
              "BMP, JPG, JPEG or PNG format",
            ]}
            footer="Tips for taking pictures"
          />
        </div>
      );
    case "identity-selfie":
      return (
        <div className="grid gap-8 md:grid-cols-[1fr_260px]">
          <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-cream/40 text-sm text-ink/50">
            Tap to start the 3-second liveness check
          </div>
          <RuleBox
            title="Liveness tips"
            rules={[
              "Good lighting, no backlight",
              "Remove sunglasses & hats",
              "Look directly at the camera",
              "Hold steady for 3 seconds",
            ]}
          />
        </div>
      );
    case "address":
      return (
        <Form>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Country of residence" value="United States" />
            <SelectField label="State / province" value="California" />
            <Field label="City"><Input placeholder="Enter city" /></Field>
            <Field label="ZIP / postal code"><Input placeholder="Enter code" /></Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <Input placeholder="Your usual address of living" />
              </Field>
            </div>
          </div>
          <Hint>For regulatory reasons, this information cannot be fully verified.</Hint>
        </Form>
      );
    case "address-proof":
      return (
        <Form>
          <SelectField label="Select document type" value="Cell phone bill" />
          <Dropzone label="Drag file here to upload or" cta="choose file" />
        </Form>
      );
    case "2fa-qr":
      return (
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="flex items-center gap-5">
            <div className="size-44 shrink-0 rounded-2xl bg-cream/60 p-3 ring-1 ring-ink/10">
              <QrPattern />
            </div>
            <div>
              <div className="font-mono text-xs text-ink/70">Backup code</div>
              <code className="mt-1 inline-block rounded-lg bg-cream/70 px-3 py-2 font-mono text-sm">
                JKJB435OI5O32
              </code>
              <Hint className="mt-3">
                If you have any problems with scanning, you can enter manually into the app.
              </Hint>
            </div>
          </div>
          <RuleBox
            title="Two-factor steps"
            rules={[
              "Download app",
              "Backup secret key",
              "Scan QR code",
              "Enable 2FA",
            ]}
          />
        </div>
      );
    case "2fa-backup":
      return (
        <Form>
          <Label>Backup secret key</Label>
          <Input value="JKJB435OI5O32" readOnly className="font-mono" />
          <Hint>
            This key will allow you to recover your authenticator if you lose, damage, or change your phone.
          </Hint>
          <label className="mt-5 inline-flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" defaultChecked className="size-4 accent-[oklch(0.27_0.16_268)]" />
            I have saved the 16-digit secret key.
          </label>
        </Form>
      );
    case "done":
      return (
        <div className="rounded-3xl bg-cream/50 p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-ink text-cream text-2xl">
            ✓
          </div>
          <h3
            className="mt-5 text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Congratulations!
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/65">
            Your soulbound KYC NFT has been minted to your wallet. Every ProofPass-enabled neobank
            can now onboard you in under three seconds.
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-xs text-ink ring-1 ring-ink/10">
            Token #00821 · Tier 2 · Polygon
          </div>
        </div>
      );
  }
  return null;
}

/* -------- Atoms -------- */

function Form({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={"block text-xs font-semibold uppercase tracking-[0.12em] text-ink/60 " + className}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink focus:ring-2 focus:ring-ink/15 " +
        className
      }
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
        <span>{value}</span>
        <svg viewBox="0 0 24 24" className="size-4 text-ink/50" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function Hint({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={"mt-3 text-xs text-ink/55 " + className}>{children}</p>;
}

function Dropzone({ label, cta }: { label: string; cta: string }) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-cream/40 px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-ink/10">
        <svg viewBox="0 0 24 24" className="size-5 text-ink/60" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-ink/70">
        {label}{" "}
        <a className="font-semibold text-ink underline">{cta}</a>
      </p>
    </div>
  );
}

function RuleBox({
  title,
  rules,
  footer,
}: {
  title: string;
  rules: string[];
  footer?: string;
}) {
  return (
    <div className="rounded-2xl bg-cream/50 p-5 text-sm">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-ink/60">{title}</div>
      <ul className="mt-3 space-y-2">
        {rules.map((r) => (
          <li key={r} className="flex gap-2 text-ink/75">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ink/40" />
            {r}
          </li>
        ))}
      </ul>
      {footer && <a className="mt-4 inline-block text-xs font-semibold text-ink underline">{footer}</a>}
    </div>
  );
}

function AccountStep() {
  const [pick, setPick] = useState<"personal" | "business">("personal");
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        {([
          { id: "personal", title: "Personal account", body: "Verify yourself as an individual user." },
          { id: "business", title: "Business account", body: "Verify directors and the entity together." },
        ] as const).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPick(opt.id)}
            className={
              "relative flex flex-col items-start gap-2 rounded-2xl p-5 text-left transition-colors " +
              (pick === opt.id
                ? "bg-cream/70 ring-2 ring-ink"
                : "bg-cream/30 ring-1 ring-ink/10 hover:bg-cream/50")
            }
          >
            <span
              className={
                "flex size-5 items-center justify-center rounded-full " +
                (pick === opt.id ? "bg-ink text-cream" : "ring-1 ring-ink/30")
              }
            >
              {pick === opt.id ? (
                <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            <div className="font-semibold">{opt.title}</div>
            <div className="text-xs text-ink/60">{opt.body}</div>
          </button>
        ))}
      </div>

      <Form>
        <Label>Email address</Label>
        <Input type="email" placeholder="Enter your email" />
        <Label className="mt-5">Create a username</Label>
        <Input placeholder="Must be at least 6 characters" />
      </Form>

      <label className="flex items-start gap-2 text-xs text-ink/65">
        <input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-[oklch(0.27_0.16_268)]" />
        I accept the <a className="underline">Terms of Service</a> and <a className="underline">Privacy Policy</a>.
      </label>
    </div>
  );
}

function QrPattern() {
  // Decorative QR-like grid (not a real code)
  const cells = Array.from({ length: 100 }).map((_, i) => i);
  return (
    <div className="grid h-full w-full grid-cols-10 gap-[2px]">
      {cells.map((i) => {
        const x = i % 10;
        const y = Math.floor(i / 10);
        const corner =
          (x < 3 && y < 3) || (x > 6 && y < 3) || (x < 3 && y > 6);
        const fill = corner ? true : (i * 7) % 3 === 0;
        return (
          <span
            key={i}
            className={"rounded-[1px] " + (fill ? "bg-ink" : "bg-transparent")}
          />
        );
      })}
    </div>
  );
}
