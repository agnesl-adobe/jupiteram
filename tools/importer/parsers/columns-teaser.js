/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-teaser variant. Base: columns.
 * Source: https://www.jupiteram.com/uk/en/individual/
 * Selector: .contentblock.teaser.cmp-contentblock--promoSmall
 * The selector matches consecutive sibling teasers that form ONE columns-teaser block:
 * the first match collects itself plus following matching siblings (one row each)
 * and removes the merged siblings. Cell order follows the imageLeft/imageRight class.
 * Columns blocks carry no xwalk field hints.
 */
const TEASER_SELECTOR = '.contentblock.teaser.cmp-contentblock--promoSmall';

function buildText(teaser, document) {
  const nodes = [];
  const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  if (title && title.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    nodes.push(h);
  }

  const description = teaser.querySelector('.cmp-teaser__description');
  if (description) {
    const paras = Array.from(description.querySelectorAll(':scope > p'));
    if (!paras.length && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.replace(/\s+/g, ' ').trim();
      nodes.push(p);
    }
    paras.forEach((p) => {
      // Split a leading bold fund name ("<b>Fund<br></b>Description") into its own paragraph.
      const first = Array.from(p.childNodes).find((n) => n.nodeType !== 3 || n.textContent.trim());
      if (first && first.nodeType === 1 && /^(B|STRONG)$/.test(first.tagName)) {
        const name = first.textContent.replace(/\s+/g, ' ').trim();
        first.remove();
        if (name) {
          const nameP = document.createElement('p');
          const strong = document.createElement('strong');
          strong.textContent = name;
          nameP.appendChild(strong);
          nodes.push(nameP);
        }
        p.querySelectorAll('br').forEach((br) => {
          if (!br.previousSibling || !br.previousSibling.textContent.trim()) br.remove();
        });
        const rest = p.textContent.replace(/\s+/g, ' ').trim();
        if (rest) {
          const restP = document.createElement('p');
          restP.textContent = rest;
          nodes.push(restP);
        }
      } else if (p.textContent.trim()) {
        nodes.push(p);
      }
    });
  }

  teaser.querySelectorAll('.cmp-teaser__action-container a[href]').forEach((a) => {
    a.querySelectorAll('.cmp-link__screen-reader-only').forEach((s) => s.remove());
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
    const p = document.createElement('p');
    p.appendChild(link);
    nodes.push(p);
  });

  return nodes;
}

export default function parse(element, { document }) {
  // Sibling already merged into an earlier columns-teaser block.
  if (!element.parentNode) return;

  const teasers = [element];
  let next = element.nextElementSibling;
  while (next && next.matches(TEASER_SELECTOR)) {
    teasers.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  teasers.forEach((teaser) => {
    const img = teaser.querySelector('.cmp-contentblock--image img, .cmp-image img, img');
    const imageCell = img ? [img] : '';
    const textNodes = buildText(teaser, document);
    const textCell = textNodes.length ? textNodes : '';
    const imageRight = teaser.classList.contains('cmp-contentblock--imageRight');
    cells.push(imageRight ? [textCell, imageCell] : [imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells });
  teasers.slice(1).forEach((t) => t.remove());
  element.replaceWith(block);
}
