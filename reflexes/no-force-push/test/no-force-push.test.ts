import type { ToolCallContext } from "@agentreflex/core";
import { describe, expect, it } from "vitest";
import reflex from "../src/index.js";

const ctx = (command: string, over: Partial<ToolCallContext> = {}): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Bash",
  command,
  paths: [],
  cwd: "/proj",
  raw: {},
  ...over,
});

describe("no-force-push", () => {
  it("denies --force", () => {
    expect(reflex.onToolCall?.(ctx("git push --force origin main"))?.action).toBe("deny");
  });

  it("denies -f, shell-aware inside a compound command", () => {
    expect(reflex.onToolCall?.(ctx("cd repo && git push -f"))?.action).toBe("deny");
  });

  it("allows --force-with-lease", () => {
    expect(reflex.onToolCall?.(ctx("git push --force-with-lease"))).toEqual({ action: "pass" });
  });

  it("does not trip on a branch named with -f", () => {
    expect(reflex.onToolCall?.(ctx("git push origin feature-fix"))).toEqual({ action: "pass" });
  });
});
