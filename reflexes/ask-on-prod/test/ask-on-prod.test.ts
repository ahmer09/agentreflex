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

describe("ask-on-prod", () => {
  it("asks before a vercel prod deploy", () => {
    expect(reflex.onToolCall?.(ctx("vercel deploy --prod"))?.action).toBe("ask");
  });

  it("asks before terraform apply and npm publish", () => {
    expect(reflex.onToolCall?.(ctx("terraform apply"))?.action).toBe("ask");
    expect(reflex.onToolCall?.(ctx("npm publish"))?.action).toBe("ask");
  });

  it("passes a local build", () => {
    expect(reflex.onToolCall?.(ctx("npm run build"))).toEqual({ action: "pass" });
  });
});
