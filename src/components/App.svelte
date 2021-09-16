<script lang="ts">
  import Visual from "./Visual.svelte";
  import InputRange from "./InputRange.svelte";
  import ParticleSelector from "./ParticleSelector.svelte";
  import type { Particle } from "../types";
  import { writable } from "svelte/store";

  let width: number = window.innerWidth;
  let height: number = window.innerHeight;

  const COLORS = [
    "#fa1414",
    "#c88c64",
    "#50aa8c",
    "#0096e6",
    "#0a14e6",
    "#8200c8",
    "#fa96d2",
    "#828282",
    "green",
  ];

  let showSettings = true;

  const r = 5;
  let nodeCount = 750;
  let MAX_DIST = 75;
  let speedMultiplier = 4;
  const BORDER = 10;
  let selectedId = 0;

  const maxDist2 = MAX_DIST * MAX_DIST;
  const fw = width / MAX_DIST + 1;
  const fh = height / MAX_DIST + 1;

  let RULE_SIZE = 3;
  let MAX_LINKS = [];
  let COUPLINGS: number[][] = [];
  let MAX_LINKS_PER_COLOR = [];

  let links: { a: Particle; b: Particle }[] = [];
  let fields: Particle[][][] = [];

  let settingRuleSize = writable(3);
  let simulationsPerFrame = 5;

  if (location.hash) {
    let hash = location.hash.substring(1).split("-");
    let c = 0;
    $settingRuleSize = ~~hash[c];
    RULE_SIZE = $settingRuleSize;
    // settingRange.value = RULE_SIZE;
    // rangeValue.textContent = RULE_SIZE;
    startNew();
    c++;
    for (let i = 0; i < RULE_SIZE; i++) {
      MAX_LINKS[i] = (Number(hash[c]) >> (i * 2)) & 3;
    }
    c++;
    for (let i = 0; i < RULE_SIZE; i++) {
      for (let j = 0; j < RULE_SIZE; j++) {
        COUPLINGS[i][j] = ((Number(hash[c]) >> (j * 2)) & 3) - 1;
      }
      c++;
    }
    for (let i = 0; i < RULE_SIZE; i++) {
      for (let j = 0; j < RULE_SIZE; j++) {
        MAX_LINKS_PER_COLOR[i][j] = (Number(hash[c]) >> (j * 2)) & 3;
      }
      c++;
    }
    history.pushState(null, null, " ");
  } else {
    startNew();
  }

  requestAnimationFrame(update);

  function startNew() {
    selectedId = 0;
    generateRules();
    generateNodes();
  }

  function generateNodes() {
    links = [];
    fields = [];
    for (let i = 0; i < fw; i++) {
      fields.push([]);
      for (let j = 0; j < fh; j++) {
        fields[i].push([]);
      }
    }
    for (let i = 0; i < nodeCount; i++) {
      addParticle(
        Math.random() * width,
        Math.random() * height,
        ~~(Math.random() * RULE_SIZE)
      );
    }
  }

  function generateRules() {
    RULE_SIZE = $settingRuleSize;
    MAX_LINKS = [];
    COUPLINGS = [];
    MAX_LINKS_PER_COLOR = [];
    for (let i = 0; i < RULE_SIZE; i++) {
      MAX_LINKS.push(~~(Math.random() * 4));
      COUPLINGS.push([]);
      MAX_LINKS_PER_COLOR.push([]);
      for (let j = 0; j < RULE_SIZE; j++) {
        COUPLINGS[i].push(Math.floor(Math.random() * 3 - 1));
        MAX_LINKS_PER_COLOR[i].push(~~(Math.random() * 4));
      }
    }
  }

  function copyRules() {
    let hash = "";
    hash += RULE_SIZE;
    let links_hash = 0;
    for (let i = 0; i < RULE_SIZE; i++) {
      links_hash |= MAX_LINKS[i] << (i * 2);
    }
    hash += "-" + links_hash;
    for (let i = 0; i < RULE_SIZE; i++) {
      let row = 0;
      for (let j = 0; j < RULE_SIZE; j++) {
        row |= (COUPLINGS[i][j] + 1) << (j * 2);
      }
      hash += "-" + row;
    }
    for (let i = 0; i < RULE_SIZE; i++) {
      let row = 0;
      for (let j = 0; j < RULE_SIZE; j++) {
        row |= MAX_LINKS_PER_COLOR[i][j] << (j * 2);
      }
      hash += "-" + row;
    }
    hash = window.location.href + "#" + hash;
    let tempInput = document.createElement("input");
    tempInput.value = hash;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  function addParticle(x: number, y: number, type: number) {
    let a: Particle = { x, y, type, sx: 0, sy: 0, bonds: [] };
    const fx = Math.floor(x / MAX_DIST);
    const fy = Math.floor(y / MAX_DIST);
    fields[fx][fy].push(a);
  }

  function removeFromArray<T>(array: T[], item: T) {
    array.splice(array.indexOf(item), 1);
  }

  function linkParticles(a: Particle, b: Particle) {
    a.bonds.push(b);
    b.bonds.push(a);
    links.push({ a, b });
  }

  function applyForce(a: Particle, b: Particle) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    let dist2 = dx * dx + dy * dy;
    if (dist2 < maxDist2) {
      let da = COUPLINGS[a.type][b.type] / dist2;
      let db = COUPLINGS[b.type][a.type] / dist2;
      if (
        a.bonds.length < MAX_LINKS[a.type] &&
        b.bonds.length < MAX_LINKS[b.type]
      ) {
        if (dist2 < maxDist2 / 4) {
          if (a.bonds.indexOf(b) === -1 && b.bonds.indexOf(a) === -1) {
            let typeCountA = 0;
            a.bonds.forEach((bond) => {
              if (bond.type === b.type) typeCountA++;
            });
            let typeCountB = 0;
            b.bonds.forEach((bond) => {
              if (bond.type === a.type) typeCountB++;
            });
            if (
              typeCountA < MAX_LINKS_PER_COLOR[a.type][b.type] &&
              typeCountB < MAX_LINKS_PER_COLOR[b.type][a.type]
            ) {
              linkParticles(a, b);
            }
          }
        }
      } else {
        if (a.bonds.indexOf(b) === -1 && b.bonds.indexOf(a) === -1) {
          da = 1 / dist2;
          db = 1 / dist2;
        }
      }
      const angle = Math.atan2(a.y - b.y, a.x - b.x);
      if (dist2 < 1) dist2 = 1;
      if (dist2 < r * r * 4) {
        da = 1 / dist2;
        db = 1 / dist2;
      }
      a.sx += Math.cos(angle) * da * speedMultiplier;
      a.sy += Math.sin(angle) * da * speedMultiplier;
      b.sx -= Math.cos(angle) * db * speedMultiplier;
      b.sy -= Math.sin(angle) * db * speedMultiplier;
    }
  }

  function logic() {
    for (let i = 0; i < fw; i++) {
      for (let j = 0; j < fh; j++) {
        const field = fields[i][j];
        for (let k = 0; k < field.length; k++) {
          const a = field[k];
          a.x += a.sx;
          a.y += a.sy;
          a.sx *= 0.98;
          a.sy *= 0.98;
          const magnitude = Math.sqrt(a.sx * a.sx + a.sy * a.sy);
          if (magnitude > 1) {
            a.sx /= magnitude;
            a.sy /= magnitude;
          }
          if (a.x < BORDER) {
            a.sx += speedMultiplier * 0.05;
            if (a.x < 0) {
              a.x = -a.x;
              a.sx *= -0.5;
            }
          } else if (a.x > width - BORDER) {
            a.sx -= speedMultiplier * 0.05;
            if (a.x > width) {
              a.x = width * 2 - a.x;
              a.sx *= -0.5;
            }
          }
          if (a.y < BORDER) {
            a.sy += speedMultiplier * 0.05;
            if (a.y < 0) {
              a.y = -a.y;
              a.sy *= -0.5;
            }
          } else if (a.y > height - BORDER) {
            a.sy -= speedMultiplier * 0.05;
            if (a.y > height) {
              a.y = height * 2 - a.y;
              a.sy *= -0.5;
            }
          }
        }
      }
    }
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const a = link.a;
      const b = link.b;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      let dist2 = dx * dx + dy * dy;
      if (dist2 > maxDist2 / 4) {
        removeFromArray(a.bonds, b);
        removeFromArray(b.bonds, a);
        removeFromArray(links, link);
        i--;
      } else {
        if (dist2 > r * r * 4) {
          const angle = Math.atan2(a.y - b.y, a.x - b.x);
          const dA = -0.015;
          a.sx += Math.cos(angle) * dA * speedMultiplier;
          a.sy += Math.sin(angle) * dA * speedMultiplier;
          b.sx -= Math.cos(angle) * dA * speedMultiplier;
          b.sy -= Math.sin(angle) * dA * speedMultiplier;
        }
      }
    }
    for (let i = 0; i < fw; i++) {
      for (let j = 0; j < fh; j++) {
        const field = fields[i][j];
        for (let k = 0; k < field.length; k++) {
          const a = field[k];
          const fx = Math.floor(a.x / MAX_DIST);
          const fy = Math.floor(a.y / MAX_DIST);
          if (fx !== i || fy !== j) {
            removeFromArray(field, a);
            fields[fx][fy].push(a);
          }
        }
      }
    }
    for (let i = 0; i < fw; i++) {
      for (let j = 0; j < fh; j++) {
        const field = fields[i][j];
        for (let i1 = 0; i1 < field.length; i1++) {
          const a = field[i1];
          for (let j1 = i1 + 1; j1 < field.length; j1++) {
            const b = field[j1];
            applyForce(a, b);
          }
          if (i < fw - 1) {
            const iNext = i + 1;
            const field1 = fields[iNext][j];
            for (let j1 = 0; j1 < field1.length; j1++) {
              const b = field1[j1];
              applyForce(a, b);
            }
          }
          if (j < fh - 1) {
            const jNext = j + 1;
            const field1 = fields[i][jNext];
            for (let j1 = 0; j1 < field1.length; j1++) {
              const b = field1[j1];
              applyForce(a, b);
            }
            if (i < fw - 1) {
              const iNext = i + 1;
              const field2 = fields[iNext][jNext];
              for (let j1 = 0; j1 < field2.length; j1++) {
                const b = field2[j1];
                applyForce(a, b);
              }
            }
          }
        }
      }
    }
  }

  function update() {
    for (let i = 0; i < simulationsPerFrame; i++) logic();
    fields = [...fields];
    window.requestAnimationFrame(update);
  }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<main>
  <Visual
    {width}
    {height}
    {fields}
    {links}
    {fw}
    {fh}
    {r}
    colors={COLORS}
    on:click={(e) => {
      console.log("add");
      addParticle(
        e.clientX + Math.random() - 0.5,
        e.clientY + Math.random() - 0.5,
        selectedId
      );
    }}
  />
  <div class="controls" class:controls_opened={showSettings}>
    {#if showSettings}
      <div class="controls-block">
        <div class="buttons-row">
          <button on:click={() => (showSettings = false)}>Hide settings</button>
        </div>
      </div>
      <div class="controls-block">
        <h2 class="controls-block__title">Current world settings</h2>
        <InputRange
          name="Simulations per frame"
          min={1}
          max={20}
          bind:value={simulationsPerFrame}
        />
        <InputRange
          name="Speed multiplier"
          min={1}
          max={40}
          bind:value={speedMultiplier}
        />
        <div class="buttons-row">
          <button on:click={copyRules}>Copy link</button>
        </div>
      </div>
      <div class="controls-block">
        <h2 class="controls-block__title">New world settings</h2>
        <InputRange
          name="Colors"
          bind:value={$settingRuleSize}
          min={1}
          max={COLORS.length}
        />
        <InputRange
          name="Node count"
          bind:value={nodeCount}
          min={0}
          max={5000}
        />
        <div class="buttons-row">
          <button on:click={startNew}>Create new world</button>
        </div>
      </div>
      <div class="controls-block">
        <h2 class="controls-block__title">Particle brush</h2>
        <ParticleSelector
          colors={COLORS.slice(0, COUPLINGS.length)}
          bind:selectedId
        />
      </div>
    {:else}
      <button on:click={() => (showSettings = true)}>Show settings</button>
    {/if}
  </div>
</main>

<style>
  .controls {
    position: fixed;
    /* width: 300px; */
    left: 20px;
    top: 20px;
    background-color: rgba(255, 255, 255, 0.5);
    /* padding: 10px; */
    border-radius: 5px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition-duration: 0.2s;
  }
  .controls_opened {
    padding: 10px;
    width: 300px;
    border-radius: 10px;
  }
  .controls-block > * {
    margin-bottom: 0;
  }
  .controls-block:not(:last-child) {
    margin-bottom: 20px;
  }
  .controls-block__title {
    margin: 0;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-size: 100%;
  }
  .buttons-row {
    display: flex;
  }
  .buttons-row button {
    width: 100%;
  }
</style>
