import Menu from '../Menu';
import DOM from '../__mocks__/menu.html';
import Item from '../Item';
import Popup from '../Popup';


describe('Menu Tests', () => {
    const { closeAll } = Popup;
    let menu;

    beforeEach(() => {
        document.body.innerHTML = DOM;
        const node = document.querySelector('#gnav_2 > .feds-navList > #gnav_2_1 .feds-navList');
        const region = '';

        menu = new Menu(node, region);
        Popup.closeAll = closeAll;
    });

    afterEach(() => {
        menu = null;
        document.body.innerHTML = '';
    });

    test('Menu to be defined and initialized?', () => {
        expect(menu).toBeDefined();
        expect(menu.node).toBeDefined();
        expect(menu.popupFlag).toBeDefined();
        expect(menu.region).toBeDefined();
        expect(menu.selectors).toBeDefined();
        expect(menu.init).toBeDefined();
        expect(menu.moveToPreviousItem).toBeDefined();
        expect(menu.moveToNextItem).toBeDefined();
        expect(menu.moveToItem).toBeDefined();
        expect(menu.hasItems).toBeDefined();
        expect(menu.setIndex).toBeDefined();
        expect(menu.blurActiveItem).toBeDefined();
        expect(menu.getNextVisibleItem).toBeDefined();
        expect(menu.getPreviousVisibleItem).toBeDefined();
        expect(menu.destroy).toBeDefined();
        expect(menu.reset).toBeDefined();

        expect(menu.items[0]).toBeInstanceOf(Item);
    });

    test('moveToPreviousItem does not do anything if the menu has no items', () => {
        menu.index = 10;
        menu.hasItems = jest.fn().mockImplementation(() => false);
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => 1);

        menu.moveToPreviousItem();

        // if the index was not touched, we can assume code execution stopped early
        expect(menu.index).toEqual(10);
    });

    test('moveToPreviousItem does not do anything if the previous position is -1', () => {
        menu.index = 10;
        menu.hasItems = jest.fn().mockImplementation(() => true);
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => -1);

        menu.moveToPreviousItem();

        // if the index was not touched, we can assume code execution stopped early
        expect(menu.index).toEqual(10);
    });

    test('moveToPreviousItem closes the popup', () => {
        const position = 2;
        const prevPos = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevPos);
        menu.items[position].hasPopup = jest.fn().mockImplementation(() => true);
        menu.items[position].popup.isExpanded = jest.fn().mockImplementation(() => true);
        menu.items[prevPos].hasPopup = jest.fn().mockImplementation(() => false);
        Popup.closeAll = jest.fn();

        menu.moveToPreviousItem(position, true, 'first');

        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('moveToPreviousItem does not close the popup if its not expanded', () => {
        const position = 1;
        const currentItem = menu.items[position];
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => position);
        currentItem.hasPopup = jest.fn().mockImplementation(() => true);
        currentItem.popup.isExpanded = jest.fn().mockImplementation(() => false);
        Popup.closeAll = jest.fn();

        menu.moveToPreviousItem(position);

        expect(currentItem.popup.isExpanded).toHaveBeenCalledTimes(1);
        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
    });

    test('moveToPreviousItem resets popup flag when a link item is focused', () => {
        const position = 0;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => 1);
        menu.items[position].hasPopup = jest.fn().mockImplementation(() => false);
        menu.popupFlag = true;

        menu.moveToPreviousItem(position, true, 'first');

        expect(menu.popupFlag).toEqual(false);
    });

    test('moveToPreviousItem focues the first column item', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.items[prevItem].popup.moveToFirstColumnItem = jest.fn();
        menu.popupFlag = true;

        menu.moveToPreviousItem(position, true, 'first');

        expect(menu.items[prevItem].popup.moveToFirstColumnItem).toHaveBeenCalledTimes(1);
        expect(menu.index).toEqual(prevItem);
    });

    test('moveToPreviousItem focusses the last column item', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.items[prevItem].popup.moveToLastColumnItem = jest.fn();
        menu.popupFlag = true;

        menu.moveToPreviousItem(position, true, 'last');

        expect(menu.items[prevItem].popup.moveToLastColumnItem).toHaveBeenCalledTimes(1);
        expect(menu.index).toEqual(prevItem);
    });

    test('moveToPreviousItem does not error if the columnFocusItem is not valid', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.popupFlag = true;

        menu.moveToPreviousItem(position, true, 'invalid');
    });

    test('moveToPreviousItem does not error if there is no columnFocusItem', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.popupFlag = true;

        menu.moveToPreviousItem(position, true); // omitted 3rd param
    });

    test('moveToPreviousItem does not error if the popup flag is false', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.items[prevItem].popup.moveToLastColumnItem = jest.fn();
        menu.popupFlag = false;

        // omitted 2nd param
        menu.moveToPreviousItem(position);
    });

    test('moveToNextItem does not do anything if the menu has no items', () => {
        menu.index = 10;
        menu.hasItems = jest.fn().mockImplementation(() => false);
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);

        menu.moveToNextItem();

        // if the index was not touched, we can assume code execution stopped early
        expect(menu.index).toEqual(10);
    });

    test('moveToNextItem does nothing if last visible item', () => {
        menu.index = 10;
        menu.hasItems = jest.fn().mockImplementation(() => true);
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => -1);

        menu.moveToNextItem();

        // if the index was not touched, we can assume code execution stopped early
        expect(menu.index).toEqual(10);
    });

    test('moveToNextItem does nothing if last item', () => {
        menu.index = 10;
        menu.hasItems = jest.fn().mockImplementation(() => true);
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => menu.items.length);

        menu.moveToNextItem();

        // if the index was not touched, we can assume code execution stopped early
        expect(menu.index).toEqual(10);
    });

    test('moveToNextItem closes the popup', () => {
        const position = 2;
        const nextPos = 3;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => nextPos);
        menu.items[position].hasPopup = jest.fn().mockImplementation(() => true);
        menu.items[position].popup.isExpanded = jest.fn().mockImplementation(() => true);
        menu.items[nextPos].hasPopup = jest.fn().mockImplementation(() => false);
        Popup.closeAll = jest.fn();

        menu.moveToNextItem(position, true, 'first');

        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
    });

    test('moveToNextItem does not close the popup if its not expanded', () => {
        const position = 1;
        const currentItem = menu.items[position];
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => position);
        currentItem.hasPopup = jest.fn().mockImplementation(() => true);
        currentItem.popup.isExpanded = jest.fn().mockImplementation(() => false);
        Popup.closeAll = jest.fn();

        menu.moveToNextItem(position);

        expect(currentItem.popup.isExpanded).toHaveBeenCalledTimes(1);
        expect(Popup.closeAll).toHaveBeenCalledTimes(0);
    });

    test('moveToNextItem resets popup flag when a link item is focused', () => {
        const position = 0;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => 1);
        menu.items[position].hasPopup = jest.fn().mockImplementation(() => false);
        menu.popupFlag = true;

        menu.moveToNextItem(position, true, 'first');

        expect(menu.popupFlag).toEqual(false);
    });

    // fooooo

    test('moveToNextItem focues the first column item', () => {
        const position = 2;
        const nextItem = 3;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => nextItem);
        menu.items[nextItem].popup.moveToFirstColumnItem = jest.fn();
        menu.popupFlag = true;

        menu.moveToNextItem(position, true, 'first');

        expect(menu.items[nextItem].popup.moveToFirstColumnItem).toHaveBeenCalledTimes(1);
        expect(menu.index).toEqual(nextItem);
    });

    test('moveToNextItem focusses the last column item', () => {
        const position = 2;
        const nextItem = 3;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => nextItem);
        menu.items[nextItem].popup.moveToLastColumnItem = jest.fn();
        menu.popupFlag = true;

        menu.moveToNextItem(position, true, 'last');

        expect(menu.items[nextItem].popup.moveToLastColumnItem).toHaveBeenCalledTimes(1);
        expect(menu.index).toEqual(nextItem);
    });

    test('moveToNextItem does not error if the columnFocusItem is not valid', () => {
        const position = 2;
        const nextItem = 3;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => nextItem);
        menu.popupFlag = true;

        menu.moveToNextItem(position, true, 'invalid');
    });

    test('moveToNextItem does not error if there is no columnFocusItem', () => {
        const position = 2;
        const nextItem = 3;
        menu.getNextVisibleItem = jest.fn().mockImplementation(() => nextItem);
        menu.popupFlag = true;

        menu.moveToNextItem(position, true); // omitted 3rd param
    });

    test('moveToNextItem does not error if the popup flag is false', () => {
        const position = 2;
        const prevItem = 1;
        menu.getPreviousVisibleItem = jest.fn().mockImplementation(() => prevItem);
        menu.items[prevItem].popup.moveToLastColumnItem = jest.fn();
        menu.popupFlag = false;

        // omitted 2nd param
        menu.moveToNextItem(position);
    });

    test('moveToItem will not do anything if the menu has no items', () => {
        menu.hasItems = jest.fn().mockImplementation(() => false);
        menu.index = -1;

        menu.moveToItem(121);

        // does not change index, execution stopped early
        expect(menu.index).toEqual(-1);
    });

    test('moveToItem will not do anything if the position is < 0', () => {
        menu.index = -1;

        menu.moveToItem(-5);

        // does not change index, execution stopped early
        expect(menu.index).toEqual(-1);
    });

    test('moveToItem will not do anything if the position is > totalItems.length', () => {
        menu.index = -1;

        menu.moveToItem(menu.items.length + 1);

        // does not change index, execution stopped early
        expect(menu.index).toEqual(-1);
    });

    test('moveToItem will move the focus to the provided position', () => {
        menu.index = -1;
        const lastItem = menu.items.length - 1;
        menu.items[lastItem].node.focus = jest.fn();

        menu.moveToItem(lastItem);

        expect(menu.index).toEqual(lastItem);
        expect(menu.items[lastItem].node.focus).toHaveBeenCalledTimes(1);
    });

    test('hasItems returns true if a column has items', () => {
        menu.items = [{}];

        expect(menu.hasItems()).toEqual(1);
    });

    test('hasItems returns false if a column has no items', () => {
        menu.items = [];

        expect(menu.hasItems()).toEqual(0);
    });

    test('setIndex will set the index', () => {
        menu.index = 5;

        menu.setIndex(5);

        expect(menu.index).toEqual(5);
    });

    test('setIndex validates the input', () => {
        menu.index = 20;

        menu.setIndex('foo');

        expect(menu.index).toEqual(20);
    });

    test('blurActiveItem will blurs the current active item', () => {
        const index = 2;
        menu.index = index;
        menu.items[index].node.blur = jest.fn();

        menu.blurActiveItem();

        expect(menu.items[index].node.blur).toHaveBeenCalledTimes(1);
    });

    test('blurActiveItem will not error with an invalid index', () => {
        menu.index = -1;
        menu.blurActiveItem();
    });

    test('getNextVisibleItem returns the next visible menu item position', () => {
        menu.items[1].node.style.visibility = true;
        menu.items[1].node.getClientRects = jest.fn().mockImplementation(() => ({ length: 2 }));

        expect(menu.getNextVisibleItem(0)).toEqual(1);
    });

    test('getNextVisibleItem returns -1 if there is no next visible item', () => {
        expect(menu.getNextVisibleItem(0)).toEqual(-1);
    });


    test('getPreviousVisibleItem returns the next visible menu item position', () => {
        menu.items[1].node.style.visibility = true;
        menu.items[1].node.getClientRects = jest.fn().mockImplementation(() => ({ length: 2 }));

        expect(menu.getPreviousVisibleItem(2)).toEqual(1);
    });

    test('getPreviousVisibleItem returns -1 if there is no next visible item', () => {
        expect(menu.getPreviousVisibleItem(4)).toEqual(-1);
    });

    test('destroy resets the menu to its initial state, before initialization', () => {
        menu.popupFlag = true;
        menu.index = 10;
        expect(menu.items).toBeDefined();

        menu.destroy();

        expect(menu.popupFlag).toBeFalsy();
        expect(menu.index).toEqual(-1);
        expect(menu.items).toBeUndefined();
    });

    test('reset will destroy and reinitialize the menu', () => {
        menu.destroy = jest.fn();
        menu.init = jest.fn();

        menu.reset();

        expect(menu.destroy).toHaveBeenCalledTimes(1);
        expect(menu.init).toHaveBeenCalledTimes(1);
    });
});
