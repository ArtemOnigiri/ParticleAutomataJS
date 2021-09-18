<script lang="ts">
  import { afterUpdate } from "svelte";
  import type { Particle } from "../types";

  export let width: number;
  export let height: number;
  export let links: { a: Particle; b: Particle }[];
  export let fields: Particle[][][];
  export let fw: number;
  export let fh: number;
  export let r: number;
  export let colors: string[];

  let canvas: HTMLCanvasElement;

  const BG_COLOR = "black";
  const LINK_COLOR = "rgba(255, 230, 0, 0.7)";

  afterUpdate(() => {
    function drawCircle(x: number, y: number, type: number) {
      ctx.fillStyle = colors[type] || "white";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
      // ctx.fillRect(x - 5, y - 5, 10, 10);
    }
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < links.length; i++) {
      const a = links[i].a;
      const b = links[i].b;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, colors[a.type]);
      gradient.addColorStop(1, colors[b.type]);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(10 - Math.hypot(a.x - b.x, a.y - b.y) / 4, 2);
      // ctx.globalAlpha = ctx.lineWidth / 10;
      ctx.stroke();
    }
    for (let i = 0; i < fw; i++) {
      for (let j = 0; j < fh; j++) {
        const field = fields[i][j];
        for (let k = 0; k < field.length; k++) {
          const a = field[k];
          // ctx.globalAlpha = 1;
          drawCircle(a.x, a.y, a.type);
        }
      }
    }
  });
</script>

<canvas bind:this={canvas} {width} {height} on:click />

<style>
  canvas {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    background-color: red;
  }
</style>
