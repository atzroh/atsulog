"use client";

import { useEffect, useRef } from "react";
import { generateIcosphere, projectVertices } from "@/app/lib/home/icosphere";

const COLORS = {
  STROKE: "#F97316",
  NODE: "#000000",
};

const ROTATION_SPEEDS = {
  X: 0.0024,
  Y: 0.0036,
  Z: 0.0016,
};

/** An icosphere wireframe drawn on a 2D canvas. */
export function CanvasSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const { vertices, edges } = generateIcosphere(2);

    const remToPx = (rem: number) =>
      rem *
      parseFloat(getComputedStyle(document.documentElement).fontSize || "16");

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || remToPx(25);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener("resize", resize);
    resize();

    let rx = 0,
      ry = 0,
      rz = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rx += ROTATION_SPEEDS.X;
      ry += ROTATION_SPEEDS.Y;
      rz += ROTATION_SPEEDS.Z;

      const isMobile = window.innerWidth < 768;
      const baseRadiusPx = remToPx(10);
      const radiusPx = isMobile ? remToPx(6) : baseRadiusPx;
      const scale = radiusPx / baseRadiusPx;
      const projected = projectVertices(
        vertices,
        { x: rx, y: ry, z: rz },
        { x: width / 2, y: height / 2 },
        radiusPx,
      );

      // Maps depth z [-1, 1] to opacity [0, 1]
      const getOpacity = (z: number) => (z + 1) / 2;

      ctx.lineWidth = remToPx(0.0625) * scale;
      for (const [v1, v2] of edges) {
        const p1 = projected[v1];
        const p2 = projected[v2];

        const avgZ = (p1.z + p2.z) / 2;
        ctx.globalAlpha = getOpacity(avgZ);
        ctx.strokeStyle = COLORS.STROKE;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      const nodeR = remToPx(0.09375) * scale;
      for (const p of projected) {
        ctx.globalAlpha = getOpacity(p.z);
        ctx.fillStyle = COLORS.NODE;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none opacity-30"
    />
  );
}
