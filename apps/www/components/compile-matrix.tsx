"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const SOURCE = `import { defineReflex, deny, pass } from "@agentreflex/core";

export default defineReflex({
  name: "no-force-push",
  onToolCall(ctx) {
    if (ctx.tool === "Bash" && ctx.command?.includes("--force"))
      return deny("open a PR — don't force-push shared history");
    return pass();
  },
});`;

type Target = { key: string; file: string; code: string };
const TARGETS: Target[] = [
  {
    key: "claude",
    file: ".claude/settings.json",
    code: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          { "type": "command", "command": "arx hook --agent claude" }
        ]
      }
    ]
  }
}`,
  },
  {
    key: "cursor",
    file: ".cursor/hooks.json",
    code: `{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      { "command": "arx hook --agent cursor" }
    ]
  }
}`,
  },
  {
    key: "gemini",
    file: ".gemini/settings.json",
    code: `{
  "hooks": [
    { "command": "arx hook --agent gemini" }
  ]
}`,
  },
  {
    key: "copilot",
    file: ".github/hooks/agentreflex.json",
    code: `{
  "preToolUse": [
    { "command": "arx hook --agent copilot" }
  ]
}`,
  },
  {
    key: "windsurf",
    file: ".windsurf/hooks.json",
    code: `{
  "hooks": {
    "beforeToolCall": [
      { "command": "arx hook --agent windsurf" }
    ]
  }
}`,
  },
  {
    key: "agents.md",
    file: "AGENTS.md",
    code: `## Reflexes

- **no-force-push** — never force-push shared
  branches; open a PR instead.`,
  },
];

export function CompileMatrix() {
  const [k, setK] = useState(TARGETS[0].key);
  const t = TARGETS.find((x) => x.key === k) ?? TARGETS[0];

  return (
    <div className="grid gap-px overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-border)] shadow-sm lg:grid-cols-2">
      {/* source — one file, hand-written */}
      <div className="flex flex-col bg-[var(--color-background)]/85 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
          <span className="font-mono text-[12px] text-[var(--color-foreground)]">
            reflexes/no-force-push.ts
          </span>
          <span className="ar-label">you write this</span>
        </div>
        <pre className="flex-1 overflow-x-auto p-4 text-[12.5px] leading-relaxed text-[var(--color-foreground)]">
          <code>{SOURCE}</code>
        </pre>
      </div>

      {/* compiled — every agent's native hook */}
      <div className="flex flex-col bg-[var(--color-background)]/85 backdrop-blur-sm">
        <Tabs value={k} onValueChange={setK}>
          <TabsList className="flex-wrap border-b border-[var(--color-border)] px-2 py-1.5">
            {TARGETS.map((x) => (
              <TabsTrigger key={x.key} value={x.key}>
                {x.key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
          <span className="font-mono text-[12px] text-[var(--color-faint)]">{t.file}</span>
          <span className="ar-label" style={{ color: "var(--color-signal)" }}>
            agentreflex writes this
          </span>
        </div>
        <pre className="flex-1 overflow-x-auto p-4 text-[12.5px] leading-relaxed text-[var(--color-foreground)]">
          <code>{t.code}</code>
        </pre>
      </div>
    </div>
  );
}
