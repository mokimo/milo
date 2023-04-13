/* eslint-disable class-methods-use-this */
import {
  getNextVisibleItem,
  getPreviousVisibleItem,
  getOpenPopup,
  selectors,
} from './utils.js';

const closeHeadline = () => {
  const open = [...document.querySelectorAll(`${selectors.headline}[aria-expanded="true"]`)];
  open.forEach((el) => el.setAttribute('aria-expanded', 'false'));
};

const openHeadline = ({ headline, focus } = {}) => {
  closeHeadline();
  if (headline.getAttribute('aria-haspopup') === 'true') {
    headline.setAttribute('aria-expanded', 'true');
    const section = headline.closest(selectors.section)
      || headline.closest(selectors.column);
    const items = [...section.querySelectorAll(selectors.popupItems)]
      .filter((el) => el.offsetHeight && el.offsetWidth);
    if (focus === 'first') items[0].focus();
    if (focus === 'last') items[items.length - 1].focus();
  }
};

const getState = () => {
  const popupEl = getOpenPopup();
  if (!popupEl) return {};
  const popupItems = [...popupEl.querySelectorAll(selectors.popupItems)];
  // In the markup either a section OR column can contain a expandable headline
  // which is what we are interested in - so we can treat them both as sections.
  const section = document.activeElement.closest(selectors.section)
    || document.activeElement.closest(selectors.column);
  let allSections = [...popupEl.querySelectorAll(selectors.section)];
  if (!allSections.length) allSections = [...popupEl.querySelectorAll(selectors.column)];
  const visibleSections = allSections.filter((el) => el.offsetHeight && el.offsetWidth);
  const currentSection = visibleSections.findIndex((node) => node.isEqualNode(section));
  const firstHeadline = visibleSections[0]?.querySelector(selectors.headline);
  const lastHeadline = visibleSections[visibleSections.length - 1]
    ?.querySelector(selectors.headline);
  const prevHeadline = visibleSections[currentSection - 1]
    ?.querySelector(selectors.headline);
  const nextHeadline = visibleSections[currentSection + 1]
    ?.querySelector(selectors.headline);
  return {
    visibleSections,
    currentSection,
    firstHeadline,
    lastHeadline,
    prevHeadline,
    nextHeadline,
    popupItems,
  };
};

class Popup {
  constructor({ mainNav }) {
    this.mainNav = mainNav;
    this.listenToChanges();
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  open({ focus } = {}) {
    const { firstHeadline, lastHeadline, popupItems } = getState();
    if (!popupItems.length) return;

    const headline = focus === 'last' ? lastHeadline : firstHeadline;

    if (headline && headline.getAttribute('aria-haspopup') === 'true') {
      closeHeadline();
      headline.setAttribute('aria-expanded', 'true');
    }

    if (focus === 'first') {
      const first = getNextVisibleItem(-1, popupItems);
      popupItems[first].focus();
    }

    if (focus === 'last') {
      const last = getPreviousVisibleItem(popupItems.length, popupItems);
      popupItems[last].focus();
    }
  }

  mobileArrowUp = ({ prev }) => {
    // Case 1:  Move focus to the previous item
    if (prev !== -1) {
      const { currentSection, popupItems } = getState();
      popupItems[prev].focus();
      if (currentSection !== getState().currentSection) closeHeadline();
      return;
    }

    // Case 2: No headline + no previous item, move to the main nav
    const { prevHeadline } = getState();
    if (!prevHeadline) {
      this.mainNav.items[this.mainNav.curr].focus();
      return;
    }

    // Case 3: Open the previous headline
    openHeadline({ headline: prevHeadline, focus: 'last' });
  };

  mobileArrowDown = ({ next }) => {
    // Case 1: Move focus to the next item
    if (next !== -1) {
      const { currentSection, popupItems } = getState();
      popupItems[next].focus();
      if (currentSection !== getState().currentSection) closeHeadline();
      return;
    }
    // Case 2: No headline + no next item, move to the main nav
    const { nextHeadline } = getState();
    if (!nextHeadline) {
      closeHeadline();
      this.mainNav.focusNext();
      this.mainNav.open();
      return;
    }

    // Case 3: Open the next headline
    openHeadline({ headline: nextHeadline, focus: 'first' });
  };

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      const popupEl = getOpenPopup();
      if (!e.target.closest(selectors.popup) || !popupEl || this.desktop.matches) return;
      e.preventDefault();
      e.stopPropagation();
      const popupItems = [...popupEl.querySelectorAll(selectors.popupItems)];
      const curr = popupItems.findIndex((el) => el === e.target);

      if (e.shiftKey && e.code === 'Tab') {
        this.mobileArrowUp({ prev: getPreviousVisibleItem(curr, popupItems) });
        return;
      }

      switch (e.code) {
        case 'Tab': {
          this.mobileArrowDown({ next: getNextVisibleItem(curr, popupItems) });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.curr].focus();
          break;
        }
        case 'Space': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'ArrowLeft': {
          const { prevHeadline } = getState();
          if (!prevHeadline) {
            closeHeadline();
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          openHeadline({ headline: prevHeadline, focus: 'first' });
          break;
        }
        case 'ArrowUp': {
          this.mobileArrowUp({ prev: getPreviousVisibleItem(curr, popupItems) });
          break;
        }
        case 'ArrowRight': {
          const { nextHeadline } = getState();
          if (!nextHeadline) {
            closeHeadline();
            this.mainNav.focusNext();
            this.mainNav.open();
            break;
          }
          openHeadline({ headline: nextHeadline, focus: 'first' });
          break;
        }
        case 'ArrowDown': {
          this.mobileArrowDown({ next: getNextVisibleItem(curr, popupItems) });
          break;
        }
        default:
          break;
      }
    });
  };
}

export default Popup;
