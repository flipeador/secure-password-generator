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
        $otpcode
        $otpsec
        $downloadqrcode
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
import { padotp, totp, otpauthURL } from '../lib/otp2fa.js';
import { Component } from '../lib/components/component.js';

const DIGITS = '0123456789';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Wait for all web components to fully load.
await Component.ready();

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

$downloadqrcode.on('click', () => $qrcode.download());

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
            const setInputValue = ($input, value) => {
                const prop = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                );
                prop.set.call($input, value); // call the setter
                $input.dispatchEvent(new Event('input', { bubbles: true }));
            };
            const inputUsername = document.querySelector('input[id=username]');
            const inputsPassword = document.querySelectorAll('input[type=password]');
            for (const inputPassword of inputsPassword)
                setInputValue(inputPassword, password);
            inputUsername?.focus?.();
        },
        $password.value
    );

    window.close();
});

/**
 * Generate the QR code or Gravatar image.
 */
function generateQrCode(delay=0) {
    clearTimeout(generateQrCode.qrTimer);
    clearTimeout(generateQrCode.otpTimer);

    generateQrCode.qrTimer = setTimeout(
        () => util.startViewTransition(() => {
            if (!$secret.value && /.+@.+\..+/.test($label.value))
                return util.getGravatarUrl($label.value, 256 - 12)
                .then(url => {
                    setTimeout(() => $gravatar.src = url);
                    return new Promise((resolve, reject) => {
                        $gravatar.onerror = reject;
                        $gravatar.onload = () => resolve(
                            util.toggleDisplay($gravatar, $qrcode)
                        );
                    });
                });

            util.toggleDisplay($qrcode, $gravatar);

            $qrcode.value = (
                $issuer.value && $label.value && $secret.value ?
                otpauthURL($issuer.value, $label.value, $secret.value) :
                $secret.value
            );

            $otpsec.style.setProperty('--angle', '360deg');
            $otpcode.value = '000000'; $otpsec.textContent = '30';
            generateQrCode.otpTimer = setInterval(() => updateTOTP(), 1000);
            return updateTOTP();
        }),
        delay
    );
}

async function updateTOTP(period=30) {
    if ($secret.value.length < 5 || $tabview.active.name !== 'qrcode')
        return;
    try {
        const time = Math.floor(Date.now() / 1000);
        const seconds = period - time % period;
        $otpcode.value = padotp(await totp($secret.value, time), 6);
        $otpsec.textContent = `${seconds}`.padStart(2, '0');
        $otpsec.style.setProperty('--angle', `${(seconds / 30) * 360}deg`);
    } catch { /* EMPTY */ }
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
