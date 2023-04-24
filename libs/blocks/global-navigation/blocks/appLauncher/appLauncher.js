import { getConfig } from '../../../../utils/utils.js';
import { toFragment } from '../../utilities/utilities.js';

const WAFFLE_ICON = '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 36 36" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeS"><path d="M10 10H2V3a1 1 0 0 1 1-1h7zm4-8h8v8h-8zm20 8h-8V2h7a1 1 0 0 1 1 1zM2 14h8v8H2zm12 0h8v8h-8zm12 0h8v8h-8zM10 34H3a1 1 0 0 1-1-1v-7h8zm4-8h8v8h-8zm19 8h-7v-8h8v7a1 1 0 0 1-1 1z"></path></svg>';
const INFO_ICON = '<svg viewBox="0 0 48 48" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeM info-icon-svg"><path d="M24 4.1A19.9 19.9 0 1 0 43.9 24 19.9 19.9 0 0 0 24 4.1zm-.3 6.2a2.718 2.718 0 0 1 2.864 2.824 2.665 2.665 0 0 1-2.864 2.863 2.706 2.706 0 0 1-2.864-2.864A2.717 2.717 0 0 1 23.7 10.3zM28 35a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-8h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h1a1 1 0 0 1 1 1z"></path></svg>';
const api = 'https://prod.adobeccstatic.com/appl/assets/config.json';
// Reverse engineered from the supported AppLauncher URLs
const supportedLocales = ['en_US', 'cs_CZ', 'cy_GB', 'da_DK', 'de_DE', 'es_ES', 'fi_FI', 'fr_FR', 'hu_HU', 'it_IT', 'ja_JP', 'ko_KR', 'nb_NO', 'nl_NL', 'pl_PL', 'pt_BR', 'pt_PT', 'ru_RU', 'sv_SE', 'tr_TR', 'uk_UA', 'zh_TW', 'zh_CN'];

// TODO analytics
const createApp = ({ name, goUrl, imgKey } = {}) => {
  if (!goUrl || !imgKey || !name) return '';
  const img = typeof imgKey === 'string' ? imgKey : imgKey.dark;
  if (!img) return '';
  const currentLang = getConfig().locale.ietf.split('-')[0];
  const lang = supportedLocales.find((str) => str.includes(currentLang));
  return toFragment`
  <li>
    <a 
      aria-label="${name}" 
      role="link" 
      target="_blank" 
      rel="noopener" 
      tabindex="0" 
      href="https://www.adobe.com/go/${goUrl}${lang ? `_${lang}` : ''}">
        <img 
          src="https://prod.adobeccstatic.com/appl/${img}" 
          role="presentation"><span>${name}</span>
    </a>
  </li>`;
};

const getData = () => fetch(api)
  .then((data) => data.json())
  .catch(() => {
    // do nothing
  });

// TODO check analytics labels
// TODO use placeholders for translations of hardcoded items
// TODO use correct aria-labels
async function decorateAppsMenu(profileEl) {
  let data = await getData();
  if (!data) {
    data = (await import('./backup.js')).default;
  }
  const appsNavItem = toFragment`
    <div class="feds-applauncher" da-ll="App Launcher">
      <button class="feds-applauncher-trigger" aria-expanded="false" aria-haspopup="true" daa-ll="App Launcher" daa-lh="header|Open">${WAFFLE_ICON}</button>
      <div class="feds-applauncher-wrapper">
      <div class="feds-applauncher-popup">
        <div class="feds-applauncher-popup-header">
          <span class="feds-applauncher-popup-header-text">WEB APPS & SERVICES</span> <span class="feds-applauncher-popup-header-info">${INFO_ICON}</span>
        </div>
        <div class="feds-applauncher-content">
          <span class="feds-applauncher-popup-infobox feds-applauncher-hidden">
            <div class="feds-applauncher-popup-infobox-header">Find the app you need</div>
            <div class="feds-applauncher-popup-infobox-description">Use this menu to launch a web app or move effortlessly between Creative Cloud, Document Cloud, and Experience Cloud. Navigate to the Apps section within the cloud you've selected to find your desktop or mobile apps.</div>
            <div class="feds-applauncher-popup-infobox-button feds-cta feds-cta--secondary">OK</div>
          </span>
          <ul class="feds-applauncher-list"></ul>
          <div class="feds-applauncher-popup-footer">MORE</div>
        </div>
      </div>
      </div>
    </div>`;
  const ul = appsNavItem.querySelector('.feds-applauncher-list');
  const infoBox = appsNavItem.querySelector('.feds-applauncher-popup-infobox');
  const footer = appsNavItem.querySelector('.feds-applauncher-popup-footer');
  const button = appsNavItem.querySelector('.feds-applauncher-trigger');
  const infoIcon = appsNavItem.querySelector('.feds-applauncher-popup-header-info');
  const infoBoxButton = appsNavItem.querySelector('.feds-applauncher-popup-infobox-button');
  data.cloudApps.forEach((entry) => ul.append(createApp(entry)));
  data.apps.forEach((entry) => ul.append(createApp(entry)));
  button.addEventListener('click', () => {
    button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
  const setInfoBox = () => {
    infoBox.style.height = `${appsNavItem.querySelector('.feds-applauncher-content').offsetHeight}px`;
    infoBox.classList.toggle('feds-applauncher-hidden');
    ul.classList.toggle('feds-applauncher-hidden');
    footer.classList.toggle('feds-applauncher-hidden');
  };
  infoIcon.addEventListener('click', () => setInfoBox());
  infoBoxButton.addEventListener('click', () => setInfoBox());
  profileEl.after(appsNavItem);
  return appsNavItem;
}

async function appLauncher(profileEl) {
  return decorateAppsMenu(profileEl);
}

export default appLauncher;
