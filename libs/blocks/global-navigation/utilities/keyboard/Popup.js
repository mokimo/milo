import Menu from './Menu.js';
import Column from './Column.js';
import selectors from './Selectors.js';
import { open, close } from './utils.js';

const Config = {
  defaultSelectors: selectors(),
  subnavSelectors: selectors('subnav'),
};

const ORDER = {
  FIRST: 'first',
  LAST: 'last',
};

const ANALYTICS = {
  stateAttribute: 'daa-lh',
  openState: 'header|Open',
  closedState: 'header|Close',
};

export default class Popup {
  /**
     * Popup constructor
     * @param {HTMLElement} node Popup's DOM node
     * @param {Item} parent Popup's parent controller
     */
  constructor(node, parent) {
    if (!(node instanceof HTMLElement)
            || !(parent.node instanceof HTMLElement)) {
      return;
    }

    this.node = node;
    this.item = parent;
    this.menu = this.item.menu;

    this.init();
  }

  /**
     * Initializes the popup structure, creates columns
     */
  init() {
    const columns = [];

    const popupLinks = this.node
      .querySelectorAll(`.${this.menu.selectors.navSubLink}, .${this.menu.selectors.imageLink}, .${this.menu.selectors.richTextLink}`);
    // eslint-disable-next-line prefer-arrow-callback
    Array.prototype.forEach.call(popupLinks, function popupLinksIterator(navLink) {
      // Select the first Nav List parent who has a headline sibling;
      // if there is none, just get the first Nav List parent
      const linkParent = navLink.closest(`.${this.menu.selectors.navListHeadline} + .${this.menu.selectors.navList}`)
            || navLink.closest(`.${this.menu.selectors.navList}`);

      // Check if this Nav List has already been added as a column
      if (columns.indexOf(linkParent) === -1) {
        // Because of some edge cases, we need to check
        // if the current parent is a child of the previous column.
        // Example edge case: say that a Nav List has two children:
        // a link and another Nav List that contains another link;
        // the first Nav List would be considered a column,
        // but its child Nav List will also be considered as such.
        // We need to ensure that just the top parent
        // is added to the column list;
        let duplicate = false;

        if (columns.length) {
          const lastColumn = columns[columns.length - 1];

          // Wrapping this check in a try/catch block for the
          // unlikely case that the Nav List parent doesn't have an ID
          try {
            duplicate = linkParent.closest(`#${lastColumn.parentElement.id}`);
          } catch (e) {
            // Do nothing
          }
        }

        // If the current Nav List is not a child of an already
        // added column, add it to the column list
        if (!duplicate) {
          columns.push(linkParent);
        }
      }
    }.bind(this));

    if (!columns || !columns.length) {
      return;
    }

    this.items = [];
    this.index = -1;

    // eslint-disable-next-line prefer-arrow-callback
    columns.forEach(function generateItemColumns(item, position) {
      this.items.push(new Column(item, position, this));
    }.bind(this));
  }

  /**
     * Moves focus to the first/ last column item of the previous column
     * @param {Number} position Current column position
     * @param {String} focusColumnItem The position of the focused column item
     */
  moveToPreviousColumn(position, focusColumnItem) {
    const previous = position - 1;

    if (!this.hasItems()) {
      return;
    }

    // If no previous column, move focus to parent menu item
    if (previous < 0) {
      this.menu.moveToItem(this.item.position);
      this.index = -1;
      return;
    }

    const column = this.items[previous];
    this.index = previous;

    // Focus column item
    if (focusColumnItem) {
      if (focusColumnItem === ORDER.FIRST) {
        // Move focus to first column item
        column.moveToColumnItem(0);
      } else if (focusColumnItem === ORDER.LAST) {
        if (column.isExpandable()) {
          column.expand();
        }

        // Move focus to last column item
        column.moveToColumnItem(column.items.length - 1, 'descending');
      }
    }
  }

  /**
     * Moves focus to the first/ last column item of the next column
     * @param {Number} position Current column position
     * @param {String} focusColumnItem The position of the focused column item
     * @param {Boolean} focusNextItem Choose to focus current menu item of next menu item
     */
  moveToNextColumn(position, focusColumnItem, focusNextItem) {
    const next = position + 1;

    if (!this.hasItems()) {
      return;
    }

    // If last column, move focus to parent menu item or next menu item
    if (next >= this.items.length) {
      if (focusNextItem) {
        this.menu.moveToNextItem(this.item.position);
      } else {
        this.menu.moveToItem(this.item.position);
      }
      this.index = -1;
      return;
    }

    const column = this.items[next];
    this.index = next;

    // Focus column item
    if (focusColumnItem) {
      if (focusColumnItem === ORDER.FIRST) {
        // Move focus to first column item
        column.moveToFirstColumnElement();
      } else if (focusColumnItem === ORDER.LAST) {
        // Move focus to last column item
        column.moveToColumnItem(column.items.length - 1);
      }
    }
  }

  /**
     * Moves focus to the first column item in the popup
     * (regardless of number of columns)
     */
  moveToFirstColumnItem() {
    if (!this.hasItems()) {
      return;
    }

    const column = this.items[0];
    column.moveToFirstColumnElement();

    this.index = 0;
  }

  /**
     * Moves focus to the last column item in the popup
     * (regardless of number of columns)
     */
  moveToLastColumnItem() {
    if (!this.hasItems()) {
      return;
    }

    const column = this.items[this.items.length - 1];

    // If the column is expandable, expand it;
    // otherwise its content is not shown and
    // the subsequent isElementVisible check will fail
    if (column.isExpandable()) {
      column.expand();
    }

    column.moveToColumnItem(column.items.length - 1, 'descending');
    this.index = this.items.length - 1;
  }

  /**
     * Check if the popup has columns
     * @returns {Boolean} True if the popup has columns
     */
  hasItems() {
    return this.items && this.items.length;
  }

  /**
     * Check if the popup is expanded
     * @return {Boolean} True if the popup is expanded
     */
  isExpanded() {
    return this.item.node.getAttribute('aria-expanded') === 'true';
  }

  /**
     * Adds a modifier class to the currently active popup
     */
  addHighlight() {
    const closestNavList = this.node.closest(`.${this.menu.selectors.navListItem}`);

    if (closestNavList instanceof HTMLElement) {
      closestNavList.classList.add(this.menu.selectors.activeDropdown);
    }
  }

  /**
     * Expands the popup
     */
  expand() {
    Popup.closeAll();
    this.addHighlight();

    if (this.node.parentElement.classList
      .contains(Config.defaultSelectors.fullWidthPopupTrigger)) {
      if (document.documentElement.clientWidth >= this.menu.desktopBreakpoint) {
        open('popup');
      }
    }

    this.node.classList.add(this.menu.selectors.openPopup);
    this.item.node.setAttribute('aria-expanded', 'true');

    if (this.item.node.hasAttribute(ANALYTICS.stateAttribute)
            && this.item.node.getAttribute(ANALYTICS.stateAttribute) === ANALYTICS.openState) {
      this.item.node.setAttribute(ANALYTICS.stateAttribute, ANALYTICS.closedState);
    }

    // TODO: Remove the subnav-specific logic once subnav is discarded
    if (this.menu.region === 'subnav') {
      const itemWrapper = this.item.node.parentElement;

      if (itemWrapper instanceof HTMLElement) {
        itemWrapper.classList.add('is-open');
      }
    }

    this.adjustPopupPosition(this.node);
  }

  static closeAll(parent) {
    Menu.deactivateDropdowns();
    let openPopups;

    close('popup');

    if (parent instanceof HTMLElement) {
      openPopups = parent.querySelectorAll(`.${Config.defaultSelectors.openPopup}`);
    } else {
      openPopups = document.querySelectorAll(`.${Config.defaultSelectors.openPopup}`);
    }

    if (openPopups instanceof NodeList && openPopups.length > 0) {
      Array.prototype.forEach.call(openPopups, (openPopup) => {
        openPopup.classList.remove(Config.defaultSelectors.openPopup);
        openPopup.style.left = '';
        const trigger = openPopup.previousElementSibling;

        if (trigger instanceof HTMLElement
                    && (trigger.classList.contains(Config.defaultSelectors.navLink)
                    || trigger.classList.contains(Config.subnavSelectors.navLink))) {
          trigger.setAttribute('aria-expanded', 'false');

          if (trigger.hasAttribute(ANALYTICS.stateAttribute)
                        && trigger.getAttribute(ANALYTICS.stateAttribute)
                            === ANALYTICS.closedState) {
            trigger.setAttribute(ANALYTICS.stateAttribute, ANALYTICS.openState);
          }
        }

        // TODO: Remove the subnav-specific logic once subnav is discarded
        // This is specific to the Subnav
        const itemWrapper = trigger.parentElement;

        if (itemWrapper instanceof HTMLElement) {
          itemWrapper.classList.remove('is-open');
        }
      });

      // Close any expanded columns
      Column.closeAll();
    }
  }

  static closeOnOutsideClick() {
    document.addEventListener('click', (event) => {
      const openPopup = document.querySelector(`.${Config.defaultSelectors.openPopup}`);

      if (openPopup instanceof HTMLElement
                && !event.target.closest(`.${Config.defaultSelectors.popupTrigger}`)
                || event.target.closest(`.${Config.subnavSelectors.popupTrigger}`)) {
        Popup.closeAll();
      }
    });
  }

  // Move the positioning logic to a better place
  adjustPopupPosition(node) {
    const windowWidth = document.documentElement.clientWidth;
    const nodePosition = node.getBoundingClientRect();

    if (Math.ceil(nodePosition.width) < windowWidth) {
      if (nodePosition.left < 0) {
        node.style.left = `${Math.abs(nodePosition.left)}px`;
      } else if (Math.ceil(nodePosition.right) > windowWidth) {
        node.style.left = `${windowWidth - nodePosition.right}px`;
      }
    }
  }

  /**
     * Resets the popup
     */
  reset() {
    if (this.items && this.items.length > 0) {
      this.items.forEach((column) => {
        column.reset();
      });
    }

    this.items = undefined;
    this.index = -1;
    this.node = undefined;
    this.item = undefined;
    this.menu = undefined;
  }
}
