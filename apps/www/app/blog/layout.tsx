import Link from "next/link";
import type { ReactNode } from "react";

const GH = "https://github.com/agentreflex/agentreflex";
const DOCS = "https://docs.agentreflex.dev";

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 tracking-tight">
      <svg
        width="15"
        height="15"
        viewBox="0 0 64 64"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
      >
        <title>agentreflex</title>
        <path d="M16 14 L40 32 L16 50" />
        <line x1="48" y1="13" x2="48" y2="51" strokeOpacity={0.4} />
      </svg>
      <span>
        <span className="text-[var(--color-faint)]">agent</span>
        <span className="font-semibold text-[var(--color-foreground)]">reflex</span>
      </span>
    </span>
  );
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/">
            <Wordmark />
          </Link>
          <nav className="ar-label flex items-center gap-x-5">
            <Link href="/blog" className="text-[var(--color-foreground)]">
              blog
            </Link>
            <a href={DOCS} className="hover:text-[var(--color-foreground)]">
              docs
            </a>
            <a href={GH} className="hover:text-[var(--color-foreground)]">
              github
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6">{children}</main>
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
          <Wordmark />
          <span className="ar-label flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href={GH} className="hover:text-[var(--color-foreground)]">
              github
            </a>
            <a href={DOCS} className="hover:text-[var(--color-foreground)]">
              docs
            </a>
            <span>MIT</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
