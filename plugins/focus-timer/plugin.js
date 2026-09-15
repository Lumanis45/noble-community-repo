/**
 * Focus Timer — alternating focus and break phases with a session counter.
 *
 * `running` is deliberately not persisted: a reload leaves you paused at the
 * remaining time rather than silently counting down while the app was closed.
 *
 * The countdown patches only the digits it changes instead of re-rendering the
 * card each second, which keeps the preset buttons from being rebuilt under
 * the user's finger.
 */
const PRESETS = [15, 25, 50];
const BREAK_MIN = 5;

const format = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default {
  activate(api) {
    const phase = api.store('phase', 'focus');
    const focusMin = api.store('focusMin', 25);
    const left = api.store('secondsLeft', 25 * 60);
    const completed = api.store('completed', 0);

    let timer = null;
    let controls = null;
    api.cleanup(() => clearInterval(timer));

    const phaseSeconds = () => (phase.get() === 'focus' ? focusMin.get() : BREAK_MIN) * 60;

    api.ui.card((el) => {
      const isFocus = () => phase.get() === 'focus';
      let running = false;

      el.innerHTML = api.html`
        <div class="flex items-center justify-between mb-2 pr-6">
          <p class="text-sm font-medium text-slate-700">Focus Timer</p>
          <span class="text-[11px] text-slate-400 tabular-nums" title="Focus sessions completed">${completed.get()} done</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <span data-phase class="block text-[11px] font-medium uppercase tracking-wide"></span>
            <span data-display class="block text-2xl font-semibold text-slate-800 tabular-nums leading-tight"></span>
          </div>
          <div class="flex gap-2 shrink-0">
            <button type="button" data-toggle
              class="px-3 py-1.5 rounded-lg bg-[var(--app-accent)] text-white text-xs font-medium active:scale-95 transition-transform">Start</button>
            <button type="button" data-reset
              class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium active:scale-95 transition-transform">Reset</button>
          </div>
        </div>
        <div data-presets class="flex items-center gap-1.5 mt-2.5"></div>`;

      const display = el.querySelector('[data-display]');
      const phaseEl = el.querySelector('[data-phase]');
      const toggleBtn = el.querySelector('[data-toggle]');
      const presets = el.querySelector('[data-presets]');

      const paint = () => {
        display.textContent = format(left.get());
        phaseEl.textContent = isFocus() ? 'Focus' : 'Break';
        phaseEl.className = `block text-[11px] font-medium uppercase tracking-wide ${
          isFocus() ? 'text-[var(--app-accent)]' : 'text-emerald-500'
        }`;
      };

      // The length picker only appears while idle at the top of a focus phase,
      // where changing it cannot contradict a countdown already in progress.
      const paintPresets = () => {
        const editable = !running && isFocus() && left.get() === focusMin.get() * 60;
        presets.innerHTML = editable
          ? api.html`${PRESETS.map((m) => api.html`
              <button type="button" data-preset="${m}"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  m === focusMin.get() ? 'bg-[var(--app-accent)] text-white' : 'bg-slate-100 text-slate-500'
                }">${m}m</button>`)}`
          : '';
        presets.querySelectorAll('[data-preset]').forEach((btn) => {
          btn.addEventListener('click', () => {
            focusMin.set(Number(btn.dataset.preset));
            left.set(focusMin.get() * 60);
            paint();
            paintPresets();
          });
        });
      };

      const stop = () => {
        if (!running) return;
        running = false;
        toggleBtn.textContent = 'Start';
        clearInterval(timer);
        timer = null;
        paintPresets();
      };

      const finish = () => {
        stop();
        if (isFocus()) {
          completed.set(completed.get() + 1);
          phase.set('break');
          api.ui.toast('Focus session done — take a break');
        } else {
          phase.set('focus');
          api.ui.toast('Break over — back to focus');
        }
        left.set(phaseSeconds());
        api.ui.refresh();
      };

      const start = () => {
        if (running || left.get() === 0) return;
        running = true;
        toggleBtn.textContent = 'Pause';
        paintPresets();
        timer = setInterval(() => {
          left.set(Math.max(0, left.get() - 1));
          display.textContent = format(left.get());
          if (left.get() === 0) finish();
        }, 1000);
      };

      const reset = () => {
        stop();
        left.set(phaseSeconds());
        paint();
        paintPresets();
      };

      toggleBtn.addEventListener('click', () => (running ? stop() : start()));
      el.querySelector('[data-reset]').addEventListener('click', reset);
      paint();
      paintPresets();
      controls = { start, pause: stop, reset };
    });

    // Published so any extension can drive the same timer the buttons drive.
    api.action('start', () => controls?.start());
    api.action('pause', () => controls?.pause());
    api.action('reset', () => controls?.reset());
  },
};
