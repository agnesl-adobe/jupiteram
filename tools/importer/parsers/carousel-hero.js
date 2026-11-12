/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero variant. Base: carousel.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selector: .carousel.panelcontainer.cmp-hero--kaleBright
 * Model: container with carousel-hero-item children (media_image, media_imageAlt, content_text).
 * One row per slide (.cmp-carousel__item): image | heading, description, CTA.
 * Indicators are removed by the cleanup transformer, so content comes from the slides.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  const cells = [];

  slides.forEach((slide, index) => {
    const img = slide.querySelector('.cmp-hero--image img, img');
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description');
    const ctas = Array.from(slide.querySelectorAll('.cmp-teaser__action-container a[href], .cmp-hero--buttons a[href]'));

    // Image cell (media_image; alt collapses into media_imageAlt)
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:media_image '));
      imageFrag.appendChild(img);
    }

    // Text cell (content_text)
    const textFrag = document.createDocumentFragment();
    const textNodes = [];
    if (title) {
      // H1 on the first slide only; later slides use H2 to keep one H1 per page.
      const heading = document.createElement(index === 0 ? 'h1' : 'h2');
      heading.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      textNodes.push(heading);
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
    const seen = new Set();
    ctas.forEach((a) => {
      if (seen.has(a)) return;
      seen.add(a);
      const p = document.createElement('p');
      p.appendChild(a);
      textNodes.push(p);
    });
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(' field:content_text '));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
