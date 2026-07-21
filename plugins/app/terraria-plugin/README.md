# Terraria

A small mobile sandbox in the style of Terraria: walk, dig, and build with
blocks on an on-screen canvas, fully button-based controls. Joins the
`"main"` slot's switcher alongside Notes, like `tic-tac-toe-plugin`.

- **Tier / type:** `community/app`
- **extType / slot:** `big` / `main`
- **Storage:** none (world state is in-memory only, resets on deactivate)
- **Exposes (`interop.js`):** a `terraria.regenerateWorld` command, so
  another extension can trigger a fresh world
- **Consumes:** nothing

See [plugins/README.md](../../../README.md) for the full authoring reference.
