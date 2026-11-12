/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-promo variant. Base: carousel.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selectors: .cmp-carousel.cmp-contentblock__carousel, .cmp-fund-finder .non-form-container .cmp-carousel
 * Model: container with carousel-promo-item children (media_image, media_imageAlt, content_text).
 * One row per slide (.cmp-carousel__item): optional image | heading, description, CTA.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('.cmp-contentblock--image img, .cmp-image img, img');
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
    const description = slide.querySelector('.cmp-teaser__description');
    const ctas = Array.from(slide.querySelectorAll('.cmp-teaser__action-container a[href]'));

    // Image cell (media_image; alt collapses into media_imageAlt). Kept even when empty.
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:media_image '));
      imageFrag.appendChild(img);
    }

    // Text cell (content_text)
    const textNodes = [];
    if (title && title.textContent.trim()) {
      const h = document.createElement('h2');
      h.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      textNodes.push(h);
    }
    if (description) {
      const paras = Array.from(description.querySelectorAll('p'));
      if (paras.length) {
        paras.forEach((p) => textNodes.push(p));
      } else if (description.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        textNodes.push(p);
      }
    }
    ctas.forEach((a) => {
      // Drop screen-reader-only helper text ("opens in a new tab") from the link label.
      a.querySelectorAll('.cmp-link__screen-reader-only').forEach((s) => s.remove());
      const link = document.createElement('a');
      link.setAttribute('href', a.getAttribute('href'));
      link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.appendChild(link);
      textNodes.push(p);
    });

    const textFrag = document.createDocumentFragment();
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:content_text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-promo', cells });
  element.replaceWith(block);
}
