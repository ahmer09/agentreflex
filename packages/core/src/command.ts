import { parse } from "shell-quote";

export interface SimpleCommand {
  /** Tokens of one simple command, e.g. ["git", "push", "--force"]. */
  argv: string[];
  /** The simple command rejoined, for glob matching. */
  raw: string;
}

const CONTROL_OPS = new Set(["&&", "||", ";", "|", "&", "\n"]);

/**
 * Split a command line into its simple commands across &&, ||, ;, and pipes, so
 * matching sees each real command — not a glob over the whole string that
 * `cd x && git push --force` would slip past. Falls back to a single segment on
 * anything the parser can't handle, so a match never silently misses.
 */
export function parseCommand(command: string): SimpleCommand[] {
  const trimmed = command.trim();
  if (!trimmed) return [];

  let tokens: ReturnType<typeof parse>;
  try {
    tokens = parse(trimmed);
  } catch {
    return [{ argv: trimmed.split(/\s+/), raw: trimmed }];
  }

  const commands: SimpleCommand[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length > 0) commands.push({ argv: current, raw: current.join(" ") });
    current = [];
  };

  for (const t of tokens) {
    if (typeof t === "string") {
      current.push(t);
    } else if (t && typeof t === "object") {
      if ("comment" in t) continue;
      if ("pattern" in t) current.push((t as { pattern: string }).pattern);
      else if ("op" in t) {
        const op = (t as { op: string }).op;
        if (CONTROL_OPS.has(op)) flush();
        else current.push(op);
      }
    }
  }
  flush();

  return commands.length > 0 ? commands : [{ argv: [trimmed], raw: trimmed }];
}

/** Minimal glob → RegExp: `*` matches any run, `?` a single char. */
function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

/**
 * True if any glob matches the whole command or any of its shell-aware segments,
 * so `cd src && git push --force` still trips a `git push*` glob.
 */
export function commandMatches(command: string, globs: string[]): boolean {
  const targets = [command.trim(), ...parseCommand(command).map((c) => c.raw)];
  return globs.some((glob) => {
    const re = globToRegExp(glob);
    return targets.some((t) => re.test(t));
  });
}
