# Classic Menu

Community example: swaps the floating dock for a plain website-style
hamburger dropdown. A minimal `theme:position` sub-slot theme — it only
touches `dock.setPosition`/`dock.setVariant`, so it can be active
simultaneously with a `theme:color` (or `theme:layout`) theme from a
different extension without evicting it.

- **Tier / type:** `community/theme`
- **extType / slot:** `theme` / `theme:position`
- **Storage:** none
- **Exposes (`interop.js`):** nothing — `interop.js` is present (every
  extension calls into it) but is a documented no-op here: chrome mutators
  are already an open, engine-gated surface for theme extensions
- **Consumes:** nothing

See [plugins/README.md](../../../README.md) for the full authoring
reference, in particular the sub-slot theme section.
