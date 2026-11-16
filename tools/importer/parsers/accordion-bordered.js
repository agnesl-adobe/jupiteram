/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-bordered variant. Base: accordion.
 * Source: https://www.jupiteram.com/uk/en/individual/uk-equities/
 * Selectors: .accordion.panelcontainer .cmp-accordion, .cmp-accordion
 * Model: container with accordion-bordered-item children (summary, text).
 * One row per .cmp-accordion__item: summary (title text) | text (panel rich text).
 * Intro copy placed inside .cmp-accordion before the items (e.g. H3 "Fund specific
 * risks") is default content of the section: it is moved in front of the block.
 */
export default function parse(element, { document }) {
  // Leading intro content (non-item children) stays as default content before the block.
  Array.from(element.children).forEach((child) => {
    if (child.classList.contains('cmp-accordion__item')) return;
    if (child.textContent.trim() || child.querySelector('img')) {
      element.before(child);
    } else {
      child.remove();
    }
  });

  const items = Array.from(element.querySelectorAll(':scope > .cmp-accordion__item'));
  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button')
      || item.querySelector('.cmp-accordion__header');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const summaryFrag = document.createDocumentFragment();
    if (title) {
      summaryFrag.appendChild(document.createComment(' field:summary '));
      summaryFrag.appendChild(document.createTextNode(title));
    }

    const panel = item.querySelector('.cmp-accordion__panel');
    const bodyNodes = [];
    if (panel) {
      const texts = Array.from(panel.querySelectorAll('.cmp-text'));
      const sources = texts.length ? texts : [panel];
      sources.forEach((src) => {
        Array.from(src.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol, :scope > table'))
          .filter((n) => n.textContent.trim())
          .forEach((n) => bodyNodes.push(n));
      });
      // Images or other media in the panel outside .cmp-text
      panel.querySelectorAll('img').forEach((img) => {
        if (!bodyNodes.some((n) => n.contains(img))) bodyNodes.push(img);
      });
    }

    const textFrag = document.createDocumentFragment();
    if (bodyNodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      bodyNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([summaryFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-bordered', cells });
  element.replaceWith(block);
}
