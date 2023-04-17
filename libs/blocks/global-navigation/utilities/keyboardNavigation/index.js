/* eslint-disable class-methods-use-this */
import { getNextVisibleItem, getPreviousVisibleItem, selectors } from './utils.js';
import MainNav from './mainNav.js';

const cycleOnOpenSearch = ({ e, isDesktop }) => {
  const withoutBreadcrumbs = [
    ...document.querySelectorAll(`
  ${selectors.brand}, 
  ${selectors.mainNavToggle},
  ${selectors.mainNavItems},
  ${selectors.searchTrigger},
  ${selectors.searchField},
  ${selectors.signIn},
  ${selectors.profileButton},
  ${selectors.logo}
  `),
  ];
  const first = getNextVisibleItem(-1, withoutBreadcrumbs);
  const last = getPreviousVisibleItem(withoutBreadcrumbs.length, withoutBreadcrumbs);
  const openSearch = isDesktop && document.querySelector(selectors.openSearch);
  if (openSearch && document.activeElement === withoutBreadcrumbs[e.shiftKey ? first : last]) {
    e.preventDefault();
    withoutBreadcrumbs[e.shiftKey ? last : first].focus();
  }
};
class KeyboardNavigation {
  constructor() {
    this.listenToChanges();
    this.mainNav = new MainNav();
    this.desktop = window.matchMedia('(min-width: 900px)');
  }

  listenToChanges = () => {
    document.querySelector('header').addEventListener('keydown', (e) => {
      if (e.shiftKey && e.code === 'Tab') {
        cycleOnOpenSearch({ e, isDesktop: this.desktop.matches });
        return;
      }
      switch (e.code) {
        case 'Tab': {
          cycleOnOpenSearch({ e, isDesktop: this.desktop.matches });
          // if (!this.desktop.matches && curr === -1) {
          //   document.querySelector('.feds-curtain').classList.remove('is-open');
          //   document.querySelector('.global-navigation').classList.remove('is-open');
          // }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'Escape': {
          const profileBtn = document.querySelector(selectors.profileButton);
          if (e.target === profileBtn && profileBtn.getAttribute('aria-expanded') === 'true') {
            profileBtn.setAttribute('aria-expanded', 'false');
          }
          break;
        }
        case 'Space': {
          e.preventDefault();
          e.target.click();
          break;
        }
        case 'ArrowDown': {
          break;
        }
        default:
          break;
      }
    });
  };
}

export default KeyboardNavigation;
