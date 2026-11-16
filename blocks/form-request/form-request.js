/*
 * Form Request: a small enquiry form authored as rows.
 * Each row: Label | Type | Placeholder (or comma-separated options for a select) | Settings
 *   Type: heading, text, email, tel, textarea, select, checkbox, submit, message
 *   Settings: "required" and/or "half" (half-width field)
 * There is no submission endpoint yet: a valid submit shows the "message" row as a thank-you.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

const FIELD_TYPES = ['text', 'email', 'tel', 'textarea', 'select', 'checkbox'];

let formCounter = 0;

const cellText = (cell) => (cell ? cell.textContent.trim() : '');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    .replace(/(^-|-$)/g, '') || 'field';
}

function readRow(row) {
  const [label, type, placeholder, settings] = row.children;
  const tokens = cellText(settings).toLowerCase().split(/[\s,]+/).filter(Boolean);
  return {
    row,
    label,
    type: cellText(type).toLowerCase() || 'text',
    placeholder: cellText(placeholder),
    required: tokens.includes('required'),
    half: tokens.includes('half'),
  };
}

function buildControl(field, id) {
  let control;
  if (field.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
  } else if (field.type === 'select') {
    control = document.createElement('select');
    field.placeholder.split(',').map((o) => o.trim()).filter(Boolean).forEach((o) => {
      const option = document.createElement('option');
      option.value = o;
      option.textContent = o;
      control.append(option);
    });
  } else {
    control = document.createElement('input');
    control.type = field.type;
  }
  control.id = id;
  control.name = slugify(cellText(field.label));
  if (field.placeholder && field.type !== 'select' && field.type !== 'checkbox') {
    control.placeholder = field.placeholder;
  }
  if (field.required) control.required = true;
  if (field.type === 'email') control.autocomplete = 'email';
  return control;
}

function buildField(field, formId) {
  const id = `${formId}-${slugify(cellText(field.label))}`;
  const wrapper = document.createElement('div');
  wrapper.className = `form-request-field form-request-${field.type}`;
  if (field.half) wrapper.classList.add('form-request-half');
  moveInstrumentation(field.row, wrapper);

  const control = buildControl(field, id);
  const label = document.createElement('label');
  label.htmlFor = id;
  const labelContent = field.label.querySelector('p') || field.label;
  label.append(...labelContent.childNodes);

  if (field.type === 'checkbox') {
    wrapper.append(control, label);
  } else {
    wrapper.append(label, control);
  }

  const error = document.createElement('p');
  error.className = 'form-request-error';
  error.id = `${id}-error`;
  error.hidden = true;
  control.setAttribute('aria-describedby', error.id);
  wrapper.append(error);
  return wrapper;
}

function showErrors(form) {
  let first;
  form.querySelectorAll('input, select, textarea').forEach((control) => {
    const error = form.querySelector(`#${control.id}-error`);
    if (!error) return;
    const valid = control.checkValidity();
    control.toggleAttribute('aria-invalid', !valid);
    error.hidden = valid;
    error.textContent = valid ? '' : control.validationMessage;
    if (!valid && !first) first = control;
  });
  return first;
}

export default function decorate(block) {
  formCounter += 1;
  const formId = `form-request-${formCounter}`;
  const fields = [...block.children].map(readRow);

  const form = document.createElement('form');
  form.noValidate = true;
  form.className = 'form-request-form';
  const intro = document.createElement('div');
  intro.className = 'form-request-intro';
  const thanks = document.createElement('div');
  thanks.className = 'form-request-thanks';
  thanks.setAttribute('role', 'status');
  thanks.tabIndex = -1;
  thanks.hidden = true;

  fields.forEach((field) => {
    if (field.type === 'heading') {
      moveInstrumentation(field.row, intro);
      intro.append(...field.label.childNodes);
    } else if (field.type === 'message') {
      moveInstrumentation(field.row, thanks);
      thanks.append(...field.label.childNodes);
    } else if (field.type === 'submit') {
      const actions = document.createElement('div');
      actions.className = 'form-request-actions';
      moveInstrumentation(field.row, actions);
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'button primary';
      button.textContent = cellText(field.label) || 'Submit';
      actions.append(button);
      form.append(actions);
    } else if (FIELD_TYPES.includes(field.type)) {
      form.append(buildField(field, formId));
    }
  });

  if (!thanks.textContent.trim()) {
    thanks.textContent = 'Thank you. We will be in touch shortly.';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstInvalid = showErrors(form);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  });
  form.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) showErrors(form);
  });

  block.replaceChildren(...(intro.childNodes.length ? [intro] : []), form, thanks);
}
