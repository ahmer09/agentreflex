import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { claude } from "../src/claude.js";
import { gemini } from "../src/gemini.js";
import { getAdapter, resolveAdapters } from "../src/index.js";
import { opencode } from "../src/opencode.js";
import { windsurf } from "../src/windsurf.js";

function inTmp<T>(fn: () => T): T {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ar-ad-"));
  const prev = process.cwd();
  process.chdir(dir);
  try {
    return fn();
  } finally {
    process.chdir(prev);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe("claude adapter", () => {
  it("parses a Bash payload into canonical context", () => {
    const c = claude.parse({ tool_name: "Bash", tool_input: { command: "git push" }, cwd: "/p" });
    expect(c).toMatchObject({ agent: "claude", tool: "Bash", command: "git push", cwd: "/p" });
  });

  it("formats deny as PreToolUse stdout, pass as empty", () => {
    const out = JSON.parse(claude.format({ action: "deny", reason: "no" }).stdout ?? "{}");
    expect(out.hookSpecificOutput.permissionDecision).toBe("deny");
    expect(claude.format({ action: "pass" })).toEqual({});
  });

  it("install then uninstall round-trips the project hook", () => {
    inTmp(() => {
      expect(claude.install("project").changed).toBe(true);
      const f = path.join(process.cwd(), ".claude", "settings.json");
      expect(fs.readFileSync(f, "utf8")).toContain("hook --agent claude");
      expect(claude.uninstall("project").changed).toBe(true);
      expect(fs.readFileSync(f, "utf8")).not.toContain("hook --agent");
    });
  });
});

describe("decision dialects", () => {
  it("gemini denies via stdout and has no native ask", () => {
    expect(JSON.parse(gemini.format({ action: "deny", reason: "x" }).stdout ?? "{}").decision).toBe(
      "deny",
    );
    expect(gemini.format({ action: "ask", reason: "x" })).toEqual({});
  });

  it("windsurf blocks via exit code 2 + stderr", () => {
    expect(windsurf.format({ action: "deny", reason: "x" })).toEqual({ stderr: "x", exit: 2 });
  });

  it("opencode normalizes lowercase tool names", () => {
    expect(opencode.parse({ tool: "bash", args: { command: "ls" } }).tool).toBe("Bash");
  });
});

describe("adapter registry", () => {
  it("resolves an explicit list and ignores unknowns", () => {
    expect(resolveAdapters(["claude", "nope"], "project").map((a) => a.name)).toEqual(["claude"]);
  });

  it("looks adapters up by name", () => {
    expect(getAdapter("windsurf")?.label).toBe("Windsurf");
  });
});
