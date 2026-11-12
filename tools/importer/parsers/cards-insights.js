/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-insights variant. Base: cards.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selector: .cmp-cards.insightsList
 * Model: container with cards-insights-card children (image, imageAlt, text).
 * One row per card (.cmp-cards--cardItems): image (kept even when empty) |
 * date + read time (meta, before heading), heading linked to the article, author, tag(s).
 * The source wraps each card in one <a>; its href is moved onto the heading.
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll(':scope > .cmp-cards--cardItems'));
  if (!items.length) items = Array.from(element.querySelectorAll('.insight-item'));
  const cells = [];

  const textOf = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const para = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  items.forEach((item) => {
    const cardLink = item.querySelector('.insight-item > a[href], a[href]');
    const href = cardLink ? cardLink.getAttribute('href') : '';
    const img = item.querySelector('.insight-item__image-container img, img');

    // Image cell (image; alt collapses into imageAlt). Kept even when empty.
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    // Text cell (text)
    const textNodes = [];
    const date = textOf(item.querySelector('.insight-item__content__public-date'));
    if (date) textNodes.push(para(date));
    const readTime = textOf(item.querySelector('.insight-item__content__reading_time'));
    if (readTime) textNodes.push(para(readTime));

    const title = item.querySelector('.insight-item__content-text-and-tags h1, .insight-item__content-text-and-tags h2, .insight-item__content-text-and-tags h3, .insight-item__content-text-and-tags h4, .insight-item__content-text-and-tags h5, .insight-item__content-text-and-tags h6');
    if (title && textOf(title)) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = textOf(title);
        h.appendChild(a);
      } else {
        h.textContent = textOf(title);
      }
      textNodes.push(h);
    }

    const author = textOf(item.querySelector('.insight-item__content__languange-and-author'));
    if (author) textNodes.push(para(author));

    // Tags: link-only paragraphs render as pills; plain text when the source has no tag URL.
    item.querySelectorAll('.insight-item__content-text li').forEach((li) => {
      const tagLink = li.querySelector('a[href]');
      const label = textOf(li);
      if (!label) return;
      if (tagLink) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.setAttribute('href', tagLink.getAttribute('href'));
        a.textContent = label;
        p.appendChild(a);
        textNodes.push(p);
      } else {
        textNodes.push(para(label));
      }
    });

    const textFrag = document.createDocumentFragment();
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
