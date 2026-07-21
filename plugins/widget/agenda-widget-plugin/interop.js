/**
 * agenda-widget-plugin's declared interaction surface. Every extension
 * calls into ./interop.js from plugin.js's activate() — see
 * plugins/README.md's "api.data" section — but declaring something is
 * optional. This extension is a pure consumer (api.data.entities, plus
 * calendar-view-plugin's and tag-manager-plugin's exposed contracts) and
 * owns no data surface of its own, so there's nothing to declare here.
 */
export function registerInterop() {
  // Nothing to declare — see the note above.
}
