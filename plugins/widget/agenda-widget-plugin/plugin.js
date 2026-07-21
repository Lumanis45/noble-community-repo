/**
 * Community example: a floating "Today" summary (extType: "small", anchor:
 * 'global') built entirely from data exposed by OTHER extensions — none of
 * it this plugin's own: dates/times parsed out of your notes
 * (AppAPI.data.entities, published by notes-plugin), Calendar View's
 * per-hour schedule (AppAPI.data.tryRead('calendar-view-plugin',
 * 'schedule')), and Quick Tags' tag list
 * (AppAPI.data.tryRead('tag-manager-plugin', 'tags')). Entirely read-only,
 * and degrades gracefully section by section depending on which of those
 * extensions are currently enabled — and refreshes live via the
 * `data:changed:<owner>:<key>` event whenever either changes.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'agenda-widget-plugin';
let removeOverlay = null;
let offEntitiesChanged = null;
let offScheduleChanged = null;
let offTagsChanged = null;

function render(container, api) {
  const entities = [
    ...api.data.entities.list({ type: 'date' }),
    ...api.data.entities.list({ type: 'datetime' }),
  ];
  // null = the owner isn't enabled / hasn't exposed that key right now.
  const schedule = api.data.tryRead('calendar-view-plugin', 'schedule', null);
  const tags = api.data.tryRead('tag-manager-plugin', 'tags', null);

  const scheduleRows = schedule
    ? Object.entries(schedule)
        .filter(([, text]) => text?.trim())
        .sort(([a], [b]) => Number(a) - Number(b))
    : null;

  container.innerHTML = `
    <p class="text-sm font-medium text-slate-700 mb-2">Agenda</p>
    <div class="space-y-2.5 text-xs text-slate-600">
      <div>
        <p class="font-medium text-slate-500 mb-1">From your notes</p>
        ${
          entities.length
            ? entities.slice(0, 4).map((e) => `<p class="truncate">${escapeHtml(e.raw)}</p>`).join('')
            : `<p class="text-slate-300">Nothing found</p>`
        }
      </div>
      <div>
        <p class="font-medium text-slate-500 mb-1">Schedule</p>
        ${
          scheduleRows === null
            ? `<p class="text-slate-300">Enable Calendar View to see this</p>`
            : scheduleRows.length
              ? scheduleRows.map(([hour, text]) => `<p class="truncate">${String(hour).padStart(2, '0')}:00 &mdash; ${escapeHtml(text)}</p>`).join('')
              : `<p class="text-slate-300">Nothing scheduled</p>`
        }
      </div>
      <div>
        <p class="font-medium text-slate-500 mb-1">Tags</p>
        ${
          tags === null
            ? `<p class="text-slate-300">Enable Quick Tags to see this</p>`
            : tags.length
              ? `<div class="flex flex-wrap gap-1">${tags.map((t) => `<span class="px-1.5 py-0.5 rounded-full bg-slate-100">${escapeHtml(t)}</span>`).join('')}</div>`
              : `<p class="text-slate-300">No tags yet</p>`
        }
      </div>
    </div>`;
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mount(api) {
  removeOverlay = api.ui.addOverlay(PLUGIN_ID, (container) => render(container, api));
}

export default {
  async activate(api) {
    registerInterop(api);
    mount(api);
    // Re-render whenever notes-plugin recomputes noteEntities, same as
    // Calendar View — see plugins/official/app/calendar-view-plugin.
    offEntitiesChanged = api.events.on('state:changed:noteEntities', () => mount(api));
    // Refresh live when Calendar View's schedule or Quick Tags' list changes
    // from anywhere else, since this widget never writes either itself.
    offScheduleChanged = api.events.on('data:changed:calendar-view-plugin:schedule', () => mount(api));
    offTagsChanged = api.events.on('data:changed:tag-manager-plugin:tags', () => mount(api));
    api.ui.showToast('Agenda activated');
  },

  async deactivate(api) {
    removeOverlay?.();
    removeOverlay = null;
    offEntitiesChanged?.();
    offEntitiesChanged = null;
    offScheduleChanged?.();
    offScheduleChanged = null;
    offTagsChanged?.();
    offTagsChanged = null;
    api.ui.showToast('Agenda deactivated');
  },
};
