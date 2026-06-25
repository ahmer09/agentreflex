import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "agentreflex — Give your AI agents reflexes",
  description:
    "Skills are what your agent can do. Reflexes are how you'd do it — an open commons of reflexes that fire in every coding agent.",
  metadataBase: new URL("https://agentreflex.dev"),
  openGraph: {
    title: "agentreflex — Give your AI agents reflexes",
    description:
      "Skills are what your agent can do. Reflexes are how you'd do it — an open commons of reflexes that fire in every coding agent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
