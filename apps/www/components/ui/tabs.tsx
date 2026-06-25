"use client";

import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "shrink-0 cursor-pointer rounded px-2.5 py-1 text-xs text-[var(--color-faint)] outline-none transition-colors hover:text-[var(--color-muted)] data-[state=active]:bg-[var(--color-surface-2)] data-[state=active]:text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
