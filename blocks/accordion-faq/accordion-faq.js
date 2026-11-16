/*
 * Accordion FAQ: question rows split by thin rules, plus/minus toggle, first answer open.
 * Based on https://www.aem.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    const [label, body] = row.children;
    if (!label) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const title = document.createElement('span');
    title.className = 'accordion-faq-item-title';
    const only = label.children.length === 1 && label.firstElementChild.tagName === 'P'
      ? label.firstElementChild : label;
    title.append(...only.childNodes);
    moveInstrumentation(label, title);
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(title, icon);

    const panel = body || document.createElement('div');
    panel.className = 'accordion-faq-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    if (i === 0) details.open = true;
    details.append(summary, panel);
    row.replaceWith(details);
  });
}
