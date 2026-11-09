"use client";

import { useEffect, useRef } from "react";
import { generateIcosphere, projectVertices } from "@/app/lib/home/icosphere";

const STROKE_COLOR = "#F97316";

const ROTATION_SPEEDS = {
  X: 0.0024,
  Y: 0.0036,
  Z: 0.0016,
};

/** Perspective in projectVertices enlarges the near side by up to this much. */
const MAX_PERSPECTIVE = 1.25;

/**
 * An icosphere wireframe drawn on a 2D canvas, sized to fit the box the
 * canvas fills, so the same component works as a mark or a backdrop.
 */
export function CanvasSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const { vertices, edges } = generateIcosphere(1);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
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

      // The near side, enlarged by perspective, still fits the box.
      const radiusPx = Math.min(width, height) / 2 / MAX_PERSPECTIVE;
      const projected = projectVertices(
        vertices,
        { x: rx, y: ry, z: rz },
        { x: width / 2, y: height / 2 },
        radiusPx,
      );

      // Maps depth z [-1, 1] to opacity [0, 1]
      const getOpacity = (z: number) => (z + 1) / 2;

      // The stroke scales with the sphere, with a floor for small sizes.
      ctx.lineWidth = Math.max(0.75, radiusPx / 160);
      ctx.strokeStyle = STROKE_COLOR;
      for (const [v1, v2] of edges) {
        const p1 = projected[v1];
        const p2 = projected[v2];
        ctx.globalAlpha = getOpacity((p1.z + p2.z) / 2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
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
      aria-hidden="true"
      className="absolute inset-0 size-full pointer-events-none opacity-60"
    />
  );
}
