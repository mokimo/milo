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
  const env = getConfig();
  const name = env.name || 'prod';
  if (name === 'prod') return href;
  const url = new URL(href);
  url.hostname = env[service];
  return url.href;
};

const decorateAction = (actionEl) => {
  if (!actionEl) return '';
  actionEl.href = decorateProfileLink(actionEl.href, 'adminconsole');
  return toFragment`<li class="gnav-profile-action">${actionEl}</li>`;
};

class Profile {
  constructor({
    decoratedEl,
    avatarImg,
    sections,
    toggleMenu,
    profileButton, // optional
    accountLink,
    signOutEl,
    manageTeams,
    manageEnterprise,
  }) {
    this.sections = sections;
    this.avatarImg = avatarImg;
    this.accountLink = accountLink;
    this.signOutEl = signOutEl;
    this.manageTeams = manageTeams;
    this.manageEnterprise = manageEnterprise;
    this.toggleMenu = toggleMenu;
    this.profileButton = profileButton;
    this.decoratedEl = decoratedEl;
    this.init();
  }

  async init() {
    const { displayName, email } = await window.adobeIMS.getProfile();
    if (this.profileButton) this.profileButton.setAttribute('aria-label', displayName);
    this.displayName = displayName;
    this.email = email;
    this.decoratedEl.append(this.menu());
    this.decoratedEl.addEventListener('click', () => this.toggleMenu(this.decoratedEl));
    this.decoratedEl.dispatchEvent(new Event('profile_ready'));
  }

  decorateSignOut() {
    const signOutLink = toFragment`<li class="gnav-profile-action">${this.signOutEl}</li>`;
    signOutLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.adobeIMS.signOut();
    });
    return signOutLink;
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
            <p class="gnav-profile-account">${this.accountLink.innerHTML}</p>
          </div>
        </a>
        <ul class="gnav-profile-actions">
          ${this.sections.manage.items.team?.id ? decorateAction(this.manageTeams) : ''}
          ${this.sections.manage.items.enterprise?.id ? decorateAction(this.manageEnterprise) : ''}
          ${this.decorateSignOut()}
        </ul>
      </div>
    `;
  }
}
export default { Profile };
export { Profile };
