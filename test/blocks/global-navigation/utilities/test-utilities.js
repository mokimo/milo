/* eslint-disable import/prefer-default-export */
import sinon, { stub } from 'sinon';
import { readFile, setViewport } from '@web/test-runner-commands';
import { Gnav } from '../../../../libs/blocks/global-navigation/global-navigation.js';
import { getLocale, setConfig, loadStyle } from '../../../../libs/utils/utils.js';

window.lana = { log: stub() };

const locales = { '': { ietf: 'en-US', tk: 'hah7vzn.css' } };
const config = {
  imsClientId: 'milo',
  codeRoot: '/libs',
  contentRoot: `${window.location.origin}${getLocale(locales).prefix}`,
  locales,
};
setConfig(config);

const loadStyles = (path) => new Promise((resolve) => {
  loadStyle(path, resolve);
});

const viewports = {
  mobile: { width: 899, height: 1024 },
  smallDesktop: { width: 901, height: 1024 },
  desktop: { width: 1200, height: 1024 },
};

export const createFullGlobalNavigation = async ({ mode = 'desktop' } = {}) => {
  setConfig(config);
  await Promise.all([
    loadStyles('../../../../libs/styles/styles.css'),
    loadStyles('../../../../libs/blocks/global-navigation/global-navigation.css'),
  ]);
  document.body.innerHTML = '<header class="global-navigation has-breadcrumbs" daa-im="true" daa-lh="gnav|milo"></header>';
  const viewport = viewports[mode];
  setViewport(viewport);
  const clock = sinon.useFakeTimers({
    // Intercept setTimeout and call the function immediately
    toFake: ['setTimeout'],
    shouldAdvanceTime: true,
  });
  const file = await readFile({ path: './mocks/global-navigation.plain.html' });
  const gnavMock = new DOMParser().parseFromString(file, 'text/html').body;
  try {
    const globalNav = new Gnav(gnavMock, document.body.querySelector('header'));
    globalNav.init();
    clock.restore();
    return globalNav;
  } catch (error) {
    console.log(error);
  }
  return '';
};
