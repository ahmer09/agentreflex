"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { rippleFrom } from "./signal-field";

const AGENTS = [
  { key: "claude", label: "Claude Code", via: "PreToolUse" },
  { key: "cursor", label: "Cursor", via: "beforeShellExecution" },
  { key: "gemini", label: "Gemini CLI", via: "BeforeTool" },
  { key: "copilot", label: "Copilot CLI", via: "preToolUse" },
  { key: "windsurf", label: "Windsurf", via: "Cascade hook" },
  { key: "opencode", label: "OpenCode", via: "tool.execute.before" },
] as const;

type Kind = "do" | "stop" | "ask";
const SCENES: { cmd: string; kind: Kind; reflex: string; line: string }[] = [
  {
    cmd: "edit src/server.ts",
    kind: "do",
    reflex: "recover",
    line: "snapshotted the file first — undoable",
  },
  {
    cmd: "git push --force origin main",
    kind: "stop",
    reflex: "no-force-push",
    line: "open a PR instead",
  },
  {
    cmd: "cat .env.production",
    kind: "stop",
    reflex: "no-secrets",
    line: "blocked — that's a secrets file",
  },
  {
    cmd: "deploy to production",
    kind: "ask",
    reflex: "ask-on-prod",
    line: "paused for your confirmation",
  },
];

const KIND: Record<
  Kind,
  { color: string; icon: string; verb: string; ripple: "signal" | "danger" | "amber" }
> = {
  do: { color: "var(--color-signal)", icon: "›", verb: "fired", ripple: "signal" },
  stop: { color: "var(--color-danger)", icon: "✕", verb: "blocked", ripple: "danger" },
  ask: { color: "var(--color-amber)", icon: "?", verb: "paused", ripple: "amber" },
};

export function LiveTerminal() {
  const [agentKey, setAgentKey] = useState<string>(AGENTS[0].key);
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const a = AGENTS.find((x) => x.key === agentKey) ?? AGENTS[0];
  const s = SCENES[scene] as (typeof SCENES)[number];
  const k = KIND[s.kind];

  useEffect(() => {
    const t = setInterval(() => setScene((n) => (n + 1) % SCENES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // type the command, then reveal the reaction
  useEffect(() => {
    setTyped("");
    setDone(false);
    const cmd = SCENES[scene]?.cmd ?? "";
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(cmd.slice(0, i));
      if (i >= cmd.length) {
        clearInterval(t);
        setDone(true);
      }
    }, 22);
    return () => clearInterval(t);
  }, [scene]);

  useEffect(() => {
    if (done) rippleFrom(ref.current, k.ripple, 0.7);
  }, [done, k.ripple]);

  function onTab(v: string) {
    setAgentKey(v);
    rippleFrom(ref.current, "signal", 0.6);
  }

  return (
    <div ref={ref} className="ar-module ar-ticks rounded shadow-sm">
      <Tabs value={agentKey} onValueChange={onTab}>
        <TabsList className="border-b border-[var(--color-border)] px-2 py-1.5">
          {AGENTS.map((ag) => (
            <TabsTrigger key={ag.key} value={ag.key}>
              {ag.key}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="p-5 text-sm">
        <div className="text-[var(--color-foreground)]">
          <span className="text-[var(--color-faint)]">$</span> {typed}
          <span className="ar-cursor">▍</span>
        </div>

        <div className="mt-4 min-h-[3.25rem]">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key={`reaction-${scene}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-baseline gap-2">
                  <span style={{ color: k.color }}>
                    {k.icon} {s.reflex}
                  </span>
                  <span className="text-[var(--color-muted)]">· {s.line}</span>
                </div>
                <div className="ar-label mt-3 flex items-center gap-2">
                  <span className="size-1 rounded-full" style={{ background: k.color }} />
                  {k.verb} via {a.via} · {a.label}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="ar-label flex items-center gap-2 text-[var(--color-faint)]"
              >
                <span className="ar-cursor">●</span> evaluating
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
