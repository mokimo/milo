import { getConfig } from '../../../../utils/utils.js';
import { toFragment, getFedsPlaceholderConfig } from '../../utilities/utilities.js';
import { replaceKeyArray } from '../../../../features/placeholders.js';

const WAFFLE_ICON = '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 36 36" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeS"><path d="M10 10H2V3a1 1 0 0 1 1-1h7zm4-8h8v8h-8zm20 8h-8V2h7a1 1 0 0 1 1 1zM2 14h8v8H2zm12 0h8v8h-8zm12 0h8v8h-8zM10 34H3a1 1 0 0 1-1-1v-7h8zm4-8h8v8h-8zm19 8h-7v-8h8v7a1 1 0 0 1-1 1z"></path></svg>';
const INFO_ICON = '<svg viewBox="0 0 48 48" focusable="false" aria-hidden="true" role="img" class="spectrum-Icon spectrum-Icon--sizeM info-icon-svg"><path d="M24 4.1A19.9 19.9 0 1 0 43.9 24 19.9 19.9 0 0 0 24 4.1zm-.3 6.2a2.718 2.718 0 0 1 2.864 2.824 2.665 2.665 0 0 1-2.864 2.863 2.706 2.706 0 0 1-2.864-2.864A2.717 2.717 0 0 1 23.7 10.3zM28 35a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-8h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11h1a1 1 0 0 1 1 1z"></path></svg>';
const { env, locale } = getConfig();
const api = `https://${env.name === 'prod' ? 'prod' : 'stage'}.adobeccstatic.com/appl/assets/config.json`;
const supportedLocales = ['cs_CZ', 'cy_GB', 'da_DK', 'de_DE', 'es_ES', 'fi_FI', 'fr_FR', 'hu_HU', 'it_IT', 'ja_JP', 'ko_KR', 'nb_NO', 'nl_NL', 'pl_PL', 'pt_BR', 'pt_PT', 'ru_RU', 'sv_SE', 'tr_TR', 'uk_UA', 'zh_TW', 'zh_CN'];
const getUrl = (goUrl) => {
  const currentLang = locale.ietf.split('-')[0];
  const lang = supportedLocales.find((str) => str.includes(currentLang));
  return `https://www.adobe.com/go/${goUrl}${lang ? `_${lang}` : ''}`; // defaults to en-US if no lang
};

// TODO analytics
const createApp = ({ name, goUrl, imgKey } = {}) => {
  if (!goUrl || !imgKey || !name) return '';
  const img = typeof imgKey === 'string' ? imgKey : imgKey.dark;
  if (!img) return '';

  return toFragment`
  <li>
    <a 
      aria-label="${name}" 
      role="link" 
      target="_blank" 
      rel="noopener" 
      tabindex="0" 
      href="${getUrl(goUrl)}">
        <img 
          src="https://prod.adobeccstatic.com/appl/${img}" 
          role="presentation"><span>${name}</span>
    </a>
  </li>`;
};

const fetchData = () => fetch(api)
  .then(async (data) => data.json())
  .catch(() => {
  // do nothing
  });

class AppLauncher {
  constructor({ profileEl }) {
    this.profileEl = profileEl;
    this.init();
  }

  async init() {
    console.log('oh');
    try {
      // const data = await fetchData();
      // static data for demo purposes to prevent CORS issues
      const data = {
        apps: [
          {
            name: 'Adobe Express',
            goUrl: 'utilitynav-appmenu-aexpbeta-icon-link_stage',
            imgKey: 'assets/cc_express_2x.png',
            url: 'https://stage.projectx.corp.adobe.com',
          },
          {
            name: 'Photoshop',
            goUrl: 'utilitynav-appmenu-ps-icon-link_stage',
            imgKey: 'assets/ps_appicons.png',
            url: 'https://stage.creativecloud.adobe.com/cc/photoshop?context=home_cc',
          },
          {
            name: 'Adobe Firefly',
            goUrl: 'utilitynav-appmenu-fireflybeta-icon-link_stage',
            imgKey: 'assets/firefly_appicon_128.png',
            url: 'https://firefly-stage.corp.adobe.com?promoid=DZTGZSX7',
          },
          {
            name: 'Lightroom',
            goUrl: 'utilitynav-appmenu-lr-icon-link_stage',
            imgKey: 'assets/lightroom_2x-1Bvte3Y.png',
            url: 'https://stage.adobelr.com/',
          },
          {
            name: 'Stock',
            goUrl: 'utilitynav-appmenu-st-icon-link_stage',
            imgKey: 'assets/stock_2x-3Tnxd6P.png',
            url: 'https://primary.stock.stage.adobe.com/',
          },
          {
            name: 'Fonts',
            goUrl: 'utilitynav-appmenu-tk-icon-link_stage',
            imgKey: {
              light: 'assets/typekit_light-EtaWIYE.png',
              dark: 'assets/typekit_dark-2YVtFWA.png',
            },
            url: 'https://fonts-relstage.adobe.com/',
          },
          {
            name: 'Acrobat Sign',
            goUrl: 'utilitynav-appmenu-as-icon-link_stage',
            imgKey: 'assets/adobe_sign_2x.png',
            url: 'https://documentsstage.adobe.com/account/homeJS',
          },
          {
            name: 'Behance',
            goUrl: 'utilitynav-appmenu-be-icon-link_stage',
            imgKey: 'assets/behance_2x-2SU4BVj.png',
            url: 'https://net.s2stagehance.com/',
          },
          {
            name: 'Portfolio',
            goUrl: 'utilitynav-appmenu-pf-icon-link_stage',
            imgKey: 'assets/portfolio_2x-1N1Dojs.png',
            url: 'https://portfolio.ccpsx.com/',
          },
          {
            name: 'Substance 3D Assets',
            goUrl: 'utilitynav-appmenu-sbs-icon-link_stage',
            imgKey: 'assets/substance_3d_2x.png',
            url: 'https://source-latest.dev.substance3d.io/',
          },
        ],
        cloudApps: [
          {
            name: 'Creative Cloud',
            goUrl: 'utilitynav-appmenu-cc-icon-link_stage',
            imgKey: 'assets/creative_cloud_appicon-1pSQ5Fg.png',
            url: 'https://stage.creativecloud.adobe.com/?context=home_cc',
          },
          {
            name: 'Acrobat',
            goUrl: 'utilitynav-appmenu-dc-icon-link_stage',
            imgKey: 'assets/dc_appicon_128.png',
            url: 'https://dc-stage.documentcloudtest.com/',
          },
          {
            name: 'Experience Cloud',
            goUrl: 'utilitynav-appmenu-ec-icon-link_stage',
            imgKey: 'assets/experience_cloud_appicon-22AkcGx.png',
            url: 'https://experiencecloud-stage.adobe.com/',
          },
        ],
        appsCatalog: 'https://www.adobe.com/go/utilitynav-appmenu-cc-viewallapps-link_stage',
        appsCatalogUrl: 'https://stage.creativecloud.adobe.com/apps/?context=apps_cc',
        viewMoreAppsUrls: {
          EC: 'utilitynav-appmenu-ec-viewallapps-link_stage',
          DC: 'utilitynav-appmenu-dc-viewallapps-link_stage',
          CC: 'utilitynav-appmenu-cc-viewallapps-link_stage',
        },
        viewMoreAppsNewUrls: {
          EC: 'https://www.stage.adobe.com/experience-cloud/products.html',
          DC: 'https://dc-stage.documentcloudtest.com/',
          CC: 'https://stage.creativecloud.adobe.com/apps/?context=apps_cc',
        },
      };
      console.log(data);
      if (!data) return;
      await this.getLabels();
      this.data = data;
      const appNavItems = this.createAppNavItems();
      this.elements = {
        appNavItems,
        appsNavItem: appNavItems.querySelector('.feds-applauncher'),
        appList: appNavItems.querySelector('.feds-applauncher-list'),
        infoBox: appNavItems.querySelector('.feds-applauncher-infobox'),
        footer: appNavItems.querySelector('.feds-applauncher-footer'),
        footerMoreButton: appNavItems.querySelector('.feds-applauncher-more-button'),
        trigger: appNavItems.querySelector('.feds-applauncher-trigger'),
        infoIcon: appNavItems.querySelector('.feds-applauncher-header-info'),
        infoBoxButton: appNavItems.querySelector('.feds-applauncher-infobox-button'),
      };
      data.cloudApps.forEach((entry) => this.elements.appList.append(createApp(entry)));
      data.apps.forEach((entry) => this.elements.appList.append(createApp(entry)));
      this.addEventListeners();
      if (appNavItems) this.profileEl.after(appNavItems);
    } catch (error) {
      window.lana?.log(`Cannot init applauncher ${error.toString()}`, { clientId: 'feds-milo' });
    }
  }

  async getLabels() {
    this.labels = {
      CC: {
        title: 'Creative Cloud Apps',
        description: 'Desktop, mobile and web creative apps',
      },
      DC: {
        title: 'Document Cloud Apps',
        description: 'Desktop, mobile and web document apps',
      },
      EC: {
        title: 'Experience Cloud Apps',
        description: 'Marketing solutions for every need',
      },
      header: 'WEB APPS & SERVICES',
      infoboxHeader: 'FIND THE APP YOU NEED',
      infoboxDescription: "Use this menu to launch a web app or move effortlessly between Creative Cloud, Document Cloud, and Experience Cloud. Navigate to the Apps section within the cloud you've selected to find your desktop or mobile apps.",
      infoboxButton: 'OK',
      footer: 'More',
      footerHeading: 'ADDITIONAL APPS FROM ADOBE',
      footerButton: 'View All',
    };
    [
      this.labels.header,
      this.labels.infoboxHeader,
      this.labels.infoboxDescription,
      this.labels.infoboxButton,
      this.labels.footer,
      this.labels.footerHeading,
      this.labels.EC.title,
      this.labels.EC.description,
      this.labels.CC.title,
      this.labels.CC.description,
      this.labels.DC.title,
      this.labels.DC.description,
      this.labels.footerButton,
    ] = await replaceKeyArray([
      'applauncher-header',
      'applauncher-infobox-header',
      'applauncher-infobox-description',
      'applauncher-infobox-button',
      'applauncher-footer',
      'applauncher-footer-heading',
      'applauncher-footer-ec-title',
      'applauncher-footer-ec-description',
      'applauncher-footer-cc-title',
      'applauncher-footer-cc-description',
      'applauncher-footer-dc-title',
      'applauncher-footer-dc-description',
      'applauncher-footer-button',
    ], getFedsPlaceholderConfig(), 'feds');
    this.labels.infoboxButton = this.labels.infoboxButton.toUpperCase();
    this.labels.footerHeading = this.labels.footerHeading.toUpperCase();
  }

  // TODO check analytics labels
  // TODO use correct aria-labels
  createAppNavItems() {
    return toFragment`
      <div class="feds-applauncher" da-ll="App Launcher">
        <button class="feds-applauncher-trigger" aria-expanded="false" aria-haspopup="true" daa-ll="App Launcher" daa-lh="header|Open">
          ${WAFFLE_ICON}
        </button>
        <div class="feds-applauncher-popup">
          <div class="feds-applauncher-header">
            <span class="feds-applauncher-header-text">${this.labels.header}</span> 
            <span class="feds-applauncher-header-info">${INFO_ICON}</span>
          </div>
          <div class="feds-applauncher-content">
            <span class="feds-applauncher-infobox feds-applauncher-hidden">
              <div class="feds-applauncher-infobox-header">${this.labels.infoboxHeader}</div>
              <div class="feds-applauncher-infobox-description">${this.labels.infoboxDescription}</div>
              <div class="feds-applauncher-infobox-button feds-cta feds-cta--secondary">${this.labels.infoboxButton}</div>
            </span>
            <ul class="feds-applauncher-list"></ul>
            <div class="feds-applauncher-footer">
              <button class="feds-applauncher-more-button">${this.labels.footer}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  replaceFooter() {
    const more = toFragment`<div class="feds-applauncher-more-list"></div>`;
    const viewMoreApps = toFragment`
      <div>
        <div class="feds-applauncher-more-header">${this.labels.footerHeading}</div>
        ${more}
      </div>
    `;
    ['CC', 'EC', 'DC'].forEach((entry) => more.append(
      toFragment`
        <div class="feds-applauncher-more-item">
          <div class="feds-applauncher-more-group">
            <div class="feds-applauncher-more-title">
              ${this.labels[entry].title}
            </div>
            <div class="feds-applauncher-more-description">
              ${this.labels[entry].description}
            </div>
          </div>
          <a 
            href="${getUrl(this.data.viewMoreAppsUrls[entry])}" 
            class="feds-cta feds-cta--secondary">
            ${this.labels.footerButton}
          </a>
        </div>
      `,
    ));
    this.elements.footer.replaceChild(viewMoreApps, this.elements.footerMoreButton);
  }

  addEventListeners() {
    const {
      trigger, infoBox, appList, footer, infoIcon, infoBoxButton, appNavItems,
    } = this.elements;
    trigger.addEventListener('click', () => {
      trigger.setAttribute('aria-expanded', trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
    const setInfoBox = () => {
      infoBox.style.height = `${appNavItems.querySelector('.feds-applauncher-content').offsetHeight}px`;
      infoBox.classList.toggle('feds-applauncher-hidden');
      appList.classList.toggle('feds-applauncher-hidden');
      footer.classList.toggle('feds-applauncher-hidden');
    };
    infoIcon.addEventListener('click', () => setInfoBox());
    infoBoxButton.addEventListener('click', () => setInfoBox());
    footer.addEventListener('click', () => this.replaceFooter());
  }
}

async function init(profileEl) {
  try {
    return new AppLauncher({ profileEl });
  } catch (e) {
    window.lana?.log(`Cannot create applauncher ${e.toString()}`, { clientId: 'feds-milo' });
    return null;
  }
}

export default init;
