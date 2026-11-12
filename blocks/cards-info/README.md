# cards-info

Custom **cards** block. Purpose: Grid of text-only help/resource cards (3 per row on desktop). One row per card: image cell (usually empty) | heading, description and a trailing link paragraph that is pinned to the card bottom as the CTA.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per card; cells: Image (image, imageAlt); keep the cell even when empty | Text (text): heading, description, CTA.

## Supported variations

No variations.

## Universal Editor fields

- `cards-info-card` / `image` (reference): Image
- `cards-info-card` / `imageAlt` (text): Image Alt Text
- `cards-info-card` / `text` (richtext): Text


## Reuse guidance

Use for tinted info/help cards with a CTA. For article listings with image, date, author and tag use cards-insights.

Generated CSS is structural only; brand styling comes from the design pass.
