/** A normalized tool name in PascalCase: "Bash" | "Edit" | "Write" | "Read" | … */
export type ToolName = string;

/** A coding agent agentreflex can speak to. */
export type AgentName =
  | "claude"
  | "copilot"
  | "cursor"
  | "gemini"
  | "windsurf"
  | "opencode"
  | "codex";

/** Where a reflex or hook is installed. */
export type Scope = "project" | "global";

/** A normalized tool call, before the agent runs it. */
export interface ToolCallContext {
  event: "onToolCall";
  agent: AgentName;
  tool: ToolName;
  /** The shell command, when the tool is a shell. */
  command?: string;
  /** File paths the tool would touch, absolute where the agent provides them. */
  paths: string[];
  cwd: string;
  /** The original agent payload, untouched. */
  raw: unknown;
  /** Options this reflex was configured with in `.reflex/config.json` (`with`). */
  options?: Record<string, unknown>;
}

/** A normalized tool result, after the agent runs it. */
export interface ToolResultContext {
  event: "onToolResult";
  agent: AgentName;
  tool: ToolName;
  command?: string;
  paths: string[];
  cwd: string;
  raw: unknown;
  /** Options this reflex was configured with in `.reflex/config.json` (`with`). */
  options?: Record<string, unknown>;
}

export type ReflexContext = ToolCallContext | ToolResultContext;

/** What a reflex decides for a tool call. */
export type Decision =
  | { action: "pass" }
  | { action: "deny"; reason: string }
  | { action: "ask"; reason: string }
  | { action: "modify"; args: Record<string, unknown>; reason?: string };

export type DecisionAction = Decision["action"];

export const pass = (): Decision => ({ action: "pass" });
export const deny = (reason: string): Decision => ({ action: "deny", reason });
export const ask = (reason: string): Decision => ({ action: "ask", reason });
export const modify = (args: Record<string, unknown>, reason?: string): Decision => ({
  action: "modify",
  args,
  reason,
});

/** A reflex: a named bundle of lifecycle handlers — the unit you install and share. */
export interface Reflex {
  name: string;
  onToolCall?(ctx: ToolCallContext): Decision | Promise<Decision>;
  onToolResult?(ctx: ToolResultContext): void | Promise<void>;
}

/** Identity helper for authoring (types + autocomplete, no runtime cost). */
export function defineReflex(reflex: Reflex): Reflex {
  return reflex;
}

/** What an agent can faithfully honor — drives graceful degradation. */
export interface Capabilities {
  events: Array<ReflexContext["event"]>;
  decisions: DecisionAction[];
}

/** What the dispatcher emits back to the agent: stdout payload, stderr, and/or exit code. */
export interface HookResponse {
  stdout?: string;
  stderr?: string;
  exit?: number;
}

/** Maps one agent's native hook dialect to and from the canonical model. */
export interface Adapter {
  name: AgentName;
  label: string;
  /** true if it can block/ask; false = advisory only. */
  enforces: boolean;
  capabilities: Capabilities;
  parse(payload: unknown): ReflexContext;
  /** Serialize a decision to the agent's native response (stdout/stderr/exit). */
  format(decision: Decision): HookResponse;
  install(scope: Scope): { file: string; changed: boolean };
  uninstall(scope: Scope): { file: string; changed: boolean };
  isInstalled(scope: Scope): boolean;
}
