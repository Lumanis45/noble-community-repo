import { registerInterop } from './interop.js';

const GRUVBOX_THEME = {
  background: '#282828',
  foreground: '#ebdbb2',
  accent: '#cc241d',
  dock: '#1d2021',
  notes: '#504945',
};


export default {
  async activate(api) {
    registerInterop(api);
    api.ui.dock.setPosition('bottom-right');
    api.ui.dock.setTheme({ accent: GRUVBOX_THEME.accent, background: GRUVBOX_THEME.background, foreground: GRUVBOX_THEME.foreground });

    api.ui.theme.set(GRUVBOX_THEME);
    api.ui.showToast('Gruvbox theme activated');
  },

  async deactivate(api) {
    api.ui.showToast('Gruvbox theme deactivated');
  },
};
