/* global QRCode */

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

// Length
const inputLength = document.querySelector('#length');
// Letters
const checkboxLetters = document.querySelector('#letters');
const selectLettersCase = document.querySelector('#letters-case');
const inputLettersMin = document.querySelector('#letters-min');
// Digits
const checkboxDigits = document.querySelector('#digits');
const inputDigitsMin = document.querySelector('#digits-min');
// Other characters
const checkboxOther = document.querySelector('#other');
const inputOtherChars = document.querySelector('#other-chars');
const inputOtherMin = document.querySelector('#other-min');
// Excluded characters
const checkboxExc = document.querySelector('#exc');
const inputExcChars = document.querySelector('#exc-chars');
// Exhaustive randomized transfer
const checkboxExRaTr = document.querySelector('#exhaustive-randomized-transfer');
// Password
const inputPassword = document.querySelector('#password');
const buttonPasswordEye = document.querySelector('#password-eye');
const svgPasswordEye = document.querySelector('#password-eye svg:first-child');
const svgPasswordEyeOff = document.querySelector('#password-eye svg:last-child');
const buttonPasswordCopy = document.querySelector('#password-copy');
// Buttons
const buttonSave = document.querySelector('#save');
const buttonGenerate = document.querySelector('#generate');
const buttonUse = document.querySelector('#use');

const inputIssuer = document.querySelector('#issuer');
const inputLabel = document.querySelector('#label');
const inputSecret = document.querySelector('#secret');

for (const tab of document.querySelectorAll('.tab')) {
    const n = tab.getAttribute('tab');

    // Translate vertical scroll to horizontal scroll.
    // Allows the user to scroll the tab buttons horizontally.
    // Needed when the window is too small to display all buttons.
    tab.addEventListener('wheel', event => {
        event.preventDefault();
        event.currentTarget.scroll(event.deltaY, 0);
    });

    const buttons = tab.querySelectorAll('& > button');
    buttons.forEach((button, i) => {
        button.addEventListener('click', event => {
            // Remove the focus from the tab button.
            event.target.blur();

            // Later, scroll the tab button into view.
            setTimeout(() => event.target.scrollIntoView());

            // Toggle the 'open' attribute of the tab buttons.
            // Use view transitions to animate the underlining.
            startViewTransition(toggleAttribute, buttons, event.target);

            // Toggle the 'open' attribute of the tab contents.
            toggleAttribute(
                `.tab-content[tab*="${n}-"]`, // all contents associated with the current tab
                `.tab-content[tab="${n}-${i+1}"]` // the content associated with the current tab button
            );

            if (button.name === 'generate-qr-code')
                generateQrCode.qrcode || generateQrCode(); // just the first time
        });
    });
}

// Select all input elements of type `number`.
for (const input of document.querySelectorAll('input[type="number"]')) {
    // Allow the user to increase or decrease the value with the mouse wheel.
    input.addEventListener('wheel', event => {
        const input = event.currentTarget;

        // Do nothing if the input is not focused.
        if (document.activeElement !== input)
            return;

        event.preventDefault();

        const step = event.deltaY > 0 ? 1 : -1;
        const value = Number(input.value) - step;
        input.value = clamp(value, input.min, input.max);

        setStorage(input);
    });
}

for (const element of document.querySelectorAll('*')) {
    if (!element.hasAttribute('session')
    && !element.hasAttribute('local'))
        continue;

    // Get the session or local value for the element.
    const storage = await getStorage(element);

    if (storage !== undefined)
        element.value = storage.value;

    if (element.type === 'checkbox')
        handleCheckbox(element);

    element.addEventListener('input', event => {
        event.preventDefault();
        const target = event.currentTarget;

        if (target.hasAttribute('unique')) {
            const value = new Set(target.value);
            target.value = [...value].join('');
        }

        if (target.type === 'number') {
            console.log(target.value);
            const value = target.value.replace(/[^\d]+/, '');
            target.value = clamp(value, target.min, target.max);
        }

        if (target.type === 'checkbox')
            handleCheckbox(target);

        setStorage(target);
    });
}

// Generate the QR code when the input fields are changed.
[inputIssuer, inputLabel, inputSecret].forEach(input => {
    input.addEventListener('input', () => generateQrCode(500));
});

// Alternate between showing the password and hiding it.
buttonPasswordEye.addEventListener('click', () => {
    const type = inputPassword.getAttribute('type');
    inputPassword.setAttribute('type',
        type === 'password' ? 'text' : 'password'
    );
    startViewTransition(() => {
        svgPasswordEye.style.display = type === 'password' ? 'block' : 'none';
        svgPasswordEyeOff.style.display = type === 'password' ? 'none' : 'block';
    });
});

// Copy the current password to the clipboard.
buttonPasswordCopy.addEventListener('click', () => {
    const password = inputPassword.value;
    navigator.clipboard.writeText(password);
});

// Save all config options in the local storage.
// Only elements with the `local` attribute are saved.
buttonSave.addEventListener('click', () => {
    const elements = document.querySelectorAll('[local]');
    return chrome.storage.local.set(
        [...elements].reduce(
            (object, element) => {
                object[element.id] = {
                    value: element.value
                };
                return object;
            },
            { }
        )
    );
});

// Generate the secure random password.
buttonGenerate.addEventListener('click', () => {
    const password = [];
    const characters = [];
    const length = inputLength.value;
    const exclude = inputExcChars.value.split('');

    if (checkboxLetters.value) {
        let letters = (
            selectLettersCase.value === 'lower' ? LETTERS.split('') :
            selectLettersCase.value === 'upper' ? LETTERS.toUpperCase().split('') :
            LETTERS.split('').concat(LETTERS.toUpperCase().split(''))
        );
        if (checkboxExc.value)
            letters = letters.filter(letter => !exclude.includes(letter));
        characters.push(...letters);
        randomizedTransfer(letters, password, inputLettersMin.value);
    }

    if (checkboxDigits.value) {
        let digits = DIGITS.split('');
        if (checkboxExc.value)
            digits = digits.filter(digit => !exclude.includes(digit));
        characters.push(...digits);
        randomizedTransfer(digits, password, inputDigitsMin.value);
    }

    if (checkboxOther.value) {
        let other = inputOtherChars.value.split('');
        if (checkboxExc.value)
            other = other.filter(char => !exclude.includes(char));
        characters.push(...other);
        randomizedTransfer(other, password, inputOtherMin.value);
    }

    // Fill the password with random characters to meet the specified length.
    while (password.length < length)
        password.push(characters[random(0, characters.length - 1)]);

    // Ensure the password is not longer than the specified length.
    while (password.length > length)
        password.splice(random(0, password.length - 1), 1);

    inputPassword.value = shuffle(password).join('');
    setStorage(inputPassword);
});

// Set the password in the input field of the active page.
// Focus the username field of the active page.
// Close the popup.
buttonUse.addEventListener('click', async () => {
    if (inputPassword.value === '')
        return inputPassword.focus();

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    function func(password) {
        const inputUsername = document.querySelector('input[id=username]');
        const inputPassword = document.querySelector('input[type=password]');

        // https://stackoverflow.com/a/75701621/14822191
        Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        ).set.call(
            document.querySelector('input[type=password]'),
            password
        );

        const event = new Event('input', { bubbles: true });
        inputPassword.dispatchEvent(event);

        inputUsername.focus();
    }

    await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func, args: [inputPassword.value]
    });

    window.close(); // close the popup
});

/**
 * Get the value for the specified element from the storage.
 */
async function getStorage(element) {
    let storage = await chrome.storage.session.get(element.id);
    if (storage[element.id] === undefined)
        storage = await chrome.storage.local.get(element.id);
    return storage[element.id];
}

/**
 * Save the value for the specified element in the session storage.
 *
 * Only elements with the `session` attribute are saved.
 * @param {HTMLElement} element
 */
async function setStorage(element) {
    if (!element.hasAttribute('session'))
        return;
    return chrome.storage.session.set({
        [element.id]: {
            value: element.value
        }
    });
}

/**
 * Set the `disabled` attribute for elements associated with the specified checkbox.
 * @param {HTMLInputElement} cb
 */
function handleCheckbox(cb) {
    const elements = document.querySelectorAll(`[id*=${cb.id}-]`);
    for (const element of elements) {
        element.disabled = !cb.value;
        if (element.hasAttribute('focus'))
            element.focus();
    }
}

/**
 * Generate the QR code.
 * @see https://github.com/flipeador/node-otp-2fa
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
function generateQrCode(delay=0) {
    generateQrCode.qrcode ??= new QRCode(
        document.querySelector('.qr-code')
    );

    clearTimeout(generateQrCode.timer);

    generateQrCode.timer = setTimeout(() => {
        const issuer = encodeURIComponent(inputIssuer.value);
        const label = encodeURIComponent(inputLabel.value);
        const secret = encodeURIComponent(inputSecret.value);
        generateQrCode.qrcode.makeCode(
            issuer === '' || label === '' ? inputSecret.value : !secret ? '' :
            `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`
        );
    }, delay);
}

/**
 * Randomly selects elements from `source` and transfers them to `target`.
 * @param {array} source
 * The array to select elements from.
 * @param {array} target
 * The array to add selected elements to.
 * @param {number} count
 * The number of elements to select and transfer.
 * @param {boolean} [exhaustive]
 * Whether to ensure all elements from `source` are used before repeating any.
 * @returns {array}
 */
function randomizedTransfer(source, target, count, exhaustive) {
    exhaustive ??= checkboxExRaTr.value;

    if (exhaustive) {
        let array = source.slice();
        for (let i = 0; i < count; ++i) {
            if (array.length === 0) array = source.slice();
            target.push(array.splice(random(0, array.length - 1), 1)[0]);
        }
    } else for (let i = 0; i < count; ++i)
        target.push(source[random(0, source.length - 1)]);

    return target;
}

/**
 * Shuffle an array.
 * @param {array} target
 * @returns {array}
 */
function shuffle(target) {
    for (let i = target.length - 1; i > 0; --i) {
        const j = random(0, i);
        [target[i], target[j]] = [target[j], target[i]];
    }
    return target;
}

/**
 * Generate a random number in a given range.
 * @param {number} min
 * @param {number} max
 * @see https://developer.mozilla.org/docs/Web/API/Crypto/getRandomValues
 */
function random(min, max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomValue = array[0] / (0xFFFFFFFF + 1);
    return Math.floor(randomValue * (max - min + 1)) + min;
}

/**
 * Clamp a number between a minimum and maximum value.
 * @param {any} value
 * @param {number} min
 * @param {number} max
 * @param {number} def
 * @returns {number}
 */
function clamp(value, min, max, def=NaN) {
    value = Number(value); min ||= 0; max ||= 99;
    value = value > max ? max : value < min ? min : value;
    return isNaN(value) ? def : value;
}

function toggleAttribute(elements, target, name='open') {
    if (typeof(elements) === 'string')
        elements = document.querySelectorAll(elements);
    if (typeof(target) === 'string')
        target = document.querySelector(target);
    for (const element of elements)
        element.removeAttribute(name);
    target.setAttribute(name, '');
}

/**
 * Starts a new same-document (SPA) view transition.
 * @param {Function} fn
 * @param {...any} args
 * @see https://developer.mozilla.org/docs/Web/API/Document/startViewTransition
 */
function startViewTransition(fn, ...args) {
    if (!document.startViewTransition) return fn(...args);
    return document.startViewTransition(() => fn(...args));
}
