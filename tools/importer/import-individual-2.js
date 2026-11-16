/* eslint-disable */
/* global WebImporter */

import heroOffsetPhotoParser from './parsers/hero-offset-photo.js';
import cardsCircularParser from './parsers/cards-circular.js';
import cardsInfoParser from './parsers/cards-info.js';
import accordionBorderedParser from './parsers/accordion-bordered.js';
import cardsInsightsParser from './parsers/cards-insights.js';
import cleanupTransformer from './transformers/jupiteram-cleanup.js';
import dmImagesTransformer from './transformers/jupiteram-dm-images.js';
import sectionsTransformer from './transformers/jupiteram-sections.js';

const PAGE_TEMPLATE = {
  "name": "individual-2",
  "urls": [
    "https://www.jupiteram.com/uk/en/individual/uk-equities/"
  ],
  "representativeUrl": "https://www.jupiteram.com/uk/en/individual/uk-equities/",
  "description": "Fund range landing page: offset-photo hero, overview text, circular fund cards, info cards, fund risk accordion, insights cards, important information band",
  "blocks": [
    {
      "name": "hero-offset-photo",
      "instances": [
        ".hero.teaser.cmp-hero--kaleBright .cmp-hero",
        ".hero.teaser .cmp-hero"
      ]
    },
    {
      "name": "cards-circular",
      "instances": [
        ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton .cmp-cards"
      ]
    },
    {
      "name": "cards-info",
      "instances": [
        ".cards.list.cmp-cards--borderlessBlue .cmp-cards",
        ".cmp-cards.defaultList"
      ]
    },
    {
      "name": "accordion-bordered",
      "instances": [
        ".accordion.panelcontainer .cmp-accordion",
        ".cmp-accordion"
      ]
    },
    {
      "name": "cards-insights",
      "instances": [
        ".cmp-cards.insightsList"
      ]
    }
  ],
  "urlPattern": "/uk/en/individual/*",
  "sections": [
    {
      "id": "s1",
      "name": "Hero",
      "selector": [
        ".hero.teaser.cmp-hero--kaleBright",
        ".hero.teaser"
      ],
      "style": null,
      "blocks": [
        "hero-offset-photo"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "Overview",
      "selector": [
        ".text:has(> #overview)",
        "#overview"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "#overview"
      ]
    },
    {
      "id": "s3",
      "name": "A selection of our UK funds",
      "selector": [
        ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton"
      ],
      "style": null,
      "blocks": [
        "cards-circular"
      ],
      "defaultContent": [
        ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton .cmp-cards-container > .cmp-text"
      ]
    },
    {
      "id": "s4",
      "name": "Additional funds in our range",
      "selector": [
        ".cards.list.cmp-cards--borderlessBlue"
      ],
      "style": null,
      "blocks": [
        "cards-info"
      ],
      "defaultContent": [
        ".cards.list.cmp-cards--borderlessBlue .cmp-cards-container > .cmp-text"
      ]
    },
    {
      "id": "s5",
      "name": "Advice note and fund specific risks",
      "selector": [
        ".text:has(> #text-c19185da67)",
        "#text-c19185da67"
      ],
      "style": null,
      "blocks": [
        "accordion-bordered"
      ],
      "defaultContent": [
        "#text-c19185da67",
        ".accordion.panelcontainer .cmp-accordion > .cmp-text"
      ]
    },
    {
      "id": "s6",
      "name": "Latest insights from the team",
      "selector": [
        ".cards.list:has(#latestinsights)",
        "#latestinsights"
      ],
      "style": null,
      "blocks": [
        "cards-insights"
      ],
      "defaultContent": [
        "#latestinsights > .cmp-text"
      ]
    },
    {
      "id": "s7",
      "name": "Important information",
      "selector": [
        ".text.kale-bright-5"
      ],
      "style": "pale-blue, small-print",
      "blocks": [],
      "defaultContent": [
        ".text.kale-bright-5 .cmp-text"
      ]
    }
  ]
};

const parsers = {
  'hero-offset-photo': heroOffsetPhotoParser,
  'cards-circular': cardsCircularParser,
  'cards-info': cardsInfoParser,
  'accordion-bordered': accordionBorderedParser,
  'cards-insights': cardsInsightsParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, dmImagesTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
