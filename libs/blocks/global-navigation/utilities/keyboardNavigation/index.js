import { getNextVisibleItem, getPreviousVisibleItem, selectors } from './utils.js';
import MainNav from './mainNav.js';

// TODO cycle through nav when search is open
class KeyboardNavigation {
  constructor() {
    this.listenToChanges();
    this.mainNav = new MainNav();
  }

  listenToChanges = () => {
    document.addEventListener('keydown', (e) => {
      if (!e.target.closest('header')) return;

      this.navItems = [
        ...document.querySelectorAll(`
      ${selectors.brand}, 
      ${selectors.mainNavToggle},
      ${selectors.mainNavItems},
      ${selectors.searchTrigger},
      ${selectors.searchField},
      ${selectors.signIn},
      ${selectors.profileButton},
      ${selectors.logo},
      ${selectors.breadCrumbItems}
      `),
      ];
      this.curr = this.navItems.findIndex((el) => el === e.target);
      this.prev = getPreviousVisibleItem(this.curr, this.navItems);
      this.next = getNextVisibleItem(this.curr, this.navItems);

      if (this.prev === -1 || this.next === -1) return;

      switch (e.code) {
        case 'Tab': {
          console.log('Tab');
          break;
        }
        case 'Enter': {
          console.log('Enter');
          break;
        }
        case 'Escape': {
          break;
        }
        case 'Space': {
          console.log('Space');
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
