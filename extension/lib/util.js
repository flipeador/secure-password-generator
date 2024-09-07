export function bool(value) {
    return !(!value || value === '0' || value === 'false');
}

export function clamp(value, min, max, step) {
    if (step !== undefined)
        value = Math.round(value / step) * step;
    return value > max ? max : value < min ? min : value;
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
    Object.defineProperty(to.prototype, name, {
        value: from.prototype[name]
    });
}

export function copyProperty(name, from, to) {
    const prop = Object.getOwnPropertyDescriptor(from.prototype, name);
    Object.defineProperty(to.prototype, name, {
        get() { return prop.get.call(this); },
        set(value) { prop.set.call(this, value); }
    });
}
