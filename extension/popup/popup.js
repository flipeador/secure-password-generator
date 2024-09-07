import * as util from './util.js';

/* global QRCode */

// Wait for all web components to fully load.
await window.document.Component.join();

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

for (const element of document.querySelectorAll('[id]'))
    window[`$${element.id}`] = element;

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

// Generate the QR code when the input fields change.
[$('issuer'), $('label'), $('secret')].forEach(input => {
    input.addEventListener('input', () => generateQrCode(500));
});

// Save all config options in the local storage.
// Only elements with the `local` attribute are saved.
$('save').addEventListener('click', () => {
    window.document.Component.save();
});

// Generate the secure random password.
$('generate').addEventListener('click', () => {
    const password = [];
    const characters = [];
    const length = $('length').value;
    const exclude = $('exc-chars').value.split('');
    const exhaustive = $('exhaustive-randomized-transfer').checked;

    if ($('letters').checked) {
        let letters = (
            $('letters-case').value === 'lower' ? LETTERS.split('') :
            $('letters-case').value === 'upper' ? LETTERS.toUpperCase().split('') :
            LETTERS.split('').concat(LETTERS.toUpperCase().split(''))
        );
        if ($('exc').checked)
            letters = letters.filter(letter => !exclude.includes(letter));
        characters.push(...letters);
        util.randomizedTransfer(letters, password, $('letters-min').value, exhaustive);
    }

    if ($('digits').checked) {
        let digits = DIGITS.split('');
        if ($('exc').checked)
            digits = digits.filter(digit => !exclude.includes(digit));
        characters.push(...digits);
        util.randomizedTransfer(digits, password, $('digits-min').value, exhaustive);
    }

    if ($('other').checked) {
        let other = $('other-chars').value.split('');
        if ($('exc').checked)
            other = other.filter(char => !exclude.includes(char));
        characters.push(...other);
        util.randomizedTransfer(other, password, $('other-min').value, exhaustive);
    }

    // Fill the password with random characters to meet the specified length.
    while (password.length < length)
        password.push(characters[util.random(0, characters.length - 1)]);

    // Ensure the password is not longer than the specified length.
    while (password.length > length)
        password.splice(util.random(0, password.length - 1), 1);

    $('password').value = util.shuffle(password).join('');
    $('password').save('value', $('password').value);
});

// Set the password in the input field of the active page.
// Focus the username field of the active page.
// Close the popup.
$('use').addEventListener('click', async () => {
    if ($('password').value === '')
        return $('password').focus();

    await executeScript(
        password => {
            // Simulate a change on an input element.
            // https://stackoverflow.com/a/75701621/14822191
            const setInputProp = (element, name, value) => {
                const prop = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    name
                );
                prop.set.call(element, value); // call the setter
                element.dispatchEvent(new Event('input', { bubbles: true }));
            };
            const inputUsername = document.querySelector('input[id=username]');
            const inputsPassword = document.querySelectorAll('input[type=password]');
            for (const inputPassword of inputsPassword)
                setInputProp(inputPassword, 'value', password);
            inputUsername?.focus?.();
        },
        $('password').value
    );

    window.close();
});

/**
 * Generate the QR code.
 * @see https://github.com/flipeador/node-otp-2fa
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
function generateQrCode(delay=0) {
    clearTimeout(generateQrCode.timer);
    generateQrCode.qrcode ??= new QRCode($('qr-code'));

    generateQrCode.timer = setTimeout(
        async () => {
            const label = $('label').value;
            const secret = $('secret').value;
            const issuer = $('issuer').value;

            if (label.includes('@') && !secret) {
                const img = $('qr-code').querySelector('img');
                const url = await util.getGravatarUrl(label);
                $('qr-code').removeAttribute('title');
                img.removeAttribute('alt');
                img.style.display = 'block';
                return img.src = url;
            }

            generateQrCode.qrcode.makeCode(getAuthUrl(issuer, label, secret));
        },
        delay
    );
}

function getAuthUrl(issuer, label, secret) {
    const iss = encodeURIComponent(issuer);
    const lab = encodeURIComponent(label);
    const sec = encodeURIComponent(secret);
    return (
        issuer === '' || label === '' ? secret : !secret ? '' :
        `otpauth://totp/${iss}:${lab}?secret=${sec}&issuer=${iss}`
    );
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
 * Inject a script into an isolated environment in the active page.
 * @see https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/scripting/executeScript
 */
async function executeScript(func, ...args) {
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func, args
    });
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

function $(id) {
    return window[`$${id}`] ??= document.querySelector(`#${id}`);
}

window.document.body.style.removeProperty('display');
