import { isRTL } from './utils.js';
import Popup from './Popup.js';
import getEventKey from './getEventKey.js';

const ORDER = {
  FIRST: 'first',
  LAST: 'last',
};

const CONFIG = { SELECTORS: { STICKY_HEADER_WRAPPER: 'feds-header-wrapper--sticky' } };

export default class Item {
  /**
     * Item constructor
     * @param {HTMLElement} node Item's DOM node
     * @param {Number} position Item position
     * @param {Menu} parent Item's parent controller
     */
  constructor(node, position, parent) {
    if (!(node instanceof HTMLElement)
            || !Number.isInteger(position)
            || !(parent.node instanceof HTMLElement)) {
      return;
    }

    this.node = node;
    this.position = position;
    this.menu = parent;

    this.init();
  }

  /**
     * Initializes the item structure, creates popup, adds event listeners
     */
  init() {
    const popup = this.node.nextElementSibling.matches(`.${this.menu.selectors.popup}`)
      ? this.node.nextElementSibling : null;
    if (popup) {
      this.popup = new Popup(popup, this);
    }

    // Keep a reference to events, in order to remove them on reset
    this.events = {
      keydown: this.handleKey.bind(this),
      click: this.handleClick.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };

    this.node.addEventListener('keydown', this.events.keydown);
    this.node.addEventListener('click', this.events.click);
    this.node.addEventListener('focus', this.events.focus);
    this.node.addEventListener('blur', this.events.blur);
  }

  /**
     * Handles keyboard events
     * @param {Event} event Keyboard event
     */
  handleKey(event) {
    const key = getEventKey(event);

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveUp();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (!isRTL()) {
          this.moveLeft();
        } else {
          this.moveRight();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (!isRTL()) {
          this.moveRight();
        } else {
          this.moveLeft();
        }
        break;
      case 'Escape':
        this.closePopup();
        break;
      case 'Space':
      case 'Enter':
        this.handleClick(event);
        break;
      case 'Tab':
        this.handleTab(event);
        break;
      default:
        break;
    }
  }

  /**
     * Handles execution (click, space, return) events.
     * If the menu item has a popup, it will toggle the popup.
     * Otherwise (if the menu item is a link), it will proceed with the link click.
     * @param {Event} event Execution event
     */
  handleClick(event) {
    const key = getEventKey(event);

    // Set index on current item
    this.menu.setIndex(this.position);
    if (this.hasPopup()) {
      // If item has a popup, toggle popup
      event.preventDefault();
      if (this.popup.isExpanded()) {
        Popup.closeAll();
        this.menu.popupFlag = false;
      } else {
        const { disableSticky } = window.fedsConfig;
        const stickyEnabledHeader = document.querySelector(`.${CONFIG.SELECTORS.STICKY_HEADER_WRAPPER}`);

        if (!disableSticky && stickyEnabledHeader instanceof HTMLElement) {
          this.node.scrollIntoView();
        }

        this.popup.expand();
        this.menu.popupFlag = true;
      }
    } else if (key === 'Space') {
      this.node.click();
    }
  }

  /**
     * Handles focus event. Sets index for focused item
     */
  handleFocus() {
    this.menu.setIndex(this.position);
  }

  /**
     * Handles blur event. Sets index for blurred item.
     * @param {Event} event Blur event
     */
  handleBlur(event) {
    if (this.hasPopup() && this.popup.isExpanded()) {
      // Keep menu item index if current focus is on a subitem
      this.menu.setIndex(this.position);
    } else {
      // Reset index
      this.menu.setIndex(-1);
    }

    // When the item lost focus, check next/ previous related target;
    // If the item is not a menu item of a column item, close all the popups
    if (event.relatedTarget) {
      if (!(event.relatedTarget.classList.contains(this.menu.selectors.navLink)
                || event.relatedTarget.classList.contains(this.menu.selectors.imageLink)
                || event.relatedTarget.classList.contains(this.menu.selectors.richTextLink)
                || event.relatedTarget.classList.contains(this.menu.selectors.navSubLink)
                || event.relatedTarget.classList.contains(this.menu.selectors.navListHeadline))) {
        Popup.closeAll();
        this.menu.popupFlag = false;
      }
    }
  }

  /**
     * Handles keydown TAB. Adds TAB navigation.
     * @param {Event} event Keydwn (tab) event
     */
  handleTab(event) {
    if (!event.shiftKey) {
      // If TAB on the last item or last visible item, ignore event
      if (this.position === this.menu.items.length - 1
                || this.menu.getNextVisibleItem(this.position) === -1) {
        return;
      }

      event.preventDefault();

      if (this.menu.popupFlag) {
        this.moveDown();
      } else {
        this.moveRight();
      }
    } else {
      // If ATL+TAB on the first item or first visible item, ignore event
      if (this.position === 0
                || this.menu.getPreviousVisibleItem(this.position) === -1) {
        return;
      }

      event.preventDefault();

      if (this.menu.popupFlag) {
        this.moveUp();
      } else {
        this.moveLeft();
      }
    }
  }

  /**
     * Handles DOWN ARROW key press. If the menu item has a popup,
     * it will first expand the popup and then focus the first column item.
     */
  moveDown() {
    if (this.hasPopup()) {
      // If item has a popup, expand the popup
      if (!this.popup.isExpanded()) {
        this.popup.expand();
        this.menu.popupFlag = true;
      }
      // Focus the first sub-item
      this.popup.moveToFirstColumnItem();
    } else {
      this.moveRight();
    }
  }

  /**
     * Handles UP ARROW key press. If the menu item has a popup
     * and the popup is expanded, it will collapse the popup and
     * expand the previous's item popup and focus the last column item.
     */
  moveUp() {
    if (this.hasPopup()) {
      if (this.popup.isExpanded()) {
        Popup.closeAll();
        this.menu.moveToPreviousItem(this.position, true, ORDER.LAST);
      } else {
        this.moveLeft();
      }
    } else {
      this.moveLeft();
    }
  }

  /**
     * Handles LEFT ARROW key press.
     * The parent controller handles LEFT movement
     */
  moveLeft() {
    this.menu.moveToPreviousItem(this.position);
  }

  /**
     * Handles RIGHT ARROW key press.
     * The parent controller handles RIGHT movement
     */
  moveRight() {
    this.menu.moveToNextItem(this.position);
  }

  /**
     * Handles ESC key press. If the menu item has an expanded popup,
     * it will close the popup.
     */
  closePopup() {
    if (this.hasPopup() && this.popup.isExpanded()) {
      Popup.closeAll();
      this.menu.popupFlag = false;
    }
  }

  /**
     * Returns true if the menu item has a popup.
     * @returns {Boolean} True if the menu item has a popup
     */
  hasPopup() {
    return !!this.popup;
  }

  /**
     * Resets the menu item
     */
  reset() {
    if (this.node instanceof HTMLElement) {
      this.node.removeEventListener('keydown', this.events.keydown, false);
      this.node.removeEventListener('click', this.events.click, false);
      this.node.removeEventListener('focus', this.events.focus, false);
      this.node.removeEventListener('blur', this.events.blur, false);
    }

    this.events = undefined;

    if (this.hasPopup()) {
      this.popup.reset();
      this.popup = undefined;
    }

    this.menu = undefined;
    this.position = undefined;
    this.node = undefined;
  }
}
