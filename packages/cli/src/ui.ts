/**
 * The terminal look. We keep our own truecolor helpers so the brand palette is
 * exact (#B8FF2E signal lime, #35E6FF cyan), with a graceful no-color fallback.
 */
const COLOR = process.env.NO_COLOR === undefined && process.env.TERM !== "dumb";

const wrap = (open: string, close: string) => (s: string) => (COLOR ? `${open}${s}${close}` : s);
const truecolor = (r: number, g: number, b: number) =>
  wrap(`\x1b[38;2;${r};${g};${b}m`, "\x1b[39m");

export const lime = truecolor(184, 255, 46);
export const cyan = truecolor(53, 230, 255);
export const amber = truecolor(245, 191, 66);
export const white = truecolor(237, 237, 239);
export const dim = wrap("\x1b[2m", "\x1b[22m");
export const bold = wrap("\x1b[1m", "\x1b[22m");

/** The deflect mark, echoed in the terminal: a signal (▷) meeting the guard (│). */
export const mark = `${lime("▷")}${dim("│")}`;

export function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

/** The brand lockup — a vertical guard line ties the two rows together. */
export function banner(version: string): string {
  return [
    "",
    `  ${lime("▷")}${dim("│")}  ${bold(white("agentreflex"))}  ${dim(`v${version}`)}`,
    `   ${dim("│")}  ${dim("give your AI agents reflexes")}`,
    "",
  ].join("\n");
}

/** A solid badge — colored background, dark bold text — like a status chip. */
export const pill = (label: string, rgb: [number, number, number] = [184, 255, 46]): string =>
  COLOR
    ? `\x1b[1m\x1b[38;2;12;12;14m\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m ${label} \x1b[0m`
    : `[${label}]`;

/** A segmented progress bar: ▰ filled (lime), ▱ empty (dim). */
export function bar(filled: number, total: number, width = 10): string {
  const f = total > 0 ? Math.round((filled / total) * width) : 0;
  return lime("▰".repeat(f)) + dim("▱".repeat(Math.max(0, width - f)));
}

/** Consistent command header: the brand chip + a contextual label, on its own line. */
export const head = (label: string): string => `\n  ${pill("agentreflex")}  ${dim(label)}\n`;
