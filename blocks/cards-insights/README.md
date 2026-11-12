# cards-insights

Custom **cards** block. Purpose: Article/insight cards. One row per card: image | meta paragraph(s) (date, read time) before the heading, heading linked to the article, author paragraph, and a tag paragraph (the last short paragraph after the heading, linked or plain text) rendered as a pill. The whole card is clickable through the heading link.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per card; cells: Image (image, imageAlt); keep the cell even when empty | Text (text): heading, description, CTA.

## Supported variations

No variations.

## Universal Editor fields

- `cards-insights-card` / `image` (reference): Image
- `cards-insights-card` / `imageAlt` (text): Image Alt Text
- `cards-insights-card` / `text` (richtext): Text


## Reuse guidance

Use for "Related insights" and other article listings. For text-only help cards use cards-info.

Generated CSS is structural only; brand styling comes from the design pass.
