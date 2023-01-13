import { toFragment } from '../../utilities.js';
import { MenuControls } from '../../delayed-utilities.js';
import { Profile } from './profile.js';

// TODO Don't commit into main for now, this is a POC only
// usage might look something like this:
// const target = document.querySelector('.feds-login')
// const token = window.feds.utilities.imslib.getAccessToken();
// if (!token) {
//     target.addEventListener('click', () => {
//         window.feds.utilities.imslib.signIn();
//     });
// }
// await loadStyles('http://localhost:6456/libs/styles/variables.css');
// await loadStyles('http://localhost:6456/libs/blocks/global-navigation/blocks/profile/profile.css');
// await loadScript('http://localhost:6456/build/profile-wrapper-build.umd.js');
// window.adobeProfile({target});

// TODOS
// - some of the profile icon button CSS is still within the global-navigation
// - keep the API consistent with the old profile, so it's just switching out an URL?
// - the menucontrols are quite tightly tied to milo. this won't work as there's JS errors
// regarding the curtain
const profileWrapper = async ({ target }) => {
  const accessToken = window.adobeIMS.getAccessToken();
  const profileRes = accessToken
    ? await fetch('https://cc-collab-stage.adobe.io/profile', { headers: new Headers({ Authorization: `Bearer ${accessToken.token}` }) })
    : {};
  const {
    sections,
    user: { avatar },
  } = await profileRes.json();
  const avatarImg = toFragment`<img class="gnav-profile-img" src="${avatar}"></img>`;
  const signOutEl = toFragment`<a href="https://account.adobe.com/">Sign Out</a>`;
  const manageTeams = toFragment`<a href="https://adminconsole.adobe.com/team">Manage Team</a>`;
  const manageEnterprise = toFragment`<a href="https://adminconsole.adobe.com/">Manage Enterprise</a>`;
  const accountLink = toFragment`<a href="https://account.adobe.com/">View Account</a>`;
  const decoratedEl = toFragment`
  <div class="gnav-profile">
    <button class="gnav-profile-button" aria-expanded="false" aria-controls="gnav-profile-menu" aria-label="Okan Sahin"> 
    <img class="gnav-profile-img" src="https://pps-stage.services.adobe.com/api/profile/image/default/65ed0931-9318-4ee1-b21f-a6718e9e0c79/138">
    </button>
  </div>
`;

  const profile = new Profile({
    accountLink,
    decoratedEl,
    toggleMenu: new MenuControls().toggleMenu,
    avatarImg,
    sections,
    signOutEl,
    manageTeams,
    manageEnterprise,
  });

  target.parentNode.replaceChild(decoratedEl, target);
  return profile;
};

window.adobeProfile = profileWrapper;

export default profileWrapper;
