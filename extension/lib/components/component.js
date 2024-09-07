import * as util from '../util.js';

const PATH = 'lib/components';

function onFocusableKeyDown(event) {
    if (event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        event.target.click();
    }
}

export class Component extends HTMLElement {
    static promises = [];
    promises = [];

    constructor(name) {
        super();
        this._name = name;
        this.loadCSS('../component.css');
        this.attachShadow({ mode: 'open' });
    }

    static join() {
        return Promise.all(Component.promises);
    }

    static save() {
        const elements = document.querySelectorAll('[local]');
        for (const element of elements) element.save();
    }

    #pushPromise() {
        const promise = util.createPromise();
        Component.promises.push(promise);
        this.promises.push(promise);
        return promise;
    }

    #popPromise(promise) {
        promise.resolve();
        this.promises.splice(this.promises.indexOf(promise), 1);
    }

    async #loadStorage() {
        let storage = await chrome.storage.session.get(this.id);
        if (storage[this.id] === undefined)
            storage = await chrome.storage.local.get(this.id);
        this.storage = storage[this.id] ?? { };
    }

    join() {
        return Promise.all(this.promises);
    }

    defineAttribute(name, defval) {
        const value =
            this.storage[name] ??
            this.getAttribute(name) ??
            defval;
        this.removeAttribute(name);
        if (value) this[name] = value;
    }

    defineToggleAttribute(name) {
        const value =
            this.storage[name] ??
            this.hasAttribute(name);
        this.removeAttribute(name);
        if (value) this[name] = true;
    }

    async main() {
        this.defineToggleAttribute('disabled');
    }

    /**
     * Fetch a file and return its text content.
     * @returns {Promise<string>}
     */
    async fetch(path) {
        const url = chrome.runtime.getURL(`${PATH}/${this._name}/${path}`);
        return await fetch(url).then(response => response.text());
    }

    /**
     * Add a single CSS stylesheet to the adopted stylesheets array.
     * @see https://developer.mozilla.org/docs/Web/API/Document/adoptedStyleSheets
     */
    async loadCSS(path) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(await this.fetch(path));
        this.shadowRoot.adoptedStyleSheets.push(sheet);
    }

    /**
     * Set the HTML markup contained within the shadow root. \
     * Parse all elements with an `id` and assign them to `this.$id`. \
     * Store the element session or local storage in `this.storage`. \
     * Call the async `main` method after the HTML markup is loaded.
     * @see https://developer.mozilla.org/docs/Web/API/Element/innerHTML
     */
    async loadHTML(name) {
        const promise = this.#pushPromise();
        this.shadowRoot.innerHTML = await this.fetch(name);
        for (const element of this.shadowRoot.querySelectorAll('*')) {
            if (element.id) this[`$${element.id}`] = element;
            if (element instanceof Component) await element.join();
        }
        await this.#loadStorage();
        await this.main?.(name);
        this.#popPromise(promise);
    }

    async save(key, value) {
        // Local storage.
        if (key === undefined) {
            if (!this.hasAttribute('local'))
                return;
            return chrome.storage.local.set({
                [this.id]: this.storage
            });
        }
        // Session storage.
        if (!this.hasAttribute('session'))
            return;
        typeof(key) === 'string' ?
        this.storage[key] = value :
        Object.assign(this.storage, key);
        return chrome.storage.session.set({
            [this.id]: this.storage
        });
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    /**
     * Set the disabled state of the container element. \
     * This element is marked as `inert`, indicating the browser to ignore it.
     * @see https://developer.mozilla.org/docs/Web/HTML/Attributes/disabled
     * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inert
     */
    set disabled(value) {
        this.inert = !!value;
        this.toggleAttribute('disabled', !!value);
        this.join?.(this.promises).then(() => {
            this.$container.toggleAttribute('disabled', !!value);
        });
    }

    /**
     * Set a function that will be called whenever the specified event is delivered. \
     * The listener function is bound to the element's shadow root host, or `undefined`.
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener
     */
    on(event, listener, options) {
        const root = this.getRootNode();
        listener = listener.bind(root.host);
        this.addEventListener(event, listener, options);
    }

    /**
     * Get the selection within the document or shadow root.
     * @returns {Selection}
     * @see https://developer.mozilla.org/docs/Web/API/Window/getSelection
     */
    getSelection() {
        try { return this.shadowRoot.getSelection(); } // chrome
        catch { return window.document.getSelection(); } // firefox
    }

    /**
     * Check if the element is focused within the document or shadow root.
     * @see https://developer.mozilla.org/docs/Web/API/Node/getRootNode
     * @see https://developer.mozilla.org/docs/Web/API/Document/activeElement
     */
    isFocused() {
        return this.getRootNode().activeElement === this;
    }

    /**
     * Allow or prevent the element from being focusable.
     * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/tabindex
     */
    setFocusable(value, clickOnSpaceKeyDown) {
        if (!value) {
            this.removeEventListener('keydown', onFocusableKeyDown);
            return this.removeAttribute('tabindex');
        }
        if (clickOnSpaceKeyDown)
            this.addEventListener('keydown', onFocusableKeyDown);
        this.setAttribute('tabindex', '0');
    }

    /**
     * Synchronously send an event invoking the affected event listeners.
     * @param {string} event
     * @param {{bubbles,cancelable,composed,detail}} options
     * @returns {boolean}
     * Returns `false` if the events has been canceled via its `event.preventDefault()` method. \
     * If the event is canceled, the default action should not be taken as it normally would be. \
     * Returns `true` if the event is not cancelable or its `preventDefault()` method was not invoked.
     * @see https://javascript.info/shadow-dom-events
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent
     */
    dispatch(event, options={}) {
        event = new CustomEvent(event, options);
        return this.dispatchEvent(event);
    }

    toggleAttribute(name, force, value='') {
        if (force)
            return !this.setAttribute(name, value);
        if (!force && force !== undefined)
            return !!this.removeAttribute(name);
        const has = this.hasAttribute(name);
        return this.toggleAttribute(name, !has, value);
    }
}

util.copyMethod('save', Component, Element);
util.copyMethod('on', Component, Element);
util.copyMethod('isFocused', Component, Element);
util.copyMethod('setFocusable', Component, Element);
util.copyMethod('toggleAttribute', Component, Element);

util.copyProperty('disabled', Component, Element);

window.document.Component = Component;
