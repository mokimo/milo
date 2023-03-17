// Map the 'keyCode' values to their 'code' counterparts
const keyMap = {
    9: 'Tab',
    13: 'Enter',
    27: 'Escape',
    32: 'Space',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
};

/**
 * This acts as a polyfill for the `keyCode` value of a KeyboardEvent;
 * if the event does not have a `code` property value,
 * then it will use the `keyCode` to generate the appropriate key name.
 * `code` is being used instead of `key` because its values
 * are more consistent across browsers
 * @param {KeyboardEvent} event The keyboard event
 * for which the key code needs to be returned
 * @return {String} The `code` value of the key that has been pressed
 */
const getEventKey = (event) => {
    const { code, keyCode } = event;

    return code || keyMap[keyCode];
};

export default getEventKey;
