/* eslint-disable class-methods-use-this */
import {
  getNextVisibleItem,
  getPreviousVisibleItem,
  selectors,
} from './utils.js';

const itemSelector = `
  ${selectors.navLink}, 
  ${selectors.promoLink},
  ${selectors.imagePromo}
`;
class Popup {
  constructor({ mainNav }) {
    this.mainNav = mainNav;
    this.listenToChanges();
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  getOpenPopup = () => document.querySelector(selectors.expandedPopupTrigger)
    ?.parentElement.querySelector(selectors.fedsPopup);

  open({ focus }) {
    const popupEl = this.getOpenPopup();
    if (!popupEl) return;
    const popupItems = [
      ...popupEl.querySelectorAll(itemSelector),
    ];
    const first = getNextVisibleItem(-1, popupItems);
    const last = getPreviousVisibleItem(popupItems.length, popupItems);
    if (first === -1) return;

    if (focus === 'first') {
      popupItems[first].focus();
    }
    if (focus === 'last') {
      popupItems[last].focus();
    }
  }

  openMobileHeadline = ({ focus, headline } = {}) => {
    const open = [...document.querySelectorAll('.feds-popup-headline[aria-expanded="true"]')];
    open.forEach((el) => el.setAttribute('aria-expanded', 'false'));

    if (headline.getAttribute('aria-haspopup') === 'true') {
      headline.setAttribute('aria-expanded', 'true');
      const nextItem = getNextVisibleItem(curr, popupItems);
      popupItems[nextItem].focus();
    }
  };

  getSections = () => {
    const section = document.activeElement.closest('.feds-popup-section');
    const allSections = [...this.getOpenPopup().querySelectorAll('.feds-popup-section')];
    const curr = allSections.findIndex((node) => node.isEqualNode(section));
    return { allSections, curr, prev: curr - 1, next: curr + 1 };
  };

  mobileArrowDown = ({ curr, popupItems, focus } = {}) => {
    // continue here with this scuffed code.. TODO TODO TODO
    if (curr + 1 < popupItems.length) {
      const { allSections, curr, next, prev } = this.getSections();
      if (next === -1) return this.mainNav.items[this.mainNav.curr].focus();
      const nextSection = allSections[next];
      const headline = nextSection.querySelector('.feds-popup-headline');
      this.openMobileHeadline({ focus, headline });
    }
  };

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      const popupEl = this.getOpenPopup();
      if (!e.target.closest(selectors.fedsPopup) || !popupEl) return;
      e.preventDefault();
      e.stopPropagation();

      const popupItems = [...popupEl.querySelectorAll(itemSelector)];
      const curr = popupItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, popupItems);
      const next = getNextVisibleItem(curr, popupItems);

      if (e.shiftKey && e.code === 'Tab') {
        if (prev === -1) {
          this.mainNav.items[this.mainNav.curr].focus();
          return;
        }
        popupItems[prev].focus();
        return;
      }

      switch (e.code) {
        case 'Tab': {
          if (next === -1) {
            this.mainNav.focusNext();
            this.mainNav.open({});
            break;
          }
          popupItems[next].focus();
          break;
        }
        case 'Enter': {
          console.log('Enter');
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.cur].focus();
          break;
        }
        case 'Space': {
          console.log('Space');
          break;
        }
        case 'ArrowLeft': {
          if (prev === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const section = document.activeElement.closest('.feds-popup-section');
          const allSections = [...this.getOpenPopup().querySelectorAll('.feds-popup-section')];
          const index = allSections.findIndex((node) => node.isEqualNode(section));
          if (index === 0) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = allSections[index - 1];
          nextSection.querySelector(itemSelector).focus();
          break;
        }
        case 'ArrowUp': {
          if (prev === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          popupItems[prev].focus();
          break;
        }
        case 'ArrowRight': {
          if (next === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const section = document.activeElement.closest('.feds-popup-section');
          const allSections = [...this.getOpenPopup().querySelectorAll('.feds-popup-section')];
          const index = allSections.findIndex((node) => node.isEqualNode(section));
          if (index === allSections.length - 1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = allSections[index + 1];
          nextSection.querySelector(itemSelector).focus();
          break;
        }
        // each popup
        // has columns & sections
        case 'ArrowDown': {
          if (!this.desktop.matches) {
            this.mobileArrowDown({ curr, popupItems });
            break;
          }
          if (next === -1) {
            this.mainNav.focusNext();
            this.mainNav.open({ focus: 'first' });
            break;
          }
          // const index = popupItems.findIndex((el) => el === document.activeElement);
          // const nextItem = getNextVisibleItem(index, popupItems);
          // console.log({ index, popupItems, nextItem });
          // if (nextItem === -1) break;
          popupItems[next].focus();
          break;
        }
        default:
          break;
      }
    });
  };
}

export default Popup;
