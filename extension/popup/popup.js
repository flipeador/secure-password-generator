/*
    global
        $tabview
        $length
        $letters
        $digits
        $excludechars
        $otherchars
        $othermin
        $letterscase
        $lettersmin
        $digitsmin
        $other
        $exclude
        $exhaustive
        $password
        $issuer
        $label
        $secret
        $qrcode
        $gravatar
        $clearlocal
        $clearsession
        $import
        $export
        $save
        $generate
        $use
*/

import * as util from '../lib/util.js';
import { Component } from '../lib/components/component.js';

// Wait for all web components to fully load.
await Component.ready();

const DIGITS = '0123456789';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Make all elements with an ID globally available.
for (const element of document.querySelectorAll('[id]'))
    window[`$${element.id}`] = element;

// Set an event listener which runs once for each tab.
$tabview.on('load', () => {
    // Generate the QR code when the tab is activated.
    if ($tabview.active.name === 'qrcode')
        generateQrCode();
});

// Generate the QR code when the input fields change.
[$issuer, $label, $secret].forEach(input => {
    input.on('input', () => generateQrCode(500));
});

$clearlocal.on('click', () => {
    chrome.storage.local.clear();
});

$clearsession.on('click', () => {
    chrome.storage.session.clear();
});

$import.on('click', async event => {
    event.target.disabled = true;
    const storage = await chrome.storage.sync.get();
    await chrome.storage.local.set(storage);
    await chrome.storage.session.clear();
    window.close();
});

$export.on('click', async event => {
    event.target.disabled = true;
    const storage = await chrome.storage.local.get();
    Object.keys(storage).length ?
    chrome.storage.sync.set(storage) :
    chrome.storage.sync.clear();
});

// Save all config options in the local storage.
// Only elements with the `local` attribute are saved.
$save.on('click', () => Component.save() );

// Generate the secure random password.
$generate.on('click', () => {
    const password = [];
    const characters = [];
    const length = $length.value;
    const exclude = $excludechars.value.split('');
    const exhaustive = $exhaustive.checked;

    if ($letters.checked) {
        let letters = (
            $letterscase.value === 'lower' ? LETTERS.split('') :
            $letterscase.value === 'upper' ? LETTERS.toUpperCase().split('') :
            LETTERS.split('').concat(LETTERS.toUpperCase().split(''))
        );
        if ($exclude.checked)
            letters = letters.filter(letter => !exclude.includes(letter));
        characters.push(...letters);
        util.randomizedTransfer(letters, password, $lettersmin.value, exhaustive);
    }

    if ($digits.checked) {
        let digits = DIGITS.split('');
        if ($exclude.checked)
            digits = digits.filter(digit => !exclude.includes(digit));
        characters.push(...digits);
        util.randomizedTransfer(digits, password, $digitsmin.value, exhaustive);
    }

    if ($other.checked) {
        let other = $otherchars.value.split('');
        if ($exclude.checked)
            other = other.filter(char => !exclude.includes(char));
        characters.push(...other);
        util.randomizedTransfer(other, password, $othermin.value, exhaustive);
    }

    // Fill the password with random characters to meet the specified length.
    while (password.length < length)
        password.push(characters[util.random(0, characters.length - 1)]);

    // Ensure the password is not longer than the specified length.
    while (password.length > length)
        password.splice(util.random(0, password.length - 1), 1);

    $password.value = util.shuffle(password).join('');
    $password.save('value', $password.value); // session storage
});

// Set the password input field(s) in the active page.
// Focus the username input field in the active page.
// Close the popup.
$use.on('click', async () => {
    if ($password.value === '')
        return $password.focus();

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
        $password.value
    );

    window.close();
});

/**
 * Generate the QR code or Gravatar image.
 * @see https://github.com/flipeador/node-otp-2fa
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
function generateQrCode(delay=0) {
    clearTimeout(generateQrCode.timer);

    generateQrCode.timer = setTimeout(
        () => util.startViewTransition(() => {
            if (!$secret.value && /.+@.+\..+/.test($label.value))
                return util.getGravatarUrl($label.value).then(url => {
                    setTimeout(() => $gravatar.src = url);
                    return new Promise((resolve, reject) => {
                        $gravatar.onerror = reject;
                        $gravatar.onload = () => resolve(util.toggleDisplay($gravatar, $qrcode));
                    });
                });

            util.toggleDisplay($qrcode, $gravatar);
            $qrcode.value = getAuthUrl($issuer.value, $label.value, $secret.value);
        }),
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

window.document.body.style.removeProperty('display');
