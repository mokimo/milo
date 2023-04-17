/* eslint-disable class-methods-use-this */
import { selectors, getNextVisibleItem, getPreviousVisibleItem } from './utils.js';
import Popup from './popup.js';
import MobilePopup from './mobilePopup.js';
import { closeAllDropdowns, openOrClose } from '../utilities.js';

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
      closeAllDropdowns();
      if (open !== e.target) this.open({ triggerEl: e.target });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') || e.target.classList.contains('feds-curtain')) {
        closeAllDropdowns();
      }
    });

    document.querySelector('header').addEventListener('keydown', (e) => {
      if (!e.target.closest(selectors.fedsNav) || e.target.closest(selectors.popup)) return;
      this.setActive(e.target);
      if (e.shiftKey && e.code === 'Tab') {
        const open = document.querySelector(selectors.expandedPopupTrigger);
        if (open) {
          if (this.prev === -1) {
            closeAllDropdowns();
          } else {
            e.preventDefault();
            this.focusPrev({ focus: 'last' });
          }
        }
        return;
      }

      switch (e.code) {
        case 'Escape': {
          closeAllDropdowns();
          break;
        }
        // TODO popup navigation logic.
        case 'ArrowLeft': {
          if (document.dir === 'ltr') {
            if (this.prev === -1) break;
            this.focusPrev({ focus: null });
          } else {
            if (this.next === -1) break;
            this.focusNext({ focus: null });
          }
          break;
        }
        case 'ArrowUp': {
          this.focusPrev({ focus: 'last' });
          break;
        }
        case 'ArrowRight': {
          const open = document.querySelector(selectors.expandedPopupTrigger);
          if (document.dir === 'ltr') {
            if (this.next === -1) break;
            this.focusNext();
          } else {
            if (this.prev === -1) break;
            this.focusPrev({ focus: null });
          }
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
    closeAllDropdowns();
    if (this.prev === -1) return;
    this.items[this.prev].focus();
    this.setActive(this.items[this.prev]);
    if (open) {
      this.open({ focus });
    }
  };

  focusNext = () => {
    if (this.next === -1) return;
    closeAllDropdowns();
    this.items[this.next].focus();
    this.setActive(this.items[this.next]);
  };

  open = ({ focus, triggerEl, e } = {}) => {
    const trigger = triggerEl || this.items[this.curr];
    if (!trigger || !trigger.hasAttribute('aria-haspopup')) return;
    if (e) e.preventDefault();
    openOrClose({ trigger });
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
