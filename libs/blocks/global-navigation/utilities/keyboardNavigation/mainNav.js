/* eslint-disable class-methods-use-this */
import { selectors, getNextVisibleItem, getPreviousVisibleItem } from './utils.js';
import Popup from './popup.js';
import MobilePopup from './mobilePopup.js';

class MainNavItem {
  constructor() {
    this.desktop = window.matchMedia('(min-width: 900px)');
    this.popup = new Popup({ mainNav: this });
    this.mobilePopup = new MobilePopup({ mainNav: this });
    this.listenToChanges();
  }

  listenToChanges() {
    document.querySelector('header').addEventListener('click', (e) => {
      if (!e.target.closest(selectors.fedsNav) || e.target.closest(selectors.popup)) return;
      const open = document.querySelector(selectors.expandedPopupTrigger);
      if (open) {
        this.close();
      } else {
        this.open({ triggerEl: e.target });
      }
    });

    document.querySelector('header').addEventListener('keydown', (e) => {
      if (!e.target.closest(selectors.fedsNav) || e.target.closest(selectors.popup)) return;
      this.setActive(e.target);

      if (e.shiftKey && e.code === 'Tab') {
        const open = document.querySelector(selectors.expandedPopupTrigger);
        if (open) {
          if (this.prev === -1) {
            this.close();
          } else {
            e.preventDefault();
            this.focusPrev({ focus: 'last' });
          }
        }
        return;
      }

      switch (e.code) {
        case 'Escape': {
          this.close();
          break;
        }
        case 'Space': {
          e.preventDefault();
          e.target.click();
          break;
        }
        // TODO popup navigation logic.
        case 'ArrowLeft': {
          if (this.prev === -1) break;
          this.focusPrev({ focus: null });

          break;
        }
        case 'ArrowUp': {
          this.focusPrev({ focus: 'last' });
          break;
        }
        case 'ArrowRight': {
          if (this.next === -1) break;
          const open = document.querySelector(selectors.expandedPopupTrigger);
          this.focusNext();
          if (open) {
            this.open();
          }
          break;
        }
        case 'ArrowDown': {
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

  focusPrev = ({ focus } = {}) => {
    const open = document.querySelector(selectors.expandedPopupTrigger);
    this.close();
    if (this.prev === -1) return;
    this.items[this.prev].focus();
    this.setActive(this.items[this.prev]);
    if (open) {
      this.open({ focus });
    }
  };

  focusNext = () => {
    if (this.next === -1) return;
    this.close();
    this.items[this.next].focus();
    this.setActive(this.items[this.next]);
  };

  close = ({ e } = {}) => {
    const openElements = document.querySelectorAll("header [aria-expanded='true']");
    if (!openElements) return;
    if (e) e.preventDefault();
    [...openElements].forEach((el) => {
      el.setAttribute('aria-expanded', 'false');
      el.setAttribute('daa-lh', 'header|Open');
    });
    document.querySelector(selectors.curtain).classList.remove('is-open');
  };

  open = ({ focus, triggerEl, e } = {}) => {
    const trigger = triggerEl || this.items[this.curr];
    if (!trigger || !trigger.hasAttribute('aria-haspopup')) return;
    if (e) e.preventDefault();
    this.close();
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('daa-lh', 'header|Close');
    const navItem = trigger.parentElement;
    const popupEl = navItem.querySelector(selectors.popup);
    if (popupEl) {
      if (this.desktop.matches) {
        this.popup.open({ focus });
      } else {
        this.mobilePopup.open({ focus });
      }
      return;
    }

    // We need to wait for the popup to be added to the DOM before we can open it.
    const observer = new MutationObserver(() => {
      observer.disconnect();
      if (this.desktop.matches) {
        this.popup.open({ focus });
      } else {
        this.mobilePopup.open({ focus });
      }
    });
    observer.observe(navItem, { childList: true });
  };
}

export default MainNavItem;
