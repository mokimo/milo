/* eslint-disable no-restricted-syntax */
import { expect } from '@esm-bundle/chai';
import { readFile, sendKeys } from '@web/test-runner-commands';
import KeyboardNavigation from '../../../../libs/blocks/global-navigation/utilities/keyboardNavigation/index.js';
import { selectors } from '../../../../libs/blocks/global-navigation/utilities/keyboardNavigation/utils.js';
import css from '../../../../libs/blocks/global-navigation/global-navigation.css' assert { type: 'css' };
import searchCss from '../../../../libs/blocks/global-navigation/blocks/search/gnav-search.css' assert { type: 'css' };
import signInCss from '../../../../libs/blocks/global-navigation/blocks/profile/signIn.css' assert { type: 'css' };
import buttonCss from '../../../../libs/blocks/global-navigation/blocks/profile/button.css' assert { type: 'css' };
import dropdownCss from '../../../../libs/blocks/global-navigation/blocks/profile/dropdown.css' assert { type: 'css' };
import navDropdownCss from '../../../../libs/blocks/global-navigation/blocks/navDropdown/dropdown.css' assert { type: 'css' };
import { setViewport } from '@web/test-runner-commands';
import { isElementVisible } from '../../../../libs/blocks/global-navigation/utilities/keyboardNavigation/utils.js';

const isOpen = (element) => element.getAttribute('aria-expanded') === 'true'
  && element.hasAttribute('daa-lh', 'header|Close');
const isClosed = (element) => element.getAttribute('aria-expanded') === 'false'
  && element.hasAttribute('daa-lh', 'header|Open');
const getPopup = (element) => element.parentElement.querySelector(selectors.fedsPopup);
const getNavLinks = (trigger) => [...getPopup(trigger).querySelectorAll(`${selectors.navLink}, ${selectors.promoLink}, ${selectors.imagePromo}`)];
let mainNavItems;
let otherNavItems;
let keyboardNavigation;
let allNavItems;
describe('keyboard navigation', () => {
  before(() => {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, css, searchCss, signInCss, buttonCss, dropdownCss, navDropdownCss]
    keyboardNavigation = new KeyboardNavigation();
  });

  beforeEach(async () => {
    setViewport({ width: 1500, height: 1500 })
    document.body.innerHTML = await readFile({ path: './mocks/global-nav.html' });
    allNavItems = [
      ...document.querySelectorAll(`
     ${selectors.brand}, 
     ${selectors.mainNavToggle},
     ${selectors.searchTrigger},
     ${selectors.mainNavItems},
     ${selectors.searchField},
     ${selectors.signIn},
     ${selectors.profileButton},
     ${selectors.logo},
     ${selectors.breadCrumbItems}
     `),
    ];
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
    keyboardNavigation.mainNav.popup.desktop = { matches: true };
  });

  describe('mainNav', () => {
    describe('Tab', () => {
      it('shifts focus', async () => {
        allNavItems[5].focus(); // last main nav item
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(allNavItems[6]); // outside of main nav
      });

      it('does not open a popup', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        await sendKeys({ press: 'Tab' });
        expect(isClosed(trigger)).to.equal(true);
      });
    });

    describe('Shift+Tab', () => {
      it('goes back on shift tab', async () => {
        allNavItems[6].focus();
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement).to.equal(allNavItems[5]);
      });

      it("On the first item, closes the popup if it's open and shifts focus", async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        keyboardNavigation.mainNav.setActive(trigger);
        keyboardNavigation.mainNav.open();
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(isClosed(trigger)).to.equal(true);
        expect(document.activeElement).to.equal(allNavItems[1]);
      });
    });

    describe('ArrowRight', () => {
      it('shifts focus', async () => {
        mainNavItems[0].focus();
        for await (const element of mainNavItems) {
          expect(document.activeElement).to.equal(element);
          await sendKeys({ press: 'ArrowRight' });
          expect(element.attributes['aria-expanded']?.value || 'false').to.equal('false');
        }
        // does not go further to the right on the last element
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement).to.equal(mainNavItems[mainNavItems.length - 1]);
      });

      it('if a popup is open, it opens the next popup', async () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerOne.focus();
        keyboardNavigation.mainNav.setActive(triggerOne);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerOne)).to.equal(true);
        await sendKeys({ press: 'ArrowRight' });
        expect(isClosed(triggerOne)).to.equal(true);
        expect(isOpen(triggerTwo)).to.equal(true);
      });

      it('if a popup is open, but the next link has no popup - it closes the popup', async () => {
        const triggerTwo = mainNavItems[1];
        const triggerPrimaryCTA = mainNavItems[2];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        await sendKeys({ press: 'ArrowRight' });
        expect(isClosed(triggerTwo)).to.equal(true);
        expect(isOpen(triggerPrimaryCTA)).to.equal(false);
      });
    });

    describe('ArrowLeft', () => {
      it('shifts focus', async () => {
        mainNavItems[mainNavItems.length - 1].focus();
        const reversedMainNavItems = mainNavItems
          .slice()
          .reverse();
        for await (const element of reversedMainNavItems) {
          expect(document.activeElement).to.equal(element);
          await sendKeys({ press: 'ArrowLeft' });
          expect(element.attributes['aria-expanded']?.value || 'false').to.equal('false');
        }
        // does not go further to the left on the first element
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(mainNavItems[0]);
      });

      it('if a popup is open, it opens the previous popup', async () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerTwo)).to.equal(true);
        await sendKeys({ press: 'ArrowLeft' });
        expect(isClosed(triggerTwo)).to.equal(true);
        expect(isOpen(triggerOne)).to.equal(true);
      });

      it('if first link has an open popup, it opens', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        keyboardNavigation.mainNav.setActive(trigger);
        keyboardNavigation.mainNav.open();
        expect(isOpen(trigger)).to.equal(true);
        await sendKeys({ press: 'ArrowLeft' });
        expect(isOpen(trigger)).to.equal(true);
      });
    });

    describe('ArrowUp', () => {
      it('cycles through', async () => {
        mainNavItems[mainNavItems.length - 1].focus();
        const reversed = mainNavItems
          .slice()
          .reverse();
        for await (const element of reversed) {
          expect(document.activeElement).to.equal(element);
          await sendKeys({ press: 'ArrowUp' });
          expect(
            element.attributes['aria-expanded']?.value || 'false',
          ).to.equal('false');
        }
        // does not go further to the left on the first element
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement).to.equal(mainNavItems[0]);
      });

      it('if first link has an open popup, it closes', async () => {
        const triggerOne = mainNavItems[0];
        triggerOne.focus();
        keyboardNavigation.mainNav.setActive(triggerOne);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerOne)).to.equal(true);
        await sendKeys({ press: 'ArrowUp' });
        expect(isClosed(triggerOne)).to.equal(true);
      });

      it('if second link has an open popup, it opens the previous popup and focusses the last item', async () => {
        const triggerOne = mainNavItems[0];
        const triggerTwo = mainNavItems[1];
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        expect(isOpen(triggerTwo)).to.equal(true);
        await sendKeys({ press: 'ArrowUp' });
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
      it('without a popup, focusses the next element', async () => {
        const cta = mainNavItems[2];
        cta.focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(mainNavItems[3]).to.equal(document.activeElement);
      });

      it('last item without popup, does nothing', async () => {
        const cta = mainNavItems[mainNavItems.length - 1];
        cta.focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(cta).to.equal(document.activeElement);
        expect(cta.attributes['aria-expanded']?.value || 'false').to.equal(
          'false',
        );
      });

      it('opens a popup', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(isOpen(trigger)).to.equal(true);
        const navLinks = getNavLinks(trigger);
        const firstPopupItem = navLinks[0];
        expect(firstPopupItem).to.equal(document.activeElement);
      });
    });

    describe('Space', () => {
      it('opens and closes a popup', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        await sendKeys({ press: 'Space' });
        expect(isOpen(trigger)).to.equal(true);
        await sendKeys({ press: 'Space' });
        expect(isClosed(trigger)).to.equal(true);
      });

      it("emits a click event on links and CTAs", (done) => {
        const cta = mainNavItems[2]
        cta.focus()
        cta.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Space' });
      })  
    })

    describe('Enter', () => {
      it('opens and closes a popup', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        await sendKeys({ press: 'Enter' });
        expect(isOpen(trigger)).to.equal(true);
        await sendKeys({ press: 'Enter' });
        expect(isClosed(trigger)).to.equal(true);
      });

      it("emits a click event on links and CTAs", (done) => {
        const cta = mainNavItems[2]
        cta.focus()
        cta.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Enter' });
      })  
    })

    describe('Escape', () => {
      it('closes a popup', async () => {
        const trigger = mainNavItems[0];
        trigger.focus();
        keyboardNavigation.mainNav.setActive(trigger);
        keyboardNavigation.mainNav.open();
        expect(isOpen(trigger)).to.equal(true);
        await sendKeys({ press: 'Escape' });
        expect(isClosed(trigger)).to.equal(true);
      })
    })
  });

  describe('navigation that is not mainNav or popup', () => {
    describe('ArrowRight', () => {
      it('does nothing', async () => {

        for await (const element of otherNavItems) {
          if(!isElementVisible(element)) continue
          element.focus();
          await sendKeys({ press: 'ArrowRight' });
          expect(document.activeElement).to.equal(element);
        }
      });
    });

    describe('ArrowLeft', () => {
      it('does nothing', async () => {
        for await (const element of otherNavItems) {
          if(!isElementVisible(element)) continue
          element.focus();
          await sendKeys({ press: 'ArrowLeft' });
          expect(document.activeElement).to.equal(element);
        }
      });
    });

    describe('ArrowUp', () => {
      it('does nothing', async () => {
        for await (const element of otherNavItems) {
          if(!isElementVisible(element)) continue
          element.focus();
          await sendKeys({ press: 'ArrowUp' });
          expect(document.activeElement).to.equal(element);
        }
      });
    });
    describe('ArrowDown', () => {
      it('nothing', async () => {
        // TODO - it opens search and profile
        for await (const element of otherNavItems) {
          if(!isElementVisible(element)) continue
          element.focus();
          await sendKeys({ press: 'ArrowDown' });
          expect(document.activeElement).to.equal(element);
        }
      });
    });
  });

  describe('popup', () => {
    let navLinks;
    let trigger;
    let triggerTwo;
    let firstPopupItem
    beforeEach(async () => {
      [trigger, triggerTwo] = mainNavItems;
      trigger.focus();
      keyboardNavigation.mainNav.setActive(trigger);
      keyboardNavigation.mainNav.open();
      navLinks = getNavLinks(trigger);
      firstPopupItem = navLinks[0];
      firstPopupItem.focus();
    });

    describe('Shift+Tab', () => {
      it('shifts focus to the previous item', async () => {
        navLinks[1].focus();
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement).to.equal(navLinks[0]);
      });
      it('shifts focus from the first popup item back to the trigger', async () => {
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement).to.equal(trigger);
      });
    });

    describe('Shift', () => {
      it('shifts focus to the next item', async () => {
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(navLinks[1]);
      });

      it('shifts focus from the last popup item, to the next trigger', async () => {
        navLinks[navLinks.length - 1].focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(triggerTwo);
      });

      it('shifts focus to the next item if it is not a popup', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[navLinksTwo.length - 1].focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement.innerText).to.equal('Primary');
      });
    });

    describe('ArrowRight', () => {
      it('shifts focus to the next column', async () => {
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
      });

      it('shifts focus from the last popup item back to the trigger', async () => {
        navLinks[navLinks.length - 1].focus();
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement).to.equal(trigger);
      });
    });

    describe('ArrowLeft', () => {
      it('shifts focus to the previous column', async () => {
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
      });

      it('shifts focus from the first popup item back to the trigger', async () => {
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(trigger);
      });

      it('shifts focus from the second popup item back to the trigger', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[1].focus();
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(triggerTwo);
      });
    });

    describe('ArrowUp', () => {
      it('shifts focus from the first popup item back to the trigger', async () => {
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement).to.equal(trigger);
      });

      it('focusses the previous item', async () => {
        navLinks[1].focus();
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement).to.equal(navLinks[0]);
      });
    });

    describe('ArrowDown', () => {
      it('shifts focus to the next item', async () => {
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement).to.equal(navLinks[1]);
      });

      it('shifts focus from the last popup item, to the next trigger', async () => {
        navLinks[navLinks.length - 1].focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement).to.equal(triggerTwo);
      });

      it('shifts focus to the next item if it is not a popup', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[navLinksTwo.length - 1].focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement.innerText).to.equal('Primary');
      });
    });

    describe('Escape', () => {
      it('closes the popup', async () => {
        expect(isOpen(trigger)).to.equal(true);
        await sendKeys({ press: 'Escape' });
        expect(isClosed(trigger)).to.equal(true);
      });
    })

    describe('Enter', () => {
      it('Emits a click event when pressing space', (done) => {
        firstPopupItem.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Enter' })
      });
    })

    describe('Space', () => {
      it('Emits a click event when pressing space', (done) => {
        firstPopupItem.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Space' })
      });
    })
  });

  describe('mobile', () => {
    let navLinks;
    let trigger;
    let triggerTwo;
    let firstPopupItem
    beforeEach(async () => {
      setViewport({ width: 600, height: 600 })
      document.body.innerHTML = await readFile({ path: './mocks/global-nav-mobile.html' });
      allNavItems = [
        ...document.querySelectorAll(`
       ${selectors.brand}, 
       ${selectors.mainNavToggle},
       ${selectors.searchTrigger},
       ${selectors.mainNavItems},
       ${selectors.searchField},
       ${selectors.signIn},
       ${selectors.profileButton},
       ${selectors.logo},
       ${selectors.breadCrumbItems}
       `),
      ];
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
      keyboardNavigation.mainNav.popup.desktop = { matches: false };
      [trigger, triggerTwo] = mainNavItems;
      trigger.focus();
      keyboardNavigation.mainNav.setActive(trigger);
      keyboardNavigation.mainNav.open();
      navLinks = getNavLinks(trigger);
      firstPopupItem = navLinks[0];
      firstPopupItem.focus();
    });

    describe('Shift+Tab', () => {
      it('shifts focus backwards', async () => {
        navLinks[1].focus();
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement).to.equal(navLinks[0]);

        // further to the trigger from the first popup item
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement).to.equal(trigger);

        // further to the search from the trigger
        await sendKeys({ down: 'Shift' });
        await sendKeys({ press: 'Tab' });
        await sendKeys({ up: 'Shift' });
        expect(document.activeElement.classList[0]).to.equal('feds-search-input');
      });
    });

    describe('Shift', () => {
      it('shifts focus to the next item', async () => {
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(navLinks[1]);
      });

      it('shifts focus from the last popup item, to the next trigger', async () => {
        const section = navLinks[navLinks.length - 2].closest(selectors.fedsPopupSection);
        const headline = section.querySelector(selectors.fedsPopupHeadline);
        headline.setAttribute('aria-expanded', true)
        navLinks[navLinks.length - 2].focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement).to.equal(triggerTwo);
      });

      it('shifts focus to the next item if it is not a popup', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[navLinksTwo.length - 1].focus();
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement.innerText).to.equal('Primary');
      });

      it('opens a headline', async () => {
        await sendKeys({ press: 'Tab' });
        await sendKeys({ press: 'Tab' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-first-item');
        const section = document.activeElement.closest(selectors.fedsPopupSection);
        const headline = section.querySelector(selectors.fedsPopupHeadline);
        expect(headline.getAttribute('aria-expanded')).to.equal('true');
      });
    });

    describe('ArrowRight', () => {
      it('shifts focus to the next section', async () => {
        expect(document.activeElement.innerText).to.equal('first-column-first-section-first-item');
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-first-item');
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
      });

      it('shifts focus from the last popup item to the next trigger', async () => {
        const section = navLinks[navLinks.length - 2].closest(selectors.fedsPopupSection);
        const headline = section.querySelector(selectors.fedsPopupHeadline);
        headline.setAttribute('aria-expanded', true)
        navLinks[navLinks.length - 2].focus();
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement).to.equal(triggerTwo);
      });
    });

    describe('ArrowLeft', () => {
      it('shifts focus to the previous section', async () => {
        await sendKeys({ press: 'ArrowRight' });
        await sendKeys({ press: 'ArrowRight' });
        expect(document.activeElement.innerText).to.equal('second-column-first-section-first-item');
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement.innerText).to.equal('first-column-first-section-last-item');
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(trigger);
      });

      it('shifts focus from the first popup item back to the trigger', async () => {
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(trigger);
      });

      it('shifts focus from the second popup item back to the trigger', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[1].focus();
        await sendKeys({ press: 'ArrowLeft' });
        expect(document.activeElement).to.equal(triggerTwo);
      });
    });

    describe('ArrowUp', () => {
      it('shifts focus from the first popup item back to the trigger', async () => {
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement).to.equal(trigger);
      });

      it('focusses the previous item', async () => {
        navLinks[1].focus();
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement).to.equal(navLinks[0]);
      });

      it('coming from trigger two, it will focus the last popup item of trigger one', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        await sendKeys({ press: 'ArrowUp' });
        expect(document.activeElement.innerText).to.equal('first-column-second-section-last-item');
      })
    });

    describe('ArrowDown', () => {
      it('shifts focus to the next item', async () => {
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement).to.equal(navLinks[1]);
      });

      it('shifts focus from the last popup item, to the next trigger', async () => {
        const section = navLinks[navLinks.length - 2].closest(selectors.fedsPopupSection);
        const headline = section.querySelector(selectors.fedsPopupHeadline);
        headline.setAttribute('aria-expanded', true)
        navLinks[navLinks.length - 2].focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement).to.equal(triggerTwo);
      });

      it('shifts focus to the next item if it is not a popup', async () => {
        triggerTwo.focus();
        keyboardNavigation.mainNav.setActive(triggerTwo);
        keyboardNavigation.mainNav.open();
        const navLinksTwo = getNavLinks(triggerTwo);
        navLinksTwo[navLinksTwo.length - 1].focus();
        await sendKeys({ press: 'ArrowDown' });
        expect(document.activeElement.innerText).to.equal('Primary');
      });
    });

    describe('Space', () => {
      it('opens a popup', async () => {
        trigger.focus()
        await sendKeys({ press: 'Space' }); 
        expect(trigger.attributes['aria-expanded'].value).to.equal('false');
        await sendKeys({ press: 'Space' }); 
        expect(trigger.attributes['aria-expanded'].value).to.equal('true');
      });


      it("emits a click event on links and CTAs", (done) => {
        firstPopupItem.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Space' });
      }) 
    })

    describe('Enter', () => {
      it("emits a click event on links and CTAs", (done) => {
        firstPopupItem.addEventListener('click', (e) => {
          e.preventDefault()
          done()
        })
        sendKeys({ press: 'Enter' });
      }) 
    })

    describe('Escape', async () => {
      expect(isOpen(trigger)).to.equal(true);
      await sendKeys({ press: 'Escape' });
      expect(isClosed(trigger)).to.equal(true);
    })
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
