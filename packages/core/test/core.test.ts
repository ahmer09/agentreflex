import { describe, expect, it } from "vitest";
import { commandMatches, parseCommand } from "../src/command.js";
import { runToolCall } from "../src/run.js";
import { ask, deny, pass } from "../src/types.js";
import type { Reflex, ToolCallContext } from "../src/types.js";

const ctx = (command: string): ToolCallContext => ({
  event: "onToolCall",
  agent: "claude",
  tool: "Bash",
  command,
  paths: [],
  cwd: "/p",
  raw: {},
});

describe("parseCommand", () => {
  it("splits on control operators", () => {
    expect(parseCommand("cd src && git push").map((c) => c.raw)).toEqual(["cd src", "git push"]);
  });

  it("splits pipes and semicolons into separate commands", () => {
    expect(parseCommand("a | b ; c")).toHaveLength(3);
  });

  it("returns [] for blank input", () => {
    expect(parseCommand("   ")).toEqual([]);
  });
});

describe("commandMatches (shell-aware)", () => {
  it("matches a glob against a segment of a compound command", () => {
    expect(commandMatches("cd src && git push --force", ["git push*--force*"])).toBe(true);
  });

  it("matches the whole command too", () => {
    expect(commandMatches("git push --force origin", ["git push*--force*"])).toBe(true);
  });

  it("does not match unrelated commands", () => {
    expect(commandMatches("ls -la", ["git push*"])).toBe(false);
  });
});

describe("runToolCall", () => {
  const blocker: Reflex = {
    name: "blocker",
    onToolCall: (c) => (/--force/.test(c.command ?? "") ? deny("no force") : pass()),
  };
  const asker: Reflex = { name: "asker", onToolCall: () => ask("confirm?") };

  it("returns the first non-pass decision (declaration order = priority)", async () => {
    expect(await runToolCall([blocker, asker], ctx("git push --force"))).toEqual({
      action: "deny",
      reason: "no force",
    });
  });

  it("passes when every reflex passes", async () => {
    expect(await runToolCall([blocker], ctx("ls"))).toEqual({ action: "pass" });
  });

  it("skips reflexes without an onToolCall handler", async () => {
    expect(await runToolCall([{ name: "noop" }, asker], ctx("ls"))).toEqual({
      action: "ask",
      reason: "confirm?",
    });
  });
});

describe("decision helpers", () => {
  it("build the canonical shapes", () => {
    expect(deny("r")).toEqual({ action: "deny", reason: "r" });
    expect(ask("r")).toEqual({ action: "ask", reason: "r" });
    expect(pass()).toEqual({ action: "pass" });
  });
});
