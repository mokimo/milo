import { selectors, getNextVisibleItem, getPreviousVisibleItem } from './utils.js';
import Popup from './PopupKeyboardNavigation.js';

class MainNavItem {
  constructor() {
    this.listenToChanges();
  }

  listenToChanges() {
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest(selectors.fedsNav)) return;
      this.setActive(e.target);

      if (e.shiftKey && e.code === 'Tab') {
        const open = document.querySelector(selectors.openPopup);
        if (open) {
          e.preventDefault();
          this.focusPrev();
          this.open({ focus: 'last' });
        }
        return;
      }

      switch (e.code) {
        case 'Tab': {
          console.log('Tab');
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
          if (!e.target.closest(selectors.fedsNav)) break;
          const open = document.querySelector(selectors.openPopup);
          this.focusPrev();
          if (open) {
            this.open();
          }

          break;
        }
        case 'ArrowUp': {
          if (!e.target.closest(selectors.fedsNav)) break;
          const open = document.querySelector(selectors.openPopup);
          this.focusPrev();
          if (open) {
            this.open({ focus: 'last' });
          }
          break;
        }
        case 'ArrowRight': {
          if (!e.target.closest(selectors.fedsNav)) break;
          const open = document.querySelector(selectors.openPopup);
          this.focusNext();
          if (open) {
            this.open();
          }
          break;
        }
        case 'ArrowDown': {
          if (!e.target.closest(selectors.fedsNav)) break;
          if (this.items[this.curr] && this.items[this.curr].hasAttribute('aria-haspopup')) {
            this.open({ focus: 'first' });
            return;
          }
          this.focusNext();
          break;
        }
        default:
          break;
      }
    });
  }

  setActive = (target) => {
    if (!target) return;
    this.items = [...document.querySelectorAll(selectors.mainNavItems)];
    this.curr = this.items.findIndex((el) => el === target);
    this.prev = getPreviousVisibleItem(this.curr, this.items);
    this.next = getNextVisibleItem(this.curr, this.items);
  };

  focusPrev = () => {
    if (this.prev === -1) return;
    this.close();
    this.items[this.prev].focus();
    this.setActive(this.items[this.prev]);
  };

  focusNext = () => {
    if (this.next === -1) return;
    this.close();
    this.items[this.next].focus();
    this.setActive(this.items[this.next]);
  };

  close = () => {
    const trigger = document.querySelector(selectors.openPopup);
    if (!trigger) return;
    this.popup?.destroy();
    this.popup = null;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('daa-lh', 'header|Open');
  };

  open = ({ focus } = {}) => {
    const trigger = this.items[this.curr];
    if (!trigger || !trigger.hasAttribute('aria-haspopup')) return;
    this.close();
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('daa-lh', 'header|Close');
    const navItem = trigger.parentElement;
    const popupEl = navItem.querySelector(selectors.fedsPopup);
    // Async popup's need a bit of special care - such as a mega menu.
    if (!popupEl) {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        this.popup = new Popup({
          popupEl: navItem.querySelector(selectors.fedsPopup),
          trigger,
          mainNav: this,
          focus,
        });
      });
      observer.observe(navItem, { childList: true });
      return;
    }
    this.popup = new Popup({ popupEl, trigger, mainNav: this, focus });
  };
}

export default MainNavItem;
