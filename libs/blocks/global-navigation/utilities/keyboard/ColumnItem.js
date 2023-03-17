import { isRTL } from './utils.js';
import Popup from './Popup.js';
import getEventKey from './getEventKey.js';

const ORDER = {
  FIRST: 'first',
  LAST: 'last',
};
export default class ColumnItem {
  /**
     * ColumnItem constructor
     * @param {HTMLElement} node ColumnItem's DOM node
     * @param {Number} position ColumnItem position
     * @param {Column} parent ColumnItem's parent controller
     */
  constructor(node, position, parent) {
    if (!(node instanceof HTMLElement)
            || !Number.isInteger(position)
            || !(parent.node instanceof HTMLElement)) {
      return;
    }
    this.node = node;
    this.position = position;
    this.column = parent;
    this.popup = this.column.popup;
    this.menu = parent.menu;

    this.init();
  }

  /**
     * Adds event listeners
     */
  init() {
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
     * Handles execution of click/space/return events.
     * If the column item is expandable, it will toggle the dropdown.
     * Otherwise (if the column item is a link), it will proceed with the link click.
     * @param {Event} event Execution event
     */
  handleClick(event) {
    this.column.setIndex(this.position);

    const key = getEventKey(event);

    if (key === 'Space') {
      this.node.click();
    }
  }

  /**
     * Handles focus event. Sets index for focused item.
     */
  handleFocus() {
    this.column.setIndex(this.position);
  }

  /**
     * Handles blur event. Resets index.
     * @param {Event} event Blur event
     */
  handleBlur(event) {
    this.column.setIndex(-1);

    // When the item lost focus, check next/ previous related target;
    // If the item is not a menu item of a column item, close all the popups;
    if (event.relatedTarget) {
      const relatedTargetClassList = event.relatedTarget.classList;
      const isRelated = relatedTargetClassList.contains(this.menu.selectors.navSubLink)
                || relatedTargetClassList.contains(this.menu.selectors.imageLink)
                || relatedTargetClassList.contains(this.menu.selectors.richTextLink)
                || relatedTargetClassList.contains(this.menu.selectors.navListHeadline);

      if (!isRelated) {
        Popup.closeAll();
      }
    }
  }

  /**
     * Handles keydown TAB. Adds TAB navigation.
     * @param {Event} event Keydwn (tab) event
     */
  handleTab(event) {
    const { item } = this.popup;
    const { menu } = item;

    // If last column item of the last column of the last item
    // or last visible item, ignore TAB event
    if (((this.position === this.column.items.length - 1)
            && (this.column.position === this.popup.items.length - 1)
            && (item.position === menu.items.length - 1))
            || menu.getNextVisibleItem(item.position) === -1) {
      return;
    }

    event.preventDefault();
    if (!event.shiftKey) {
      this.moveDown();
    } else {
      this.moveUp();
    }
  }

  /**
     * Moves the focus to next column item
     */
  moveDown() {
    this.column.moveToNextColumnItem(this.position);
  }

  /**
     * Moves the focus to previous column item
     */
  moveUp() {
    this.column.moveToPreviousColumnElement(this.position);
  }

  /**
     * Moves focus to the first column item of the previous column, or parent menu item.
     */
  moveLeft() {
    this.popup.moveToPreviousColumn(this.column.position, ORDER.FIRST);
  }

  /**
     * Moves focus to the first column item of the next column, or parent menu item.
     */
  moveRight() {
    this.popup.moveToNextColumn(this.column.position, ORDER.FIRST);
  }

  /**
     * Collapses the parent popup and moves focus to parent menu item
     */
  closePopup() {
    Popup.closeAll();
    this.popup.menu.moveToItem(this.popup.item.position);
    this.popup.menu.popupFlag = false;
  }

  /**
     * Resets the column item
     */
  reset() {
    this.node.removeEventListener('keydown', this.events.keydown, false);
    this.node.removeEventListener('click', this.events.click, false);
    this.node.removeEventListener('focus', this.events.focus, false);
    this.node.removeEventListener('blur', this.events.blur, false);
    this.events = undefined;

    this.node = undefined;
    this.position = undefined;
    this.column = undefined;
    this.popup = undefined;
  }
}
