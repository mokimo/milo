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
};

const isElementVisible = (elem) => !!(
  elem
    && elem instanceof HTMLElement
    && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
    && window.getComputedStyle(elem).getPropertyValue('visibility') !== 'hidden'
);

const getNextVisibleItem = (position, items) => {
  let newPosition = position;
  do {
    newPosition += 1;
    if (newPosition >= items.length) {
      return -1;
    }
  } while (!isElementVisible(items[newPosition]));
  return newPosition;
};

const getPreviousVisibleItem = (position, items) => {
  let newPosition = position;
  do {
    newPosition -= 1;
    if (newPosition < 0) {
      return -1;
    }
  } while (!isElementVisible(items[newPosition]));

  return newPosition;
};

export { getNextVisibleItem, getPreviousVisibleItem, selectors };
