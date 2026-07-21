# Quick Capture

A floating capture box, visible everywhere (`anchor: 'global'`). Typing a
line and hitting Capture writes a note directly into the shared notes store
— no composer sheet. An optional checkbox also drops the same text onto
your To-Do list, written through the surface `todo-list-plugin` itself
exposes, not by touching its storage.

- **Tier / type:** `community/widget`
- **extType / slot:** `small` / none
- **Storage:** none of its own
- **Exposes (`interop.js`):** nothing — no data surface of its own
- **Consumes:** `api.data.notes.upsert` (shared memory — see
  `plugins/official/app/notes-plugin`) and `todo-list-plugin`'s exposed
  `'tasks'` contract via `api.data.has`/`read`/`write`, when To-Do List is
  enabled

See [plugins/README.md](../../../README.md) for the full authoring
reference.
