/**
 * Gruvbox — the palette, applied app-wide.
 *
 * It claims no `parts` in its manifest, so it owns all of them and evicts any
 * other theme when enabled. Narrowing it to just colours is a switch away in
 * the Library, and that selection is what decides which of the calls below
 * actually paint.
 */
export default {
  activate(api) {
    api.chrome.colors({
      background: '#282828',
      foreground: '#ebdbb2',
      accent: '#cc241d',
      dock: '#1d2021',
    });
    api.chrome.position({ position: 'bottom-right', variant: 'floating' });
    api.ui.toast('Gruvbox activated');
  },
};
