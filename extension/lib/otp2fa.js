/**
 * One-time password implementation by @flipeador.
 * https://github.com/flipeador/secure-password-generator
 *
 * Works in the browser and in NodeJS.
 *
 * Special thanks to ChatGPT for its incredible skills.
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Convert a number into an 8-byte buffer.
 * @param {number} number
 */
export function intToBuffer(number) {
    const buffer = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        buffer[i] = number & 0xFF;
        number >>= 8;
    }
    return buffer;
}

/**
 * Convert a base32 string into a buffer.
 * @param {string} base32
 */
export function base32ToBuffer(base32) {
    const bytes = []; let bits = 0; let value = 0;

    for (const char of base32.replace(/[=]+$/, '')) {
        const index = CHARS.indexOf(char.toUpperCase());
        if (index === -1)
            throw new Error(`Invalid character: ${char}`);
        value = (value << 5) | index; bits += 5;
        if (bits >= 8)
            bytes.push((value >> (bits -= 8)) & 0xFF);
    }

    return new Uint8Array(bytes);
}

/**
 * Pad an otp number with leading zeros.
 * @param {number} otp
 * @param {number} [digits=10]
 * The number of trailing digits to get. \
 * It should be a value between 6 and 10.
 */
export function padotp(otp, digits=10) {
    return `${otp}`.padStart(digits, '0').slice(-digits);
}

/**
 * Generates an HMAC-based one-time password (HOTP).
 * @param {Uint8Array|string} secret
 * The shared secret key used to generate the HMAC.
 * @param {Uint8Array|number} counter
 * The counter value, incremented each time an OTP is generated.
 * @param {'SHA-1'|'SHA-256'|'SHA-512'} [algorithm='SHA-1']
 * The hash algorithm used in the HMAC function.
 * @returns {Promise<number>}
 * A promise that resolves to a 31-bit integer representing the generated OTP.
 */
export async function hotp(secret, counter, algorithm='SHA-1') {
    if (typeof(secret) === 'string')
        secret = base32ToBuffer(secret);
    if (typeof(counter) === 'number')
        counter = intToBuffer(counter);

    // Generate a signature using the HMAC algorithm.
    // https://developer.mozilla.org/docs/Web/API/SubtleCrypto/sign
    const buffer = new Uint8Array(
        await crypto.subtle.sign(
            'HMAC',
            // Import the secret key to create a cryptographic key.
            // https://developer.mozilla.org/docs/Web/API/SubtleCrypto/importKey
            await crypto.subtle.importKey(
                'raw', // the key material is in raw binary format
                secret, // the secret used as the key for the HMAC
                { name: 'HMAC', hash: algorithm },
                false, // the key is non-extractable
                ['sign'] // the key can only be used for signing
            ),
            counter // the data to be signed
        ) // ArrayBuffer
    );

    // Extract the last 4 bits of the hash buffer as a decimal integer.
    // The offset indicates where in the hash to start extracting the OTP.
    const offset = buffer[buffer.length - 1] & 0xF;

    // Extract 4 bytes starting from the calculated offset.
    const otp = // dynamic truncation
        buffer[offset] << 24 | buffer[offset + 1] << 16 |
        buffer[offset + 2] << 8 | buffer[offset + 3];

    // Clear the highest bit, ensuring the result is a 31-bit integer.
    return otp & 0x7FFFFFFF;
}

/**
 * Generates a time-based one-time password (TOTP).
 * @param {Uint8Array} secret
 * The shared secret key used to generate the HMAC.
 * @param {number} time
 * The Unix timestamp, in seconds.
 * @param {number} [period=30]
 * The period that the passcode will be valid for, in seconds.
 * @param {'SHA-1'|'SHA-256'|'SHA-512'} [algorithm='SHA-1']
 * The hash algorithm used in the HMAC function.
 * @returns {Promise<number>}
 *  A promise that resolves to a 31-bit integer representing the generated OTP.
 * @example
 * const time = Math.floor(Date.now() / 1000);
 * const code = await totp(generateSecret(), time, 30);
 * console.log(padotp(code, 6), 30-time%30, 'seconds');
 */
export async function totp(secret, time, period=30, algorithm='SHA-1') {
    const counter = Math.floor(time / period);
    return await hotp(secret, counter, algorithm);
}

/**
 * Generates a random base32 secret of the specified length.
 * @param {number} [length=24]
 */
export function generateSecret(length=24) {
    let secret = '';
    while (length-- > 0)
        secret += CHARS[Math.floor(Math.random() * CHARS.length)];
    return secret;
}

/**
 * Generates an OTP Auth URL, to be encoded in a QR code.
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
export function otpauthURL(issuer, label, secret, params={}) {
    issuer = encodeURIComponent(issuer); label = encodeURIComponent(label);
    const url = new URL(`otpauth://${params.type??'totp'}/${issuer}:${label}`);
    url.searchParams.set('issuer', issuer); url.searchParams.set('secret', secret);
    for (const key of ['algorithm', 'digits', 'period', 'counter'])
        if (params[key]) url.searchParams.set(key, params[key]);
    return url.toString();
}
