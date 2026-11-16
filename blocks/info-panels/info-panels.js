/*
 * Columns Panels: side-by-side bordered panels (e.g. a summary list next to a link list).
 * A short first paragraph becomes the panel eyebrow; a list made only of links
 * becomes a divided link list with arrows.
 */

const EYEBROW_MAX_LENGTH = 60;

function decorateEyebrow(panel) {
  const first = panel.firstElementChild;
  if (!first || first.tagName !== 'P' || first.children.length) return;
  const text = first.textContent.trim();
  const next = first.nextElementSibling;
  if (!text || text.length > EYEBROW_MAX_LENGTH || !next) return;
  if (!/^(H[1-6]|UL|OL)$/.test(next.tagName)) return;
  first.classList.add('columns-panels-eyebrow');
}

function decorateLinkLists(panel) {
  panel.querySelectorAll(':scope > ul').forEach((ul) => {
    const items = [...ul.children];
    const linkOnly = items.length && items.every((li) => {
      const a = li.querySelector('a[href]');
      return a && li.textContent.trim() === a.textContent.trim();
    });
    if (!linkOnly) return;
    ul.classList.add('columns-panels-links');
    items.forEach((li) => {
      const a = li.querySelector('a[href]');
      // a link wrapped in strong/em must not render as a button here
      a.classList.remove('button', 'primary', 'secondary', 'accent');
      li.replaceChildren(a);
      const arrow = document.createElement('span');
      arrow.className = 'columns-panels-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      a.append(arrow);
    });
  });
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  block.classList.add(`columns-panels-${row.children.length}-cols`);
  [...block.children].forEach((r) => {
    [...r.children].forEach((panel) => {
      panel.classList.add('columns-panels-panel');
      decorateEyebrow(panel);
      decorateLinkLists(panel);
    });
  });
}
