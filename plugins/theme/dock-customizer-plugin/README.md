# Dock Customizer

Community example: a full theme (`slot: "theme"`) that moves the dock,
retints it, and pins a shortcut — proof that extensions can restyle the
engine's one piece of chrome. Declares `components: ["theme:color",
"theme:position"]`, so the Library's detail page offers a per-dimension
toggle letting the user combine, say, its colors with another theme's
layout.

- **Tier / type:** `community/theme`
- **extType / slot:** `theme` / `theme` (full, filterable via `components`)
- **Storage:** none
- **Exposes (`interop.js`):** nothing — `interop.js` is present (every
  extension calls into it) but is a documented no-op here: chrome mutators
  (`AppAPI.ui.dock.*`, `AppAPI.ui.theme.*`) are already an open,
  engine-gated surface for theme extensions, so there's no additional
  interop contract to declare
- **Consumes:** nothing

See [plugins/README.md](../../../README.md) for the full authoring
reference, in particular the `theme` extType section and its component
filter mechanics.
