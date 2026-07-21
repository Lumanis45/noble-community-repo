/**
 * Terraria — a mobile mini-sandbox in the spirit of Terraria, entirely on canvas.
 * Joins the "main" slot as another switcher tab (extType: "big"), like tic-tac-toe-plugin.
 * Fully button-based controls (touch-friendly), no keyboard. Exposes a
 * `terraria.regenerateWorld` command via ./interop.js.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'terraria-plugin';

const TILE = 28;
const COLS = 16;
const ROWS = 10;
const SURFACE_ROW = 3; // строка, на которой трава

const AIR = 0;
const GRASS = 1;
const DIRT = 2;
const STONE = 3;
const BEDROCK = 4;

const BLOCK_COLOR = {
  [GRASS]: '#5ec94f',
  [DIRT]: '#8b5a2b',
  [STONE]: '#8a8a8a',
  [BEDROCK]: '#2b2b2b',
};
const BLOCK_LABEL = {
  [GRASS]: '🟩',
  [DIRT]: '🟫',
  [STONE]: '⬜',
};
const PLACEABLE = [GRASS, DIRT, STONE];

let unregisterView = null;
let activeContainerCleanup = null;
let unregisterInterop = null;
/** Set by render() on mount; lets ./interop.js's 'terraria.regenerateWorld' command drive the same reset the ↻ button does. */
let regenerateWorld = null;

function generateWorld() {
  const world = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new Array(COLS).fill(AIR);
    if (r === SURFACE_ROW) row.fill(GRASS);
    else if (r > SURFACE_ROW && r < ROWS - 2) row.fill(DIRT);
    else if (r === ROWS - 2) row.fill(STONE);
    else if (r === ROWS - 1) row.fill(BEDROCK);
    world.push(row);
  }
  for (let r = SURFACE_ROW + 1; r < ROWS - 2; r++) {
    for (let c = 0; c < COLS; c++) {
      if (Math.random() < 0.15) world[r][c] = STONE;
    }
  }
  return world;
}

function isSolid(tile) {
  return tile !== AIR;
}

function render(container) {
  container.innerHTML = `
    <div class="relative w-full h-full flex flex-col items-center justify-center gap-2 p-2 select-none" style="touch-action:none;">
      <div class="flex items-center justify-between w-full" style="max-width:${COLS * TILE}px;">
        <div data-materials class="flex items-center gap-1"></div>
        <button type="button" data-action="reset"
          class="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--app-accent)] text-white active:scale-95 transition-transform">
          ↻
        </button>
      </div>

      <canvas data-canvas width="${COLS * TILE}" height="${ROWS * TILE}"
        style="width:100%;max-width:${COLS * TILE}px;height:auto;border-radius:12px;touch-action:none;"
        class="shadow-md border border-slate-200"></canvas>

      <div class="flex items-center justify-between w-full" style="max-width:${COLS * TILE}px;">
        <div class="flex items-center gap-2">
          <button type="button" data-btn="left"
            class="w-12 h-12 rounded-full bg-slate-200 text-slate-700 text-xl font-bold active:scale-90 transition-transform">◀</button>
          <button type="button" data-btn="right"
            class="w-12 h-12 rounded-full bg-slate-200 text-slate-700 text-xl font-bold active:scale-90 transition-transform">▶</button>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" data-mode="mine"
            class="w-12 h-12 rounded-full text-xl active:scale-90 transition-transform">⛏</button>
          <button type="button" data-mode="build"
            class="w-12 h-12 rounded-full text-xl active:scale-90 transition-transform">🧱</button>
          <button type="button" data-btn="jump"
            class="w-14 h-12 rounded-full bg-[var(--app-accent)] text-white text-xl font-bold active:scale-90 transition-transform">⤒</button>
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('[data-canvas]');
  const ctx = canvas.getContext('2d');
  const materialsEl = container.querySelector('[data-materials]');
  const resetBtn = container.querySelector('[data-action="reset"]');
  const leftBtn = container.querySelector('[data-btn="left"]');
  const rightBtn = container.querySelector('[data-btn="right"]');
  const jumpBtn = container.querySelector('[data-btn="jump"]');
  const mineModeBtn = container.querySelector('[data-mode="mine"]');
  const buildModeBtn = container.querySelector('[data-mode="build"]');

  let world = generateWorld();
  const inventory = { [GRASS]: 0, [DIRT]: 0, [STONE]: 0 };
  let selected = DIRT;
  let mode = 'mine'; // 'mine' | 'build'

  const player = {
    x: (COLS / 2) * TILE,
    y: (SURFACE_ROW - 1) * TILE,
    w: TILE * 0.6,
    h: TILE * 0.9,
    vx: 0,
    vy: 0,
    grounded: false,
  };

  const held = { left: false, right: false, jump: false };
  const GRAVITY = 1400;
  const MOVE_SPEED = 220;
  const JUMP_VELOCITY = -560;
  const REACH = 3.2 * TILE;

  function paintModeButtons() {
    mineModeBtn.className = `w-12 h-12 rounded-full text-xl active:scale-90 transition-transform ${
      mode === 'mine' ? 'bg-[var(--app-accent)] text-white' : 'bg-slate-200 text-slate-700'
    }`;
    buildModeBtn.className = `w-12 h-12 rounded-full text-xl active:scale-90 transition-transform ${
      mode === 'build' ? 'bg-[var(--app-accent)] text-white' : 'bg-slate-200 text-slate-700'
    }`;
  }

  function paintMaterials() {
    materialsEl.innerHTML = PLACEABLE.map((t) => `
      <button type="button" data-material="${t}"
        class="px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-90 transition-transform
          ${selected === t ? 'bg-[var(--app-accent)] text-white' : 'bg-slate-100 text-slate-600'}">
        <span>${BLOCK_LABEL[t]}</span><span>${inventory[t]}</span>
      </button>`).join('');
    materialsEl.querySelectorAll('[data-material]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected = Number(btn.dataset.material);
        paintMaterials();
      });
    });
  }

  function tileAt(px, py) {
    const c = Math.floor(px / TILE);
    const r = Math.floor(py / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return BEDROCK;
    return world[r][c];
  }

  function rectSolid(x, y, w, h) {
    return (
      isSolid(tileAt(x, y)) ||
      isSolid(tileAt(x + w, y)) ||
      isSolid(tileAt(x, y + h)) ||
      isSolid(tileAt(x + w, y + h))
    );
  }

  function bindHold(btn, key) {
    const start = (e) => {
      e.preventDefault();
      held[key] = true;
    };
    const end = (e) => {
      e.preventDefault();
      held[key] = false;
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
    return () => {
      btn.removeEventListener('pointerdown', start);
      btn.removeEventListener('pointerup', end);
      btn.removeEventListener('pointerleave', end);
      btn.removeEventListener('pointercancel', end);
    };
  }

  const unbindLeft = bindHold(leftBtn, 'left');
  const unbindRight = bindHold(rightBtn, 'right');
  const unbindJump = bindHold(jumpBtn, 'jump');

  function inReach(c, r) {
    const dx = c * TILE + TILE / 2 - (player.x + player.w / 2);
    const dy = r * TILE + TILE / 2 - (player.y + player.h / 2);
    return Math.hypot(dx, dy) <= REACH;
  }

  function onCanvasPointerDown(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const c = Math.floor(x / TILE);
    const r = Math.floor(y / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (!inReach(c, r)) return;

    if (mode === 'mine') {
      const tile = world[r][c];
      if (tile === AIR || tile === BEDROCK) return;
      world[r][c] = AIR;
      inventory[tile] = (inventory[tile] || 0) + 1;
      paintMaterials();
    } else {
      if (world[r][c] !== AIR) return;
      if (!inventory[selected]) return;
      world[r][c] = selected;
      inventory[selected] -= 1;
      paintMaterials();
    }
  }

  function onModeClick(next) {
    mode = next;
    paintModeButtons();
  }
  mineModeBtn.addEventListener('click', () => onModeClick('mine'));
  buildModeBtn.addEventListener('click', () => onModeClick('build'));

  function update(dt) {
    player.vx = (held.right ? MOVE_SPEED : 0) - (held.left ? MOVE_SPEED : 0);
    if (held.jump && player.grounded) {
      player.vy = JUMP_VELOCITY;
      player.grounded = false;
    }

    player.vy += GRAVITY * dt;

    let nextX = player.x + player.vx * dt;
    if (!rectSolid(nextX, player.y, player.w, player.h)) {
      player.x = nextX;
    }
    player.x = Math.max(0, Math.min(COLS * TILE - player.w, player.x));

    let nextY = player.y + player.vy * dt;
    if (!rectSolid(player.x, nextY, player.w, player.h)) {
      player.y = nextY;
      player.grounded = false;
    } else {
      if (player.vy > 0) player.grounded = true;
      player.vy = 0;
    }
    player.y = Math.max(0, Math.min(ROWS * TILE - player.h, player.y));
  }

  function draw() {
    ctx.fillStyle = '#bfe3ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = world[r][c];
        if (tile === AIR) continue;
        ctx.fillStyle = BLOCK_COLOR[tile];
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
      }
    }

    ctx.fillStyle = '#e23b3b';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.w * 0.15, player.y + player.h * 0.2, player.w * 0.2, player.h * 0.15);
    ctx.fillRect(player.x + player.w * 0.65, player.y + player.h * 0.2, player.w * 0.2, player.h * 0.15);
  }

  let lastTime = performance.now();
  let rafId = null;
  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function doReset() {
    world = generateWorld();
    inventory[GRASS] = 0;
    inventory[DIRT] = 0;
    inventory[STONE] = 0;
    player.x = (COLS / 2) * TILE;
    player.y = (SURFACE_ROW - 1) * TILE;
    player.vx = 0;
    player.vy = 0;
    paintMaterials();
  }

  canvas.addEventListener('pointerdown', onCanvasPointerDown);
  resetBtn.addEventListener('click', doReset);
  regenerateWorld = doReset;

  paintMaterials();
  paintModeButtons();
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);

  container.__terrariaCleanup = () => {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('pointerdown', onCanvasPointerDown);
    unbindLeft();
    unbindRight();
    unbindJump();
  };
}

export default {
  async activate(api) {
    unregisterView = api.ui.setMainView(PLUGIN_ID, (container) => {
      activeContainerCleanup?.();
      render(container);
      activeContainerCleanup = container.__terrariaCleanup;
    });
    unregisterInterop = registerInterop(api, { regenerateWorld: () => regenerateWorld?.() });
    api.ui.showToast('Terraria activated');
  },

  async deactivate(api) {
    activeContainerCleanup?.();
    activeContainerCleanup = null;
    unregisterView?.();
    unregisterView = null;
    unregisterInterop?.();
    unregisterInterop = null;
    regenerateWorld = null;
    api.ui.showToast('Terraria deactivated');
  },
};
