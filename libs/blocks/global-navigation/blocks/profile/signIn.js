import { toFragment, getFedsPlaceholderConfig, openOrClose } from '../../utilities/utilities.js';
import { replaceKey } from '../../../../features/placeholders.js';

const signIn = () => {
  if (typeof window.adobeIMS?.signIn !== 'function') return;

  window.adobeIMS.signIn();
};

const decorateSignIn = async ({ rawElem, decoratedElem }) => {
  const dropdownElem = rawElem.querySelector(':scope > div:nth-child(2)');
  const signInLabel = await replaceKey('sign-in', getFedsPlaceholderConfig());
  let signInElem;

  if (!dropdownElem) {
    signInElem = toFragment`<a href="#" daa-ll="${signInLabel}" class="feds-signIn">${signInLabel}</a>`;

    signInElem.addEventListener('click', (e) => {
      e.preventDefault();
      signIn();
    });
  } else {
    signInElem = toFragment`<a href="#" daa-ll="${signInLabel}" class="feds-signIn" role="button" aria-expanded="false" aria-haspopup="true">${signInLabel}</a>`;

    signInElem.addEventListener('click', () => {
      openOrClose({ trigger: signInElem });
    });

    dropdownElem.classList.add('feds-signIn-dropdown');

    // TODO we don't have a good way of adding config properties to links
    const dropdownSignIn = dropdownElem.querySelector('[href="https://adobe.com?sign-in=true"]');

    if (dropdownSignIn) {
      dropdownSignIn.addEventListener('click', (e) => {
        e.preventDefault();
        signIn();
      });
    }

    decoratedElem.append(dropdownElem);
  }

  decoratedElem.prepend(signInElem);
};

export default decorateSignIn;
