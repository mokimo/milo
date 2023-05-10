/* eslint-disable no-restricted-syntax */
import { expect } from '@esm-bundle/chai';
import { createFullGlobalNavigation, selectors, isElementVisible } from './utilities/test-utilities.js';
import logoOnlyNav from './mocks/global-navigation-only-logo.plain.js';

describe('global navigation', () => {
  describe('basic sanity tests', () => {
    it('should render the navigation on desktop', async () => {
      const nav = await createFullGlobalNavigation();

      expect(nav).to.exist;
      expect(isElementVisible(document.querySelector(selectors.globalNavigation))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.search))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.profile))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.logo))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.brandContainer))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(false);
      expect(document.querySelectorAll(selectors.navItem).length).to.equal(8);
    });

    it('should render the navigation on smallDesktop', async () => {
      await createFullGlobalNavigation({ viewport: 'smallDesktop' });

      expect(isElementVisible(document.querySelector(selectors.globalNavigation))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.search))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.profile))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.logo))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.brandContainer))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(false);
      expect(document.querySelectorAll(selectors.navItem).length).to.equal(8);
    });

    it('should render the navigation on mobile', async () => {
      await createFullGlobalNavigation({ viewport: 'mobile' });

      expect(isElementVisible(document.querySelector(selectors.globalNavigation))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.search))).to.equal(false);
      expect(isElementVisible(document.querySelector(selectors.profile))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.logo))).to.equal(false);
      expect(isElementVisible(document.querySelector(selectors.brandContainer))).to.equal(true);
      expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(true);
      expect(document.querySelectorAll(selectors.navItem).length).to.equal(8);
    });
  });

  describe('brand', () => {
    describe('desktop', () => {
      it('should render the whole block', async () => {
        await createFullGlobalNavigation();

        const container = document.querySelector(selectors.brandContainer);
        const image = container.querySelector(selectors.brandImage);
        const brandText = container.querySelector(selectors.brandLabel);

        expect(isElementVisible(image)).to.equal(true);
        expect(isElementVisible(brandText)).to.equal(true);
        expect(brandText.innerText).to.equal('Adobe');
      });
    });

    describe('small desktop', () => {
      it('should render the logo', async () => {
        await createFullGlobalNavigation({ viewport: 'smallDesktop' });

        const container = document.querySelector(selectors.brandContainer);
        const image = container.querySelector(selectors.brandImage);
        const brandText = container.querySelector(selectors.brandLabel);

        expect(isElementVisible(image)).to.equal(true);
        expect(isElementVisible(brandText)).to.equal(false);
        expect(brandText.innerText).to.equal('Adobe');
      });
    });

    describe('mobile', () => {
      it('mobile - should render the logo', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        const container = document.querySelector(selectors.brandContainer);
        const image = container.querySelector(selectors.brandImage);
        const brandText = container.querySelector(selectors.brandLabel);

        expect(isElementVisible(image)).to.equal(true);
        expect(isElementVisible(brandText)).to.equal(true);
        expect(brandText.innerText).to.equal('Adobe');
      });
    });
    it('should not render the brand block if it was not authored', async () => {
      await createFullGlobalNavigation({ globalNavigation: logoOnlyNav });

      const container = document.querySelector(selectors.brandContainer);
      const image = container.querySelector(selectors.brandImage);
      const brandText = container.querySelector(selectors.brandLabel);

      expect(isElementVisible(image)).to.equal(false);
      expect(isElementVisible(brandText)).to.equal(false);
    });
  });

  describe('Gnav-toggle', () => {
    describe('desktop', () => {
      it('should be hidden', async () => {
        await createFullGlobalNavigation();

        expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(false);
      });
    });

    describe('mobile', () => {
      it('should be visible on mobile', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(true);
      });
      it('should open the navigation clicked on mobile', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        const header = document.querySelector(selectors.globalNavigation);
        const toggle = document.querySelector(selectors.gnavToggle);
        const curtain = document.querySelector(selectors.curtain);

        expect(header.classList.contains('is-open')).to.equal(false);
        expect(curtain.classList.contains('is-open')).to.equal(false);
        expect(isElementVisible(document.querySelector(selectors.navWrapper))).to.equal(false);

        toggle.click();

        expect(header.classList.contains('is-open')).to.equal(true);
        expect(curtain.classList.contains('is-open')).to.equal(true);
        expect(isElementVisible(document.querySelector(selectors.navWrapper))).to.equal(true);
      });
    });
  });

  describe('main nav', () => {
    describe('desktop', () => {
      it('should render the main nav', async () => {
        await createFullGlobalNavigation();

        [...document.querySelectorAll(selectors.navItem)].forEach((el) => {
          expect(isElementVisible(el)).to.equal(true);
        });
      });

      it('should open a menu on click', async () => {
        await createFullGlobalNavigation();

        const navItem = document.querySelector(selectors.navItem);
        const navLink = navItem.querySelector(selectors.navLink);
        const popup = navItem.querySelector(selectors.popup);

        expect(navLink.getAttribute('aria-expanded')).to.equal('false');
        expect(navLink.getAttribute('daa-lh')).to.equal('header|Open');
        expect(isElementVisible(popup)).to.equal(false);

        navLink.click();

        expect(navLink.getAttribute('aria-expanded')).to.equal('true');
        expect(isElementVisible(popup)).to.equal(true);
        expect(navLink.getAttribute('daa-lh')).to.equal('header|Close');
      });

      it('should close a menu on click', async () => {
        await createFullGlobalNavigation();

        const navItem = document.querySelector(selectors.navItem);
        const navLink = navItem.querySelector(selectors.navLink);
        const popup = navItem.querySelector(selectors.popup);

        navLink.click();

        expect(navLink.getAttribute('aria-expanded')).to.equal('true');
        expect(isElementVisible(popup)).to.equal(true);

        navLink.click();

        expect(navLink.getAttribute('aria-expanded')).to.equal('false');
        expect(isElementVisible(popup)).to.equal(false);
      });

      it(
        'should be able to click all links with popups and at most have 1 open menu at a time',
        async () => {
          await createFullGlobalNavigation();

          const navLinks = document.querySelectorAll(`${selectors.navLink}[aria-haspopup='true']`);

          [...navLinks].forEach((link) => {
            const navItem = link.parentElement;
            const popup = navItem.querySelector(selectors.popup);

            link.click();

            expect(document.querySelectorAll(`${selectors.navLink}[aria-expanded='true']`).length).to.equal(1);
            expect(link.getAttribute('aria-expanded')).to.equal('true');
            expect(isElementVisible(popup)).to.equal(true);
          });
        },
      );

      it('should close menus when clicking outside of the header', async () => {
        await createFullGlobalNavigation();

        const navItem = document.querySelector(selectors.navItem);
        const navLink = navItem.querySelector(selectors.navLink);
        const popup = navItem.querySelector(selectors.popup);

        navLink.click();

        expect(navLink.getAttribute('aria-expanded')).to.equal('true');
        expect(isElementVisible(popup)).to.equal(true);

        document.body.click();

        expect(navLink.getAttribute('aria-expanded')).to.equal('false');
        expect(isElementVisible(popup)).to.equal(false);
      });
    });

    describe('small desktop', () => {
      it('should render the main nav', async () => {
        await createFullGlobalNavigation({ viewport: 'smallDesktop' });

        [...document.querySelectorAll(selectors.navItem)].forEach((el) => {
          expect(isElementVisible(el)).to.equal(true);
        });
      });
    });

    describe('mobile', () => {
      it('should render the main nav only on click', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        [...document.querySelectorAll(selectors.navItem)].forEach((el) => {
          expect(isElementVisible(el)).to.equal(false);
        });

        document.querySelector(selectors.gnavToggle).click();

        [...document.querySelectorAll(selectors.navItem)].forEach((el) => {
          expect(isElementVisible(el)).to.equal(true);
        });
      });
    });
  });

  describe('main nav popups', () => {
    describe('desktop', () => {
      it('should render the promo', async () => {
        await createFullGlobalNavigation();

        document.querySelector(selectors.gnavToggle).click();
        document.querySelector(selectors.navLink).click();

        expect(isElementVisible(document.querySelector(selectors.promoImage))).to.equal(true);
      });
    });
    describe('small desktop', () => {});
    describe('mobile', () => {
      it('should open a menu and headline on click', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        document.querySelector(selectors.gnavToggle).click();

        const navItem = document.querySelector(selectors.navItem);
        const navLink = navItem.querySelector(selectors.navLink);
        const popup = navItem.querySelector(selectors.popup);
        const headline = popup.querySelector(selectors.headline);
        const headlinePopupItems = popup.querySelector(selectors.popupItems);

        expect(isElementVisible(popup.querySelector(selectors.navLink))).to.equal(false);
        expect(navLink.getAttribute('aria-expanded')).to.equal('false');
        expect(navLink.getAttribute('daa-lh')).to.equal('header|Open');
        expect(isElementVisible(popup)).to.equal(false);
        expect(headline.getAttribute('aria-expanded')).to.equal('false');
        expect(isElementVisible(headlinePopupItems)).to.equal(false);

        navLink.click();

        expect(isElementVisible(popup.querySelector(selectors.navLink))).to.equal(true);
        expect(navLink.getAttribute('aria-expanded')).to.equal('true');
        expect(navLink.getAttribute('daa-lh')).to.equal('header|Close');
        expect(isElementVisible(popup)).to.equal(true);
        expect(headline.getAttribute('aria-expanded')).to.equal('false');
        expect(isElementVisible(headlinePopupItems)).to.equal(false);

        headline.click();

        expect(headline.getAttribute('aria-expanded')).to.equal('true');
        expect(isElementVisible(headlinePopupItems)).to.equal(true);
      });

      it('should not render the promo', async () => {
        await createFullGlobalNavigation({ viewport: 'mobile' });

        document.querySelector(selectors.gnavToggle).click();
        document.querySelector(selectors.navLink).click();

        expect(isElementVisible(document.querySelector(selectors.promoImage))).to.equal(false);
      });
    });
  });

  describe('Gnav-logo', () => {
    // TODO write the tests
    // https://jira.corp.adobe.com/browse/MWPW-130641
    // it('should only render the logo', async () => {
    //   await createFullGlobalNavigation({ globalNavigation: logoOnlyNav });
    // });
  });
});
