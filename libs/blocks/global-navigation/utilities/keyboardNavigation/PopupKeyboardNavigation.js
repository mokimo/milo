import { getNextVisibleItem, getPreviousVisibleItem, selectors } from './utils.js';

class Popup {
  constructor({ popupEl, trigger }) {
    if (!popupEl) return;
    const popupItems = [
      ...popupEl.querySelectorAll(`
        ${selectors.navLink}, 
        ${selectors.promoLink},
        ${selectors.imagePromo}
      `),
    ];
    const first = getNextVisibleItem(-1, popupItems);
    if (first === -1) return;
    popupItems[first].focus();

    popupEl.addEventListener('keydown', (e) => {
      const curr = popupItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, popupItems);
      const next = getNextVisibleItem(curr, popupItems);

      const mainNavItems = [...document.querySelectorAll(selectors.mainNavItems)];
      const currMain = mainNavItems.findIndex((el) => el === trigger);
      const prevMain = getPreviousVisibleItem(currMain, mainNavItems);
      const nextMain = getNextVisibleItem(currMain, mainNavItems);

      switch (e.code) {
        case 'Enter': {
          console.log('Enter');
          break;
        }
        case 'Escape': {
          console.log('Escape');
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
          popupItems[curr].blur();
          popupItems[prev].focus();
          break;
        }
        case 'ArrowRight': {
          break;
        }
        case 'ArrowDown': {
          if (next === -1 && nextMain) {
            popupItems[curr].blur();
            mainNavItems[nextMain].focus();
            console.log('shifted focus');
            mainNavItems[nextMain].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            break;
          }
          popupItems[curr].blur();
          popupItems[next].focus();
          break;
        }
        default:
          break;
      }
    });
  }

  destroy() {
    console.log('bye');
  }
}

export default Popup;
