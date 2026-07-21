# Sunshine Mode

Community example: drags the burger menu to the top and paints the whole
app yellow — a full theme (`slot: "theme"`) touching all three chrome
dimensions at once (`components: ["theme:color", "theme:position",
"theme:layout"]`). The only example that calls `setButtonLocation`.

- **Tier / type:** `community/theme`
- **extType / slot:** `theme` / `theme` (full, filterable via `components`)
- **Storage:** none
- **Exposes (`interop.js`):** nothing — `interop.js` is present (every
  extension calls into it) but is a documented no-op here: chrome mutators
  are already an open, engine-gated surface for theme extensions
- **Consumes:** nothing

See [plugins/README.md](../../../README.md) for the full authoring
reference.
