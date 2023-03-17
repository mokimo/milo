import { isElementVisible, onDebouncedEvent, getDesktopBreakpoint } from './utils.js';
import Item from './Item.js';
import Popup from './Popup.js';
import selectors from './Selectors.js';

const ORDER = {
  FIRST: 'first',
  LAST: 'last',
};

const Config = {
  selectors: {
    activeDropdown: 'feds-dropdown--active',
    popupTrigger: 'feds-popup-trigger',
  },
};

export default class Menu {
  /**
     * Menu constructor
     * @param {HTMLElement} node Menu's DOM node
     */
  constructor(node, region) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    this.node = node;
    // 'popupFlag' determines if an item's popup will be expanded on LEFT/ RIGHT keys
    this.popupFlag = false;
    this.region = region;
    this.selectors = selectors(this.region);
    this.desktopBreakpoint = getDesktopBreakpoint();
    this.init();
    this.closePopupsOnResize();
  }

  /**
     * Initializes the menu structure, creates menu items
     */
  init() {
    this.items = [];
    this.index = -1;

    const navListItems = this.node.querySelectorAll(`.${this.selectors.navListItem}`);
    const topMenuNavListItems = Array.prototype.filter.call(navListItems, (navListItem) => {
      // Determine which items are part of the top menu navigation;
      // one such item must not be nested inside a popup
      const isPopupDescendant = navListItem.closest(`.${this.selectors.popup}`);

      if (!isPopupDescendant) {
        // Ensure that the item has at least one element inside;
        // it can happen that this element has broken inheritance,
        // thus being rendered as empty
        const hasChildren = navListItem.childElementCount > 0;

        // If this Nav List is not empty, check if its first
        // child element represents a link or a popup trigger
        if (hasChildren) {
          return navListItem.firstElementChild.classList.contains(`${this.selectors.navLink}`)
                        || navListItem.firstElementChild.classList.contains(`${this.selectors.popupTrigger}`);
        }
      }

      return false;
    });

    let i = 0;
    const len = topMenuNavListItems.length;

    for (i; i < len; i += 1) {
      const item = topMenuNavListItems[i].querySelector(`.${this.selectors.navLink}`);
      this.items.push(new Item(item, i, this));
    }
  }

  /**
     * Moves focus to the previous menu item
     * @param {Number} position Current item's position
     * @param {Boolean} expand Expand the popup
     * @param {String} focusColumnItem Set focus on first/ last column item
     */
  moveToPreviousItem(position, expand, focusColumnItem) {
    const previous = this.getPreviousVisibleItem(position);

    // If there are no items, do nothing
    if (!this.hasItems()) {
      return;
    }

    // If first item or first visible item, do nothing
    if (previous < 0 || previous === -1) {
      return;
    }

    const currentItem = this.items[position];

    // Close popup on current focused item
    if (currentItem.hasPopup()) {
      if (currentItem.popup.isExpanded()) {
        Popup.closeAll();
      }
      // Reset popup flag when a link item is focused
    } else {
      this.popupFlag = false;
    }

    const shouldExpand = (expand === undefined) ? this.popupFlag : expand;
    // Focus previous item and expand previous item's popup
    // if the current item's popup was expanded
    const previousItem = this.items[previous];
    previousItem.node.focus();
    if (shouldExpand && previousItem.hasPopup()) {
      previousItem.popup.expand();

      if (focusColumnItem) {
        if (focusColumnItem === ORDER.FIRST) {
          previousItem.popup.moveToFirstColumnItem();
        } else if (focusColumnItem === ORDER.LAST) {
          previousItem.popup.moveToLastColumnItem();
        }
      }
    }

    this.index = previous;
  }

  /**
     * Moves focus to the next menu item
     * @param {Number} position Current item's position
     * @param {Boolean} expand Expand the popup
     * @param {String} focusColumnItem Set focus on first/ last column item
     */
  moveToNextItem(position, expand, focusColumnItem) {
    const next = this.getNextVisibleItem(position);

    // If there are no items, do nothing
    if (!this.hasItems()) {
      return;
    }

    // If last item or last visible item, do nothing
    if (next >= this.items.length || next === -1) {
      return;
    }

    const currentItem = this.items[position];
    // Close popup on current focused item
    if (currentItem.hasPopup()) {
      if (currentItem.popup.isExpanded()) {
        Popup.closeAll();
      }
      // Reset popup flag when a link item is focused
    } else {
      this.popupFlag = false;
    }

    const shouldExpand = (expand === undefined) ? this.popupFlag : expand;
    // Focus next item and expand next item's popup
    // if the current item's popup was expanded
    const nextItem = this.items[next];
    nextItem.node.focus();
    if (shouldExpand && nextItem.hasPopup()) {
      nextItem.popup.expand();
      if (focusColumnItem) {
        if (focusColumnItem === ORDER.FIRST) {
          nextItem.popup.moveToFirstColumnItem();
        } else if (focusColumnItem === ORDER.LAST) {
          nextItem.popup.moveToLastColumnItem();
        }
      }
    }

    this.index = next;
  }

  /**
     * Moves focus to a provided position; does not automatically expand popup
     * @param {Number} position Desired focus position
     */
  moveToItem(position) {
    if (!this.hasItems()) {
      return;
    }

    if (position < 0 || position >= this.items.length) {
      return;
    }

    this.items[position].node.focus();
    this.index = position;
  }

  /**
     * Check if menu has menu items
     * @returns {Boolean} True if menu has menu items
     */
  hasItems() {
    return this.items && this.items.length;
  }

  /**
     * Updates the index for current focused menu item
     * @param {Number} index Value of index
     */
  setIndex(index) {
    if (!Number.isInteger(index)) {
      return;
    }

    this.index = index;
  }

  /**
     * Blurs the current active item
     */
  blurActiveItem() {
    if (this.index >= 0) {
      this.items[this.index].node.blur();
    }
  }

  /**
     * Returns the next visible menu item position
     * @param {Number} position Current item's position
     * @return {Number} Next visible menu item position or -1 if none
     */
  getNextVisibleItem(position) {
    let newPosition = position;
    do {
      newPosition += 1;
      if (newPosition >= this.items.length) {
        return -1;
      }
    } while (!isElementVisible(this.items[newPosition].node));

    return newPosition;
  }

  /**
     * Returns the previous visible menu item position
     * @param {Number} position Current item's position
     * @return {Number} Previous visible menu item position or -1 if none
     */
  getPreviousVisibleItem(position) {
    let newPosition = position;
    do {
      newPosition -= 1;
      if (newPosition < 0) {
        return -1;
      }
    } while (!isElementVisible(this.items[newPosition].node));

    return newPosition;
  }

  /**
     * Closes all dropdown menus when the viewport size changes
     * from a desktop layout to a mobile one
     */
  closePopupsOnResize() {
    let cachedWindowWidth = document.documentElement.clientWidth;

    onDebouncedEvent('resize', () => {
      const windowWidth = document.documentElement.clientWidth;
      const hasLayoutChanged = (cachedWindowWidth >= this.desktopBreakpoint
                && windowWidth < this.desktopBreakpoint)
                || (cachedWindowWidth < this.desktopBreakpoint
                && windowWidth >= this.desktopBreakpoint);

      if (hasLayoutChanged) {
        Popup.closeAll();
      }

      cachedWindowWidth = windowWidth;
    });
  }

  /**
     * Removes the highlight from all open dropdown menus;
     * if the currently active dropdown menu is a column, setting
     * the `highlightParent` parameter to `true` will move
     * the highlight from the active column to its parent popup
     * @param {Boolean} [highlightParent=false] Defines whether
     * the parent popup should receive highlight
     */
  static deactivateDropdowns(highlightParent = false) {
    const activeDropdowns = document.querySelectorAll(`.${Config.selectors.activeDropdown}`);

    Array.prototype.forEach.call(activeDropdowns, (activeDropdown) => {
      activeDropdown.classList.remove(Config.selectors.activeDropdown);

      if (highlightParent) {
        const closestPopup = activeDropdown.closest(`.${Config.selectors.popupTrigger}`);

        if (closestPopup instanceof HTMLElement) {
          closestPopup.parentElement.classList.add(Config.selectors.activeDropdown);
        }
      }
    });
  }

  /**
     * Resets the menu to its initial state, before initialization
     */
  destroy() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((item) => {
        item.reset();
      });
    }
    this.popupFlag = false;
    this.items = undefined;
    this.index = -1;
  }

  /**
     * Reinitializes the menu. Needed for greedy nav/ mobile layout
     */
  reset() {
    this.destroy();
    this.init();
  }
}
