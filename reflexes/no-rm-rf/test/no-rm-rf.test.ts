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

describe("no-rm-rf", () => {
  it("denies rm -rf /", () => {
    expect(reflex.onToolCall?.(ctx("rm -rf /"))?.action).toBe("deny");
  });

  it("denies rm -rf ~ and a bare *", () => {
    expect(reflex.onToolCall?.(ctx("rm -rf ~"))?.action).toBe("deny");
    expect(reflex.onToolCall?.(ctx("rm -rf *"))?.action).toBe("deny");
  });

  it("denies a recursive delete of a system dir, shell-aware", () => {
    expect(reflex.onToolCall?.(ctx("sudo rm -fr /usr/local"))?.action).toBe("deny");
  });

  it("allows rm -rf of a project folder", () => {
    expect(reflex.onToolCall?.(ctx("rm -rf node_modules dist"))).toEqual({ action: "pass" });
  });

  it("allows a non-recursive rm", () => {
    expect(reflex.onToolCall?.(ctx("rm file.txt"))).toEqual({ action: "pass" });
  });
});
