/**
 * Community example: a floating quick-capture box (extType: "small",
 * anchor: 'global' — visible everywhere, not anchored to one main-view
 * extension). Typing a line and hitting Capture creates a note straight
 * into the shared notes store (AppAPI.data.notes.upsert) — no composer
 * sheet, no round trip through Notes' own UI. A checkbox lets you also drop
 * the same text onto your To-Do list, written through the surface
 * todo-list-plugin itself chose to expose
 * (AppAPI.data.write('todo-list-plugin', 'tasks', ...)) — this
 * extension never touches todo-list-plugin's storage directly. Degrades
 * gracefully (hides the checkbox) if To-Do List isn't currently enabled.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'quick-capture-plugin';
let removeOverlay = null;

function render(container, api) {
  const todoAvailable = api.data.has('todo-list-plugin', 'tasks');
  container.innerHTML = `
    <p class="text-sm font-medium text-slate-700 mb-2">Quick Capture</p>
    <form data-form class="flex flex-col gap-2">
      <input data-input type="text" placeholder="Capture a thought..."
        class="w-full text-sm outline-none border border-slate-200 rounded-lg px-2.5 py-1.5 placeholder:text-slate-300" />
      ${
        todoAvailable
          ? `<label class="flex items-center gap-1.5 text-xs text-slate-500">
               <input type="checkbox" data-also-task class="w-3.5 h-3.5 rounded border-slate-300" />
               Also add to To-Do
             </label>`
          : ''
      }
      <button type="submit"
        class="self-end px-3 py-1.5 rounded-lg bg-[var(--app-accent)] text-white text-xs font-medium active:scale-95 transition-transform">Capture</button>
    </form>`;

  container.querySelector('[data-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = container.querySelector('[data-input]');
    const text = input.value.trim();
    if (!text) return;
    const now = Date.now();

    // Shared memory: any extension can read this the same way notes-plugin's
    // own composer creates a note — see AppAPI.data in plugins/README.md.
    api.data.notes.upsert({ id: crypto.randomUUID(), title: text, body: '', createdAt: now, updatedAt: now });

    const alsoTask = container.querySelector('[data-also-task]')?.checked;
    if (alsoTask && todoAvailable) {
      try {
        const tasks = api.data.read('todo-list-plugin', 'tasks');
        api.data.write('todo-list-plugin', 'tasks', [...tasks, { id: crypto.randomUUID(), label: text, done: false }]);
      } catch (err) {
        console.error(err);
      }
    }

    input.value = '';
    api.ui.showToast('Captured');
  });
}

export default {
  async activate(api) {
    registerInterop(api);
    removeOverlay = api.ui.addOverlay(PLUGIN_ID, (container) => render(container, api));
    api.ui.showToast('Quick Capture activated');
  },

  async deactivate(api) {
    removeOverlay?.();
    removeOverlay = null;
    api.ui.showToast('Quick Capture deactivated');
  },
};
