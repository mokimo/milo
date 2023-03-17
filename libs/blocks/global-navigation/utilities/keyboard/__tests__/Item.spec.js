import Item from '../Item';
import Menu from '../Menu';
import Popup from '../Popup';
import DOM from '../__mocks__/menu.html';

describe('Item', () => {
    let item;
    let menu;
    let node;
    let popup;
    const { closeAll } = Popup;
    const mockPosition = 10000;

    beforeEach(() => {
        document.body.innerHTML = DOM;
        document.querySelector('html').setAttribute('dir', 'ltr');
        node = document.querySelector('.feds-popup').querySelector('.feds-navLink');
        const position = 0;
        menu = new Menu(document.querySelector('#gnav_2 > .feds-navList > #gnav_2_1 .feds-navList'));

        item = new Item(node, position, menu);
        popup = new Popup(document.querySelector('.feds-popup'), item);
        item.popup = popup;
        // Mock the 'disableSticky' value
        window.fedsConfig = {
            disableSticky: false,
        };
        // Mock 'scrollIntoView' method
        item.node.scrollIntoView = () => {};

        // reset
        Popup.closeAll = closeAll;
    });

    test('instance exposes various methods', () => {
        expect(item.init).toBeDefined();
        expect(item.handleKey).toBeDefined();
        expect(item.handleClick).toBeDefined();
        expect(item.handleFocus).toBeDefined();
        expect(item.handleBlur).toBeDefined();
        expect(item.handleTab).toBeDefined();
        expect(item.moveDown).toBeDefined();
        expect(item.moveUp).toBeDefined();
        expect(item.moveLeft).toBeDefined();
        expect(item.moveRight).toBeDefined();
        expect(item.closePopup).toBeDefined();
        expect(item.hasPopup).toBeDefined();
        expect(item.reset).toBeDefined();
    });

    test('if the node of an item is not an HTMLElement, do not initialize it', () => {
        const notInitializedItem = new Item(undefined, mockPosition, undefined);

        // We do not initialize the item (early return in the constructor)
        // So position will not be set, and we can assume the item was not initialized
        expect(notInitializedItem.position).toBe(undefined);
    });

    test('handleKey called with tab keypress?', () => {
        const eventTab = new window.KeyboardEvent('keypress', { code: 'Tab' });
        item.handleTab = jest.fn();
        expect(item.handleTab).toBeCalledTimes(0);
        item.handleKey(eventTab);
        expect(item.handleTab).toBeCalledTimes(1);
    });

    test('handleKey called with esc keypress will close the popup', () => {
        const eventEsc = new window.KeyboardEvent('keypress', { code: 'Escape' });
        item.closePopup = jest.fn();
        expect(item.closePopup).toBeCalledTimes(0);
        item.handleKey(eventEsc);
        expect(item.closePopup).toBeCalledTimes(1);
    });

    test('handleKey called with space keypress will do nothing', () => {
        const eventSpace = new window.KeyboardEvent('keypress', { code: 'Space' });
        item.handleKey(eventSpace);
        // nothing to assert here, we don't want anything to happen
    });

    test('handleKey called with left keypress moves item to the left', () => {
        const eventLeft = new window.KeyboardEvent('keypress', { code: 'ArrowLeft' });
        eventLeft.preventDefault = jest.fn();
        item.moveLeft = jest.fn();

        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveLeft).toBeCalledTimes(0);
        item.handleKey(eventLeft);
        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveLeft).toBeCalledTimes(1);
    });

    test('handleKey called with left keypress with RTL moves item to the right', () => {
        const eventLeft = new window.KeyboardEvent('keypress', { code: 'ArrowLeft' });
        eventLeft.preventDefault = jest.fn();
        item.moveRight = jest.fn();
        document.querySelector('html').setAttribute('dir', 'rtl');

        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveRight).toBeCalledTimes(0);
        item.handleKey(eventLeft);
        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveRight).toBeCalledTimes(1);
    });

    test('handleKey called with up keypress?', () => {
        const eventUp = new window.KeyboardEvent('keypress', { code: 'ArrowUp' });
        eventUp.preventDefault = jest.fn();
        item.moveUp = jest.fn();

        expect(eventUp.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveUp).toBeCalledTimes(0);
        item.handleKey(eventUp);
        expect(eventUp.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveUp).toBeCalledTimes(1);
    });

    test('handleKey called with right keypress moves item to the right', () => {
        const eventRight = new window.KeyboardEvent('keypress', { code: 'ArrowRight' });
        eventRight.preventDefault = jest.fn();
        item.moveRight = jest.fn();

        expect(eventRight.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveRight).toBeCalledTimes(0);
        item.handleKey(eventRight);
        expect(eventRight.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveRight).toBeCalledTimes(1);
    });

    test('handleKey called with right keypress with RTL moves item to the left', () => {
        const eventRight = new window.KeyboardEvent('keypress', { code: 'ArrowRight' });
        eventRight.preventDefault = jest.fn();
        item.moveLeft = jest.fn();
        document.querySelector('html').setAttribute('dir', 'rtl');

        expect(eventRight.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveLeft).toBeCalledTimes(0);
        item.handleKey(eventRight);
        expect(eventRight.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveLeft).toBeCalledTimes(1);
    });

    test('handleKey called with down keypress?', () => {
        const eventDown = new window.KeyboardEvent('keypress', { code: 'ArrowDown' });
        eventDown.preventDefault = jest.fn();
        item.moveDown = jest.fn();

        expect(eventDown.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveDown).toHaveBeenCalledTimes(0);
        item.handleKey(eventDown);
        expect(eventDown.preventDefault).toHaveBeenCalledTimes(1);
        expect(item.moveDown).toHaveBeenCalledTimes(1);
    });

    test('handleKey will not error on an invalid code', () => {
        const randomEvent = new window.KeyboardEvent('keypress', { code: 'Test' });
        item.handleKey(randomEvent);
    });

    test('handleFocus calls setIndex on the menu', () => {
        menu.setIndex = jest.fn();
        expect(menu.setIndex).toHaveBeenCalledTimes(0);
        item.handleFocus();
        expect(menu.setIndex).toHaveBeenCalledTimes(1);
    });

    test('handleClick expands popup', () => {
        item.popup.expand = jest.fn();
        menu.setIndex = jest.fn();
        node.scrollIntoView = jest.fn();

        expect(menu.setIndex).toHaveBeenCalledTimes(0);
        expect(item.popup.expand).toHaveBeenCalledTimes(0);
        expect(node.scrollIntoView).toHaveBeenCalledTimes(0);
        item.handleClick(new MouseEvent('click'));
        expect(item.popup.expand).toHaveBeenCalledTimes(1);
        expect(menu.setIndex).toHaveBeenCalledTimes(1);
        expect(node.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    test('handleClick closes expanded popup', () => {
        Popup.closeAll = jest.fn();
        item.popup.isExpanded = jest.fn().mockImplementation(() => true);

        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        item.handleClick(new MouseEvent('click'));
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('handleClick proceeds clicking the link if there is no popup', (done) => {
        node.addEventListener('click', () => done());
        item.hasPopup = jest.fn().mockImplementation(() => false);
        const eventSpace = new window.KeyboardEvent('keypress', { code: 'Space' });
        item.handleClick(eventSpace);
    });

    test('handleTab, moves the menu up, if the menu has a popupFlag', () => {
        item.position = 1;
        item.moveUp = jest.fn();
        menu.popupFlag = true;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => 1);

        expect(item.moveUp).toHaveBeenCalledTimes(0);
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: true, preventDefault: () => false });
        item.handleTab(eventShift);
        expect(item.moveUp).toHaveBeenCalledTimes(1);
    });

    test('handleTab moves the menu left', () => {
        item.position = 1;
        item.moveLeft = jest.fn();
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => 1);

        expect(item.moveLeft).toHaveBeenCalledTimes(0);
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: true, preventDefault: () => false });
        item.handleTab(eventShift);
        expect(item.moveLeft).toHaveBeenCalledTimes(1);
    });

    test('handleTab shiftKey, ignores event if the tab is on the last visible item', () => {
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: true, preventDefault: () => false });
        eventShift.preventDefault = jest.fn();
        menu.popupFlag = true;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => -1);
        item.moveUp = jest.fn();

        expect(eventShift.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveUp).toHaveBeenCalledTimes(0);
        item.handleTab(eventShift);
        expect(eventShift.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveUp).toHaveBeenCalledTimes(0);
    });

    test('handleTab moves the menu down', () => {
        item.position = 10;
        item.moveDown = jest.fn();
        menu.popupFlag = true;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);

        expect(item.moveDown).toHaveBeenCalledTimes(0);
        const keypressEvent = new window.KeyboardEvent('keypress', { preventDefault: () => false });
        item.handleTab(keypressEvent);
        expect(item.moveDown).toHaveBeenCalledTimes(1);
    });

    test('handleTab moves the menu right', () => {
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);
        item.position = 10;
        item.moveRight = jest.fn();

        expect(item.moveRight).toHaveBeenCalledTimes(0);
        const keypressEvent = new window.KeyboardEvent('keypress', { preventDefault: () => false });
        item.handleTab(keypressEvent);
        expect(item.moveRight).toHaveBeenCalledTimes(1);
    });

    test('handleTab ignores event if the tab is on the last visible item', () => {
        const keypressEvent = new window.KeyboardEvent('keypress', { preventDefault: () => false });
        keypressEvent.preventDefault = jest.fn();
        menu.popupFlag = true;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => -1);
        item.position = 10;
        item.moveDown = jest.fn();

        expect(keypressEvent.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveDown).toHaveBeenCalledTimes(0);
        item.handleTab(keypressEvent);
        expect(keypressEvent.preventDefault).toHaveBeenCalledTimes(0);
        expect(item.moveDown).toHaveBeenCalledTimes(0);
    });

    test('moveDown without popup will call moveRight', () => {
        item.hasPopup = jest.fn().mockImplementation(() => false);
        item.moveRight = jest.fn();

        expect(item.moveRight).toHaveBeenCalledTimes(0);
        item.moveDown();
        expect(item.moveRight).toHaveBeenCalledTimes(1);
    });

    test('moveDown will expand the popup', () => {
        menu.popupFlag = false;
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.isExpanded = jest.fn().mockImplementation(() => false);
        item.popup.expand = jest.fn();
        item.popup.moveToFirstColumnItem = jest.fn();

        expect(menu.popupFlag).toBe(false);
        expect(item.popup.expand).toHaveBeenCalledTimes(0);
        expect(item.popup.moveToFirstColumnItem).toHaveBeenCalledTimes(0);
        item.moveDown();
        expect(menu.popupFlag).toBe(true);
        expect(item.popup.expand).toHaveBeenCalledTimes(1);
        expect(item.popup.moveToFirstColumnItem).toHaveBeenCalledTimes(1);
    });

    test('moveDown will not expand an expanded popup', () => {
        menu.popupFlag = false;

        // already expanded
        item.popup.isExpanded = jest.fn().mockImplementation(() => true);
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.expand = jest.fn();
        item.popup.moveToFirstColumnItem = jest.fn();

        expect(menu.popupFlag).toBe(false);
        expect(item.popup.expand).toHaveBeenCalledTimes(0);
        expect(item.popup.moveToFirstColumnItem).toHaveBeenCalledTimes(0);
        item.moveDown();
        expect(menu.popupFlag).toBe(false);
        expect(item.popup.expand).toHaveBeenCalledTimes(0);

        // only moveToFirstColumnItem was called because popup is already expanded
        expect(item.popup.moveToFirstColumnItem).toHaveBeenCalledTimes(1);
    });

    test('moveUp without popup will call moveLeft', () => {
        item.hasPopup = jest.fn().mockImplementation(() => false);
        item.moveLeft = jest.fn();

        expect(item.moveLeft).toHaveBeenCalledTimes(0);
        item.moveUp();
        expect(item.moveLeft).toHaveBeenCalledTimes(1);
    });

    test('moveUp will close the popup', () => {
        Popup.closeAll = jest.fn();
        menu.moveToPreviousItem = jest.fn();
        item.position = mockPosition;
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.isExpanded = jest.fn().mockImplementation(() => true);

        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        expect(menu.moveToPreviousItem).toHaveBeenCalledTimes(0);
        item.moveUp();
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
        expect(menu.moveToPreviousItem).toHaveBeenCalledTimes(1);
        expect(menu.moveToPreviousItem.mock.calls[0][0]).toBe(mockPosition);
        expect(menu.moveToPreviousItem.mock.calls[0][1]).toBe(true);
        expect(menu.moveToPreviousItem.mock.calls[0][2]).toBe('last');
    });

    test('moveUp will call moveLeft if it has a popup, but it is not expanded', () => {
        item.moveLeft = jest.fn();
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.isExpanded = jest.fn().mockImplementation(() => false);

        expect(item.moveLeft).toHaveBeenCalledTimes(0);
        item.moveUp();
        expect(item.moveLeft).toHaveBeenCalledTimes(1);
    });

    test('moveLeft will call movie.moveToPreviousItem', () => {
        item.position = mockPosition;
        menu.moveToPreviousItem = jest.fn();
        expect(menu.moveToPreviousItem).toHaveBeenCalledTimes(0);
        item.moveLeft();
        expect(menu.moveToPreviousItem).toHaveBeenCalledTimes(1);
        expect(menu.moveToPreviousItem.mock.calls[0][0]).toBe(mockPosition);
    });

    test('moveRight will call movie.moveToNextItem with position', () => {
        item.position = mockPosition;
        menu.moveToNextItem = jest.fn();
        expect(menu.moveToNextItem).toHaveBeenCalledTimes(0);
        item.moveRight();
        expect(menu.moveToNextItem).toHaveBeenCalledTimes(1);
        expect(menu.moveToNextItem.mock.calls[0][0]).toBe(mockPosition);
    });

    test('closePopup will call closePopup', () => {
        Popup.closeAll = jest.fn();
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.isExpanded = jest.fn().mockImplementation(() => true);

        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        item.closePopup();
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('handleBlur keeps the menu index if the current focus is on a subitem', () => {
        item.position = mockPosition;
        item.hasPopup = jest.fn().mockImplementation(() => true);
        item.popup.isExpanded = jest.fn().mockImplementation(() => true);
        menu.setIndex = jest.fn();

        expect(menu.setIndex).toHaveBeenCalledTimes(0);
        item.handleBlur(new Event('blur'));
        expect(menu.setIndex).toHaveBeenCalledTimes(1);
        expect(menu.setIndex.mock.calls[0][0]).toBe(mockPosition);
    });

    test('handleBlur resets the index when there is no popup', () => {
        item.hasPopup = jest.fn().mockImplementation(() => false);
        menu.setIndex = jest.fn();
        item.handleBlur(new Event('blur'));
        expect(menu.setIndex).toHaveBeenCalledTimes(1);
        expect(menu.setIndex.mock.calls[0][0]).toBe(-1);
    });

    test('handleBlur closes the Popup if there is a related Target', () => {
        const blurEvent = new Event('blur');
        const relatedTarget = document.createElement('a');
        relatedTarget.classList.add('Subnav-menu-label');
        blurEvent.relatedTarget = relatedTarget;
        Popup.closeAll = jest.fn();
        item.hasPopup = jest.fn().mockImplementation(() => false);
        menu.setIndex = jest.fn();
        menu.popupFlag = true;

        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        expect(menu.popupFlag).toBe(true);
        item.handleBlur(blurEvent);
        expect(menu.popupFlag).toBe(false);
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('reset will reset the instance', () => {
        item.hasPopup = jest.fn().mockImplementation(() => true);
        node.removeEventListener = jest.fn();
        popup.reset = jest.fn();
        expect(item.node).toBeDefined();
        expect(item.events).toBeDefined();
        expect(item.menu).toBeDefined();
        expect(item.position).toBeDefined();
        expect(item.popup).toBeDefined();
        expect(popup.reset).toHaveBeenCalledTimes(0);
        expect(node.removeEventListener).toHaveBeenCalledTimes(0);
        item.reset();
        expect(item.node).toBeUndefined();
        expect(item.events).toBeUndefined();
        expect(item.menu).toBeUndefined();
        expect(item.position).toBeUndefined();
        expect(item.popup).toBeUndefined();
        expect(popup.reset).toHaveBeenCalledTimes(1);
        // we remove 4 event listeners
        expect(node.removeEventListener).toHaveBeenCalledTimes(4);
    });
});
