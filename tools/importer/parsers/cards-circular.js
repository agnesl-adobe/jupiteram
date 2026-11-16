/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-circular variant. Base: cards.
 * Source: https://www.jupiteram.com/uk/en/individual/uk-equities/
 * Selector: .cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton .cmp-cards
 * Model: container with cards-circular-card children (image, imageAlt, text).
 * One row per card (.cmp-card): image (kept even when empty) |
 * H4 fund name, tagline (source <h5>) as an emphasised paragraph, summary,
 * Objective, Investment Manager(s), trailing "Learn more" CTA paragraph.
 * Empty <h5>&nbsp;</h5> / <p>&nbsp;</p> spacers are dropped.
 */
const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function buildText(item, document) {
  const nodes = [];
  const content = item.querySelector('.cmp-card__content-text');
  if (content) {
    Array.from(content.children).forEach((child) => {
      const tag = child.tagName;
      const text = textOf(child);
      if (!text) return;
      if (/^H[56]$/.test(tag)) {
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = text;
        p.appendChild(em);
        nodes.push(p);
      } else if (/^H[1-4]$/.test(tag)) {
        const h = document.createElement(tag.toLowerCase());
        h.textContent = text;
        nodes.push(h);
      } else if (/^(P|UL|OL)$/.test(tag)) {
        nodes.push(child);
      }
    });
  }

  item.querySelectorAll('a.cmp-card__content-button[href]').forEach((a) => {
    const label = textOf(a);
    if (!label) return;
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.textContent = label;
    const p = document.createElement('p');
    p.appendChild(link);
    nodes.push(p);
  });
  return nodes;
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-card'));
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.cmp-card-image-container img, img');

    // Image cell (image; alt collapses into imageAlt). Kept even when empty.
    const imageFrag = document.createDocumentFragment();
    if (img) {
      // The source title attribute is an asset ID, not authored copy.
      img.removeAttribute('title');
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    const textNodes = buildText(item, document);
    const textFrag = document.createDocumentFragment();
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-circular', cells });
  element.replaceWith(block);
}
