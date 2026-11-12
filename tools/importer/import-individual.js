/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import searchFundFinderParser from './parsers/search-fund-finder.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import cardsInfoParser from './parsers/cards-info.js';
import columnsTeaserParser from './parsers/columns-teaser.js';
import cardsInsightsParser from './parsers/cards-insights.js';
import cleanupTransformer from './transformers/jupiteram-cleanup.js';
import dmImagesTransformer from './transformers/jupiteram-dm-images.js';
import sectionsTransformer from './transformers/jupiteram-sections.js';

const PAGE_TEMPLATE = {
  "name": "individual",
  "urls": [
    "https://www.jupiteram.com/uk/en/individual/"
  ],
  "representativeUrl": "https://www.jupiteram.com/uk/en/individual/",
  "description": "Individual investor landing page: hero carousel, important notice, fund finder with promo slider, help cards, fund teasers and related insights",
  "urlPattern": "/uk/en/*",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".carousel.panelcontainer.cmp-hero--kaleBright",
        ".carousel.panelcontainer"
      ]
    },
    {
      "name": "search-fund-finder",
      "instances": [
        ".cmp-fund-finder .form-container",
        "form#fundFinder.fund-finder-form"
      ]
    },
    {
      "name": "carousel-promo",
      "instances": [
        ".cmp-carousel.cmp-contentblock__carousel",
        ".cmp-fund-finder .non-form-container .cmp-carousel"
      ]
    },
    {
      "name": "cards-info",
      "instances": [
        ".cmp-cards.defaultList",
        ".cards.list.cmp-cards--borderlessBlue .cmp-cards"
      ]
    },
    {
      "name": "columns-teaser",
      "instances": [
        ".contentblock.teaser.cmp-contentblock--promoSmall"
      ]
    },
    {
      "name": "cards-insights",
      "instances": [
        ".cmp-cards.insightsList"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel",
      "selector": [
        ".carousel.panelcontainer.cmp-hero--kaleBright",
        ".carousel.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Important information notice",
      "selector": [
        ".text.carpo-bright-50"
      ],
      "style": "pale-blue",
      "blocks": [],
      "defaultContent": [
        ".text.carpo-bright-50 .cmp-text"
      ]
    },
    {
      "id": "section-3",
      "name": "Fund finder and MyJupiter promo",
      "selector": [
        ".fundfinder",
        ".cmp-fund-finder"
      ],
      "style": "light-blue",
      "blocks": [
        "search-fund-finder",
        "carousel-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Help cards, fund teasers and related insights",
      "selector": [
        ".cards.list.cmp-cards--borderlessBlue"
      ],
      "style": null,
      "blocks": [
        "cards-info",
        "columns-teaser",
        "cards-insights"
      ],
      "defaultContent": [
        ".cards.list .cmp-cards-container > .cmp-text"
      ]
    }
  ]
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  'search-fund-finder': searchFundFinderParser,
  'carousel-promo': carouselPromoParser,
  'cards-info': cardsInfoParser,
  'columns-teaser': columnsTeaserParser,
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
