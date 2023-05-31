import {
  getLocale,
  getConfig,
  setConfig,
  isInTextNode,
  getMetadata,
  createTag,
  localizeLink,
  appendHtmlPostfix,
  loadTemplate,
  loadBlock,
  decorateSVG,
  decorateAutoBlock,
  decorateLinks,
  loadDeferred,
  loadArea,
  utf8ToB64,
  b64ToUtf8,
  parseEncodedConfig,
  loadLana,
  debounce,
  loadScript,
  loadStyle,
} from '../../libs/utils/utils.js';

const stubResource = {
  'https://platform.twitter.com/widgets.js': true,
  'https://www.instagram.com/embed.js': true,
  'https://www.tiktok.com/embed.js': true,
  'https://www.adobe.com/special/chimera/caas-libs/stable/app.css': true,
  'https://www.adobe.com/special/chimera/caas-libs/stable/react.umd.js': true,
  'https://www.adobe.com/etc.clientlibs/globalnav/clientlibs/base/privacy-standalone.js': true,
  'https://admin.hlx.page/preview/adobecom/milo/main/drafts/jck/bulk-publish/test/test-0': true,
  // 'https://dev.apps.enterprise.adobe.com/faas/service/jquery.faas-current.js': true,
  'https://documentcloud.adobe.com/view-sdk/viewer.js': true,
  'https://auth.services.adobe.com/imslib/imslib.min.js': true,
  'https://www.stage.adobe.com/special/tacocat/literals/en.js': true,
  'https://www.stage.adobe.com/special/tacocat/lib/1.16.0/tacocat.js': true,
};

const logExternalResource = (url) => {
  if (!/^(\.\.\/|\.\/|\/|http:\/\/localhost)/.test(url)) {
    console.error(
      '** Loading external scripts or styles is disallowed in unit tests, please find a way to mock!',
      url,
    );
  }
};

function createIntersectionObserver({ el, callback /* , once = true, options = {} */ }) {
  // fire immediately
  callback(el, { target: el });
}

const wrappedLoadStyle = (...args) => {
  const [url] = args;
  if (stubResource[url]) return new Promise((resolve) => { resolve(); });
  logExternalResource(url);
  return loadStyle(...args);
};

const wrappedLoadScript = (...args) => {
  const [url] = args;
  if (stubResource[url]) return new Promise((resolve) => { resolve(); });
  logExternalResource(url);
  return loadScript(...args);
};

export {
  getLocale,
  getConfig,
  setConfig,
  isInTextNode,
  getMetadata,
  createTag,
  localizeLink,
  appendHtmlPostfix,
  wrappedLoadStyle as loadStyle,
  wrappedLoadScript as loadScript,
  loadTemplate,
  loadBlock,
  decorateSVG,
  decorateAutoBlock,
  decorateLinks,
  loadDeferred,
  loadArea,
  utf8ToB64,
  b64ToUtf8,
  parseEncodedConfig,
  createIntersectionObserver,
  loadLana,
  debounce,
};
