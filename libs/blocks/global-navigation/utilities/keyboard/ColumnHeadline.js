import { isRTL } from './utils.js';
import Column from './Column.js';
import getEventKey from './getEventKey.js';

export default class ColumnHeadline {
  /**
     * ColumnHeadline constructor
     * @param {HTMLElement} node ColumnHeadline's DOM node
     * @param {Column} parent ColumnHeadline's parent controller
     */
  constructor(node, parent) {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    this.node = node;
    this.column = parent;

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
    };

    this.node.addEventListener('keydown', this.events.keydown);
    this.node.addEventListener('click', this.events.click);
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
          this.moveUp();
        } else {
          this.moveDown();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (!isRTL()) {
          this.moveDown();
        } else {
          this.moveUp();
        }
        break;
      case 'Escape':
        Column.closeAll();
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
     * Handles execution of click/space/return events, expanding the column
     */
  handleClick() {
    if (!this.column.isExpanded()) {
      this.column.expand();
    } else {
      Column.closeAll();
    }
  }

  /**
     * Handles keydown TAB. Adds TAB navigation.
     * @param {Event} event Keydown (tab) event
     */
  handleTab(event) {
    event.preventDefault();
    if (!event.shiftKey) {
      this.moveDown();
    } else {
      this.moveUp();
    }
  }

  /**
     * Moves the focus to the first item of the column
     */
  moveDown() {
    this.column.moveToColumnItem(0);
  }

  /**
     * Opens previous column and moves the focus to its last item
     */
  moveUp() {
    this.column.moveToPreviousColumnItem(0);
  }

  /**
     * Resets the column headline
     */
  reset() {
    this.node.removeEventListener('keydown', this.events.keydown, false);
    this.node.removeEventListener('click', this.events.click, false);
    this.events = undefined;

    this.node = undefined;
    this.column = undefined;
  }
}
