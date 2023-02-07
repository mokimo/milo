import { toFragment } from '../../utilities.js';
import { replaceKeyArray } from '../../../../features/placeholders.js';
import { getConfig } from '../../../../utils/utils.js';

const initProfileButton = async ({
  blockEl,
  decoratedEl,
  avatar,
}) => {
  const labels = {};
  [labels.profileButton] = await replaceKeyArray(['profile-button'], getConfig(), 'feds');

  if (blockEl.children.length > 1) decoratedEl.classList.add('has-menu');
  decoratedEl.closest('nav.gnav')?.classList.add('signed-in');

  const profileButtonEl = toFragment`
      <button 
        class="feds-profile-button" 
        aria-expanded="false" 
        aria-controls="feds-profile-menu"
        aria-label="${labels.profileButton || 'Profile button'}"
        daa-ll="Account"
        aria-haspopup="true"
      > 
        <img class="feds-profile-img" src="${avatar}"></img>
      </button>
    `;
  profileButtonEl.addEventListener('click', () => window.dispatchEvent(new Event('feds:profileButton:clicked')));
  return profileButtonEl;
};

const initProfileMenu = async ({ blockEl, Profile, ...rest }) => {
  const labels = {};
  [labels.profileButton, labels.signOut, labels.viewAccount, labels.manageTeams, labels.manageEnterprise] = await replaceKeyArray(['profile-button', 'sign-out', 'view-account', 'manage-teams', 'manage-enterprise'], getConfig(), 'feds');
  const profile = new Profile({
    localMenu: blockEl.querySelector('h5')?.parentElement,
    labels,
    ...rest,
  });
  return profile;
};

export default { initProfileButton, initProfileMenu };
