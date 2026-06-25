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

describe("conventional-commits", () => {
  it("allows a well-formed message", () => {
    expect(reflex.onToolCall?.(ctx('git commit -m "feat: add reflexes"'))).toEqual({
      action: "pass",
    });
    expect(reflex.onToolCall?.(ctx('git commit -m "fix(core): handle null ctx"'))).toEqual({
      action: "pass",
    });
  });

  it("denies a message without a type prefix", () => {
    expect(reflex.onToolCall?.(ctx('git commit -m "updated some stuff"'))?.action).toBe("deny");
  });

  it("passes a commit with no inline message (editor opens)", () => {
    expect(reflex.onToolCall?.(ctx("git commit"))).toEqual({ action: "pass" });
  });
});
