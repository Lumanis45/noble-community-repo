/**
 * Community example: a small two-player Tic-Tac-Toe game living in the main
 * view. Verifies the engine is a generic host, not a notes app with
 * extension points bolted on — a totally unrelated app can live in the same
 * main-view slot. It's declared `"extType": "big", "slot": "main"` in its
 * manifest, so it just joins Notes (and any other "main" occupant) as
 * another switcher tab — see ui/workspace.js + ui/bottomBar.js for the
 * switcher UI that appears once a slot has 2+ simultaneous occupants.
 * Also exposes a `ticTacToe.reset` command via ./interop.js.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'tic-tac-toe-plugin';
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let unregisterView = null;
let unregisterInterop = null;
/** Set by render() on mount; lets ./interop.js's 'ticTacToe.reset' command drive the same reset the button does. */
let resetGame = null;

function checkResult(cells) {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
  }
  return cells.every(Boolean) ? 'draw' : null;
}

function render(container) {
  let cells = Array(9).fill(null);
  let turn = 'X';
  let result = null;

  function paint() {
    const status = result ? (result === 'draw' ? "It's a draw!" : `${result} wins!`) : `${turn}'s turn`;
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full gap-4 p-6">
        <p class="text-sm text-slate-500">${status}</p>
        <div class="grid grid-cols-3 gap-2 w-64">
          ${cells
            .map(
              (cell, i) => `
            <button type="button" data-cell="${i}" ${cell || result ? 'disabled' : ''}
              class="aspect-square rounded-xl border border-slate-200 bg-white text-3xl font-semibold
                     text-slate-700 flex items-center justify-center hover:bg-slate-50
                     active:scale-95 transition-transform disabled:active:scale-100">${cell ?? ''}</button>`
            )
            .join('')}
        </div>
        <button type="button" data-action="reset"
          class="text-sm font-medium px-4 py-2 rounded-xl bg-[var(--app-accent)] text-white active:scale-95 transition-transform">
          Reset
        </button>
      </div>`;

    container.querySelectorAll('[data-cell]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.cell);
        if (cells[i] || result) return;
        cells[i] = turn;
        result = checkResult(cells);
        turn = turn === 'X' ? 'O' : 'X';
        paint();
      });
    });
    container.querySelector('[data-action="reset"]').addEventListener('click', () => reset());
  }

  function reset() {
    cells = Array(9).fill(null);
    turn = 'X';
    result = null;
    paint();
  }

  resetGame = reset;
  paint();
}

export default {
  async activate(api) {
    unregisterView = api.ui.setMainView(PLUGIN_ID, render);
    unregisterInterop = registerInterop(api, { reset: () => resetGame?.() });
    api.ui.showToast('Tic-Tac-Toe activated');
  },

  async deactivate(api) {
    unregisterView?.();
    unregisterView = null;
    unregisterInterop?.();
    unregisterInterop = null;
    resetGame = null;
    api.ui.showToast('Tic-Tac-Toe deactivated');
  },
};
