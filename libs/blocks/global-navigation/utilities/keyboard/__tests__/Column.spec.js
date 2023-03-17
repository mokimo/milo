import Item from '../Item';
import Menu from '../Menu';
import Popup from '../Popup';
import DOM from '../__mocks__/menu.html';
import Column from '../Column';
import ColumnItem from '../ColumnItem';
import isElementVisible from '../../dom/isElementVisible';

jest.mock('../../dom/isElementVisible');

describe('column', () => {
    let column;
    let menu;
    let node;
    let popup;
    const position = 10;
    const { closeAll } = Popup;

    beforeEach(() => {
        document.body.innerHTML = DOM;
        document.querySelector('html').setAttribute('dir', 'ltr');
        node = document.querySelector('#gnav_2 > .feds-navList > #gnav_2_1 .feds-navList');

        menu = new Menu(node, '');

        const parent = new Item(node.querySelector('.feds-navLink'), position, menu);
        popup = new Popup(node, parent);
        column = new Column(node, position, popup);
        column.init();

        // reset
        Popup.closeAll = closeAll;
    });

    test('instance exposes various methods', () => {
        expect(column.init).toBeDefined();
        expect(column.moveToPreviousColumnItem).toBeDefined();
        expect(column.moveToNextColumnItem).toBeDefined();
        expect(column.moveToColumnItem).toBeDefined();
        expect(column.hasItems).toBeDefined();
        expect(column.setIndex).toBeDefined();
        expect(column.reset).toBeDefined();
    });

    test('constructor sets node, position, popup and menu on the instance', () => {
        expect(column.node).toBe(node);
        expect(column.menu).toBe(menu);
        expect(column.popup).toBe(popup);
        expect(column.position).toBe(position);
    });

    test('init exposes ColumnItems on the instance', () => {
        column.init();

        // 60 based on the mock
        expect(column.items).toHaveLength(60);
        expect(column.items[0]).toBeInstanceOf(ColumnItem);
    });

    test('moveToPreviousColumnItem does nothing if the column has no items', () => {
        column.hasItems = jest.fn().mockImplementation(() => false);
        popup.moveToPreviousColumn = jest.fn();

        column.moveToPreviousColumnItem(0);

        expect(popup.moveToPreviousColumn).toHaveBeenCalledTimes(0);
        expect(column.index).toEqual(-1);
    });

    test('moveToPreviousColumnItem moves focus to previous column, last item', () => {
        popup.moveToPreviousColumn = jest.fn();

        // If first column item, move focus to previous column, last item
        column.moveToPreviousColumnItem(0);

        expect(popup.moveToPreviousColumn).toHaveBeenCalledTimes(1);
        expect(popup.moveToPreviousColumn.mock.calls[0][0]).toEqual(position);
        expect(popup.moveToPreviousColumn.mock.calls[0][1]).toEqual('last');
        expect(column.index).toEqual(-1);
    });

    test('moveToPreviousColumnItem moves focus to the previous column item', () => {
        isElementVisible.mockImplementation(() => true);
        column.items[2].node.focus = jest.fn();

        column.moveToPreviousColumnItem(3);

        expect(column.index).toEqual(2);
        expect(column.items[2].node.focus).toHaveBeenCalledTimes(1);
        isElementVisible.mockRestore();
    });

    test('moveToNextColumnItem does nothing if the column has no items', () => {
        column.hasItems = jest.fn().mockImplementation(() => false);
        popup.moveToNextColumn = jest.fn();

        column.moveToNextColumnItem(0);

        expect(popup.moveToNextColumn).toHaveBeenCalledTimes(0);
        expect(column.index).toEqual(-1);
    });

    test('moveToNextColumnItem moves focus to the next column, first item', () => {
        column.items = [{}]; // fix length of items on the instance
        popup.moveToNextColumn = jest.fn();

        // If last column item, move focus to next column, first column item
        column.moveToNextColumnItem(1);

        expect(popup.moveToNextColumn).toHaveBeenCalledTimes(1);
        expect(popup.moveToNextColumn.mock.calls[0][0]).toEqual(position);
        expect(popup.moveToNextColumn.mock.calls[0][1]).toEqual('first');
        expect(popup.moveToNextColumn.mock.calls[0][2]).toEqual(true);
        expect(column.index).toEqual(-1);
    });

    test('moveToNextColumnItem moves focus to next column item', () => {
        isElementVisible.mockImplementation(() => true);
        column.items[4].node.focus = jest.fn();

        column.moveToNextColumnItem(3);

        expect(column.index).toEqual(4);
        expect(column.items[4].node.focus).toHaveBeenCalledTimes(1);
        isElementVisible.mockRestore();
    });

    test('moveToColumnItem does nothing if the column has no items', () => {
        column.hasItems = jest.fn().mockImplementation(() => false);
        column.items[5].node.focus = jest.fn();

        column.moveToColumnItem(5);

        expect(column.items[5].node.focus).toHaveBeenCalledTimes(0);
        expect(column.index).toEqual(-1);
    });

    test('moveToColumnItem does nothing if the position doesnt match', () => {
        const nonExistantItemPosition = column.items.length + 1;

        column.moveToColumnItem(nonExistantItemPosition);

        expect(column.index).toEqual(-1);
    });

    test('moveToColumnItem moves focus to a provided position', () => {
        isElementVisible.mockImplementation(() => true);
        column.items[5].node.focus = jest.fn();

        column.moveToColumnItem(5);

        expect(column.items[5].node.focus).toHaveBeenCalledTimes(1);
        expect(column.index).toEqual(5);
        isElementVisible.mockRestore();
    });

    test('hasItems returns true if a column has items', () => {
        column.items = [{}];

        expect(column.hasItems()).toEqual(1);
    });

    test('hasItems returns false if a column has no items', () => {
        column.items = [];

        expect(column.hasItems()).toEqual(0);
    });

    test('setIndex updates the index for the current focussed columnItem', () => {
        expect(column.index).toEqual(-1);

        column.setIndex(5);

        expect(column.index).toEqual(5);
    });

    test('setIndex does not update index if something else than an Integer is passed', () => {
        expect(column.index).toEqual(-1);

        column.setIndex('5');

        expect(column.index).toEqual(-1);
    });

    test('reset resets the instance', () => {
        column.index = 10;

        expect(column.items).toBeDefined();
        expect(column.node).toBeDefined();
        expect(column.position).toBeDefined();
        expect(column.popup).toBeDefined();
        expect(column.index).toEqual(10);

        column.reset();

        expect(column.items).toBeUndefined();
        expect(column.node).toBeUndefined();
        expect(column.position).toBeUndefined();
        expect(column.popup).toBeUndefined();
        expect(column.index).toEqual(-1);
    });
});
