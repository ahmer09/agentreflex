"use client";

import { useEffect, useRef } from "react";

type RGB = [number, number, number];
type RippleColor = "signal" | "cyan" | "amber" | "danger";

const PALETTE: Record<RippleColor, RGB> = {
  signal: [188, 84, 48], // terracotta
  cyan: [199, 154, 63], // warm gold
  amber: [176, 125, 28],
  danger: [178, 58, 44],
};

/** Foreground → field coupling: ripple the grid out from an element's center. */
export function rippleFrom(el: Element | null, color: RippleColor = "signal", strength = 1): void {
  if (!el) return;
  const r = el.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("ar:ripple", {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, color, strength },
    }),
  );
}

// Tunables — adjust to taste once it's on screen.
const CELL = 9; // grid pitch — tiny, densely packed
const SIZE_MIN = 7.6; // square size at rest (≈1px gap)
const SIZE_MAX = 8.6; // square size when lit (nearly touching)
const SPEED = 0.24; // px/ms shockwave expansion
const RING = 42; // ring half-width
const LIFE = 1500; // ripple lifetime (ms)
const RIPPLE_GAIN = 0.42; // overall ripple intensity (brightness + color pop)
const REST: RGB = [180, 170, 150]; // very faint warm taupe on paper — blooms terracotta on ripple

export function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext("2d");
    const parentEl = canvasEl.parentElement;
    if (!ctx2d || !parentEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctx2d;
    const parent: HTMLElement = parentEl;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; base: number }[] = [];
    let ripples: { x: number; y: number; t: number; c: RGB; s: number }[] = [];
    let raf = 0;
    let lastMove = 0;

    function resize() {
      const r = parent.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Center-dense, edge-scatter dissolve so the field melts into the dark.
      dots = [];
      const margin = Math.min(w, h) * 0.24;
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * CELL;
          const y = j * CELL;
          const edge = Math.min(x, w - x, y, h - y);
          const ef = Math.max(0, Math.min(1, edge / margin)); // 0 at edge, 1 inside
          if (Math.random() < ef * 1.12) dots.push({ x, y, base: 0.04 + Math.random() * 0.06 });
        }
      }
    }

    function add(x: number, y: number, c: RGB, s: number) {
      ripples.push({ x, y, t: performance.now(), c, s });
      if (ripples.length > 28) ripples.shift();
    }

    function onMove(e: PointerEvent) {
      const now = performance.now();
      if (now - lastMove < 80) return;
      lastMove = now;
      const r = canvas.getBoundingClientRect();
      add(e.clientX - r.left, e.clientY - r.top, PALETTE.signal, 0.4);
    }

    function onEvent(e: Event) {
      const d = (e as CustomEvent).detail ?? {};
      const r = canvas.getBoundingClientRect();
      add(
        (d.x ?? r.left + w / 2) - r.left,
        (d.y ?? r.top + h / 2) - r.top,
        PALETTE[d.color as RippleColor] ?? PALETTE.signal,
        d.strength ?? 1,
      );
    }

    function frame(now: number) {
      ctx.clearRect(0, 0, w, h);
      ripples = ripples.filter((r) => now - r.t < LIFE);
      for (const d of dots) {
        let br = d.base;
        if (!reduce) br += 0.012 * (0.5 + 0.5 * Math.sin(now * 0.0009 + d.x * 0.05 + d.y * 0.03));
        let rr = REST[0];
        let gg = REST[1];
        let bb = REST[2];
        let cr = 0;
        let cg = 0;
        let cb = 0;
        let aw = 0;
        for (const rp of ripples) {
          const age = now - rp.t;
          const radius = age * SPEED;
          const delta = Math.abs(Math.hypot(d.x - rp.x, d.y - rp.y) - radius);
          if (delta < RING) {
            const fall = 1 - delta / RING;
            const inten = fall * fall * (1 - age / LIFE) * rp.s * RIPPLE_GAIN;
            br += inten;
            cr += rp.c[0] * inten;
            cg += rp.c[1] * inten;
            cb += rp.c[2] * inten;
            aw += inten;
          }
        }
        if (aw > 0) {
          const m = Math.min(1, aw);
          rr = lerp(rr, cr / aw, m);
          gg = lerp(gg, cg / aw, m);
          bb = lerp(bb, cb / aw, m);
        }
        br = Math.min(br, 1);
        const s = SIZE_MIN + br * (SIZE_MAX - SIZE_MIN);
        ctx.fillStyle = `rgba(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)},${0.045 + br * 0.55})`;
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("ar:ripple", onEvent);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("ar:ripple", onEvent);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 block h-full w-full"
    />
  );
}
