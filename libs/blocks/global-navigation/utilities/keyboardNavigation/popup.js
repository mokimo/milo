/* eslint-disable class-methods-use-this */
import {
  getNextVisibleItem,
  getPreviousVisibleItem,
  getOpenPopup,
  selectors,
} from './utils.js';

const getState = ({ e } = {}) => {
  const popupEl = getOpenPopup();
  if (!popupEl) return {};
  const popupItems = [...popupEl.querySelectorAll(selectors.popupItems)];
  const curr = popupItems.findIndex((el) => el === e.target);
  const prev = getPreviousVisibleItem(curr, popupItems);
  const next = getNextVisibleItem(curr, popupItems);
  const column = document.activeElement.closest(selectors.column);
  const visibleColumns = [...popupEl.querySelectorAll(selectors.column)];
  const currentColumn = visibleColumns.findIndex((node) => node.isEqualNode(column));
  const prevColumn = visibleColumns[currentColumn - 1] || -1;
  const nextColumn = visibleColumns[currentColumn + 1] || -1;

  return {
    popupItems,
    curr,
    prev,
    next,
    prevColumn,
    nextColumn,
  };
};
class Popup {
  constructor({ mainNav }) {
    this.mainNav = mainNav;
    this.listenToChanges();
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  open({ focus } = {}) {
    const popupItems = [...(getOpenPopup()?.querySelectorAll(selectors.popupItems) || [])];
    if (!popupItems.length) return;
    const first = getNextVisibleItem(-1, popupItems);
    const last = getPreviousVisibleItem(popupItems.length, popupItems);
    if (focus === 'first') popupItems[first].focus();
    if (focus === 'last') popupItems[last].focus();
  }

  listenToChanges = () => {
    document.querySelector('header').addEventListener('keydown', (e) => {
      const popupEl = getOpenPopup();
      if (!e.target.closest(selectors.popup) || !popupEl || !this.desktop.matches) return;
      e.preventDefault();
      e.stopPropagation();
      const { popupItems, prev, next, prevColumn, nextColumn } = getState({ e });

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
          e.target.click();
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.curr].focus();
          break;
        }
        case 'Space': {
          e.target.click();
          break;
        }
        case 'ArrowLeft': {
          const noPrev = (document.dir === 'ltr' && prevColumn === -1);
          const noNext = (document.dir === 'rtl' && nextColumn === -1);
          if (noPrev || noNext) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          if (document.dir === 'ltr') {
            prevColumn.querySelector(selectors.popupItems).focus();
          } else {
            nextColumn.querySelector(selectors.popupItems).focus();
          }
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
          const noNext = document.dir === 'ltr' && nextColumn === -1;
          const noPrev = document.dir === 'rtl' && prevColumn === -1;
          if (noNext || noPrev) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          if (document.dir === 'ltr') {
            nextColumn.querySelector(selectors.popupItems).focus();
          } else {
            prevColumn.querySelector(selectors.popupItems).focus();
          }
          break;
        }
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
