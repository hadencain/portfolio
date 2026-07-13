# Research templates

Not served, not deployed — this directory lives outside `public/` and `app/`, so
nothing here appears on the site. It's the preserved shape of a real research entry,
kept as a reference until a genuine investigation is published.

The `/research` page renders cards from `public/research/index.json` and each entry
page fetches `public/research/<slug>/entry.json` at request time. Right now
`index.json` is `[]` — the page shows no cards on purpose.

## To publish a real entry

Assay's portfolio export already does this automatically. The manual shape:

1. Drop the export folder into `public/research/<slug>/` — it contains `entry.json`
   plus `figure_*.png`.
2. Prepend a card object to `public/research/index.json` (the array). Use
   `index-entry.example.json` here as the shape — the fields the cards read are
   `slug`, `title`, `date`, `dataset`, `abstract`, `n_findings`.

That's it — the card appears on `/research`, and `/research/<slug>` renders the full
entry.

## What's here

- `index-entry.example.json` — one card object, the shape of an item in `index.json`.
- `example-entry/` — a complete worked entry (the synthetic e-commerce demo):
  `entry.json` + its figures. This is the shape of what goes into
  `public/research/<slug>/`. Synthetic data — reference only, never republish as real.
