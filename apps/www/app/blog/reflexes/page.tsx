import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Your agent has hands. It needs reflexes.";
const description =
  "Coding agents can act on your machine, but every one of them reinvents the layer that decides what happens when they do. agentreflex is an attempt to make that layer portable.";

export const metadata: Metadata = {
  title: `${title} — agentreflex`,
  description,
  alternates: { canonical: "https://agentreflex.dev/blog/reflexes" },
  openGraph: {
    type: "article",
    url: "https://agentreflex.dev/blog/reflexes",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url: "https://agentreflex.dev/blog/reflexes",
  author: { "@type": "Organization", name: "agentreflex", url: "https://agentreflex.dev" },
  publisher: { "@id": "https://agentreflex.dev/#org" },
};

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 font-sans text-[15px] leading-[1.75] text-[var(--color-foreground)]">
      {children}
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-12 text-xl font-bold tracking-tight">{children}</h2>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="ar-module mt-6 overflow-x-auto p-4 text-[13px] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[var(--radius)] bg-[var(--color-surface-2)] px-1 py-0.5 text-[13px]">
      {children}
    </code>
  );
}

export default function ReflexesEssay() {
  return (
    <article className="py-16">
      <p className="ar-label">blog · july 2026</p>
      <h1 className="mt-4 max-w-2xl text-balance text-4xl font-bold leading-[1.1] tracking-tight">
        Your agent has hands.{" "}
        <span style={{ color: "var(--color-signal)" }}>It needs reflexes.</span>
      </h1>

      <P>
        A coding agent will, on a good day, refactor a module, run your tests, and open a clean PR.
        On a bad day the same agent will <C>git push --force</C> to main, <C>rm -rf</C> a directory
        it misread, or <C>cat .env</C> into its context window on the way to &ldquo;debugging&rdquo;
        something. The capability that makes it useful is the capability that makes it dangerous.
        There is no version of an agent that acts on your machine where this isn&rsquo;t true.
      </P>
      <P>
        So every serious agent grew a hook system: a place to intercept what the agent is about to
        do and say <em>no</em>, or <em>ask first</em>, or <em>change it</em>. Claude Code has{" "}
        <C>PreToolUse</C>. Cursor has <C>beforeShellExecution</C>. Copilot CLI, Gemini CLI,
        Windsurf, OpenCode — each has its own. Good. The problem is that none of them are the same,
        and none of them talk to each other.
      </P>

      <H2>The wall you hit on the second agent</H2>
      <P>
        Write a hook that blocks force-pushes to main in Claude Code and you&rsquo;ve solved it — in
        Claude Code. Open Cursor and that protection does not exist. Different format, different
        event names, different payload shape, different way of saying &ldquo;deny.&rdquo; So you
        re-implement it. Then Gemini ships and you re-implement it again, against a third API, and
        you find out halfway through that Gemini has no native way to say &ldquo;ask the
        human&rdquo; — only allow or block.
      </P>
      <P>
        Most people don&rsquo;t re-implement it three times. They write it once, for their main
        agent, and accept that the guardrail evaporates the moment they switch tools. Or they skip
        it and write it down instead — a line in <C>AGENTS.md</C> or <C>.cursorrules</C> that says
        &ldquo;don&rsquo;t force-push to main.&rdquo; But a rules file is advice. It&rsquo;s a
        prompt. The model can read it, agree with it, and force-push anyway, because nothing{" "}
        <em>ran</em> between the decision and the command. Instructions are not enforcement.
      </P>

      <H2>Three layers, and only one is missing</H2>
      <P>Step back and the tooling around coding agents sorts into three layers:</P>
      <ul className="mt-5 list-disc space-y-2 pl-5 font-sans text-[15px] leading-[1.75]">
        <li>
          <strong>Instructions</strong> — what the agent <em>should</em> do. Prose. AGENTS.md,
          skills files. This is standardizing.
        </li>
        <li>
          <strong>Capabilities</strong> — what the agent <em>can</em> do. The outbound tools it can
          call. MCP owns this, and it&rsquo;s standardizing fast.
        </li>
        <li>
          <strong>The lifecycle layer</strong> — what <em>actually happens</em> the instant the
          agent acts. Intercept the tool call, decide, and let it through, block it, change it, or
          ask.
        </li>
      </ul>
      <P>
        The first two layers have a name and a shared shape that any harness can target. The third
        one doesn&rsquo;t. Every agent ships its own version and everyone hand-rolls adapters to it.
        That&rsquo;s the gap. MCP gives your agent hands. Nothing gives it reflexes.
      </P>

      <H2>What a reflex is</H2>
      <P>
        A reflex is deterministic logic that runs the moment an agent is about to act, and returns
        one of four verdicts: <strong>pass</strong>, <strong>deny</strong>, <strong>ask</strong>, or{" "}
        <strong>modify</strong>. That&rsquo;s the whole model. It&rsquo;s small on purpose.
      </P>
      <Code>{`// .reflex/no-force-push.mjs
export default {
  name: "no-force-push",
  onToolCall(ctx) {
    if (ctx.tool === "Bash" && /git\\s+push\\b.*--force\\b/.test(ctx.command ?? ""))
      return { action: "deny", reason: "no force-push — open a PR instead" };
    return { action: "pass" };
  },
};`}</Code>
      <P>
        The important part is what you <em>don&rsquo;t</em> see. You didn&rsquo;t parse Claude
        Code&rsquo;s payload, or Cursor&rsquo;s, or Gemini&rsquo;s. <C>ctx</C> is a canonical
        context — normalized tool name, a shell-aware-parsed command (so{" "}
        <C>cd build && git push --force</C> is caught, which naive substring matching misses),
        paths, cwd, which agent. agentreflex sits under every agent as a single dispatcher; each
        agent calls it through its own native hook, the dispatcher normalizes the event, runs your
        reflexes, and translates the verdict back into whatever that agent expects. Where an agent
        can&rsquo;t express a verdict — Gemini and &ldquo;ask&rdquo; — a capability descriptor on
        the adapter degrades it gracefully instead of silently dropping it.
      </P>
      <P>Write the reflex once. It fires everywhere.</P>

      <H2>A reflex is a file, not a package</H2>
      <P>
        The other deliberate choice: a reflex is a folder with a manifest, not an npm package. It
        lives in <C>.reflex/</C> in your repo. You own it, you edit it, you commit it alongside the
        code it protects. Editing it is instantly live — no build, no publish, no version bump. The
        contract is JSON over stdin/stdout, so a reflex can be TypeScript, JavaScript, Python, or a
        shell script; the language is yours.
      </P>
      <P>
        That&rsquo;s the shadcn lesson applied here: the unit you share is <em>the code</em>, not a
        dependency you pull in and can&rsquo;t see. Sharing is opt-in and rises in friction only
        when you want it to — <C>agentreflex add no-secrets</C> from the commons,{" "}
        <C>add github:you/repo</C>, <C>add ./path</C>, <C>add https://…</C>. The official registry
        is the best-known URL, not the only one. And because the reflexes you rely on are committed,
        every collaborator inherits them on <C>agentreflex install</C>, the way they inherit{" "}
        <C>.editorconfig</C>.
      </P>

      <H2>The part that has to be true: trust</H2>
      <P>
        A tool that runs code on every agent action has to be honest about that. Reflexes are code,
        and code you don&rsquo;t read is code you shouldn&rsquo;t run. So: <C>add</C> shows you the
        source before anything is wired in. Reflexes declare the capabilities they use. And the
        dispatcher <strong>fails open</strong> — if a reflex is slow, throws, or the runtime itself
        breaks, the agent proceeds. agentreflex will never block or crash your agent because of its
        own bug. A safety layer that takes down your workflow when <em>it</em> fails isn&rsquo;t a
        safety layer.
      </P>
      <P>
        And to be clear about what it is and isn&rsquo;t: this is seatbelts, not a sandbox. A reflex
        runs before the tool call and parses commands properly, but a determined model or user can
        route around any single rule. It&rsquo;s built to catch the agent doing the thing
        you&rsquo;d have flinched at — the 99% case — not to contain an adversary. Anyone who tells
        you a hook layer is a security boundary is selling something.
      </P>

      <H2>What ships today</H2>
      <P>
        MIT, v0.x. Six enforcing adapters, verified against live agents, and about ten official
        reflexes to start: protective ones (no-secrets, no-rm-rf, ask-on-prod, stay-in-repo,
        no-curl-bash) and proactive ones (recover, which snapshots files before the agent edits
        them so any change is undoable; prefer-rg; conventional-commits), plus <C>abide</C>,
        where you write your human↔agent working agreement in plain language and it&rsquo;s
        enforced everywhere.
      </P>
      <P>
        Harness APIs churn; keeping the adapters current is the job — and the moat. The longer
        arc is a language-neutral spec, so any harness can implement reflex support and any
        language can author one, and a registry so the useful reflexes find the next person who
        needs them. A library earns stars. A shared layer everyone can build on is the thing
        worth trying for.
      </P>
      <P>If you use more than one coding agent, try it on a repo:</P>
      <Code>{`npx agentreflex init
npx agentreflex add no-secrets`}</Code>
      <P>Then tell me what reflex you&rsquo;d write first — or where it breaks.</P>

      <div className="ar-module mt-10 p-5">
        <ul className="ar-label space-y-2">
          <li>
            <a
              href="https://github.com/agentreflex/agentreflex"
              className="hover:text-[var(--color-signal)]"
            >
              → repo: github.com/agentreflex/agentreflex
            </a>
          </li>
          <li>
            <a href="https://agentreflex.dev" className="hover:text-[var(--color-signal)]">
              → playground: agentreflex.dev
            </a>
          </li>
          <li>
            <a href="https://docs.agentreflex.dev" className="hover:text-[var(--color-signal)]">
              → docs: docs.agentreflex.dev
            </a>
          </li>
        </ul>
      </div>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static, build-time JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
