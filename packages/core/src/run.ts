import type { Decision, Reflex, ToolCallContext, ToolResultContext } from "./types.js";

/**
 * Run reflexes for a tool call. The first reflex to return a non-`pass` decision
 * wins — declaration order is priority — otherwise the call passes.
 */
export async function runToolCall(reflexes: Reflex[], ctx: ToolCallContext): Promise<Decision> {
  for (const reflex of reflexes) {
    if (!reflex.onToolCall) continue;
    const decision = await reflex.onToolCall(ctx);
    if (decision.action !== "pass") return decision;
  }
  return { action: "pass" };
}

/** Run every reflex's post-tool side effect. These never block. */
export async function runToolResult(reflexes: Reflex[], ctx: ToolResultContext): Promise<void> {
  for (const reflex of reflexes) {
    await reflex.onToolResult?.(ctx);
  }
}
