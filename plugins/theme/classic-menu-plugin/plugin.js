/**
 * Community example: swaps the dock's "type" from the default floating
 * circular dock to a classic website-style hamburger button + dropdown
 * list (icon + text rows), the way most sites build their nav menu. Uses
 * AppAPI.ui.dock.setVariant — the hamburger toggle and the Extension
 * Library row are still there and still fixed, just restyled.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'classic-menu-plugin';

export default {
  async activate(api) {
    registerInterop(api);
    api.ui.dock.setVariant('classic');
    api.ui.showToast('Classic Menu activated');
  },

  async deactivate(api) {
    // The engine restores the previous dock variant for us (see
    // ExtensionManager) — a theme never undoes its own chrome by hand.
    api.ui.showToast('Classic Menu deactivated');
  },
};
