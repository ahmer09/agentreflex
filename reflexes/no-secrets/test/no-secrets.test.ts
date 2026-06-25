import type { ToolCallContext } from "@agentreflex/core";
import { describe, expect, it } from "vitest";
import reflex from "../src/index.js";

const ctx = (over: Partial<ToolCallContext> = {}): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Bash",
  command: undefined,
  paths: [],
  cwd: "/proj",
  raw: {},
  ...over,
});

describe("no-secrets", () => {
  it("denies reading .env", () => {
    expect(reflex.onToolCall?.(ctx({ tool: "Read", paths: [".env"] }))?.action).toBe("deny");
  });

  it("denies writing .env.production", () => {
    expect(
      reflex.onToolCall?.(ctx({ tool: "Write", paths: ["config/.env.production"] }))?.action,
    ).toBe("deny");
  });

  it("denies cat of a private key in bash", () => {
    expect(reflex.onToolCall?.(ctx({ command: "cat ~/.ssh/id_rsa" }))?.action).toBe("deny");
  });

  it("passes a normal source file", () => {
    expect(reflex.onToolCall?.(ctx({ tool: "Read", paths: ["src/index.ts"] }))).toEqual({
      action: "pass",
    });
  });
});
