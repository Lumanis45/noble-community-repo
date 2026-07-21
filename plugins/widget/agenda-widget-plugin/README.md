# Agenda

A floating "Today" summary, visible everywhere (`anchor: 'global'`), built
entirely from data exposed by other extensions: dates/times parsed out of
your notes, Calendar View's schedule, and Quick Tags' tags. Purely
read-only — it never writes anywhere, and degrades gracefully section by
section depending on which of those extensions are currently enabled.

- **Tier / type:** `community/widget`
- **extType / slot:** `small` / none
- **Storage:** none
- **Exposes (`interop.js`):** nothing — no data surface of its own
- **Consumes:** `api.data.entities.list()` (shared memory — see
  `plugins/official/app/notes-plugin`), `calendar-view-plugin`'s exposed
  `'schedule'` contract, and `tag-manager-plugin`'s exposed `'tags'`
  contract, both via `api.data.tryRead` — refreshes live on either's
  `data:changed:<owner>:<key>` event

See [plugins/README.md](../../../README.md) for the full authoring
reference.
