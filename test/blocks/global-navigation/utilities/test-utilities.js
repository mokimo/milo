/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import sinon, { stub } from 'sinon';
import { setViewport } from '@web/test-runner-commands';
import initGnav from '../../../../libs/blocks/global-navigation/global-navigation.js';
import {
  getLocale,
  setConfig,
  loadStyle,
} from '../../../../libs/utils/utils.js';
import defaultPlaceholders from '../mocks/placeholders.js';
import defaultProfile from '../mocks/profile.js';
import largeMenuMock from '../mocks/large-menu.plain.js';
import globalNavigationMock from '../mocks/global-navigation.plain.js';
import { isElementVisible } from '../../../../libs/blocks/global-navigation/utilities/keyboard/utils.js';

export { isElementVisible };
export const selectors = {
  brandContainer: '.feds-brand-container',
  brandLabel: '.feds-brand-label',
  brandImage: '.feds-brand-image',
  gnavToggle: '.gnav-toggle',
  largeMenu: '.feds-navItem--megaMenu',
  profile: '.feds-profile',
  profileMenu: '.feds-profile-menu',
  popup: '.feds-popup',
  navItem: '.feds-navItem',
  globalNavigation: '.global-navigation',
  search: '.feds-search',
  logo: '.gnav-logo',
};
const ogFetch = window.fetch;
const locales = { '': { ietf: 'en-US', tk: 'hah7vzn.css' } };
const config = {
  imsClientId: 'milo',
  codeRoot: '/libs',
  contentRoot: `${window.location.origin}${getLocale(locales).prefix}`,
  locales,
};
const viewports = {
  mobile: { width: 899, height: 1024 },
  smallDesktop: { width: 901, height: 1024 },
  desktop: { width: 1200, height: 1024 },
};

export const loadStyles = (path) => new Promise((resolve) => loadStyle(path, resolve));

export const mockRes = ({ payload, status = 200, ok = true } = {}) => new Promise((resolve) => {
  resolve({
    status,
    ok,
    json: () => payload,
    text: () => payload,
  });
});

export const waitForElement = (selector, parent) => new Promise((resolve) => (
  parent.querySelector(selector)
    ? resolve()
    : new MutationObserver((mutationRecords, observer) => resolve() && observer.disconnect())
      .observe(parent, { childList: true, subtree: true })));

/**
 *
 * @param {Object} param0
 * @param {String} param0.mode Sets viewport: "mobile" | "smallDesktop" | "desktop"
 * @param {Object} param0.placeholders Supply custom placeholders - mocks/placeholders.js
 * @param {String} param0.globalNavigation Render a gnav, default mocks/global-navigation.plain.js
 * @param {Boolean} param0.signedIn Set to false to simulate a signed out user
 * @returns
 */
export const createFullGlobalNavigation = async ({
  viewport = 'desktop',
  placeholders,
  signedIn = true,
  globalNavigation,
} = {}) => {
  const clock = sinon.useFakeTimers({
    // Intercept setTimeout and call the function immediately
    toFake: ['setTimeout'],
  });
  setConfig(config);
  setViewport(viewports[viewport]);
  window.lana = { log: stub() };
  window.fetch = stub().callsFake((url) => {
    if (url.includes('profile')) { return mockRes({ payload: defaultProfile }); }
    if (url.includes('placeholders')) { return mockRes({ payload: placeholders || defaultPlaceholders }); }
    if (url.includes('large-menu')) { return mockRes({ payload: largeMenuMock }); }
    if (url.includes('gnav')) { return mockRes({ payload: globalNavigation || globalNavigationMock }); }
    return null;
  });
  window.adobeIMS = {
    isSignedInUser: stub().returns(signedIn),
    getAccessToken: stub().returns('mock-access-token'),
    getProfile: stub().returns(
      new Promise((resolve) => {
        resolve({
          displayName: 'Mock User',
          email: 'Mock@adobe.com',
        });
      }),
    ),
  };
  document.body.innerHTML = '<header class="global-navigation has-breadcrumbs" daa-im="true" daa-lh="gnav|milo"></header>';
  await Promise.all([
    loadStyles('../../../../libs/styles/styles.css'),
    loadStyles(
      '../../../../libs/blocks/global-navigation/global-navigation.css',
    ),
  ]);

  const instance = await initGnav(document.body.querySelector('header'));
  window.adobeid.onReady();
  await clock.tickAsync(10000);
  // I'm not 100% sure why we need to wait for the large menu, profile
  // the clock.tickAsync should call all the setTimeouts immediately
  const waitForElements = [];
  const profile = document.querySelector(selectors.profile);
  const largeMenu = document.querySelector(selectors.largeMenu);
  if (profile) waitForElements.push(waitForElement(selectors.profileMenu, profile));
  if (largeMenu) waitForElements.push(waitForElement(selectors.popup, largeMenu));
  await Promise.all(waitForElements);

  clock.restore();
  window.fetch = ogFetch;
  window.adobeIMS = undefined;
  window.adobeid = undefined;

  return instance;
};
