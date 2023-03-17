import { getNextVisibleItem, getPreviousVisibleItem, selectors } from './utils.js';
import Popup from './PopupKeyboardNavigation.js';

// TODO cycle through nav when search is open
class KeyboardNavigation {
  constructor() {
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest('header')) return;

      this.navItems = [
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
      this.curr = this.navItems.findIndex((el) => el === e.target);
      this.prev = getPreviousVisibleItem(this.curr, this.navItems);
      this.next = getNextVisibleItem(this.curr, this.navItems);

      this.setActiveMainNavItems(e.target);
      if (this.prev === -1 || this.next === -1) return;

      if (e.shiftKey && e.code === 'Tab') {
        const open = document.querySelector(selectors.openPopup);
        if (open) {
          e.preventDefault();
          this.focusPrevNavItem();
          this.openPopup({ focus: 'last' });
        }
        return;
      }

      switch (e.code) {
        case 'Tab': {
          break;
        }
        case 'Enter': {
          console.log('Enter');
          break;
        }
        case 'Escape': {
          break;
        }
        case 'Space': {
          console.log('Space');
          break;
        }
        // TODO popup navigation logic.
        case 'ArrowLeft': {
          this.focusPrevNavItem();
          break;
        }
        case 'ArrowUp': {
          const open = document.querySelector(selectors.openPopup);
          this.focusPrevNavItem();
          if (open) {
            this.openPopup({ focus: 'last' });
          }
          break;
        }
        case 'ArrowRight': {
          this.focusNextNavItem();
          break;
        }
        case 'ArrowDown': {
          if (this.mainNavItems[this.currMain] && this.mainNavItems[this.currMain].hasAttribute('aria-haspopup')) {
            this.openPopup({ focus: 'first' });
            return;
          }
          this.focusNextNavItem();
          break;
        }
        default:
          break;
      }
    });
  }

  setActiveMainNavItems = (target) => {
    if (!target) return;
    this.mainNavItems = [...document.querySelectorAll(selectors.mainNavItems)];
    this.currMain = this.mainNavItems.findIndex((el) => el === target);
    this.prevMain = getPreviousVisibleItem(this.currMain, this.mainNavItems);
    this.nextMain = getNextVisibleItem(this.currMain, this.mainNavItems);
  };

  focusPrevNavItem = () => {
    if (this.prevMain === -1) return;
    this.closePopup();
    this.mainNavItems[this.prevMain].focus();
    this.setActiveMainNavItems(this.mainNavItems[this.prevMain]);
  };

  focusNextNavItem = () => {
    if (this.nextMain === -1) return;
    this.closePopup();
    this.mainNavItems[this.nextMain].focus();
    this.setActiveMainNavItems(this.mainNavItems[this.nextMain]);
  };

  closePopup = () => {
    const trigger = document.querySelector(selectors.openPopup);
    if (!trigger) return;
    this.popup?.destroy();
    this.popup = null;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('daa-lh', 'header|Open');
  };

  openPopup = ({ focus } = {}) => {
    const trigger = this.mainNavItems[this.currMain];
    if (!trigger || !trigger.hasAttribute('aria-haspopup')) return;
    this.closePopup();
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('daa-lh', 'header|Close');
    const navItem = trigger.parentElement;
    const popupEl = navItem.querySelector('.feds-popup');
    if (!popupEl) {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        this.popup = new Popup({ popupEl: navItem.querySelector('.feds-popup'), trigger, keyboardNavigation: this, focus });
      });
      observer.observe(navItem, { childList: true });
      return;
    }
    this.popup = new Popup({ popupEl, trigger, keyboardNavigation: this, focus });
  };
}

export default KeyboardNavigation;
