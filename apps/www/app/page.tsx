"use client";

import { CommandPanel } from "@/components/command-panel";
import { CompileMatrix } from "@/components/compile-matrix";
import { Commons } from "@/components/gallery";
import { LiveTerminal } from "@/components/live-terminal";
import { SignalField } from "@/components/signal-field";

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 tracking-tight">
      <svg
        width="15"
        height="15"
        viewBox="0 0 64 64"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
      >
        <title>agentreflex</title>
        <path d="M16 14 L40 32 L16 50" />
        <line x1="48" y1="13" x2="48" y2="51" strokeOpacity={0.4} />
      </svg>
      <span>
        <span className="text-[var(--color-faint)]">agent</span>
        <span className="font-semibold text-[var(--color-foreground)]">reflex</span>
      </span>
    </span>
  );
}

const GH = "https://github.com/agentreflex/agentreflex";
const DOCS = "https://docs.agentreflex.dev";

const STEPS = [
  {
    n: "01",
    title: "write",
    body: "An instinct in TypeScript, Python, or bash. No SDK, no deploy.",
    mono: "reflexes/your-reflex.ts",
  },
  {
    n: "02",
    title: "add",
    body: "Pull one into any project. It wires itself into every agent you use.",
    mono: "npx agentreflex add no-secrets",
  },
  {
    n: "03",
    title: "share",
    body: "Send it back — by URL, or a PR to the commons. Now it's everyone's.",
    mono: "arx add github:you/reflex",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/90 px-5 py-2.5 text-sm backdrop-blur-sm">
        <Wordmark />
        <span className="ar-label flex items-center gap-5">
          <a href="#commons" className="hover:text-[var(--color-foreground)]">
            commons
          </a>
          <a href={DOCS} className="hover:text-[var(--color-foreground)]">
            docs
          </a>
          <a href={GH} className="hover:text-[var(--color-foreground)]">
            ★ github
          </a>
        </span>
      </header>

      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <SignalField />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
          <div className="ar-label">the open reflex commons</div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.0] tracking-tight sm:text-6xl lg:text-7xl">
            Give your AI agents <span style={{ color: "var(--color-signal)" }}>reflexes.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
            Skills are what your agent <span className="text-[var(--color-foreground)]">can</span>{" "}
            do. Reflexes are how <span className="text-[var(--color-foreground)]">you&apos;d</span>{" "}
            do it.
          </p>

          <div className="mt-8">
            <CommandPanel />
            <a
              href={GH}
              className="ar-label mt-4 inline-block hover:text-[var(--color-foreground)]"
            >
              ★ star on github
            </a>
          </div>

          <div className="mt-12">
            <div className="ar-label mb-3">
              one reflex, compiled into every agent&apos;s native hook ↓
            </div>
            <CompileMatrix />
          </div>
        </div>
      </section>

      {/* ── it fires in the moment ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="ar-label">
              <span style={{ color: "var(--color-signal)" }}>01</span> &nbsp;in the moment
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Caught the instant before it runs.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
              Same reflexes, every agent. Switch tabs — the command runs through the hook either
              way.
            </p>
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex items-baseline gap-3">
                <dt style={{ color: "var(--color-signal)" }}>fired</dt>
                <dd className="text-[var(--color-muted)]">
                  the proactive move you&apos;d have made
                </dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt style={{ color: "var(--color-danger)" }}>blocked</dt>
                <dd className="text-[var(--color-muted)]">the mistake you&apos;d never make</dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt style={{ color: "var(--color-amber)" }}>paused</dt>
                <dd className="text-[var(--color-muted)]">the call only you should make</dd>
              </div>
            </dl>
          </div>

          <LiveTerminal />
        </div>
      </section>

      <Commons />

      {/* ── write & share ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="ar-label">
          <span style={{ color: "var(--color-signal)" }}>03</span> &nbsp;write &amp; share
        </div>
        <h2 className="mt-5 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          A reflex is a file you own.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
          Keep it in your repo. Hand it to your team. Or give it to everyone.
        </p>

        <div className="mt-8 grid gap-px overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3 bg-[var(--color-background)] p-6">
              <div className="ar-label flex items-center gap-2">
                <span style={{ color: "var(--color-signal)" }}>{s.n}</span>
                <span className="text-[var(--color-foreground)]">{s.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">{s.body}</p>
              <span className="mt-auto pt-2 font-mono text-[11px] text-[var(--color-faint)]">
                {s.mono}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── closing ── */}
      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Teach it once. <span style={{ color: "var(--color-signal)" }}>It never forgets.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
            Open source, MIT, and yours to extend. Bring your reflexes to every agent you code with.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <CommandPanel />
            <a href={GH} className="ar-label hover:text-[var(--color-foreground)]">
              ★ star on github
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
          <Wordmark />
          <span className="ar-label flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href={GH} className="hover:text-[var(--color-foreground)]">
              github
            </a>
            <a href={DOCS} className="hover:text-[var(--color-foreground)]">
              docs
            </a>
            <a href="#commons" className="hover:text-[var(--color-foreground)]">
              commons
            </a>
            <span>MIT</span>
          </span>
        </div>
      </footer>
    </>
  );
}
