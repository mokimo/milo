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
    const popupItems = [...popupEl.querySelectorAll(itemSelector)];
    const first = getNextVisibleItem(-1, popupItems);
    if (first === -1) return;

    if (focus === 'first') {
      popupItems[first].focus();
    }

    if (focus === 'last') {
      const last = getPreviousVisibleItem(popupItems.length, popupItems);
      popupItems[last].focus();
    }
  }

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      const popupEl = this.getOpenPopup();
      if (!e.target.closest(selectors.fedsPopup) || !popupEl || !this.desktop.matches) return;
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
          // TODO, arrowLeft and arrowRight might not always work and lead to JS errors.
          // CHECK the medium menu.
          if (prev === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const section = document.activeElement.closest(selectors.fedsPopupSection);
          const visibleSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
          const index = visibleSections.findIndex((node) => node.isEqualNode(section));
          if (index <= 0) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = visibleSections[index - 1];
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

          const section = document.activeElement.closest(selectors.fedsPopupSection);
          const visibleSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
          const index = visibleSections.findIndex((node) => node.isEqualNode(section));
          if (index === visibleSections.length - 1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = visibleSections[index + 1];
          nextSection.querySelector(itemSelector).focus();
          break;
        }
        // each popup
        // has columns & sections
        case 'ArrowDown': {
          if (next === -1) {
            this.mainNav.focusNext();
            this.mainNav.open();
            break;
          }

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
