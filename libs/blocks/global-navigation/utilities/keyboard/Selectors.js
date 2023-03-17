const selectors = (region) => {
  switch (region) {
    case 'subnav':
      return {
        popupTrigger: 'Subnav-menu-item.has-submenu',
        navLink: 'Subnav-menu-label',
        navSubLink: 'Subnav-submenu-link',
        popup: 'Subnav-submenus',
        openPopup: 'feds-popup--open',
        navList: 'Subnav-submenu',
        navListItem: 'Subnav-menu-item',
      };
    default:
      return {
        popupTrigger: 'feds-popup-trigger',
        fullWidthPopupTrigger: 'feds-popup-trigger--fullWidth',
        navLink: 'feds-navLink',
        imageLink: 'feds-image-link',
        navSubLink: 'feds-navLink',
        richTextLink: 'feds-richText-link',
        popup: 'feds-popup',
        openPopup: 'feds-popup--open',
        navList: 'feds-navList',
        navListHeadline: 'feds-navList-headline',
        navListItem: 'feds-navList-item',
        activeDropdown: 'feds-dropdown--active',
      };
  }
};

export default selectors;
