/* eslint-disable class-methods-use-this */
import { selectors, getNextVisibleItem, getPreviousVisibleItem } from './utils.js';
import Popup from './popup.js';

class MainNavItem {
  constructor() {
    this.popup = new Popup({ mainNav: this });
    this.listenToChanges();
  }

  listenToChanges() {
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest(selectors.fedsNav) || e.target.closest(selectors.fedsPopup)) return;
      this.setActive(e.target);

      if (e.shiftKey && e.code === 'Tab') {
        const open = document.querySelector(selectors.expandedPopupTrigger);
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
          const open = document.querySelector(selectors.expandedPopupTrigger);
          this.focusPrev();
          if (open) {
            this.open();
          }

          break;
        }
        case 'ArrowUp': {
          if (!e.target.closest(selectors.fedsNav)) break;
          const open = document.querySelector(selectors.expandedPopupTrigger);
          this.focusPrev();
          if (open) {
            this.open({ focus: 'last' });
          }
          break;
        }
        case 'ArrowRight': {
          if (!e.target.closest(selectors.fedsNav)) break;
          const open = document.querySelector(selectors.expandedPopupTrigger);
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
    const trigger = document.querySelector(selectors.expandedPopupTrigger);
    if (!trigger) return;
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
    if (popupEl) {
      this.popup.open({ focus });
      return;
    }

    // We need to wait for the popup to be added to the DOM before we can open it.
    const observer = new MutationObserver(() => {
      observer.disconnect();
      this.popup.open({ focus });
    });
    observer.observe(navItem, { childList: true });
  };
}

export default MainNavItem;
