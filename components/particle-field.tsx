"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

const PARTICLE_COUNT = 180;
const REPULSION_RADIUS = 110;
const REPULSION_STRENGTH = 2800;
const SPRING_STRENGTH = 0.045;
const DAMPING = 0.82;
const CONNECTION_RADIUS = 90;
const CONNECTION_OPACITY_MAX = 0.12;

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spawnParticles();
    }

    function spawnParticles() {
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
        const hx = Math.random() * w;
        const hy = Math.random() * h;
        return {
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.2 + 0.4,
          opacity: Math.random() * 0.5 + 0.15,
        };
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
          p.vx += (dx / dist) * force * force * (REPULSION_STRENGTH / 1000);
          p.vy += (dy / dist) * force * force * (REPULSION_STRENGTH / 1000);
        }

        p.vx += (p.homeX - p.x) * SPRING_STRENGTH;
        p.vy += (p.homeY - p.y) * SPRING_STRENGTH;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_RADIUS) {
            const alpha =
              ((CONNECTION_RADIUS - dist) / CONNECTION_RADIUS) *
              CONNECTION_OPACITY_MAX;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(232,232,232,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,232,232,${p.opacity.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
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
