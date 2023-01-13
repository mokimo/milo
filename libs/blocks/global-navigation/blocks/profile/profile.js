import { getConfig } from '../../../../utils/utils.js';
import { toFragment } from '../../utilities.js';

const decorateEmail = (email) => {
  const MAX_CHAR = 12;
  const emailParts = email.split('@');
  const username = emailParts[0].length <= MAX_CHAR ? emailParts[0] : `${emailParts[0].slice(0, MAX_CHAR)}…`;
  const domainArr = emailParts[1].split('.');
  const tld = domainArr.pop();
  let domain = domainArr.join('.');
  domain = domain.length <= MAX_CHAR ? domain : `${domain.slice(0, MAX_CHAR)}…`;
  return `${username}@${domain}.${tld}`;
};

const decorateProfileLink = (href, service) => {
  const { env } = getConfig();
  if (env.name === 'prod') return href;
  const url = new URL(href);
  url.hostname = env[service];
  return url.href;
};

const decorateSignOut = ({ blockEl }) => {
  const signOutLink = toFragment`<li class="gnav-profile-action">${blockEl.querySelector('div > div > p:nth-child(5) a')}</li>`;
  signOutLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.adobeIMS.signOut();
  });
  return signOutLink;
};

const decorateAction = ({ child, blockEl }) => {
  const action = blockEl.querySelector(`div > div > p:nth-child(${child}) a`);
  action.href = decorateProfileLink(action.href, 'adminconsole');
  return toFragment`<li class="gnav-profile-action">${action}</li>`;
};

class Profile {
  constructor({ blockEl, profileEl, avatarImg, sections }) {
    const gnav = profileEl.closest('nav.gnav');
    gnav.classList.add('signed-in');
    this.init({ blockEl, profileEl, avatarImg, sections });
  }

  async init({ blockEl, profileEl, avatarImg, sections }) {
    const { displayName, email } = await window.adobeIMS.getProfile();
    this.blockEl = blockEl;
    this.profileEl = profileEl;
    this.displayName = displayName;
    this.email = email;
    this.sections = sections;
    this.avatarImg = avatarImg;
    this.accountLink = this.blockEl.querySelector('div > div > p:nth-child(2) a');
    this.profileEl.append(this.menu());
  }

  menu() {
    return toFragment`
      <div id="gnav-profile-menu" class="gnav-profile-menu">
        <a 
          href="${decorateProfileLink(this.accountLink.href, 'account')}" 
          class="gnav-profile-header"
          aria-label="${this.accountLink.textContent}"
        >
          ${this.avatarImg.cloneNode(true)}
          <div class="gnav-profile-details">
            <p class="gnav-profile-name">${this.displayName}</p>
            <p class="gnav-profile-email">${decorateEmail(this.email)}</p>
            <p class="gnav-profile-account">${this.blockEl.querySelector('div > div > p:nth-child(2) a').innerHTML}</p>
          </div>
        </a>
        <ul class="gnav-profile-actions">
          ${this.sections.manage.items.team?.id ? decorateAction({ child: '3', blockEl: this.blockEl }) : ''}
          ${this.sections.manage.items.enterprise?.id ? decorateAction({ child: '4', blockEl: this.blockEl }) : ''}
          ${decorateSignOut({ blockEl: this.blockEl })}
        </ul>
      </div>
    `;
  }
}
export default { Profile };
