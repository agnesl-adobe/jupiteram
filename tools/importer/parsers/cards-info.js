/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-info variant. Base: cards.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selectors: .cmp-cards.defaultList, .cards.list.cmp-cards--borderlessBlue .cmp-cards
 * Model: container with cards-info-card children (image, imageAlt, text).
 * One row per card (.cmp-cards--cardItems): image (kept even when empty) | heading, description, CTA.
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll(':scope > .cmp-cards--cardItems'));
  if (!items.length) items = Array.from(element.querySelectorAll('.default-item'));
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.default-item__image-container img, img');
    const content = item.querySelector('.default-item__content-text') || item;
    const ctas = Array.from(item.querySelectorAll('.default-item__content-and-button > a[href]'));

    // Image cell (image; alt collapses into imageAlt). Kept even when empty.
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    // Text cell (text): heading, description, CTA.
    const textNodes = Array.from(content.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol'))
      .filter((n) => n.textContent.trim());
    ctas.forEach((a) => {
      const link = document.createElement('a');
      link.setAttribute('href', a.getAttribute('href'));
      link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.appendChild(link);
      textNodes.push(p);
    });

    const textFrag = document.createDocumentFragment();
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-info', cells });
  element.replaceWith(block);
}
