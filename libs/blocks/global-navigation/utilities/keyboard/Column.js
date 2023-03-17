import { isElementVisible } from './utils.js';
import Menu from './Menu.js';
import ColumnItem from './ColumnItem.js';
import ColumnHeadline from './ColumnHeadline.js';

const Config = { selectors: { headline: 'feds-navList-headline' } };

const ORDER = {
  FIRST: 'first',
  LAST: 'last',
};
export default class Column {
  /**
     * Column constructor
     * @param {HTMLElement} node Column's DOM node
     * @param {Number} position Column position
     * @param {Popup} parent Column's parent controller
     */
  constructor(node, position, parent) {
    if (!(node instanceof HTMLElement)
            || !Number.isInteger(position)
            || !(parent.node instanceof HTMLElement)) {
      return;
    }

    this.node = node;
    this.position = position;
    this.popup = parent;
    this.menu = parent.menu;

    this.init();
  }

  /**
     * Initializes the menu structure, creates column items
     */
  init() {
    // Initialize logic for column items
    const items = this.node
      .querySelectorAll(`.${this.menu.selectors.navSubLink}, .${this.menu.selectors.imageLink}, .${this.menu.selectors.richTextLink}`);

    // If column doesn't have any items, stop logic execution
    if (!items || !items.length) {
      return;
    }

    this.items = [];
    this.index = -1;

    // eslint-disable-next-line prefer-arrow-callback
    Array.prototype.forEach.call(items, function generateColumnItems(item, position) {
      this.items.push(new ColumnItem(item, position, this));
    }.bind(this));

    const headline = this.node.parentElement.querySelector(`.${Config.selectors.headline}`);

    if (headline instanceof HTMLElement) {
      if (headline.textContent
                && headline.textContent.trim().length) {
        this.headline = new ColumnHeadline(headline, this);
      } else {
        headline.parentElement.removeChild(headline);
      }
    }
  }

  /**
     * Moves focus to previous column item
     * @param {Number} position Current column item's position
     */
  moveToPreviousColumnItem(position) {
    const previous = position - 1;

    // If there are no items, do nothing
    if (!this.hasItems()) {
      return;
    }

    // If first column item, move focus to previous column, last item
    if (previous < 0) {
      Column.closeAll();
      this.popup.moveToPreviousColumn(this.position, ORDER.LAST);
      this.index = -1;
      return;
    }

    if (isElementVisible(this.items[previous].node)) {
      this.items[previous].node.focus();
    } else {
      this.moveToColumnItem(previous);
    }

    this.index = previous;
  }

  /**
     * Moves focus to next column item
     * @param {Number} position Current column item's position
     */
  moveToNextColumnItem(position) {
    const next = position + 1;

    // If there are no items, do nothing
    if (!this.hasItems()) {
      return;
    }

    // If last column item, move focus to next column, first column item
    if (next >= this.items.length) {
      this.popup.moveToNextColumn(this.position, ORDER.FIRST, true);
      this.index = -1;
      return;
    }

    // Only focus the next item if it is visible
    if (isElementVisible(this.items[next].node)) {
      this.items[next].node.focus();
    } else {
      this.moveToColumnItem(next);
    }

    this.index = next;
  }

  /**
     * Moves focus to a provided position; does not automatically expand dropdown
     * @param {Number} position Desired focus position
     */
  moveToColumnItem(position, direction) {
    // If there are no items, do nothing
    if (!this.hasItems()) {
      return;
    }

    // If position is below 0, move to the previous column
    if (position < 0) {
      this.popup.moveToPreviousColumn(this.position, ORDER.LAST);
      return;
    }

    // If position exceeds the current column's items, move to the next column
    if (position >= this.items.length) {
      this.popup.moveToNextColumn(this.position, ORDER.FIRST, true);
      return;
    }

    // Only focus the element if it is visible.
    // Otherwise, move to the next visible focusable element
    if (isElementVisible(this.items[position].node)) {
      this.index = position;
      this.items[position].node.focus();
    } else if (direction === 'descending') {
      this.index = position - 1;
      this.moveToColumnItem(position - 1, direction);
    } else {
      this.index = position + 1;
      this.moveToColumnItem(position + 1);
    }
  }

  /**
     * Move to the first focusable element of the current column.
     * On mobile this could be the column headline, if one exists.
     * Otherwise, the first focusable element will receive focus
     */
  moveToFirstColumnElement() {
    // On mobile devices, the first column element
    // might be a headline, which needs to receive focus
    // and the column it wraps should be expanded
    if (this.isExpandable()) {
      this.expand();
    } else {
      // On desktop devices or if a headline is not present,
      // the first column item should receive focus
      this.moveToColumnItem(0);
    }
  }

  /**
     * Move to the previous focusable element.
     * If the previous element is another column item
     * from the currently open column, then it receives focus.
     * If the previous element is the headline, then
     * - on mobile devices, the headline receives focus;
     * - on desktop devices, the last element of the previous column receives focus.
     * @param {Number} position Current column item's position
     */
  moveToPreviousColumnElement(position) {
    if (position === 0 && this.isExpandable()) {
      this.headline.node.focus();
    } else {
      this.moveToPreviousColumnItem(position);
    }
  }

  /**
     * Check if column has column items
     * @returns {Boolean} True if column has column items
     */
  hasItems() {
    return this.items && this.items.length;
  }

  /**
     * Updates the index for current focused column item
     * @param {Number} index Value of index
     */
  setIndex(index) {
    if (!Number.isInteger(index)) {
      return;
    }

    this.index = index;
  }

  /**
     * Check if the column can be expanded
     * @return {Boolean} True if the column is expandable
     */
  isExpandable() {
    return window.innerWidth < this.menu.desktopBreakpoint
            && this.headline instanceof ColumnHeadline
            && isElementVisible(this.headline.node);
  }

  /**
     * Check if the column is expanded
     * @return {Boolean} True if the column is expanded
     */
  isExpanded() {
    return this.headline
            && this.headline.node.getAttribute('aria-expanded') === 'true';
  }

  /**
     * Adds a modifier class to the currently active column
     */
  addHighlight() {
    const closestNavList = this.node.closest(`.${this.menu.selectors.navListItem}`);

    if (closestNavList instanceof HTMLElement) {
      closestNavList.classList.add(this.menu.selectors.activeDropdown);
    }
  }

  /**
     * Expands the column
     */
  expand() {
    // Close all columns, but don't highlight the parent popup
    Column.closeAll(false);
    this.addHighlight();
    this.headline.node.focus();
    this.headline.node.setAttribute('aria-expanded', true);
  }

  /**
     * Closes all currently open columns
     * @param {Boolean} [highlightParent=true] Defines whether the parent
     * popup should receive highlighting. Default is true
     */
  static closeAll(highlightParent = true) {
    Menu.deactivateDropdowns(highlightParent);
    const expandedHeadlines = document.querySelectorAll(`.${Config.selectors.headline}[aria-expanded = 'true']`);

    if (expandedHeadlines.length > 0) {
      Array.prototype.forEach.call(expandedHeadlines, (expandedHeadline) => {
        expandedHeadline.setAttribute('aria-expanded', false);
      });
    }
  }

  /**
     * Resets the column
     */
  reset() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((columnItem) => {
        columnItem.reset();
      });
    }

    if (this.headline) {
      this.headline.reset();
    }

    this.items = undefined;
    this.index = -1;
    this.node = undefined;
    this.position = undefined;
    this.popup = undefined;
  }
}
