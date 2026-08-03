"use client";

import { useEffect, useRef } from "react";
import { CHART_ORDER, TALENT_BY_KEY, relNormalize, type TalentScores } from "@/lib/talents";

function getTokens() {
  const cs = getComputedStyle(document.documentElement);
  return {
    brand: cs.getPropertyValue("--brand").trim() || "#1B2A4A",
    fill: cs.getPropertyValue("--radar-fill").trim() || "rgba(27,42,74,0.16)",
    grid: cs.getPropertyValue("--radar-grid").trim() || "#C7CFDD",
    ink: cs.getPropertyValue("--ink").trim() || "#1B2333",
  };
}

export function drawRadar(
  canvas: HTMLCanvasElement,
  scores: TalentScores,
  opts: { size?: number; dpr?: number; noLabels?: boolean } = {}
) {
  const tokens = getTokens();
  const dpr = opts.dpr || window.devicePixelRatio || 1;
  const size = opts.size || canvas.width;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2 + size * 0.02;
  const R = size * 0.34;
  const n = CHART_ORDER.length;
  const levels = 5;
  const norm = relNormalize(scores);

  function pt(i: number, v: number): [number, number] {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = R * (v / levels);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  ctx.strokeStyle = tokens.grid;
  ctx.lineWidth = 1;
  for (let lvl = 1; lvl <= levels; lvl++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, lvl);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, levels);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  if (!opts.noLabels) {
    const labels = CHART_ORDER.map((k) => TALENT_BY_KEY[k].name);
    ctx.fillStyle = tokens.ink;
    ctx.font = `600 ${Math.round(size * 0.032)}px -apple-system,'Hiragino Sans',sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const lx = cx + (R + size * 0.09) * Math.cos(angle);
      const ly = cy + (R + size * 0.09) * Math.sin(angle);
      ctx.fillText(labels[i], lx, ly);
    }
  }

  const poly = CHART_ORDER.map((k, i) => pt(i, norm[k]));
  ctx.beginPath();
  poly.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = tokens.fill;
  ctx.fill();
  ctx.strokeStyle = tokens.brand;
  ctx.lineWidth = 2;
  ctx.stroke();

  poly.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, size * 0.012), 0, Math.PI * 2);
    ctx.fillStyle = tokens.brand;
    ctx.fill();
  });
}

export default function RadarChart({
  scores,
  size = 280,
}: {
  scores: TalentScores;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    drawRadar(ref.current, scores, { size });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const redraw = () => ref.current && drawRadar(ref.current, scores, { size });
    mq.addEventListener("change", redraw);
    const observer = new MutationObserver(redraw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mq.removeEventListener("change", redraw);
      observer.disconnect();
    };
  }, [scores, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
