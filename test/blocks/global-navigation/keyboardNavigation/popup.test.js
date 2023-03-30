import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import KeyboardNavigation from '../../../../libs/blocks/global-navigation/utilities/keyboardNavigation/index.js';
import { selectors } from '../../../../libs/blocks/global-navigation/utilities/keyboardNavigation/utils.js';

const globalNavMock = await readFile({ path: './mocks/global-nav.html' });
const dispatch = ({ element, className, code, shiftKey }) => {
  const el = element || document.querySelector(className);
  const ev = new KeyboardEvent('keydown', {
    code,
    key: code,
    shiftKey,
    bubbles: true,
  });
  el.dispatchEvent(ev);
};

const isOpen = (element) => element.hasAttribute('aria-expanded', 'true')
  && element.hasAttribute('daa-lh', 'header|Close');

const getPopup = (element) => element.parentElement.querySelector(selectors.fedsPopup);
let mainNavItems;

describe('keyboard navigation', () => {
  beforeEach(async () => {
    document.body.innerHTML = globalNavMock;
    // eslint-disable-next-line no-new
    new KeyboardNavigation();
    mainNavItems = [...document.querySelectorAll(selectors.mainNavItems)];
  });

  describe('popup', () => {
    let navLinks;
    beforeEach(() => {
      const trigger = mainNavItems[0];
      trigger.focus();
      dispatch({ element: trigger, code: 'ArrowDown' });
      expect(isOpen(trigger)).to.equal(true);
      navLinks = [
        ...getPopup(trigger).querySelectorAll(`
          ${selectors.navLink}, 
          ${selectors.promoLink},
          ${selectors.imagePromo}
      `),
      ];
      const firstPopupItem = navLinks[0];
      expect(firstPopupItem).to.equal(document.activeElement);
    });

    describe('ArrowRight', () => {
      it('shifts focus to the next section', () => {
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
      });
    });

    describe('ArrowLeft', () => {
      it('shifts focus to the previous section', () => {
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowLeft' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowLeft' });
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
      });
    });
  });

  // describe('main navigation', () => {
  //   test('focus each element', () => {
  //     // Focus logo, main nav links, cta, search, profile, app launcher
  //   });

  //   test('interaction with the logo', () => {
  //     // Enter - redirect to link
  //     // Space - does nothing
  //     // Arrow keys - nothing
  //   });

  //   test('interaction with a navItem with dropdown', () => {
  //     // Space: Similar to click, open, close
  //     // Arrow down: open dropdown and focus 1st element
  //     // Arrow up, close dropdown if open and focussed OR move to the left
  //     // Left: go to left nav item if available, else nothing
  //     // Left: close dropdown if open
  //     // right: go to right nav item if available, else nothing
  //     // right: close dropdown if open
  //   });

  //   test('interaction with a navItem without dropdown', () => {
  //     // Space/Enter: similar to click, do the action
  //     // Up/Left: focus navItem to the left
  //     // down/Right: focus navItem to the right or nothing
  //   });

  //   test('left and right arrow keys only work within the feds-nav', () => {
  //     // At the end of the left/right boundaries,
  //     // left/up and right/down keys do nothing
  //   });
  // });

  // describe('navLink popup', () => {
  //   describe('shift', () => {
  //     // goes through all interactive elements
  //   });

  //   describe('left', () => {
  //     // Goes into the start of a popup section
  //     // if there are no popup sections, goes back to the navLink
  //   });
  //   desribe('right', () => {
  //     // Goes to the start of a popup section
  //     // if there are no popup sections left, goes back to the navLink
  //   });
  //   describe('down', () => {
  //     // goes to the next interactive popup item
  //     // if no item is left, close the popup and go to the next navLink
  //   });
  //   describe('up', () => {
  //     // go to the next interactive popup item
  //     // if no item is left, go to the navLink but don't close the popup
  //   });
  // });

  // describe('profile', () => {
  //   test('interacting with the profile', () => {
  //     // Space: open/close
  //     // Enter: open/close
  //     // Arrow-up: close if open
  //     // Arrow-down: open if closed
  //   });
  //   test('interacting with the profile dropdown', () => {
  //     // Up/down focus the clickable links
  //   });
  // });

  // describe('search', () => {
  //   test('interacting with search', () => {
  //     // Arrow keys: nothing
  //     // Enter: Open and focus the search input, or close the search
  //     // Space: nothing
  //   });
  //   test('tab and shift+tab do not leave the navigation when the search is open', () => {

  //   });
  // });

  // describe('appLauncher', () => {

  // });
});
