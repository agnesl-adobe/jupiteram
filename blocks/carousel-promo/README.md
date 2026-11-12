# carousel-promo

Custom **carousel** block. Purpose: Compact text-led promo slider with Prev/Next circular arrow buttons. One row per slide: optional image | heading, paragraph, CTA link. Empty image cells are dropped.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide; cells: Image (media_image, media_imageAlt) | Text (content_text): heading, description, CTA link.

## Supported variations

No variations.

## Universal Editor fields

- `carousel-promo-item` / `media_image` (reference): Image
- `carousel-promo-item` / `media_imageAlt` (text): Image Alt Text
- `carousel-promo-item` / `content_text` (richtext): Text


## Reuse guidance

Use for short promo/announcement rotations beside other content. Not for full-bleed hero imagery (use carousel-hero).

Generated CSS is structural only; brand styling comes from the design pass.
