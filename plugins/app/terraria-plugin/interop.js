/**
 * terraria-plugin's declared interaction surface. Called once from
 * plugin.js's activate(), with the returned unregister fn called from
 * deactivate() — same convention every plugin follows, official or
 * community. See plugins/README.md's "api.data" section.
 */
export function registerInterop(api, { regenerateWorld }) {
  api.commands.register('terraria.regenerateWorld', () => regenerateWorld());
  return () => api.commands.unregister('terraria.regenerateWorld');
}
