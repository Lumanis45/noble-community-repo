/**
 * Classic Menu — swaps the floating dock for a website-style hamburger
 * dropdown.
 *
 * It claims only the `position` part, so it can run alongside a theme that
 * claims only `colors`: the two never contend for the same chrome.
 */
export default {
  activate(api) {
    api.chrome.position({ variant: 'classic' });
    api.ui.toast('Classic Menu activated');
  },
};
