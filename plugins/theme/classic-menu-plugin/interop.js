/**
 * classic-menu-plugin's declared interaction surface. Every extension calls
 * into ./interop.js from plugin.js's activate() — see plugins/README.md's
 * "api.data" section — but declaring something is optional,
 * and a theme rarely has anything to add here: the chrome it repaints
 * (AppAPI.ui.dock) is already a shared, engine-gated surface every
 * extension can read, so there's no separate data contract
 * needed on top of it.
 */
export function registerInterop() {
  // Nothing to declare — see the note above.
}
