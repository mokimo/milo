import {
  getNextVisibleItem,
  getPreviousVisibleItem,
  selectors,
} from './utils.js';

class Popup {
  constructor({ popupEl, focus, keyboardNavigation }) {
    if (!popupEl) return;
    const popupItems = [
      ...popupEl.querySelectorAll(`
      ${selectors.navLink}, 
      ${selectors.promoLink},
      ${selectors.imagePromo}
      `),
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

    this.handleKeydown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const curr = popupItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, popupItems);
      const next = getNextVisibleItem(curr, popupItems);
      if (e.shiftKey && e.code === 'Tab') {
        if (prev === -1) {
          keyboardNavigation.mainNavItems[keyboardNavigation.currMain].focus();
          return;
        }
        popupItems[prev].focus();
        return;
      }

      switch (e.code) {
        case 'Tab': {
          if (next === -1) {
            keyboardNavigation.focusNextNavItem();
            keyboardNavigation.openPopup({});
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
          keyboardNavigation.closePopup();
          keyboardNavigation.mainNavItems[keyboardNavigation.currMain].focus();
          break;
        }
        case 'Space': {
          console.log('Space');
          break;
        }
        // TODO popup navigation logic.
        case 'ArrowLeft': {
          break;
        }
        case 'ArrowUp': {
          if (prev === -1) {
            keyboardNavigation.mainNavItems[keyboardNavigation.currMain].focus();
            break;
          }
          popupItems[prev].focus();
          break;
        }
        case 'ArrowRight': {
          break;
        }
        case 'ArrowDown': {
          if (next === -1) {
            keyboardNavigation.focusNextNavItem();
            keyboardNavigation.openPopup({});
            break;
          }
          popupItems[next].focus();
          break;
        }
        default:
          break;
      }
    };

    this.popupEl = popupEl;
    this.popupEl.addEventListener('keydown', this.handleKeydown);
  }

  destroy() {
    this.popupEl.removeEventListener('keydown', this.handleKeydown);
  }
}

export default Popup;
