"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Action = "deny" | "ask" | "allow";

interface Rule {
  desc: string;
  action: Action;
  test: (c: string) => boolean;
}

// A tiny in-browser stand-in for a real reflex set — enough to feel it.
const RULES: Rule[] = [
  {
    desc: "Never force-push.",
    action: "deny",
    test: (c) => /git\s+push\b.*(--force|(?:^|\s)-f)\b/.test(c),
  },
  {
    desc: "Never rm -rf the filesystem root.",
    action: "deny",
    test: (c) => /\brm\s+-[a-z]*r[a-z]*f?\b\s+\/(\s|$)/.test(c),
  },
  {
    desc: "Don't read or write .env files.",
    action: "deny",
    test: (c) => /\.env\b/.test(c),
  },
  {
    desc: "Ask before pushing.",
    action: "ask",
    test: (c) => /git\s+push\b/.test(c),
  },
];

function evaluate(cmd: string): { action: Action; desc?: string } {
  const c = cmd.trim();
  if (!c) return { action: "allow" };
  for (const rule of RULES) if (rule.test(c)) return { action: rule.action, desc: rule.desc };
  return { action: "allow" };
}

const AGENTS = ["Claude Code", "Cursor", "Gemini", "Copilot", "Windsurf", "OpenCode"] as const;
const EXAMPLES = ["git push --force", "rm -rf /", "git push origin main", "cat .env", "ls -la"];

const COLOR: Record<Action, string> = {
  deny: "var(--color-danger)",
  ask: "var(--color-amber)",
  allow: "var(--color-signal)",
};
const ICON: Record<Action, string> = { deny: "⛔", ask: "⚠", allow: "✓" };
const STATE: Record<Action, string> = { deny: "blocked", ask: "ask first", allow: "allowed" };

export function ReflexPlayground() {
  const [cmd, setCmd] = useState("git push --force");
  const verdict = evaluate(cmd);
  const color = COLOR[verdict.action];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-left shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[var(--color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--color-border)]" />
        <span className="size-2.5 rounded-full bg-[var(--color-border)]" />
        <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
          try a command — every agent reacts
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 font-mono text-base sm:text-lg">
          <span className="select-none text-[var(--color-muted)]">$</span>
          <input
            className="ar-cmd"
            value={cmd}
            spellCheck={false}
            autoComplete="off"
            aria-label="command"
            onChange={(e) => setCmd(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setCmd(ex)}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-1 font-mono text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-signal)] hover:text-[var(--color-foreground)]"
            >
              {ex}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={verdict.action + (verdict.desc ?? "")}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-5 flex flex-wrap items-baseline gap-x-2 font-mono text-sm"
          >
            <span style={{ color }} className="font-semibold">
              {ICON[verdict.action]} {verdict.action.toUpperCase()}
            </span>
            {verdict.desc && <span className="text-[var(--color-muted)]">— {verdict.desc}</span>}
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AGENTS.map((agent) => (
            <div
              key={agent}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/40 px-3 py-2"
            >
              <motion.span
                className="size-2 shrink-0 rounded-full"
                animate={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                transition={{ duration: 0.25 }}
              />
              <span className="truncate text-xs">{agent}</span>
              <span className="ml-auto font-mono text-[10px]" style={{ color }}>
                {STATE[verdict.action]}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-[var(--color-muted)]">
          one reflex · enforced in every agent
        </p>
      </div>
    </div>
  );
}
