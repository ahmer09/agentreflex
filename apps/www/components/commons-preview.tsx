"use client";

import { useRef, useState } from "react";
import { rippleFrom } from "./signal-field";

type Kind = "proactive" | "protective";
const ITEMS: { name: string; by: string; kind: Kind }[] = [
  { name: "no-force-push", by: "core", kind: "protective" },
  { name: "no-secrets", by: "core", kind: "protective" },
  { name: "no-rm-rf", by: "core", kind: "protective" },
  { name: "no-curl-bash", by: "core", kind: "protective" },
  { name: "ask-on-prod", by: "core", kind: "protective" },
  { name: "stay-in-repo", by: "core", kind: "protective" },
  { name: "prefer-rg", by: "core", kind: "proactive" },
  { name: "conventional-commits", by: "core", kind: "proactive" },
];

export function CommonsPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function add(name: string, kind: Kind) {
    try {
      await navigator.clipboard.writeText(`npx agentreflex add ${name}`);
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(name);
    rippleFrom(ref.current, kind === "protective" ? "amber" : "signal", 0.7);
    setTimeout(() => setCopied((c) => (c === name ? null : c)), 1400);
  }

  return (
    <div ref={ref} className="ar-module ar-ticks rounded shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <span className="ar-label text-[var(--color-foreground)]">the commons</span>
        <span className="ar-label">open · MIT</span>
      </div>

      <ul className="divide-y divide-[var(--color-border)]/60">
        {ITEMS.map((it) => (
          <li key={it.name}>
            <button
              type="button"
              onMouseEnter={() =>
                rippleFrom(ref.current, it.kind === "protective" ? "amber" : "signal", 0.35)
              }
              onClick={() => add(it.name, it.kind)}
              className="group flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    it.kind === "protective" ? "var(--color-amber)" : "var(--color-signal)",
                }}
              />
              <span className="text-[var(--color-foreground)]">{it.name}</span>
              <span className="ar-label text-[var(--color-faint)]">{it.by}</span>
              <span className="ml-auto font-mono text-[11px] text-[var(--color-faint)] transition-colors group-hover:text-[var(--color-signal)]">
                {copied === it.name ? "copied ✓" : "add ↓"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2.5">
        <a href="#commons" className="ar-label hover:text-[var(--color-foreground)]">
          browse all ›
        </a>
        <a
          href="https://docs.agentreflex.dev/writing-a-reflex"
          className="ar-label hover:text-[var(--color-foreground)]"
        >
          contribute yours ›
        </a>
      </div>
    </div>
  );
}
