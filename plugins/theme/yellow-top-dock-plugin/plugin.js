/**
 * Community example: drags the burger menu to the top of the screen and
 * paints the whole app yellow. Built from the chrome surfaces only a
 * `theme`-type extension is allowed to touch (AppAPI.ui.dock + AppAPI.ui.theme)
 * — it cannot reach the hamburger toggle or the Extension Library button,
 * those simply aren't part of the surface. It also demonstrates
 * `setButtonLocation`: being a theme (the type meant to own app-wide chrome
 * decisions), it relocates the Settings button into the bottom bar while
 * active. Note the asymmetry with `activate`: nothing is undone here by hand.
 * The engine snapshots all chrome — position, accent, theme tokens, button
 * placement — before this paints and replays it on deactivate (see
 * ExtensionManager), so the reskin can never "stick".
 */
import { registerInterop } from './interop.js';

const YELLOW_THEME = { background: '#fef9c3', foreground: '#713f12', accent: '#ca8a04' };

export default {
  async activate(api) {
    registerInterop(api);
    api.ui.dock.setPosition('top-right');
    api.ui.dock.setTheme({ accent: YELLOW_THEME.accent });
    api.ui.theme.set(YELLOW_THEME);
    api.ui.dock.setButtonLocation('settings', 'bottom');

    api.ui.showToast('Sunshine Mode activated ☀️');
  },

  async deactivate(api) {
    api.ui.showToast('Sunshine Mode deactivated');
  },
};
