/**
 * Calendar View — a daily schedule that joins Notes as another tab.
 *
 * Two sources meet in one view: hours you fill in here, stored and shared as
 * `schedule`, and dates Notes parsed out of your note bodies, read from its
 * `dates` store. The second needs no input at all — writing a date in a note
 * is what puts it here.
 *
 * Hour fields write on input without re-rendering, because rebuilding the row
 * would take the caret with it.
 */
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export default {
  activate(api) {
    const schedule = api.store('schedule', {}, {
      shared: true,
      describe: 'Per-hour plan text, keyed by hour number: { 14: "Standup" }.',
    });
    const notes = api.shared('notes', 'notes', []);
    const dates = api.shared('notes', 'dates', []);

    api.ui.main((el) => {
      const plan = schedule.get();
      const byId = new Map(notes.get().map((n) => [n.id, n]));
      const openable = api.extensions.isOn('notes');

      const groups = [...dates.get().reduce((map, e) => {
        const day = e.value.slice(0, 10);
        map.set(day, [...(map.get(day) ?? []), e]);
        return map;
      }, new Map())].sort(([a], [b]) => a.localeCompare(b));

      const rowCls = openable
        ? 'flex items-center gap-2 text-sm text-slate-600 py-0.5 -mx-1 px-1 rounded-lg cursor-pointer hover:bg-slate-50 active:bg-slate-100'
        : 'flex items-center gap-2 text-sm text-slate-600 py-0.5';

      el.innerHTML = api.html`
        <div class="p-4 space-y-5">
          ${groups.length ? api.html`
            <div>
              <p class="text-sm font-medium text-slate-700 mb-3">From your notes</p>
              <div class="space-y-2">
                ${groups.map(([day, items]) => api.html`
                  <div class="rounded-2xl border border-slate-200 bg-white p-3">
                    <p class="text-xs font-semibold text-slate-500 mb-1.5">${day}</p>
                    ${items.map((e) => api.html`
                      <div class="${rowCls}" data-open="${openable ? e.noteId : ''}">
                        ${e.value.length > 10
                          ? api.html`<span class="text-xs text-slate-400 tabular-nums shrink-0">${e.value.slice(11)}</span>`
                          : ''}
                        <span class="truncate">${byId.get(e.noteId)?.title || e.raw}</span>
                      </div>`)}
                  </div>`)}
              </div>
            </div>` : ''}

          <div>
            <p class="text-sm font-medium text-slate-700 mb-3">Today's Schedule</p>
            <div class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              ${HOURS.map((hour) => api.html`
                <div class="flex items-center gap-3 px-3 py-2">
                  <span class="text-xs text-slate-400 w-12 shrink-0">${String(hour).padStart(2, '0')}:00</span>
                  <input type="text" placeholder="Add event..." value="${plan[hour] ?? ''}" data-hour="${hour}"
                    class="flex-1 text-sm outline-none placeholder:text-slate-300" />
                </div>`)}
            </div>
          </div>
        </div>`;

      el.querySelectorAll('[data-hour]').forEach((input) => {
        input.addEventListener('input', () => {
          schedule.set({ ...schedule.get(), [input.dataset.hour]: input.value });
        });
      });

      el.querySelectorAll('[data-open]').forEach((row) => {
        if (row.dataset.open) row.addEventListener('click', () => api.call('notes', 'open', row.dataset.open));
      });
    });

    // Only the notes-derived half is redrawn from outside; a schedule change
    // came from an input in this view, which is already showing it.
    notes.onChange(() => api.ui.refresh());
    dates.onChange(() => api.ui.refresh());
  },
};
