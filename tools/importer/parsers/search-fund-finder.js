/* eslint-disable */
/* global WebImporter */

/**
 * Parser for search-fund-finder variant. Base: search.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selectors: .cmp-fund-finder .form-container, form#fundFinder.fund-finder-form
 * Model: search-fund-finder (text, index, link, linkText).
 * Rows: intro text | fund data URL | "View all funds" link.
 * The source form loads fund data client-side and exposes no data URL, so the
 * index row uses a site-local default that authors should point at the real fund list.
 */
const DEFAULT_FUND_INDEX = '/data/funds.json';
const DEFAULT_ALL_FUNDS_HREF = '/uk/en/individual/fund-centre/';

export default function parse(element, { document }) {
  const form = element.matches('form') ? element : (element.querySelector('form#fundFinder, form.fund-finder-form, form') || element);
  const cells = [];

  // Row 1: intro text (richtext) - the panel heading ("Search for a fund").
  const introHeading = form.querySelector('h1, h2, h3, h4');
  if (introHeading && introHeading.textContent.trim()) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    const h = document.createElement('h2');
    h.textContent = introHeading.textContent.trim();
    textFrag.appendChild(h);
    cells.push([textFrag]);
  } else {
    cells.push(['']);
  }

  // Row 2: fund data URL (plain text).
  const dataAttr = form.getAttribute('data-source') || form.getAttribute('data-url') || form.getAttribute('action');
  const index = dataAttr && /\.json(\?|$)/i.test(dataAttr) ? dataAttr : DEFAULT_FUND_INDEX;
  const indexFrag = document.createDocumentFragment();
  indexFrag.appendChild(document.createComment(' field:index '));
  indexFrag.appendChild(document.createTextNode(index));
  cells.push([indexFrag]);

  // Row 3: "View all funds" link (link + linkText collapsed into the anchor text).
  const allFunds = form.querySelector('#view-all-funds, .view-all-funds');
  const allFundsAnchor = form.querySelector('a.view-all-funds, .view-all-funds a[href]');
  const linkText = (allFunds && allFunds.textContent.trim()) || 'View all funds';
  const href = (allFundsAnchor && allFundsAnchor.getAttribute('href'))
    || (allFunds && allFunds.getAttribute('data-href'))
    || DEFAULT_ALL_FUNDS_HREF;
  const linkFrag = document.createDocumentFragment();
  linkFrag.appendChild(document.createComment(' field:link '));
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = linkText;
  linkFrag.appendChild(a);
  cells.push([linkFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-fund-finder', cells });
  element.replaceWith(block);
}
