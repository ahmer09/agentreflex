import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agentreflex.dev",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://agentreflex.dev/blog",
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://agentreflex.dev/blog/reflexes",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
