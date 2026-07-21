/**
 * Community example: proves extensions can restyle the engine's chrome
 * (dock position, accent color, pinned shortcuts, a settings section)
 * without ever touching the hamburger toggle or the Extension Library
 * button — AppAPI simply doesn't expose a way to reach those.
 */
import { registerInterop } from './interop.js';

const PLUGIN_ID = 'dock-customizer-plugin';

let unpinButton = null;
let unregisterSettings = null;

export default {
  async activate(api) {
    registerInterop(api);
    api.ui.dock.setPosition('bottom-left');
    api.ui.dock.setTheme({ accent: '#7c3aed' });

    unpinButton = api.ui.dock.addButton(PLUGIN_ID, {
      icon: 'puzzle',
      title: 'Say hi',
      onClick: () => api.ui.showToast('Hi from the Dock Customizer!'),
    });

    unregisterSettings = api.settings.registerSection(PLUGIN_ID, {
      title: 'Dock Customizer',
      render(container) {
        container.innerHTML = `
          <p class="text-sm text-slate-600">
            This extension moved the dock to the bottom-left corner, retinted it purple,
            and pinned a shortcut. Deactivate it in the Extension Library to restore the
            default dock.
          </p>`;
      },
    });

    api.ui.showToast('Dock Customizer activated');
  },

  async deactivate(api) {
    // No need to undo setPosition/setTheme: the engine snapshots chrome before
    // a theme paints and restores it on deactivate (see ExtensionManager). A
    // theme only cleans up its OWN registrations — its pinned button and
    // settings section.
    unpinButton?.();
    unpinButton = null;
    unregisterSettings?.();
    unregisterSettings = null;
    api.ui.showToast('Dock Customizer deactivated');
  },
};
