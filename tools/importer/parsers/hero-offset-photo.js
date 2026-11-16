/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-offset-photo variant. Base: hero.
 * Source: https://www.jupiteram.com/uk/en/individual/uk-equities/
 * Selectors: .hero.teaser.cmp-hero--kaleBright .cmp-hero, .hero.teaser .cmp-hero
 * Model: hero-offset-photo (image, imageAlt, text).
 * Row 1: image (alt collapses into imageAlt). Row 2: H1 heading (+ any intro copy).
 * The breadcrumb is removed by the cleanup transformer (the block builds its own)
 * and the trailing brand dot (<span>.</span>) is styling the block adds back.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.cmp-hero--image img, .cmp-image img');
  const content = element.querySelector('.cmp-hero--content') || element;

  const imageFrag = document.createDocumentFragment();
  if (img) {
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img);
  }

  const textNodes = [];
  const title = content.querySelector('h1, h2, .cmp-teaser__title');
  if (title) {
    const text = title.textContent.replace(/\s+/g, ' ').trim().replace(/\s*\.$/, '');
    if (text) {
      const h1 = document.createElement('h1');
      h1.textContent = text;
      textNodes.push(h1);
    }
  }
  content.querySelectorAll('.cmp-teaser__description p, .cmp-teaser__description').forEach((n) => {
    if (n.matches('.cmp-teaser__description') && n.querySelector('p')) return;
    const text = n.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const p = document.createElement('p');
    p.textContent = text;
    textNodes.push(p);
  });
  content.querySelectorAll('.cmp-teaser__action-container a[href]').forEach((a) => {
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

  const cells = [[imageFrag], [textFrag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-offset-photo', cells });
  element.replaceWith(block);
}
