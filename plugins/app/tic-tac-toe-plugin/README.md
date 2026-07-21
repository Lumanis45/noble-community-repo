# Tic-Tac-Toe

Community example: a small two-player game living entirely in the main
view — proof the engine is a generic host, not a notes app with extension
points bolted on. Joins the `"main"` slot's switcher alongside Notes (and
anything else there) instead of evicting it; there's no exclusive/evicting
extType for ordinary content anymore.

- **Tier / type:** `community/app`
- **extType / slot:** `big` / `main`
- **Storage:** none (game state is in-memory only, resets on deactivate)
- **Exposes (`interop.js`):** a `ticTacToe.reset` command, so another
  extension can start a fresh game
- **Consumes:** nothing

See [plugins/README.md](../../../README.md) for the full authoring reference.
