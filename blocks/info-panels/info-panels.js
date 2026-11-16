/*
 * Info Panels: side-by-side bordered panels (e.g. a summary list next to a link list).
 * A short first paragraph becomes the panel eyebrow; a list made only of links
 * becomes a divided link list with arrows.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

const EYEBROW_MAX_LENGTH = 60;

function decorateEyebrow(panel) {
  const first = panel.firstElementChild;
  if (!first || first.tagName !== 'P' || first.children.length) return;
  const text = first.textContent.trim();
  const next = first.nextElementSibling;
  if (!text || text.length > EYEBROW_MAX_LENGTH || !next) return;
  if (!/^(H[1-6]|UL|OL)$/.test(next.tagName)) return;
  first.classList.add('info-panels-eyebrow');
}

function decorateLinkLists(panel) {
  panel.querySelectorAll(':scope > ul').forEach((ul) => {
    const items = [...ul.children];
    const linkOnly = items.length && items.every((li) => {
      const a = li.querySelector('a[href]');
      return a && li.textContent.trim() === a.textContent.trim();
    });
    if (!linkOnly) return;
    ul.classList.add('info-panels-links');
    items.forEach((li) => {
      const a = li.querySelector('a[href]');
      // a link wrapped in strong/em must not render as a button here
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      li.replaceChildren(a);
      const arrow = document.createElement('span');
      arrow.className = 'info-panels-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      a.append(arrow);
    });
  });
}

// Panels are authored either as one row of cells or as one row (item) per panel.
function collectPanels(block) {
  const rows = [...block.children];
  if (rows.length === 1) return [...rows[0].children];
  return rows.map((row) => {
    const cell = row.firstElementChild || document.createElement('div');
    moveInstrumentation(row, cell);
    return cell;
  });
}

export default function decorate(block) {
  const panels = collectPanels(block);
  if (!panels.length) return;
  const row = document.createElement('div');
  panels.forEach((panel) => {
    // richtext leaves empty paragraphs around headings and lists
    panel.querySelectorAll(':scope > p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
    });
    panel.classList.add('info-panels-panel');
    decorateEyebrow(panel);
    decorateLinkLists(panel);
    row.append(panel);
  });
  block.classList.add(`info-panels-${panels.length}-cols`);
  block.replaceChildren(row);
}
