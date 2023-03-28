import {
  getNextVisibleItem,
  getPreviousVisibleItem,
  selectors,
} from './utils.js';

class Popup {
  constructor({ popupEl, focus, mainNav }) {
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
          mainNav.items[mainNav.curr].focus();
          return;
        }
        popupItems[prev].focus();
        return;
      }

      switch (e.code) {
        case 'Tab': {
          if (next === -1) {
            mainNav.focusNext();
            mainNav.open({});
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
          mainNav.close();
          mainNav.items[mainNav.cur].focus();
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
          console.log(mainNav);
          if (prev === -1) {
            mainNav.items[mainNav.curr].focus();
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
            mainNav.focusNext();
            mainNav.open({});
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
