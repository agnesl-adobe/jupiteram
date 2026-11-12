# carousel-hero

Custom **carousel** block. Purpose: Full-bleed hero slider at the top of a landing page. One row per slide: background image | heading (H1 on the first slide), intro paragraph and one CTA link. Dot pagination; autoplays (paused on hover/focus and for reduced motion).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide; cells: Image (media_image, media_imageAlt) | Text (content_text): heading, description, CTA link.

## Supported variations

No variations.

## Universal Editor fields

- `carousel-hero-item` / `media_image` (reference): Image
- `carousel-hero-item` / `media_imageAlt` (text): Image Alt Text
- `carousel-hero-item` / `content_text` (richtext): Text


## Reuse guidance

Use for rotating hero banners with a cover photo per slide. For a single static hero use the hero block; for compact text-led sliders use carousel-promo.

Generated CSS is structural only; brand styling comes from the design pass.
