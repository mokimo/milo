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
  if (!popupEl) return { popupItems: [] };
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

    const first = getNextVisibleItem(-1, popupItems);
    const last = getPreviousVisibleItem(popupItems.length, popupItems);
    if (focus === 'first') popupItems[first].focus();
    if (focus === 'last') popupItems[last].focus();
  }

  mobileArrowUp = ({ prev, curr }) => {
    // Case 1:  Move focus to the previous item
    if (prev !== -1 && curr - 1 === prev) {
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
    document.querySelector('header').addEventListener('keydown', (e) => {
      const popupEl = getOpenPopup();
      if (!e.target.closest(selectors.popup) || !popupEl || this.desktop.matches) return;
      e.preventDefault();
      e.stopPropagation();
      const popupItems = [...popupEl.querySelectorAll(selectors.popupItems)];
      const curr = popupItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, popupItems);
      const next = getNextVisibleItem(curr, popupItems);
      if (e.shiftKey && e.code === 'Tab') {
        this.mobileArrowUp({ prev, curr });
        return;
      }

      switch (e.code) {
        case 'Tab': {
          this.mobileArrowDown({ next });
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.curr].focus();
          break;
        }
        case 'ArrowLeft': {
          const { prevHeadline, nextHeadline } = getState();
          const headline = document.dir === 'ltr' ? prevHeadline : nextHeadline;
          if (!headline) {
            closeHeadline();
            if (document.dir === 'ltr') {
              this.mainNav.items[this.mainNav.curr].focus();
            } else {
              this.mainNav.focusNext();
              this.mainNav.open();
            }
            break;
          }
          openHeadline({ headline, focus: 'first' });
          break;
        }
        case 'ArrowUp': {
          this.mobileArrowUp({ prev, curr });
          break;
        }
        case 'ArrowRight': {
          const { prevHeadline, nextHeadline } = getState();
          const headline = document.dir === 'ltr' ? nextHeadline : prevHeadline;
          if (!headline) {
            closeHeadline();
            if (document.dir === 'ltr') {
              this.mainNav.focusNext();
              this.mainNav.open();
            } else {
              this.mainNav.items[this.mainNav.curr].focus();
            }
            break;
          }
          openHeadline({ headline, focus: 'first' });
          break;
        }
        case 'ArrowDown': {
          this.mobileArrowDown({ next });
          break;
        }
        default:
          break;
      }
    });
  };
}

export default Popup;
