const selectors = {
  mainNavItems:
    '.feds-navItem > a, .feds-navItem > .feds-cta-wrapper > .feds-cta',
  brand: '.feds-brand',
  mainNavToggle: '.gnav-toggle',
  searchTrigger: '.feds-search-trigger',
  searchField: '.feds-search-input',
  signIn: '.feds-signin',
  profileButton: '.feds-profile-button',
  logo: '.gnav-logo',
  breadCrumbItems: '.feds-breadcrumbs li > a',
  expandedPopupTrigger: '.feds-navLink[aria-expanded = "true"]',
  navLink: '.feds-navLink',
  promoLink: '.feds-promo-link',
  imagePromo: 'a.feds-promo-image',
  fedsNav: '.feds-nav',
  fedsPopup: '.feds-popup',
  fedsPopupHeadline: '.feds-popup-headline',
  fedsPopupSection: '.feds-popup-section',
};

const isElementVisible = (elem) => !!(
  elem
    && elem instanceof HTMLElement
    && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
    && window.getComputedStyle(elem).getPropertyValue('visibility') !== 'hidden'
);

const getNextVisibleItem = (position, items) => {
  for (let newPosition = position + 1; newPosition < items.length; newPosition += 1) {
    if (isElementVisible(items[newPosition])) return newPosition;
  }
  return -1;
};

const getPreviousVisibleItem = (position, items) => {
  for (let newPosition = position - 1; newPosition >= 0; newPosition -= 1) {
    if (isElementVisible(items[newPosition])) return newPosition;
  }
  return -1;
};

export { isElementVisible, getNextVisibleItem, getPreviousVisibleItem, selectors };
