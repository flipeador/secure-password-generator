export function bool(value) {
    return !(!value || value === '0' || value === 'false');
}

export function clamp(value, min, max, step) {
    if (step !== undefined)
        value = Math.round(value / step) * step;
    return value > max ? max : value < min ? min : value;
}

export function* range(start, end, step=1) {
    if (end === undefined) {
        end = start;
        start = 0;
    }

    for (let i = start; i < end; i += step)
        yield i;
}

export function shuffle(target) {
    for (let i = target.length - 1; i > 0; --i) {
        const j = random(0, i);
        [target[i], target[j]] = [target[j], target[i]];
    }
    return target;
}

/**
 * Generate a random number in a given range.
 * @see https://developer.mozilla.org/docs/Web/API/Crypto/getRandomValues
 */
export function random(min, max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomValue = array[0] / (0xFFFFFFFF + 1);
    return Math.floor(randomValue * (max - min + 1)) + min;
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
export function randomizedTransfer(source, target, count, exhaustive) {
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
 * Generate the SHA-256 hash of the given string.
 * @see https://developer.mozilla.org/docs/Web/API/SubtleCrypto/digest
 */
export async function sha256(str) {
    return new Uint8Array(
        await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(str)
        )
    ).reduce((s, b) => (s + b.toString(16).padStart(2, '0')), '');
}

/**
 * Get the Gravatar URL of the given email address.
 * @see https://docs.gravatar.com/api/avatars/images
 */
export async function getGravatarUrl(email, size=256, rating='x', fallback='identicon') {
    const hash = await sha256(email.toLowerCase());
    const params = new URLSearchParams({ s: size, r: rating, d: fallback });
    return `https://www.gravatar.com/avatar/${hash}.jpg?${params}`;
}

/**
 * Starts a new same-document (SPA) view transition.
 * @see https://developer.mozilla.org/docs/Web/API/Document/startViewTransition
 */
export function startViewTransition(fn, ...args) {
    if (!document.startViewTransition) return fn(...args);
    return document.startViewTransition(() => fn(...args));
}

export function toggleDisplay(...elements) {
    for (const element of elements)
        element.style.display = 'none';
    elements[0].style.display = 'block';
}

export function createPromise() {
    const object = { };
    return Object.assign(
        new Promise((resolve, reject) => {
            Object.assign(object, { resolve, reject });
        }),
        object
    );
}

export function copyMethod(name, from, to) {
    Object.defineProperties(to.prototype, {
        [name]: {
            value: from.prototype[name]
        },
        [`__${name}`]: {
            value: to.prototype[name]
        },
    });
}

export function copyProperty(name, from, to) {
    Object.defineProperties(to.prototype, {
        [name]: Object.getOwnPropertyDescriptor(from.prototype, name),
        [`__${name}`]: Object.getOwnPropertyDescriptor(to.prototype, name) ?? { }
    });
}
