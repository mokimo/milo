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
  gnavToggle: '.gnav-toggle',
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

export const loadStyles = (path) => new Promise((resolve) => {
  loadStyle(path, resolve);
});

export const mockJsonRes = ({ payload, status = 200, ok = true } = {}) => new Promise((resolve) => {
  resolve({
    status,
    ok,
    json: () => payload,
  });
});

export const mockHtmlRes = ({ payload, status = 200, ok = true } = {}) => new Promise((resolve) => {
  resolve({
    status,
    ok,
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
 * @param {Object} param0.placeholders Supply custom placeholders - see mocks for data structure
 * @param {Boolean} param0.signedIn Set to false to simulate a signed out user
 * @returns
 */
export const createFullGlobalNavigation = async ({
  viewport = 'desktop',
  placeholders,
  signedIn = true,
} = {}) => {
  const clock = sinon.useFakeTimers({
    // Intercept setTimeout and call the function immediately
    toFake: ['setTimeout'],
  });
  setConfig(config);
  setViewport(viewports[viewport]);
  window.lana = { log: stub() };
  window.fetch = stub().callsFake((url) => {
    if (url.includes('profile')) { return mockJsonRes({ payload: defaultProfile }); }
    if (url.includes('placeholders')) { return mockJsonRes({ payload: placeholders || defaultPlaceholders }); }
    if (url.includes('large-menu')) { return mockHtmlRes({ payload: largeMenuMock }); }
    if (url.includes('gnav')) { return mockHtmlRes({ payload: globalNavigationMock }); }
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

  try {
    const instance = await initGnav(document.body.querySelector('header'));
    window.adobeid.onReady();
    await clock.tickAsync(10000);
    // I'm not 100% sure why we need to wait for the large menu, profile
    // the clock.tickAsync should call all the setTimeouts immediately
    await Promise.all([
      waitForElement(
        '.feds-profile-menu',
        document.querySelector('.feds-profile'),
      ),
      waitForElement('.feds-popup', document.querySelector('.feds-navItem')),
    ]);
    clock.restore();
    window.fetch = ogFetch;
    window.adobeIMS = undefined;
    window.adobeid = undefined;
    return instance;
  } catch (error) {
    console.log(error);
  }
  return '';
};
