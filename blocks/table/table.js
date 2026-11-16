/*
 * Table: authored rows become a data table; the first row is the header
 * (add the "no-header" option to treat every row as data).
 * Based on https://www.aem.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

// richtext cells wrap single lines in <p>; unwrap so cells keep table line-heights
function unwrapSingleParagraph(cell) {
  if (cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    && cell.textContent.trim() === cell.firstElementChild.textContent.trim()) {
    cell.firstElementChild.replaceWith(...cell.firstElementChild.childNodes);
  }
}

export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const hasHeader = !block.classList.contains('no-header');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    const isHeader = hasHeader && i === 0;
    [...row.children].forEach((cell) => {
      const td = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) td.scope = 'col';
      moveInstrumentation(cell, td);
      td.append(...cell.childNodes);
      unwrapSingleParagraph(td);
      // links inside table cells are plain text links, never buttons
      td.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
      td.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
      tr.append(td);
    });
    (isHeader ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);
}
