/* eslint-disable class-methods-use-this */
import {
  getNextVisibleItem,
  getPreviousVisibleItem,

  selectors,
} from './utils.js';

const itemSelector = `
  ${selectors.navLink}, 
  ${selectors.promoLink},
  ${selectors.imagePromo}
`;
class Popup {
  constructor({ mainNav }) {
    this.mainNav = mainNav;
    this.listenToChanges();
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  getOpenPopup = () => document.querySelector(selectors.expandedPopupTrigger)
    ?.parentElement.querySelector(selectors.fedsPopup);

  open({ focus }) {
    const popupEl = this.getOpenPopup();
    if (!popupEl) return;
    const popupItems = [
      ...popupEl.querySelectorAll(itemSelector),
    ];
    const first = getNextVisibleItem(-1, popupItems);
    if (first === -1) return;

    if (focus === 'first') {
      popupItems[first].focus();
    }

    if (focus === 'last') {
      if (!this.desktop.matches) {
        const { lastSection } = this.getSections();
        const headline = lastSection.querySelector(selectors.fedsPopupHeadline);
        if (headline && headline.getAttribute('aria-haspopup') === 'true') {
          this.closeHeadline();
          headline.setAttribute('aria-expanded', 'true');
        }
      }
      const last = getPreviousVisibleItem(popupItems.length, popupItems);
      popupItems[last].focus();
    }
  }

  closeHeadline = () => {
    const open = [...document.querySelectorAll(`${selectors.fedsPopupHeadline}[aria-expanded="true"]`)];
    open.forEach((el) => el.setAttribute('aria-expanded', 'false'));
  };

  openHeadline = ({ curr, popupItems, headline, focus } = {}) => {
    this.closeHeadline();
    if (headline.getAttribute('aria-haspopup') === 'true') {
      headline.setAttribute('aria-expanded', 'true');

      const nextItem = getNextVisibleItem(curr, popupItems);
      const prevItem = getPreviousVisibleItem(curr, popupItems);
      if ((focus === 'first' && nextItem === -1)) {
        this.mainNav.focusNext();
        this.mainNav.open({ focus });
        return;
      }
      if (focus === 'first') {
        popupItems[nextItem].focus();
      }
      if (focus === 'last') {
        popupItems[prevItem].focus();
      }
    }
  };

  isOpenSection = (el, sections) => {
    const section = el.closest(selectors.fedsPopupSection);
    return sections.includes(section);
  };

  getSections = () => {
    const section = document.activeElement.closest(selectors.fedsPopupSection);
    const allSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
    const visibleSections = allSections.filter((el) => el.offsetHeight && el.offsetWidth);
    const curr = visibleSections.findIndex((node) => node.isEqualNode(section));
    return {
      visibleSections,
      currentSection: curr,
      previousSection: getPreviousVisibleItem(curr, visibleSections),
      nextSection: getNextVisibleItem(curr, visibleSections),
      firstSection: visibleSections[0],
      lastSection: visibleSections[visibleSections.length - 1],
    };
  };

  mobileArrowUp = ({ curr, popupItems, prev } = {}) => {
    // If the previous element is visible we can just move focus to the previous item
    const { currentSection, visibleSections, previousSection } = this.getSections();
    const prevElementIsVisible = curr === prev + 1;
    if (prevElementIsVisible && prev !== -1) {
      popupItems[prev].focus();
      // special case, we move out of the headline, thus we can close it.
      if (currentSection !== this.getSections().currentSection) this.closeHeadline();
      return;
    }

    // if the previous element is not visible, we check if it has a headline
    const headline = visibleSections[previousSection]?.querySelector(selectors.fedsPopupHeadline);

    // if there is no headline, we can just move on
    if (!headline) {
      this.closeHeadline();
      this.mainNav.items[this.mainNav.curr].focus();
      return;
    }

    this.openHeadline({ headline, popupItems, curr, focus: 'last' });
  };

  mobileArrowDown = ({ curr, popupItems, next } = {}) => {
    // If the next element is visible we can just move focus to the next item
    const { visibleSections, currentSection, nextSection } = this.getSections();
    const nextElementIsVisible = curr === next - 1;
    if (nextElementIsVisible && next !== -1) {
      popupItems[next].focus();
      // special case, if we move out of a headline - we will need to close the current headline
      if (currentSection !== this.getSections().currentSection) this.closeHeadline();
      return;
    }

    // if the next element is not visible, we check if it has a headline
    const headline = visibleSections[nextSection]?.querySelector(selectors.fedsPopupHeadline);

    // if there is no headline, we can just move on
    if (!headline) {
      this.closeHeadline();
      this.mainNav.focusNext();
      this.mainNav.open();
      return;
    }

    this.openHeadline({ headline, popupItems, curr, focus: 'first' });
  };

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      const popupEl = this.getOpenPopup();
      if (!e.target.closest(selectors.fedsPopup) || !popupEl) return;
      e.preventDefault();
      e.stopPropagation();

      const popupItems = [...popupEl.querySelectorAll(itemSelector)];
      const curr = popupItems.findIndex((el) => el === e.target);
      const prev = getPreviousVisibleItem(curr, popupItems);
      const next = getNextVisibleItem(curr, popupItems);

      if (e.shiftKey && e.code === 'Tab') {
        if (!this.desktop.matches) {
          this.mobileArrowUp({ prev, curr, popupItems });
          return;
        }

        if (prev === -1) {
          this.mainNav.items[this.mainNav.curr].focus();
          return;
        }
        popupItems[prev].focus();
        return;
      }

      switch (e.code) {
        case 'Tab': {
          if (!this.desktop.matches) {
            this.mobileArrowDown({ next, curr, popupItems });
            break;
          }

          if (next === -1) {
            this.mainNav.focusNext();
            this.mainNav.open({});
            break;
          }
          popupItems[next].focus();
          break;
        }
        case 'Enter': {
          console.log('Enter');
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.cur].focus();
          break;
        }
        case 'Space': {
          console.log('Space');
          break;
        }
        case 'ArrowLeft': {
          // TODO, arrowLeft and arrowRight might not always work and lead to JS errors.
          // CHECK the medium menu.
          if (prev === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const section = document.activeElement.closest(selectors.fedsPopupSection);
          const visibleSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
          const index = visibleSections.findIndex((node) => node.isEqualNode(section));
          if (index <= 0) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = visibleSections[index - 1];
          nextSection.querySelector(itemSelector).focus();
          break;
        }
        case 'ArrowUp': {
          if (!this.desktop.matches) {
            this.mobileArrowUp({ prev, curr, popupItems });
            break;
          }

          if (prev === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          popupItems[prev].focus();
          break;
        }
        case 'ArrowRight': {
          if (next === -1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const section = document.activeElement.closest(selectors.fedsPopupSection);
          const visibleSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
          const index = visibleSections.findIndex((node) => node.isEqualNode(section));
          if (index === visibleSections.length - 1) {
            this.mainNav.items[this.mainNav.curr].focus();
            break;
          }
          const nextSection = visibleSections[index + 1];
          nextSection.querySelector(itemSelector).focus();
          break;
        }
        // each popup
        // has columns & sections
        case 'ArrowDown': {
          if (!this.desktop.matches) {
            this.mobileArrowDown({ next, curr, popupItems });
            break;
          }

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
