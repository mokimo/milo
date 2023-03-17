import ColumnItem from '../ColumnItem';
import Column from '../Column';
import Item from '../Item';
import Menu from '../Menu';
import Popup from '../Popup';
import DOM from '../__mocks__/menu.html';

describe('Item', () => {
    let columnItem;
    let menu;
    let node;
    let popup;
    let column;
    const { closeAll } = Popup;
    const mockPosition = 10000;

    beforeEach(() => {
        document.body.innerHTML = DOM;
        document.querySelector('html').setAttribute('dir', 'ltr');
        node = document.querySelector('#gnav_2 > .feds-navList > #gnav_2_1 .feds-navList');

        const position = 0;
        menu = new Menu(node, '');

        const parent = new Item(node.querySelector('.feds-navLink'), position, menu);
        popup = new Popup(node, parent);
        column = new Column(node, position, popup);
        columnItem = new ColumnItem(node, position, column);

        // reset
        Popup.closeAll = closeAll;
    });

    test('instance exposes various methods', () => {
        expect(columnItem.init).toBeDefined();
        expect(columnItem.handleKey).toBeDefined();
        expect(columnItem.handleClick).toBeDefined();
        expect(columnItem.handleFocus).toBeDefined();
        expect(columnItem.handleBlur).toBeDefined();
        expect(columnItem.handleTab).toBeDefined();
        expect(columnItem.moveDown).toBeDefined();
        expect(columnItem.moveUp).toBeDefined();
        expect(columnItem.moveLeft).toBeDefined();
        expect(columnItem.moveRight).toBeDefined();
        expect(columnItem.closePopup).toBeDefined();
        expect(columnItem.reset).toBeDefined();
    });

    test('if the node of an columnItem is not an HTMLElement, do not initialize it', () => {
        const notInitializedColumnItem = new ColumnItem(undefined, mockPosition, undefined);

        // We do not initialize the columnItem (early return in the constructor)
        // So position will not be set, and we can assume the columnItem was not initialized
        expect(notInitializedColumnItem.position).toBe(undefined);
    });

    test('handleKey will be called on keypress', () => {
        const eventTab = new window.KeyboardEvent('keypress', { code: 'Tab' });
        columnItem.handleTab = jest.fn();
        expect(columnItem.handleTab).toBeCalledTimes(0);
        columnItem.handleKey(eventTab);
        expect(columnItem.handleTab).toBeCalledTimes(1);
    });

    test('handleKey ESC, will close the popup', () => {
        const eventEsc = new window.KeyboardEvent('keypress', { code: 'Escape' });
        columnItem.closePopup = jest.fn();
        expect(columnItem.closePopup).toBeCalledTimes(0);
        columnItem.handleKey(eventEsc);
        expect(columnItem.closePopup).toBeCalledTimes(1);
    });

    test('handleKey SPACE, will do nothing', () => {
        const eventSpace = new window.KeyboardEvent('keypress', { code: 'Space' });
        columnItem.handleKey(eventSpace);
        // nothing to assert here, we don't want anything to happen
    });

    test('handleKey LEFT, moves columnItem to the left', () => {
        const eventLeft = new window.KeyboardEvent('keypress', { code: 'ArrowLeft' });
        eventLeft.preventDefault = jest.fn();
        columnItem.moveLeft = jest.fn();

        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveLeft).toBeCalledTimes(0);
        columnItem.handleKey(eventLeft);
        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveLeft).toBeCalledTimes(1);
    });

    test('handleKey LEFT, with RTL moves columnItem to the right', () => {
        const eventLeft = new window.KeyboardEvent('keypress', { code: 'ArrowLeft' });
        eventLeft.preventDefault = jest.fn();
        columnItem.moveRight = jest.fn();
        document.querySelector('html').setAttribute('dir', 'rtl');

        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveRight).toBeCalledTimes(0);
        columnItem.handleKey(eventLeft);
        expect(eventLeft.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveRight).toBeCalledTimes(1);
    });

    test('handleKey UP, moves columnItem up', () => {
        const eventUp = new window.KeyboardEvent('keypress', { code: 'ArrowUp' });
        eventUp.preventDefault = jest.fn();
        columnItem.moveUp = jest.fn();

        expect(eventUp.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveUp).toBeCalledTimes(0);
        columnItem.handleKey(eventUp);
        expect(eventUp.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveUp).toBeCalledTimes(1);
    });

    test('handleKey RIGHT, moves columnItem to the right', () => {
        const eventRight = new window.KeyboardEvent('keypress', { code: 'ArrowRight' });
        eventRight.preventDefault = jest.fn();
        columnItem.moveRight = jest.fn();

        expect(eventRight.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveRight).toBeCalledTimes(0);
        columnItem.handleKey(eventRight);
        expect(eventRight.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveRight).toBeCalledTimes(1);
    });

    test('handleKey RIGHT, with RTL moves columnItem to the left', () => {
        const eventRight = new window.KeyboardEvent('keypress', { code: 'ArrowRight' });
        eventRight.preventDefault = jest.fn();
        columnItem.moveLeft = jest.fn();
        document.querySelector('html').setAttribute('dir', 'rtl');

        expect(eventRight.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveLeft).toBeCalledTimes(0);
        columnItem.handleKey(eventRight);
        expect(eventRight.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveLeft).toBeCalledTimes(1);
    });

    test('handleKey DOWN, will move item down', () => {
        const eventDown = new window.KeyboardEvent('keypress', { code: 'ArrowDown' });
        eventDown.preventDefault = jest.fn();
        columnItem.moveDown = jest.fn();

        expect(eventDown.preventDefault).toHaveBeenCalledTimes(0);
        expect(columnItem.moveDown).toHaveBeenCalledTimes(0);
        columnItem.handleKey(eventDown);
        expect(eventDown.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveDown).toHaveBeenCalledTimes(1);
    });

    test('handleKey INVALID CODE, will not error', () => {
        const randomEvent = new window.KeyboardEvent('keypress', { code: 'Test' });
        columnItem.handleKey(randomEvent);
    });

    test('handleClick will set the index of a column to the current position of its item', () => {
        column.setIndex = jest.fn();
        expect(column.setIndex).toHaveBeenCalledTimes(0);
        columnItem.handleClick(new MouseEvent('click'));
        expect(column.setIndex).toHaveBeenCalledTimes(1);
        expect(column.setIndex.mock.calls[0][0]).toBe(columnItem.position);
    });

    test('handleFocus calls setIndex on the column', () => {
        column.setIndex = jest.fn();
        expect(column.setIndex).toHaveBeenCalledTimes(0);
        columnItem.handleFocus();
        expect(column.setIndex).toHaveBeenCalledTimes(1);
    });

    test('handleBlur will reset the index', () => {
        columnItem.position = mockPosition;
        column.setIndex = jest.fn();

        expect(column.setIndex).toHaveBeenCalledTimes(0);
        columnItem.handleBlur(new Event('blur'));
        expect(column.setIndex).toHaveBeenCalledTimes(1);
        expect(column.setIndex.mock.calls[0][0]).toBe(-1);
    });

    test('handleBlur ensures popups are closed if neccessary', () => {
        const blurEvent = new Event('blur');
        const relatedTarget = document.createElement('a');
        blurEvent.relatedTarget = relatedTarget;
        Popup.closeAll = jest.fn();

        // relatedTarget not part of a menu -> close popups
        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        columnItem.handleBlur(blurEvent);
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);

        // relatedTarget part of menu -> do not close poups
        relatedTarget.classList.add('feds-navLink');
        columnItem.handleBlur(blurEvent);
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('handleTab+SHIFT moves the menu up', () => {
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: true });
        eventShift.preventDefault = jest.fn();
        columnItem.moveUp = jest.fn();
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);


        expect(columnItem.moveUp).toHaveBeenCalledTimes(0);
        expect(eventShift.preventDefault).toHaveBeenCalledTimes(0);
        columnItem.handleTab(eventShift);
        expect(eventShift.preventDefault).toHaveBeenCalledTimes(1);
        expect(columnItem.moveUp).toHaveBeenCalledTimes(1);
    });

    test('handleTab+(NOT SHIFT) moves the menu down', () => {
        columnItem.moveDown = jest.fn();
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);

        expect(columnItem.moveDown).toHaveBeenCalledTimes(0);
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: false, preventDefault: () => false });
        columnItem.handleTab(eventShift);
        expect(columnItem.moveDown).toHaveBeenCalledTimes(1);
    });

    test('handleTab will have an early return we are on the last visible item', () => {
        const eventShift = new window.KeyboardEvent('keypress', { shiftKey: true });
        eventShift.preventDefault = jest.fn();

        // we are on the "last item"
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => -1);

        // we will return early, and thus "event.preventDefault" will not be called
        expect(eventShift.preventDefault).toHaveBeenCalledTimes(0);
        columnItem.handleTab(eventShift);
        expect(eventShift.preventDefault).toHaveBeenCalledTimes(0);
    });

    test('moveDown will call column.moveToNextColumnItem', () => {
        column.moveToNextColumnItem = jest.fn();

        expect(column.moveToNextColumnItem).toHaveBeenCalledTimes(0);
        columnItem.moveDown();
        expect(column.moveToNextColumnItem).toHaveBeenCalledTimes(1);
        expect(column.moveToNextColumnItem.mock.calls[0][0]).toBe(columnItem.position);
    });

    test('moveUp will call column.moveToPreviousColumnItem', () => {
        column.moveToPreviousColumnItem = jest.fn();

        expect(column.moveToPreviousColumnItem).toHaveBeenCalledTimes(0);
        columnItem.moveUp();
        expect(column.moveToPreviousColumnItem).toHaveBeenCalledTimes(1);
        expect(column.moveToPreviousColumnItem.mock.calls[0][0]).toBe(columnItem.position);
    });

    test('moveLeft will call popup.moveToPreviousColumn', () => {
        popup.moveToPreviousColumn = jest.fn();

        expect(popup.moveToPreviousColumn).toHaveBeenCalledTimes(0);
        columnItem.moveLeft();
        expect(popup.moveToPreviousColumn).toHaveBeenCalledTimes(1);
        expect(popup.moveToPreviousColumn.mock.calls[0][0]).toBe(columnItem.position);
        expect(popup.moveToPreviousColumn.mock.calls[0][1]).toBe('first');
    });

    test('moveRight will call popup.moveToNextColumn', () => {
        popup.moveToNextColumn = jest.fn();

        expect(popup.moveToNextColumn).toHaveBeenCalledTimes(0);
        columnItem.moveRight();
        expect(popup.moveToNextColumn).toHaveBeenCalledTimes(1);
        expect(popup.moveToNextColumn.mock.calls[0][0]).toBe(columnItem.position);
        expect(popup.moveToNextColumn.mock.calls[0][1]).toBe('first');
    });

    test('closePopup will call closePopup', () => {
        Popup.closeAll = jest.fn();
        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
        columnItem.closePopup();
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('reset will reset the instance', () => {
        node.removeEventListener = jest.fn();
        popup.reset = jest.fn();

        expect(columnItem.node).toBeDefined();
        expect(columnItem.events).toBeDefined();
        expect(columnItem.position).toBeDefined();
        expect(columnItem.popup).toBeDefined();
        expect(popup.reset).toHaveBeenCalledTimes(0);
        expect(node.removeEventListener).toHaveBeenCalledTimes(0);
        columnItem.reset();
        expect(columnItem.node).toBeUndefined();
        expect(columnItem.events).toBeUndefined();
        expect(columnItem.column).toBeUndefined();
        expect(columnItem.popup).toBeUndefined();

        // we remove 4 event listeners
        expect(node.removeEventListener).toHaveBeenCalledTimes(4);
    });
});
