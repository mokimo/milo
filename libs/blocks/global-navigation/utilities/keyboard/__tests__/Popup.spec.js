import Popup from '../Popup';
import Item from '../Item';
import Menu from '../Menu';
import Column from '../Column';
import DOM from '../__mocks__/menu.html';
import selectors from '../Selectors';

const Config = {
    defaultSelectors: selectors(),
    subnavSelectors: selectors('subnav'),
};

describe('Popup Tests', () => {
    let popup;
    const { closeAll } = Popup;
    beforeEach(() => {
        document.body.innerHTML = DOM;
        const node = document.querySelector('.feds-popup');
        const parent = new Item(node.querySelector('.feds-navLink'), 0, new Menu(document.querySelector('#gnav_2 > .feds-navList > #gnav_2_1 .feds-navList'), ''));
        popup = new Popup(node, parent);

        Popup.closeAll = closeAll;
    });

    afterEach(() => {
        popup = null;
        document.body.innerHTML = '';
    });

    test('instance without DOM node does not expose anything', () => {
        const malFormedPopup = new Popup(undefined, undefined);
        expect(malFormedPopup.node).toBeUndefined();
        expect(malFormedPopup.item).toBeUndefined();
        expect(malFormedPopup.menu).toBeUndefined();
    });

    test('instance exposes various methods', () => {
        expect(popup.init).toBeDefined();
        expect(popup.moveToPreviousColumn).toBeDefined();
        expect(popup.moveToNextColumn).toBeDefined();
        expect(popup.moveToFirstColumnItem).toBeDefined();
        expect(popup.moveToLastColumnItem).toBeDefined();
        expect(popup.hasItems).toBeDefined();
        expect(popup.isExpanded).toBeDefined();
        expect(popup.expand).toBeDefined();
        expect(popup.adjustPopupPosition).toBeDefined();
        expect(popup.reset).toBeDefined();
        expect(Popup.closeAll).toBeDefined();
        expect(Popup.closeOnOutsideClick).toBeDefined();
    });

    test('init exposes items and index', () => {
        popup.init();

        expect(popup.items).toBeDefined();
        expect(popup.items[0]).toBeInstanceOf(Column);
        expect(popup.index).toEqual(-1);
    });

    test('moveToPreviousColumn not do anything if it has no items', () => {
        const position = 2;
        popup.hasItems = jest.fn().mockImplementation(() => false);

        popup.moveToPreviousColumn(position);

        // not "position - 1", so we can assume the code stopped executing early
        expect(popup.index).toEqual(-1);
    });

    test('moveToPreviousColumn moves focus to the parent menu item', () => {
        const spyFn = jest.spyOn(popup.menu, 'moveToItem');
        popup.moveToPreviousColumn(0, 'first');
        expect(popup.index).toEqual(-1);
        expect(spyFn).toHaveBeenCalled();
    });

    test('moveToPreviousColumn moves focus to the first column item', () => {
        const position = 2;
        popup.items[position - 1].moveToColumnItem = jest.fn();

        popup.moveToPreviousColumn(position, 'first');

        expect(popup.index).toEqual(position - 1);
        expect(popup.items[position - 1].moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(popup.items[position - 1].moveToColumnItem.mock.calls[0][0]).toEqual(0);
    });

    test('moveToPreviousColumn moves focus to the last column item', () => {
        const items = [{}, {}];
        const position = 2;
        popup.items[position - 1].items = items;
        popup.items[position - 1].moveToColumnItem = jest.fn();

        popup.moveToPreviousColumn(position, 'last');

        expect(popup.index).toEqual(position - 1);
        expect(popup.items[position - 1].moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(popup.items[position - 1].moveToColumnItem.mock.calls[0][0])
            .toEqual(items.length - 1);
    });

    test('moveToNextColumn not do anything if it has no items', () => {
        const position = 2;
        popup.hasItems = jest.fn().mockImplementation(() => false);

        popup.moveToNextColumn(position);

        // not "position + 1", so we can assume the code stopped executing early
        expect(popup.index).toEqual(-1);
    });

    test('moveToNextColumn moves focus to the first column item', () => {
        const items = [{}, {}];
        const position = 0;
        popup.items[position + 1].items = items;
        popup.items[position + 1].moveToColumnItem = jest.fn();

        popup.moveToNextColumn(position, 'first', true);

        expect(popup.index).toEqual(position + 1);
        expect(popup.items[position + 1].moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(popup.items[position + 1].moveToColumnItem.mock.calls[0][0])
            .toEqual(0);
    });


    test('moveToNextColumn moves focus to the last column item', () => {
        const items = [{}, {}];
        const position = 0;
        popup.items[position + 1].items = items;
        popup.items[position + 1].moveToColumnItem = jest.fn();

        popup.moveToNextColumn(position, 'last', true);

        expect(popup.index).toEqual(position + 1);
        expect(popup.items[position + 1].moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(popup.items[position + 1].moveToColumnItem.mock.calls[0][0])
            .toEqual(items.length - 1);
    });

    test('moveToNextColumn moves focus to the next menu item', () => {
        popup.menu.moveToNextItem = jest.fn();

        popup.moveToNextColumn(1, 'last', true);

        expect(popup.menu.moveToNextItem).toHaveBeenCalledTimes(1);
    });

    test('moveToNextColumn moves focus to the parent menu item', () => {
        popup.menu.moveToItem = jest.fn();

        popup.moveToNextColumn(1, 'last', false);

        expect(popup.menu.moveToItem).toHaveBeenCalledTimes(1);
    });

    test('moveToFirstColumnItem does not to anything if there are no items', () => {
        popup.hasItems = jest.fn().mockImplementation(() => false);
        popup.items[0].moveToColumnItem = jest.fn();

        popup.moveToFirstColumnItem();

        expect(popup.items[0].moveToColumnItem).toHaveBeenCalledTimes(0);
    });

    test('moveToFirstColumnItem moves focus to the first column item in the popup', () => {
        popup.items[0].moveToColumnItem = jest.fn();

        popup.moveToFirstColumnItem();

        expect(popup.items[0].moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(popup.items[0].moveToColumnItem.mock.calls[0][0]).toEqual(0);
        expect(popup.index).toEqual(0);
    });

    test('moveToLastColumnItem does not to anything if there are no items', () => {
        popup.hasItems = jest.fn().mockImplementation(() => false);
        const lastColumnIndex = popup.items.length - 1;
        const lastColumn = popup.items[lastColumnIndex];
        lastColumn.moveToColumnItem = jest.fn();

        popup.moveToLastColumnItem();

        expect(lastColumn.moveToColumnItem).toHaveBeenCalledTimes(0);
    });

    test('moveToLastColumnItem moves focus to the last column item in the popup', () => {
        const lastColumnIndex = popup.items.length - 1;
        const lastColumn = popup.items[lastColumnIndex];
        const lastColumnItemIndex = lastColumn.items.length - 1;
        lastColumn.moveToColumnItem = jest.fn();

        popup.moveToLastColumnItem();

        expect(lastColumn.moveToColumnItem).toHaveBeenCalledTimes(1);
        expect(lastColumn.moveToColumnItem.mock.calls[0][0]).toEqual(lastColumnItemIndex);
        expect(popup.index).toEqual(lastColumnIndex);
    });

    test('hasItems returns true if a column has items', () => {
        popup.items = [{}];

        expect(popup.hasItems()).toEqual(1);
    });

    test('hasItems returns false if a column has no items', () => {
        popup.items = [];

        expect(popup.hasItems()).toEqual(0);
    });

    test('isExpanded returns false if the popup is not expanded', () => {
        popup.item.node.setAttribute('aria-expanded', 'false');
        expect(popup.isExpanded()).toEqual(false);
    });

    test('isExpanded returns true if the popup is expanded', () => {
        popup.item.node.setAttribute('aria-expanded', 'true');
        expect(popup.isExpanded()).toEqual(true);
    });

    test('expand expands the popup', () => {
        Popup.closeAll = jest.fn();
        popup.adjustPopupPosition = jest.fn();
        popup.menu.region = 'subnav';
        popup.node.classList.remove(popup.menu.selectors.openPopup);
        popup.item.node.setAttribute('aria-expanded', 'false');
        popup.item.node.setAttribute('daa-lh', 'header|Open');
        expect(popup.item.node.parentElement.classList.contains('is-open')).toEqual(false);

        popup.expand();

        expect(popup.node.classList.contains(popup.menu.selectors.openPopup)).toEqual(true);
        expect(popup.item.node.getAttribute('aria-expanded')).toEqual('true');
        expect(popup.item.node.getAttribute('daa-lh')).toEqual('header|Close');
        expect(popup.item.node.parentElement.classList.contains('is-open')).toEqual(true);
        expect(Popup.closeAll).toHaveBeenCalledTimes(1);
        expect(popup.adjustPopupPosition).toHaveBeenCalledTimes(1);
    });

    test('closeAll closes all popups', () => {
        const popupEl = document.querySelector(`.${Config.defaultSelectors.popup}`);
        popupEl.classList.add(Config.defaultSelectors.openPopup);
        const triggerEl = popupEl.previousElementSibling;
        triggerEl.setAttribute('daa-lh', 'header|Close');
        triggerEl.setAttribute('aria-expanded', 'true');
        const itemWrapper = triggerEl.parentElement;
        itemWrapper.classList.add('is-open');

        Popup.closeAll();

        expect(popupEl.classList.contains(Config.defaultSelectors.openPopup)).toEqual(false);
        expect(triggerEl.getAttribute('aria-expanded')).toEqual('false');
        expect(triggerEl.getAttribute('daa-lh')).toEqual('header|Open');
        expect(itemWrapper.classList.contains('is-open')).toEqual(false);
    });

    test('closeAll with parameters closes all popups', () => {
        const popupEl = document.querySelector(`.${Config.defaultSelectors.popup}`);
        popupEl.classList.add(Config.defaultSelectors.openPopup);
        const triggerEl = popupEl.previousElementSibling;
        triggerEl.setAttribute('daa-lh', 'header|Close');
        triggerEl.setAttribute('aria-expanded', 'true');
        const itemWrapper = triggerEl.parentElement;
        itemWrapper.classList.add('is-open');

        Popup.closeAll(document.documentElement);

        expect(popupEl.classList.contains(Config.defaultSelectors.openPopup)).toEqual(false);
        expect(triggerEl.getAttribute('aria-expanded')).toEqual('false');
        expect(triggerEl.getAttribute('daa-lh')).toEqual('header|Open');
        expect(itemWrapper.classList.contains('is-open')).toEqual(false);
    });

    test('closeAll keeps the analytics attribute', () => {
        const popupEl = document.querySelector(`.${Config.defaultSelectors.popup}`);
        popupEl.classList.add(Config.defaultSelectors.openPopup);
        const triggerEl = popupEl.previousElementSibling;
        triggerEl.setAttribute('daa-lh', 'header|Open');
        triggerEl.setAttribute('aria-expanded', 'true');

        Popup.closeAll();

        expect(triggerEl.getAttribute('daa-lh')).toEqual('header|Open');
    });

    test('closeOnOutsideClick will close popups', (done) => {
        const popupEl = document.querySelector(`.${Config.defaultSelectors.popup}`);
        popupEl.classList.add(Config.defaultSelectors.openPopup);
        Popup.closeAll = jest.fn();

        Popup.closeOnOutsideClick();

        // settimeout to wait for event listener registration
        setTimeout(() => {
            document.onclick = () => {
                expect(Popup.closeAll).toHaveBeenCalledTimes(1);
                done();
            };
            document.documentElement.click();
        }, 0);
    });

    test('adjustPopupPosition moves the popup to a better place', () => {
        const nodeMock = {
            getBoundingClientRect: () => ({
                width: -1,
                left: -1,
            }),
            style: {
                left: 'mock',
            },
        };
        popup.adjustPopupPosition(nodeMock);

        expect(nodeMock.style.left).toEqual('1px');
    });

    test('adjustPopupPosition moves the popup to a better position', () => {
        const nodeMock = {
            getBoundingClientRect: () => ({
                width: -1,
                right: 1,
            }),
            style: {
                left: 'mock',
            },
        };
        popup.adjustPopupPosition(nodeMock);

        expect(nodeMock.style.left).toEqual('-1px');
    });

    test('reset resets the instance', () => {
        expect(popup.items).toBeDefined();
        expect(popup.node).toBeDefined();
        expect(popup.item).toBeDefined();
        expect(popup.menu).toBeDefined();

        popup.reset();

        expect(popup.items).toBeUndefined();
        expect(popup.node).toBeUndefined();
        expect(popup.item).toBeUndefined();
        expect(popup.menu).toBeUndefined();
        expect(popup.index).toEqual(-1);
    });
});
