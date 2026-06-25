import type { ToolCallContext } from "@agentreflex/core";
import { describe, expect, it } from "vitest";
import reflex from "../src/index.js";

const ctx = (command: string): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Bash",
  command,
  paths: [],
  cwd: "/proj",
  raw: {},
});

describe("prefer-rg", () => {
  it("denies recursive grep", () => {
    expect(reflex.onToolCall?.(ctx("grep -r TODO src/"))?.action).toBe("deny");
    expect(reflex.onToolCall?.(ctx("grep -Rn foo ."))?.action).toBe("deny");
  });

  it("allows ripgrep", () => {
    expect(reflex.onToolCall?.(ctx("rg foo"))).toEqual({ action: "pass" });
  });

  it("allows non-recursive grep on a file", () => {
    expect(reflex.onToolCall?.(ctx("grep foo file.txt"))).toEqual({ action: "pass" });
  });
});
