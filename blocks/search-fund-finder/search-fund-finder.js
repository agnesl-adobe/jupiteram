import { moveInstrumentation } from '../../scripts/scripts.js';

// Used when the fund data source is missing or does not expose these columns.
const DEFAULT_ASSET_CLASSES = ['Alternatives', 'Equities', 'Fixed Income', 'Multi Asset'];
const DEFAULT_LEGAL_STRUCTURES = ['ETF', 'ICVC', 'OEIC', 'SICAV', 'Unit Trust'];

let finderId = 0;

const pick = (item, keys) => {
  const key = keys.find((k) => item[k] !== undefined && item[k] !== '');
  return key ? String(item[key]) : '';
};

function normalizeFund(item) {
  return {
    name: pick(item, ['name', 'title', 'fundName']),
    isin: pick(item, ['isin', 'ISIN']),
    assetClass: pick(item, ['assetClass', 'asset-class', 'asset_class']),
    legalStructure: pick(item, ['legalStructure', 'legal-structure', 'legal_structure', 'structure']),
    path: pick(item, ['path', 'url']),
  };
}

async function fetchFunds(source) {
  if (!source) return null;
  try {
    const resp = await fetch(source);
    if (!resp.ok) return null;
    const json = await resp.json();
    const rows = Array.isArray(json) ? json : json?.data;
    return Array.isArray(rows) ? rows.map(normalizeFund) : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('search-fund-finder: could not load fund data', e);
    return null;
  }
}

function distinct(values, fallback) {
  const list = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return list.length ? list : fallback;
}

function createSelect(id, label, allLabel, values) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-fund-finder-field';
  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.className = 'search-fund-finder-sr-only';
  labelEl.textContent = label;
  const select = document.createElement('select');
  select.id = id;
  select.append(new Option(allLabel, ''));
  values.forEach((v) => select.append(new Option(v, v)));
  wrapper.append(labelEl, select);
  return { wrapper, select };
}

/**
 * Classify authored rows: a URL to the fund data (.json or bare URL text), the
 * "view all funds" link, and optional intro text (e.g. a heading).
 */
function readConfig(block) {
  const config = { source: '', allFunds: null, intro: [] };
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    const link = row.querySelector('a[href]');
    const isDataUrl = (value) => /\.json(\?|$)/i.test(value) || /^https?:\/\/\S+$/.test(value);
    if (!config.source && link && /\.json(\?|$)/i.test(link.href)) {
      config.source = link.href;
    } else if (!config.source && !link && text && isDataUrl(text)) {
      config.source = text;
    } else if (link && !config.allFunds) {
      config.allFunds = { href: link.href, label: link.textContent.trim() || 'View all funds', row };
    } else if (text) {
      config.intro.push(row);
    }
  });
  return config;
}

export default async function decorate(block) {
  finderId += 1;
  const prefix = `search-fund-finder-${finderId}`;
  const config = readConfig(block);

  const form = document.createElement('form');
  form.className = 'search-fund-finder-form';
  form.setAttribute('role', 'search');

  // intro content (e.g. "Search for a fund" heading) authored in the block
  config.intro.forEach((row) => {
    const intro = document.createElement('div');
    intro.className = 'search-fund-finder-intro';
    moveInstrumentation(row, intro);
    [...row.children].forEach((cell) => intro.append(...cell.childNodes));
    form.append(intro);
  });

  const searchField = document.createElement('div');
  searchField.className = 'search-fund-finder-field search-fund-finder-search';
  const searchLabel = document.createElement('label');
  searchLabel.htmlFor = `${prefix}-q`;
  searchLabel.className = 'search-fund-finder-sr-only';
  searchLabel.textContent = 'Fund name or ISIN';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = `${prefix}-q`;
  input.name = 'q';
  input.placeholder = 'Fund name or ISIN';
  input.autocomplete = 'off';
  searchField.append(searchLabel, input);

  const refine = document.createElement('fieldset');
  refine.className = 'search-fund-finder-refine';
  const legend = document.createElement('legend');
  legend.textContent = 'Refine your search';
  refine.append(legend);

  const funds = await fetchFunds(config.source);
  const assetClass = createSelect(
    `${prefix}-asset-class`,
    'Asset class',
    'All Asset Class',
    distinct((funds || []).map((f) => f.assetClass), DEFAULT_ASSET_CLASSES),
  );
  const legalStructure = createSelect(
    `${prefix}-legal-structure`,
    'Legal structure',
    'All Legal Structure',
    distinct((funds || []).map((f) => f.legalStructure), DEFAULT_LEGAL_STRUCTURES),
  );
  refine.append(assetClass.wrapper, legalStructure.wrapper);

  const actions = document.createElement('div');
  actions.className = 'search-fund-finder-actions';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'search-fund-finder-results button';
  submit.setAttribute('aria-live', 'polite');
  submit.textContent = 'View results';
  actions.append(submit);

  if (config.allFunds) {
    const allLink = document.createElement('a');
    allLink.href = config.allFunds.href;
    allLink.className = 'search-fund-finder-all';
    allLink.textContent = config.allFunds.label;
    moveInstrumentation(config.allFunds.row, allLink);
    actions.append(allLink);
  }

  form.append(searchField, refine, actions);

  const filtered = () => {
    if (!funds) return null;
    const q = input.value.trim().toLowerCase();
    const asset = assetClass.select.value;
    const structure = legalStructure.select.value;
    return funds.filter((f) => (!q || f.name.toLowerCase().includes(q)
        || f.isin.toLowerCase().includes(q))
      && (!asset || f.assetClass === asset)
      && (!structure || f.legalStructure === structure));
  };

  const updateCount = () => {
    const results = filtered();
    if (!results) return;
    submit.textContent = `View ${results.length} result${results.length === 1 ? '' : 's'}`;
    submit.disabled = results.length === 0;
  };

  input.addEventListener('input', updateCount);
  assetClass.select.addEventListener('change', updateCount);
  legalStructure.select.addEventListener('change', updateCount);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = filtered();
    // A single match goes straight to its fund page.
    if (results && results.length === 1 && results[0].path) {
      window.location.href = results[0].path;
      return;
    }
    if (!config.allFunds) return;
    const url = new URL(config.allFunds.href, window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    if (assetClass.select.value) url.searchParams.set('assetClass', assetClass.select.value);
    if (legalStructure.select.value) url.searchParams.set('legalStructure', legalStructure.select.value);
    window.location.href = url.toString();
  });

  block.replaceChildren(form);
  updateCount();
}
