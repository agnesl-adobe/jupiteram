/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for jupiteram.com.
 * Uses payload.template.sections from page-templates.json.
 *
 * beforeTransform: insert <hr> section breaks before every non-first section
 * (while parser target elements still exist). Styled sections get a marker
 * attribute on their <hr>; a styled first section gets a temporary marked <hr>.
 *
 * afterTransform: insert a Section Metadata block at the end of each styled
 * section (just before the next section break), then drop marker attributes
 * and the temporary first-section <hr>.
 *
 * Note: sections 2-4 are siblings inside the same .cmp-container grid, and
 * section-4 has no own wrapper (it starts at .cards.list.cmp-cards--borderlessBlue),
 * so the <hr> breaks are inserted as siblings directly before each section start.
 */
const MARKER_ATTR = 'data-excat-section-id';
const FIRST_ATTR = 'data-excat-first-section';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function isSectionBreak(node) {
  return node && node.nodeType === 1 && node.tagName === 'HR';
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;

      if (i === 0) {
        if (section.style) {
          const hr = document.createElement('hr');
          hr.setAttribute(MARKER_ATTR, section.id);
          hr.setAttribute(FIRST_ATTR, 'true');
          el.parentNode.insertBefore(hr, el);
        }
        continue;
      }

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (marker) {
        // Place metadata at the end of the section: right before the next
        // sibling section break, or after the last sibling if none.
        let cursor = marker.nextSibling;
        let nextBreak = null;
        while (cursor) {
          if (isSectionBreak(cursor)) { nextBreak = cursor; break; }
          cursor = cursor.nextSibling;
        }
        if (nextBreak) {
          nextBreak.parentNode.insertBefore(metadata, nextBreak);
        } else {
          marker.parentNode.appendChild(metadata);
        }

        if (marker.hasAttribute(FIRST_ATTR)) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER_ATTR);
        }
      } else {
        // Fallback: marker lost, attach after the surviving section element.
        const el = findSectionElement(element, section);
        if (el && el.parentNode) {
          el.parentNode.insertBefore(metadata, el.nextSibling);
        }
      }
    }
  }
}
