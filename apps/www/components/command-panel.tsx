"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { rippleFrom } from "./signal-field";

const REFLEXES = [
  { name: "test-first", instinct: "reach for the test before the code" },
  { name: "house-style", instinct: "match the project's conventions" },
  { name: "no-force-push", instinct: "flinch at a force-push to shared branches" },
  { name: "small-commits", instinct: "keep commits atomic and scoped" },
  { name: "ask-on-prod", instinct: "pause before touching production" },
  { name: "explain-why", instinct: "leave a why on non-obvious changes" },
] as const;

export function CommandPanel() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = REFLEXES[i] as (typeof REFLEXES)[number];

  useEffect(() => {
    if (open) return; // pause shuffle while the menu is open
    const t = setInterval(() => setI((n) => (n + 1) % REFLEXES.length), 2600);
    return () => clearInterval(t);
  }, [open]);

  function pick(idx: number) {
    setI(idx);
    rippleFrom(ref.current, "cyan", 0.7);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`npx agentreflex add ${cur.name}`);
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true);
    rippleFrom(ref.current, "signal", 1);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      ref={ref}
      className="mt-9 flex w-fit max-w-full items-center gap-2 whitespace-nowrap rounded border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-2.5 text-sm backdrop-blur"
    >
      <span className="text-[var(--color-faint)]">$</span>
      <span className="text-[var(--color-muted)]">npx agentreflex add</span>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="inline-flex items-center gap-1 outline-none"
          style={{ color: "var(--color-signal)" }}
        >
          {cur.name}
          <ChevronDown className="size-3 text-[var(--color-faint)]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {REFLEXES.map((r, idx) => (
            <DropdownMenuItem
              key={r.name}
              onSelect={() => pick(idx)}
              className="flex-col items-start gap-0.5"
            >
              <span
                style={{ color: idx === i ? "var(--color-signal)" : "var(--color-foreground)" }}
              >
                {r.name}
              </span>
              <span className="text-[var(--color-faint)]">{r.instinct}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={copy}
        className="ar-label ml-3 shrink-0 transition-colors hover:text-[var(--color-signal)]"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
