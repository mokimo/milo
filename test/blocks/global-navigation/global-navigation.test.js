/* eslint-disable no-restricted-syntax */
import { expect } from '@esm-bundle/chai';
import { createFullGlobalNavigation, selectors, isElementVisible } from './utilities/test-utilities.js';

describe('global navigation', () => {
  it('should render the navigation on desktop', async () => {
    const nav = await createFullGlobalNavigation();
    expect(document.querySelector('.global-navigation')).to.exist;
    expect(nav).to.exist;
  });

  it('should render the navigation on smallDesktop', async () => {
    await createFullGlobalNavigation({ viewport: 'smallDesktop' });
    expect(document.querySelector('.global-navigation')).to.exist;
  });

  it('should render the navigation on mobile', async () => {
    await createFullGlobalNavigation({ viewport: 'mobile' });
    expect(document.querySelector('.global-navigation')).to.exist;
  });

  describe('Brand', () => {
    it('should render the brand block on desktop', async () => {
      await createFullGlobalNavigation();
      expect(document.querySelector(selectors.brandContainer)).to.exist;
    });
  });

  describe('Gnav-toggle', () => {
    it('GNAV toggle should be hidden on desktop', async () => {
      await createFullGlobalNavigation();
      expect(isElementVisible(document.querySelector(selectors.gnavToggle))).to.equal(false);
    });
  });
});
