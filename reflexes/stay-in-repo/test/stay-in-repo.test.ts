import type { ToolCallContext } from "@agentreflex/core";
import { describe, expect, it } from "vitest";
import reflex from "../src/index.js";

const ctx = (over: Partial<ToolCallContext> = {}): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Write",
  command: undefined,
  paths: [],
  cwd: "/proj",
  raw: {},
  ...over,
});

describe("stay-in-repo", () => {
  it("denies an absolute path outside the project", () => {
    expect(reflex.onToolCall?.(ctx({ paths: ["/etc/hosts"] }))?.action).toBe("deny");
  });

  it("denies a relative escape", () => {
    expect(reflex.onToolCall?.(ctx({ paths: ["../other/app.ts"] }))?.action).toBe("deny");
  });

  it("allows an in-repo path", () => {
    expect(reflex.onToolCall?.(ctx({ paths: ["src/index.ts"] }))).toEqual({ action: "pass" });
  });

  it("ignores non-edit tools", () => {
    expect(reflex.onToolCall?.(ctx({ tool: "Read", paths: ["/etc/hosts"] }))).toEqual({
      action: "pass",
    });
  });
});
