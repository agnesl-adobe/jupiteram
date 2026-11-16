/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for jupiteram.com.
 * Removes non-authorable site chrome and widgets captured in migration-work/cleaned.html.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global header experience fragment (includes the country/language
    // attestation popup .cmp-attestation-form) and global footer.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      '#jam-header',
      '#header',
      '.cmp-attestation-form',
      'footer.experiencefragment',
    ]);

    // OneTrust cookie banner / preference center.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
      '.ot-floating-button__back',
    ]);

    // Chat widgets (CCE chat + Freshchat frame).
    WebImporter.DOMUtils.remove(element, [
      '#cce-chat-widget',
      '#id_cce_chat_container',
      '.chat-button.cce_button',
      '#fc_frame',
      '#fc_widget',
    ]);

    // Carousel / slider controls and indicators (non-authorable UI).
    WebImporter.DOMUtils.remove(element, [
      '.cmp-carousel__actions',
      '.cmp-carousel__indicators',
      '.biography-item__arrow-container',
    ]);

    // Breadcrumb trail (e.g. inside the uk-equities hero .cmp-hero--content).
    // Not authored content: the hero-offset-photo block builds its own.
    WebImporter.DOMUtils.remove(element, ['nav.cmp-breadcrumb', '.cmp-breadcrumb']);

    // Screen-reader-only helper text inside links ("opens in a new tab"),
    // otherwise imported as visible label text (e.g. "MyJupiteropens in a new tab").
    WebImporter.DOMUtils.remove(element, ['.cmp-link__screen-reader-only']);
  }

  if (hookName === 'afterTransform') {
    // Leftover non-authorable elements.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'iframe',
      'link',
    ]);

    // Strip tracking / AEM component data attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name;
        if (
          name.startsWith('data-cmp-')
          || name.startsWith('data-analytics')
          || name === 'onclick'
        ) {
          el.removeAttribute(name);
        }
      });
    });
  }
}
