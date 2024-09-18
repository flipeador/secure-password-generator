import * as util from '../util.js';

const PATH = 'lib/components';

export class Component extends HTMLElement {
    static promises = [];
    promises = [];

    constructor() {
        super();

        this.set('component');

        const promise = this.pushPromise();
        this.main().then(() => promise.resolve());
    }

    static ready() {
        return Promise.all(Component.promises);
    }

    static save() {
        const elements = document.querySelectorAll('[local]');
        for (const element of elements)
            if (element instanceof Component)
                element.save();
    }

    pushPromise() {
        const promise = util.createPromise();
        Component.promises.push(promise);
        this.promises.push(promise);
        return promise;
    }

    ready() {
        return Promise.all(this.promises);
    }

    defineAttribute(name, defval, force) {
        const value =
            this.storage?.[name] ??
            this.get(name) ??
            defval;
        this.remove(name);
        if (value || force)
            this[name] = value;
    }

    defineToggleAttribute(name) {
        const value =
            this.storage?.[name] ??
            this.has(name);
        this.remove(name);
        if (value)
            this[name] = true;
    }

    async main() {
        let storage = await chrome.storage.session.get(this.id);
        if (storage[this.id] === undefined)
            storage = await chrome.storage.local.get(this.id);
        this.storage = storage[this.id] ?? { };

        this.defineToggleAttribute('disabled');
    }

    async fetch(path) {
        path = `x-${this.constructor.name.toLowerCase()}/${path}`;
        const url = chrome.runtime.getURL(`${PATH}/${path}`);
        return fetch(url).then(response => response.text());
    }

    async save(key, value) {
        // Local storage.
        if (key === undefined) {
            if (!this.has('local')) return;
            return chrome.storage.local.set({
                [this.id]: this.storage
            });
        }
        // Session storage.
        if (!this.has('session')) return;
        typeof(key) === 'string' ?
        this.storage[key] = value :
        Object.assign(this.storage, key);
        return chrome.storage.session.set({
            [this.id]: this.storage
        });
    }

    get disabled() {
        return this.has('disabled');
    }

    /**
     * Set the disabled state of the container element. \
     * This element is marked as `inert`, indicating the browser to ignore it.
     * @see https://developer.mozilla.org/docs/Web/HTML/Attributes/disabled
     * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inert
     */
    set disabled(value) {
        this.inert = !!value;
        this.toggle('disabled', !!value);
        this.ready?.().then(() => {
            this.$container?.toggle?.('disabled', !!value);
        });
    }

    get name() {
        return this.get('name');
    }

    set name(value) {
        this.set('name', value);
    }

    /**
     * Set a function that will be called whenever the specified event is delivered.
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener
     */
    on(event, listener, options) {
        const host = (
            this.getRootNode().host ??
            this.closest('[component]')
        );
        listener = (
            typeof(listener) === 'string' ?
            host[listener].bind(host) :
            listener.bind(host)
        );
        this.addEventListener(event, listener, options);
        return listener;
    }

    /**
     * Removes the event listener with the same type, callback, and options.
     * @see https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener
     */
    off(type, listener, options) {
        this.removeEventListener(type, listener, options);
    }

    /**
     * Focus the element, if it can be focused.
     * @see https://developer.mozilla.org/docs/Web/API/HTMLElement/focus
     */
    focus(options={}) {
        this.__focus(options);
        if (!options.preventScroll)
            this.scrollIntoView({ behavior: 'smooth' });
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
    setFocusable(value, clickKeyList) {
        this.off('keydown', this._focusableFn);
        this._focusableFn = (
            clickKeyList &&
            this.on('keydown', event => {
                if (clickKeyList.includes(event.key)) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.target.click();
                }
            })
        );
        this.toggle('tabindex', value || value === 0, value);
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

    has(name) {
        return this.hasAttribute(name);
    }

    get(name) {
        return this.getAttribute(name);
    }

    set(name, value='') {
        const attr = this.get(name);
        if (value === null) this.remove(name);
        else this.setAttribute(name, value ?? '');
        return attr ?? null;
    }

    remove(name) {
        const attr = this.get(name);
        this.removeAttribute(name);
        return attr ?? null;
    }

    toggle(name, force, value) {
        if (force === undefined)
            return this.toggle(name, !this.has(name), value);
        return force ? this.set(name, value) : this.remove(name);
    }
}

export class ShadowComponent extends Component {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<slot></slot>';
    }

    async main() {
        await super.main();
        await this.loadCSS('../component.css');
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
     * Parse all elements with an `id` and assign them to `this.$id`.
     * @see https://developer.mozilla.org/docs/Web/API/Element/innerHTML
     */
    async loadHTML(name) {
        this.shadowRoot.innerHTML = await this.fetch(name);
        for (const element of this.shadowRoot.querySelectorAll('*')) {
            if (element.id) this[`$${element.id}`] = element;
            if (element instanceof Component) await element.ready();
        }
    }
}

util.copyMethod('on', Component, Element);
util.copyMethod('off', Component, Element);
util.copyMethod('has', Component, Element);
util.copyMethod('get', Component, Element);
util.copyMethod('set', Component, Element);
util.copyMethod('remove', Component, Element);
util.copyMethod('toggle', Component, Element);

util.copyMethod('save', Component, HTMLElement);
util.copyMethod('focus', Component, HTMLElement);
util.copyMethod('isFocused', Component, HTMLElement);
util.copyMethod('setFocusable', Component, HTMLElement);

util.copyProperty('disabled', Component, Element);
