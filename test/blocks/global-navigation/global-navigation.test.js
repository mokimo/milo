/* eslint-disable no-restricted-syntax */
import { expect } from '@esm-bundle/chai';
import { createFullGlobalNavigation, selectors, isElementVisible } from './utilities/test-utilities.js';
import logoOnlyNav from './mocks/global-navigation-only-logo.plain.js';

describe('global navigation', () => {
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

  describe('Brand', () => {
    it('Desktop - should render the whole block', async () => {
      await createFullGlobalNavigation();

      const container = document.querySelector(selectors.brandContainer);
      const image = container.querySelector(selectors.brandImage);
      const brandText = container.querySelector(selectors.brandLabel);

      expect(isElementVisible(image)).to.equal(true);
      expect(isElementVisible(brandText)).to.equal(true);
      expect(brandText.innerText).to.equal('Adobe');
    });

    it('smallDesktop - should render the logo', async () => {
      await createFullGlobalNavigation({ viewport: 'smallDesktop' });

      const container = document.querySelector(selectors.brandContainer);
      const image = container.querySelector(selectors.brandImage);
      const brandText = container.querySelector(selectors.brandLabel);

      expect(isElementVisible(image)).to.equal(true);
      expect(isElementVisible(brandText)).to.equal(false);
      expect(brandText.innerText).to.equal('Adobe');
    });

    it('mobile - should render the logo', async () => {
      await createFullGlobalNavigation({ viewport: 'mobile' });

      const container = document.querySelector(selectors.brandContainer);
      const image = container.querySelector(selectors.brandImage);
      const brandText = container.querySelector(selectors.brandLabel);

      expect(isElementVisible(image)).to.equal(true);
      expect(isElementVisible(brandText)).to.equal(true);
      expect(brandText.innerText).to.equal('Adobe');
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
    it('GNAV toggle should be hidden on desktop', async () => {
      await createFullGlobalNavigation();
      expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(false);
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
