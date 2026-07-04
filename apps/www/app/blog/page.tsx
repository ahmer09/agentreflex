import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — agentreflex",
  description: "Notes on reflexes, agents, and the lifecycle layer.",
  alternates: { canonical: "https://agentreflex.dev/blog" },
};

const POSTS = [
  {
    slug: "reflexes",
    title: "Your agent has hands. It needs reflexes.",
    description:
      "Coding agents can act on your machine, but every one of them reinvents the layer that decides what happens when they do.",
    date: "July 2026",
  },
];

export default function BlogIndex() {
  return (
    <div className="py-16">
      <p className="ar-label">blog</p>
      <div className="mt-8 space-y-10">
        {POSTS.map((post) => (
          <article key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-2xl font-bold tracking-tight group-hover:text-[var(--color-signal)]">
                {post.title}
              </h2>
              <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-[var(--color-muted)]">
                {post.description}
              </p>
              <p className="ar-label mt-3">{post.date}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
