/*
 * Accordion Bordered: full-width rounded rows with a circular chevron toggle.
 * Based on https://www.aem.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-bordered-item-label';
    const title = document.createElement('span');
    title.className = 'accordion-bordered-item-title';
    // an authored single paragraph would add block margins inside the summary
    const only = label.children.length === 1 && label.firstElementChild.tagName === 'P'
      ? label.firstElementChild : label;
    title.append(...only.childNodes);
    moveInstrumentation(label, title);
    const icon = document.createElement('span');
    icon.className = 'accordion-bordered-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(title, icon);

    const panel = body || document.createElement('div');
    panel.className = 'accordion-bordered-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-bordered-item';
    details.append(summary, panel);
    row.replaceWith(details);
  });
}
