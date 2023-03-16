import { getNextVisibleItem, getPreviousVisibleItem, selectors } from './utils.js';
import Popup from './PopupKeyboardNavigation.js';

let popup;
const closePopup = () => {
  const trigger = document.querySelector(selectors.openPopup);
  if (!trigger) return;
  popup?.destroy();
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('daa-lh', 'header|Open');
};

// TODO do this for real...
const openPopup = (trigger) => {
  closePopup();
  trigger.setAttribute('aria-expanded', 'true');
  trigger.setAttribute('daa-lh', 'header|Close');
  trigger.blur();
  const navItem = trigger.parentElement;
  const popupEl = navItem.querySelector('.feds-popup');
  if (!popupEl) {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      popup = new Popup({ popupEl: navItem.querySelector('.feds-popup'), trigger });
    });
    observer.observe(navItem, { childList: true });
    return;
  }
  popup = new Popup({ popupEl, trigger });
};

class KeyboardNavigation {
  constructor() {
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest('header')) return;

      const navItems = [
        ...document.querySelectorAll(`
        ${selectors.brand}, 
        ${selectors.mainNavToggle},
        ${selectors.mainNavItems},
        ${selectors.searchTrigger},
        ${selectors.searchField},
        ${selectors.signIn},
        ${selectors.profileButton},
        ${selectors.logo},
        ${selectors.breadCrumbItems}
        `),
      ];

      const curr = navItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, navItems);
      const next = getNextVisibleItem(curr, navItems);

      console.log({ prev, next, curr });
      // TODO cycle through nav when search is open
      if (prev === -1 || next === -1 || curr === 0 || curr + 1 === navItems.length) return;

      if (e.shiftKey && e.code === 'Tab') {
        if (prev === -1) return;
        closePopup();
        return;
      }

      const mainNavItems = [...document.querySelectorAll(selectors.mainNavItems)];
      const currMain = mainNavItems.findIndex((el) => el === e.target);
      const prevMain = getPreviousVisibleItem(currMain, mainNavItems);
      const nextMain = getNextVisibleItem(currMain, mainNavItems);

      switch (e.code) {
        case 'Tab': {
          closePopup();
          break;
        }
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
          if (prevMain === -1) break;
          mainNavItems[currMain].blur();
          mainNavItems[prevMain].focus();
          closePopup();
          break;
        }
        case 'ArrowUp': {
          if (!mainNavItems[currMain]) break;
          closePopup();
          if (currMain <= 0) break;
          mainNavItems[currMain].blur();
          mainNavItems[currMain - 1].focus();
          break;
        }
        case 'ArrowRight': {
          if (nextMain === -1) break;
          mainNavItems[currMain].blur();
          mainNavItems[nextMain].focus();
          closePopup();
          break;
        }
        case 'ArrowDown': {
          console.log('oh');
          console.log(mainNavItems[currMain]);
          if (!mainNavItems[currMain]) break;
          openPopup(mainNavItems[currMain]);
          break;
        }
        default:
          break;
      }
    });
  }
}

export default KeyboardNavigation;
