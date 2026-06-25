"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function CopyCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable; no-op
    }
  }, [command]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy command: ${command}`}
      className={cn(
        "group flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left font-mono text-sm transition-colors hover:border-[var(--color-signal)]",
        className,
      )}
    >
      <span className="flex items-center gap-2 truncate">
        <span aria-hidden className="select-none text-[var(--color-muted)]">
          $
        </span>
        <span className="truncate">{command}</span>
      </span>
      <span
        aria-hidden
        className="shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-foreground)]"
      >
        {copied ? (
          <Check className="size-4" style={{ color: "var(--color-signal)" }} />
        ) : (
          <Copy className="size-4" />
        )}
      </span>
    </button>
  );
}
