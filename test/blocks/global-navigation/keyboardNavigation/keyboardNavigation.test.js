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
const isClosed = (element) => element.hasAttribute('aria-expanded', 'false')
  && element.hasAttribute('daa-lh', 'header|Open');
const getPopup = (element) => element.parentElement.querySelector(selectors.fedsPopup);
let mainNavItems;
let otherNavItems;
let keyboardNavigation;
describe('keyboard navigation', () => {
  beforeEach(async () => {
    document.body.innerHTML = globalNavMock;
    keyboardNavigation = new KeyboardNavigation();
    mainNavItems = [...document.querySelectorAll(selectors.mainNavItems)];
    otherNavItems = [
      ...document.querySelectorAll(`
    ${selectors.brand}, 
    ${selectors.mainNavToggle},
    ${selectors.searchTrigger},
    ${selectors.searchField},
    ${selectors.signIn},
    ${selectors.profileButton},
    ${selectors.logo},
    ${selectors.breadCrumbItems}
    `),
    ];
  });

  describe('mainNav', () => {
    describe('ArrowRight', () => {
      it('shifts focus', () => {
        mainNavItems[0].focus();
        mainNavItems.forEach((element) => {
          expect(document.activeElement).to.equal(element);
          dispatch({ element, code: 'ArrowRight' });
          expect(
            element.attributes['aria-expanded']?.value || 'false',
          ).to.equal('false');
        });
        // does not go further to the right on the last element
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement).to.equal(
          mainNavItems[mainNavItems.length - 1],
        );
      });

      it('if a popup is open, it opens the next popup', () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerOne.focus();
        keyboardNavigation.mainNav.setActive(triggerOne);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerOne)).to.equal(true);
        dispatch({ element: triggerOne, code: 'ArrowRight' });
        expect(isClosed(triggerOne)).to.equal(true);
        expect(isOpen(triggerTwo)).to.equal(true);
      });

      it('if a popup is open, but the next link has no popup - it closes the popup', () => {
        const triggerTwo = mainNavItems[1];
        const triggerPrimaryCTA = mainNavItems[2];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        dispatch({ element: triggerTwo, code: 'ArrowRight' });
        expect(isClosed(triggerTwo)).to.equal(true);
        expect(isOpen(triggerPrimaryCTA)).to.equal(false);
      });
    });

    describe('ArrowLeft', () => {
      it('shifts focus', () => {
        mainNavItems[mainNavItems.length - 1].focus();
        mainNavItems
          .slice()
          .reverse()
          .forEach((element) => {
            expect(document.activeElement).to.equal(element);
            dispatch({ element, code: 'ArrowLeft' });
            expect(
              element.attributes['aria-expanded']?.value || 'false',
            ).to.equal('false');
          });
        // does not go further to the left on the first element
        dispatch({ element: document.activeElement, code: 'ArrowLeft' });
        expect(document.activeElement).to.equal(mainNavItems[0]);
      });

      it('if a popup is open, it opens the previous popup', () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerTwo)).to.equal(true);
        dispatch({ element: triggerTwo, code: 'ArrowLeft' });
        expect(isClosed(triggerTwo)).to.equal(true);
        expect(isOpen(triggerOne)).to.equal(true);
      });

      it('if first link has an open popup, it opens', () => {
        const triggerOne = mainNavItems[0];
        triggerOne.focus();
        expect(isOpen(triggerOne)).to.equal(true);
        dispatch({ element: triggerOne, code: 'ArrowLeft' });
        expect(isOpen(triggerOne)).to.equal(true);
      });
    });

    describe('ArrowUp', () => {
      it('cycles through', () => {
        mainNavItems[mainNavItems.length - 1].focus();
        mainNavItems
          .slice()
          .reverse()
          .forEach((element) => {
            expect(document.activeElement).to.equal(element);
            dispatch({ element, code: 'ArrowUp' });
            expect(
              element.attributes['aria-expanded']?.value || 'false',
            ).to.equal('false');
          });
        // does not go further to the left on the first element
        dispatch({ element: document.activeElement, code: 'ArrowUp' });
        expect(document.activeElement).to.equal(mainNavItems[0]);
      });

      it('if first link has an open popup, it closes', () => {
        const triggerOne = mainNavItems[0];
        triggerOne.focus();
        keyboardNavigation.mainNav.setActive(triggerOne);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerOne)).to.equal(true);
        dispatch({ element: triggerOne, code: 'ArrowUp' });
        expect(isClosed(triggerOne)).to.equal(true);
      });

      it('if second link has an open popup, it opens the previous popup and focusses the last item', () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerTwo)).to.equal(true);
        dispatch({ element: triggerTwo, code: 'ArrowUp' });
        expect(isClosed(triggerTwo)).to.equal(true);
        expect(isOpen(triggerOne)).to.equal(true);
        expect(document.activeElement).to.not.equal(triggerOne);

        // focus shifted to last item of the popup
        const navLinks = [
          ...triggerOne.parentElement.querySelectorAll(`
        ${selectors.navLink}, 
        ${selectors.promoLink},
        ${selectors.imagePromo}
      `),
        ];
        const lastNavLink = navLinks[navLinks.length - 1];
        expect(lastNavLink).to.equal(document.activeElement);
      });
    });

    describe('ArrowDown', () => {
      it('without a popup, focusses the next element', () => {
        const cta = mainNavItems[2];
        cta.focus();
        dispatch({ element: cta, code: 'ArrowDown' });
        expect(mainNavItems[3]).to.equal(document.activeElement);
      });

      it('last item without popup, does nothing', () => {
        const cta = mainNavItems[mainNavItems.length - 1];
        cta.focus();
        dispatch({ element: cta, code: 'ArrowDown' });
        expect(cta).to.equal(document.activeElement);
        expect(cta.attributes['aria-expanded']?.value || 'false').to.equal(
          'false',
        );
      });

      it('opens a popup', () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        dispatch({ element: trigger, code: 'ArrowDown' });
        expect(isOpen(trigger)).to.equal(true);
        const navLinks = [
          ...getPopup(trigger).querySelectorAll(`
      ${selectors.navLink}, 
      ${selectors.promoLink},
      ${selectors.imagePromo}
    `),
        ];
        const firstPopupItem = navLinks[0];
        expect(firstPopupItem).to.equal(document.activeElement);
      });
    });
  });

  describe('navigation that is not mainNav or popup', () => {
    describe('ArrowRight', () => {
      it('does nothing', () => {
        otherNavItems.forEach((element) => {
          element.focus();
          dispatch({ element, code: 'ArrowRight' });
          expect(document.activeElement).to.equal(element);
        });
      });
    });

    describe('ArrowLeft', () => {
      it('does nothing', () => {
        otherNavItems.forEach((element) => {
          element.focus();
          dispatch({ element, code: 'ArrowLeft' });
          expect(document.activeElement).to.equal(element);
        });
      });
    });

    describe('ArrowUp', () => {
      it('does nothing', () => {
        otherNavItems.forEach((element) => {
          element.focus();
          dispatch({ element, code: 'ArrowUp' });
          expect(document.activeElement).to.equal(element);
        });
      });
    });
    describe('ArrowDown', () => {
      it('nothing', () => {
        // TODO - it opens search and profile
        otherNavItems.forEach((element) => {
          element.focus();
          dispatch({ element, code: 'ArrowDown' });
          expect(document.activeElement).to.equal(element);
        });
      });
    });
  });

  describe('popup', () => {
    describe('ArrowRight', () => {
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

      it.only('shifts focus to the next section', () => {
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-first-item');
        dispatch({ element: document.activeElement, code: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
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
