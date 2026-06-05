"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number;
  phase: number;
  freq: number;
  amp: number;
  radius: number;
  opacity: number;
  maxOpacity: number;
}

const COUNT = 260;
const MOUSE_RADIUS = 130;
const MOUSE_INFLUENCE = 0.18;
const DAMPING = 0.94;

function makeParticle(w: number, h: number, randomY = true): Particle {
  const baseVy = 0.35 + Math.random() * 0.75;
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h : -Math.random() * 40,
    vx: (Math.random() - 0.5) * 0.3,
    vy: baseVy,
    baseVy,
    phase: Math.random() * Math.PI * 2,
    freq: 0.006 + Math.random() * 0.012,
    amp: 0.4 + Math.random() * 1.2,
    radius: 0.8 + Math.random() * 1.4,
    opacity: 0,
    maxOpacity: 0.2 + Math.random() * 0.55,
  };
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = Array.from({ length: COUNT }, () =>
        makeParticle(canvas.width, canvas.height, true)
      );
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      tickRef.current++;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mvx = mouseRef.current.vx;
      const mvy = mouseRef.current.vy;

      for (const p of particlesRef.current) {
        // Sine drift
        p.vx += Math.sin(tickRef.current * p.freq + p.phase) * 0.012;
        // Restore towards base fall speed
        p.vy += (p.baseVy - p.vy) * 0.02;

        // Mouse current — push particles in direction mouse is moving
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const falloff = 1 - dist / MOUSE_RADIUS;
          const pushX = (dx / dist) * falloff * 1.8 + mvx * falloff * MOUSE_INFLUENCE;
          const pushY = (dy / dist) * falloff * 1.2 + mvy * falloff * MOUSE_INFLUENCE;
          p.vx += pushX;
          p.vy += pushY;
        }

        p.vx *= DAMPING;
        p.vy = Math.max(p.vy * DAMPING, p.baseVy * 0.3);

        p.x += p.vx;
        p.y += p.vy;

        // Fade in near top, fade out near bottom
        const lifeProgress = p.y / h;
        if (lifeProgress < 0.08) {
          p.opacity = Math.min(p.opacity + 0.02, p.maxOpacity * (lifeProgress / 0.08));
        } else if (lifeProgress > 0.85) {
          p.opacity = Math.max(0, p.maxOpacity * ((1 - lifeProgress) / 0.15));
        } else {
          p.opacity = Math.min(p.opacity + 0.015, p.maxOpacity);
        }

        // Wrap horizontally
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        // Reset at bottom
        if (p.y > h + 10) {
          const reset = makeParticle(w, h, false);
          reset.x = Math.random() * w;
          Object.assign(p, reset);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,220,235,${p.opacity.toFixed(3)})`;
        ctx.fill();
      }

      // Decay mouse velocity
      mouseRef.current.vx *= 0.85;
      mouseRef.current.vy *= 0.85;

      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.vx = x - prevMouseRef.current.x;
      mouseRef.current.vy = y - prevMouseRef.current.y;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      prevMouseRef.current = { x, y };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000, vx: 0, vy: 0 };
    }

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
