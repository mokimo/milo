const isElementVisible = (elem) => !!(elem
  && elem instanceof HTMLElement
  && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
  && window.getComputedStyle(elem).getPropertyValue('visibility') !== 'hidden');

const isRTL = () => document.querySelector('html').getAttribute('dir') === 'rtl';

const SELECTORS = {
  curtain: 'feds-curtainWrapper',
  openCurtain: 'feds-curtainWrapper--open',
};

const open = (requestor) => {
  const curtainElement = document.querySelector(`.${SELECTORS.curtain}`);
  if (curtainElement instanceof HTMLElement) {
    curtainElement.classList.add(SELECTORS.openCurtain);
    if (typeof requestor === 'string' && requestor.length > 0) {
      curtainElement.setAttribute('data-requestor', requestor);
    }
  }
};

const close = (requestor) => {
  const openCurtainElement = document.querySelector(`.${SELECTORS.openCurtain}`);
  if (openCurtainElement instanceof HTMLElement) {
    const openCurtainRequestor = openCurtainElement.getAttribute('data-requestor');
    if (typeof requestor === 'undefined'
          || (typeof requestor === 'string'
          && requestor.length > 0
          && requestor === openCurtainRequestor)) {
      openCurtainElement.classList.remove(SELECTORS.openCurtain);
      openCurtainElement.removeAttribute('data-requestor');
    }
  }
};

const onDebouncedEvent = (eventName, callback, debounceRate = 200) => {
  let eventTimeout;

  if (typeof eventName !== 'string'
      || !eventName.length
      || !typeof callback === 'function'
      || !Number.isInteger(debounceRate)) {
    return;
  }

  window.addEventListener(eventName, () => {
    clearTimeout(eventTimeout);

    eventTimeout = setTimeout(callback, debounceRate);
  });
};

const Config = {
  selectors: {
    header: 'feds-header',
    smallDesktopEnabled: 'feds--smallDesktopEnabled',
  },
};

let cachedDesktopBreakpoint;

/**
* Computes and caches the desktop breakpoint value based on a DOM modifier class
* @returns {Integer} <em>1200</em> if the small desktop feature is disabled (default)
* or <em>900</em> if the small desktop feature is enabled
*/
const computeDesktopBreakpoint = () => {
  const headerElement = document.querySelector(`#${Config.selectors.header}`);
  let breakpoint = 1200;

  if (headerElement instanceof HTMLElement
      && headerElement.classList.contains(Config.selectors.smallDesktopEnabled)) {
    breakpoint = 900;
  }

  cachedDesktopBreakpoint = breakpoint;
  return breakpoint;
};

/**
* Returns either the cached value for the desktop breakpoint
* or calculates it on the spot if not already available
* @return {Integer} The breakpoint value from where the desktop resolution starts
*/
const getDesktopBreakpoint = () => cachedDesktopBreakpoint || computeDesktopBreakpoint();

export {
  isElementVisible, isRTL, open, close, onDebouncedEvent, getDesktopBreakpoint,
};
