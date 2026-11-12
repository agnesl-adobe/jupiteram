# search-fund-finder

Custom **search** block. Purpose: Fund search panel: optional intro row (e.g. heading "Search for a fund"), a row with the fund data URL (.json with a data array of name, isin, assetClass, legalStructure, path), and a row with the "View all funds" link. Renders a name/ISIN input, asset class and legal structure selects, and a live "View N results" button that opens the all-funds page with q/assetClass/legalStructure query parameters.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: optional intro row (rich text, e.g. "Search for a fund" heading); a row with the fund data URL (.json); a row with the "View all funds" link.

## Supported variations

No variations.

## Universal Editor fields

- `search-fund-finder` / `text` (richtext): Intro Text
- `search-fund-finder` / `index` (text): Fund Data URL
- `search-fund-finder` / `link` (aem-content): View All Funds Link
- `search-fund-finder` / `linkText` (text): View All Funds Link Text


## Reuse guidance

Use wherever the fund finder appears. Select options are derived from the data source, falling back to the source-site lists when no data is available.

Generated CSS is structural only; brand styling comes from the design pass.
