import getEventKey from '../getEventKey';

describe('getEventKey', () => {
    test('getEventKey should be defined', () => {
        expect(getEventKey).toBeDefined();
        expect(typeof getEventKey).toBe('function');
    });

    test('getEventKey should return a code string', () => {
        // Tab key
        const tabCodeEvent = new window.KeyboardEvent('keydown', { code: 'Tab' });
        expect(getEventKey(tabCodeEvent)).toBe('Tab');
        const tabKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 9 });
        expect(getEventKey(tabKeyCodeEvent)).toBe('Tab');
        // Enter key
        const enterCodeEvent = new window.KeyboardEvent('keydown', { code: 'Enter' });
        expect(getEventKey(enterCodeEvent)).toBe('Enter');
        const enterKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 13 });
        expect(getEventKey(enterKeyCodeEvent)).toBe('Enter');
        // Escape key
        const escapeCodeEvent = new window.KeyboardEvent('keydown', { code: 'Escape' });
        expect(getEventKey(escapeCodeEvent)).toBe('Escape');
        const escapeKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 27 });
        expect(getEventKey(escapeKeyCodeEvent)).toBe('Escape');
        // Space key
        const spaceCodeEvent = new window.KeyboardEvent('keydown', { code: 'Space' });
        expect(getEventKey(spaceCodeEvent)).toBe('Space');
        const spaceKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 32 });
        expect(getEventKey(spaceKeyCodeEvent)).toBe('Space');
        // Arrow Left
        const arrowLeftCodeEvent = new window.KeyboardEvent('keydown', { code: 'ArrowLeft' });
        expect(getEventKey(arrowLeftCodeEvent)).toBe('ArrowLeft');
        const arrowLeftKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 37 });
        expect(getEventKey(arrowLeftKeyCodeEvent)).toBe('ArrowLeft');
        // Arrow Up
        const arrowUpCodeEvent = new window.KeyboardEvent('keydown', { code: 'ArrowUp' });
        expect(getEventKey(arrowUpCodeEvent)).toBe('ArrowUp');
        const arrowUpKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 38 });
        expect(getEventKey(arrowUpKeyCodeEvent)).toBe('ArrowUp');
        // Arrow Right
        const arrowRightCodeEvent = new window.KeyboardEvent('keydown', { code: 'ArrowRight' });
        expect(getEventKey(arrowRightCodeEvent)).toBe('ArrowRight');
        const arrowRightKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 39 });
        expect(getEventKey(arrowRightKeyCodeEvent)).toBe('ArrowRight');
        // Arrow Down
        const arrowDownCodeEvent = new window.KeyboardEvent('keydown', { code: 'ArrowDown' });
        expect(getEventKey(arrowDownCodeEvent)).toBe('ArrowDown');
        const arrowDownKeyCodeEvent = new window.KeyboardEvent('keydown', { keyCode: 40 });
        expect(getEventKey(arrowDownKeyCodeEvent)).toBe('ArrowDown');
    });
});
