import type { ToolCallContext } from "@agentreflex/core";
import { describe, expect, it } from "vitest";
import abide from "../src/index.js";

const ctx = (command: string, over: Partial<ToolCallContext> = {}): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Bash",
  command,
  paths: [],
  cwd: "/no-such-project",
  raw: {},
  ...over,
});

describe("abide reflex (built-in defaults)", () => {
  it("denies force-push, shell-aware inside a compound command", () => {
    expect(abide.onToolCall?.(ctx("cd src && git push --force"))).toEqual({
      action: "deny",
      reason: "Never force-push.",
    });
  });

  it("asks before a plain push", () => {
    expect(abide.onToolCall?.(ctx("git push origin main"))).toEqual({
      action: "ask",
      reason: "Ask before pushing.",
    });
  });

  it("denies edits outside the project", () => {
    expect(
      abide.onToolCall?.(ctx("", { tool: "Write", command: undefined, paths: ["/etc/hosts"] })),
    ).toEqual({ action: "deny", reason: "Don't edit files outside the project." });
  });

  it("passes a harmless command", () => {
    expect(abide.onToolCall?.(ctx("ls -la"))).toEqual({ action: "pass" });
  });
});
