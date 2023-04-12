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
    const popupItems = [...popupEl.querySelectorAll(itemSelector)];
    const first = getNextVisibleItem(-1, popupItems);
    if (first === -1) return;

    if (focus === 'first') {
      popupItems[first].focus();
    }

    if (focus === 'last') {
      this.setSections();
      const headline = this.lastSection.querySelector(selectors.fedsPopupHeadline);
      if (headline && headline.getAttribute('aria-haspopup') === 'true') {
        this.closeHeadline();
        headline.setAttribute('aria-expanded', 'true');
      }
      const last = getPreviousVisibleItem(popupItems.length, popupItems);
      popupItems[last].focus();
    }
  }

  closeHeadline = () => {
    const open = [...document.querySelectorAll(`${selectors.fedsPopupHeadline}[aria-expanded="true"]`)];
    open.forEach((el) => el.setAttribute('aria-expanded', 'false'));
  };

  openHeadline = ({ headline, focus } = {}) => {
    this.closeHeadline();
    if (headline.getAttribute('aria-haspopup') === 'true') {
      headline.setAttribute('aria-expanded', 'true');
      const section = headline.closest(selectors.fedsPopupSection);
      const items = [...section.querySelectorAll(itemSelector)]
        .filter((el) => el.offsetHeight && el.offsetWidth);
      if (focus === 'first') items[0].focus();
      if (focus === 'last') items[items.length - 1].focus();
    }
  };

  isOpenSection = (el, sections) => {
    const section = el.closest(selectors.fedsPopupSection);
    return sections.includes(section);
  };

  setSections = () => {
    const section = document.activeElement.closest(selectors.fedsPopupSection);
    const allSections = [...this.getOpenPopup().querySelectorAll(selectors.fedsPopupSection)];
    const visibleSections = allSections.filter((el) => el.offsetHeight && el.offsetWidth);
    const currentSection = visibleSections.findIndex((node) => node.isEqualNode(section));
    this.visibleSections = visibleSections;
    this.currentSection = currentSection;
    [this.firstSection] = visibleSections;
    this.lastSection = visibleSections[visibleSections.length - 1];
  };

  mobileArrowUp = () => {
    // If the previous element is visible we can just move focus to the previous item
    const { currentSection } = this;
    const prevElementIsVisible = this.curr === this.prev + 1;
    if (prevElementIsVisible && this.prev !== -1) {
      this.popupItems[this.prev].focus();
      this.setSections();
      // special case, we move out of the headline, thus we can close it.
      if (currentSection !== this.currentSection) this.closeHeadline();
      return;
    }

    // if the previous element is not visible, we check if it has a headline
    const headline = this.visibleSections[this.currentSection - 1]
      ?.querySelector(selectors.fedsPopupHeadline);

    // if there is no headline, we can just move on
    if (!headline) {
      this.closeHeadline();
      this.mainNav.items[this.mainNav.curr].focus();
      return;
    }

    this.openHeadline({ headline, focus: 'last' });
  };

  mobileArrowDown = () => {
    // If the next element is visible we can just move focus to the next item
    const { currentSection } = this;
    const nextElementIsVisible = this.curr === this.next - 1;
    if (nextElementIsVisible && this.next !== -1) {
      this.popupItems[this.next].focus();
      this.setSections();
      // special case, if we move out of a headline - we will need to close the current headline
      if (currentSection !== this.currentSection) this.closeHeadline();
      return;
    }

    // if the next element is not visible, we check if it has a headline
    const headline = this.visibleSections[this.currentSection + 1]
      ?.querySelector(selectors.fedsPopupHeadline);

    // if there is no headline, we can just move on
    if (!headline) {
      this.closeHeadline();
      this.mainNav.focusNext();
      this.mainNav.open();
      return;
    }

    this.openHeadline({ headline, focus: 'first' });
  };

  setActive = ({ curr, popupEl } = {}) => {
    this.popupItems = [...popupEl.querySelectorAll(itemSelector)];
    // TODO should this be document.activeElement? I think so.
    this.curr = this.popupItems.findIndex((el) => el === (curr || document.activeElement));
    this.prev = getPreviousVisibleItem(this.curr, this.popupItems);
    this.next = getNextVisibleItem(this.curr, this.popupItems);
  };

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      const popupEl = this.getOpenPopup();
      if (!e.target.closest(selectors.fedsPopup) || !popupEl || this.desktop.matches) return;
      e.preventDefault();
      e.stopPropagation();
      this.setActive({ curr: e.target, popupEl });
      this.setSections();

      if (e.shiftKey && e.code === 'Tab') {
        if (!this.desktop.matches) {
          this.mobileArrowUp();
          return;
        }

        if (this.prev === -1) {
          this.mainNav.items[this.mainNav.curr].focus();
          return;
        }
        this.popupItems[this.prev].focus();
        return;
      }

      switch (e.code) {
        case 'Tab': {
          this.mobileArrowDown();
          break;
        }
        case 'Enter': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'Escape': {
          this.mainNav.close();
          this.mainNav.items[this.mainNav.curr].focus();
          break;
        }
        case 'Space': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'ArrowLeft': {
          // if the next element is not visible, we check if it has a headline
          const headline = this.visibleSections[this.currentSection - 1]
            ?.querySelector(selectors.fedsPopupHeadline);

          // if there is no headline, we move onto the next nav item
          if (!headline) {
            this.closeHeadline();

            const section = document.activeElement.closest(selectors.fedsPopupSection);
            const isLastNavItem = this.visibleSections
              .findIndex((node) => node.isEqualNode(section));

            if (isLastNavItem <= 1) {
              this.mainNav.items[this.mainNav.curr].focus();
              break;
            }

            this.mainNav.focusPrev();
            this.mainNav.open();
            break;
          }

          // TODO talk to rares, headlines are not focussable anymore.
          // IMO this is fine
          this.openHeadline({ headline, focus: 'last' });
          break;
        }
        case 'ArrowUp': {
          this.mobileArrowUp();
          break;
        }
        case 'ArrowRight': {
          // if the next element is not visible, we check if it has a headline
          const headline = this.visibleSections[this.currentSection + 1]
            ?.querySelector(selectors.fedsPopupHeadline);

          // if there is no headline, we can just move on
          if (!headline) {
            this.closeHeadline();
            this.mainNav.focusNext();
            this.mainNav.open();
            break;
          }
          // TODO talk to rares, headlines are not focussable anymore.
          // IMO this is fine
          this.openHeadline({ headline, focus: 'first' });
          break;
        }
        // each popup
        // has columns & sections
        case 'ArrowDown': {
          this.mobileArrowDown();
          break;
        }
        default:
          break;
      }
    });
  };
}

export default Popup;
