const PATH = 'lib/components';

export class Base extends HTMLElement {
    constructor(type) {
        super();
        this.type = type;
        this.attachShadow({ mode: 'open' });
    }

    #id(id) {
        return typeof(id) === 'string' ?
            this[`$${id}`] : id || this;
    }

    async fetch(path) {
        const url = chrome.runtime.getURL(
            `${PATH}/${this.type}/${path}`
        );
        return fetch(url).then(r => r.text());
    }

    async loadCSS(path) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(await this.fetch(path));
        this.shadowRoot.adoptedStyleSheets.push(sheet);
    }

    async loadHTML(name) {
        const html = await this.fetch(name);
        this.shadowRoot.innerHTML = html;
        for (const element of this.shadowRoot.querySelectorAll('[id]'))
            this[`$${element.id}`] = element;
        this.main?.();
    }

    setFocusable(element, value=0) {
        if (element.hasAttribute('tabindex'))
            return;
        element.setAttribute('tabindex', value);
        element.addEventListener('keydown', event => {
            if (event.key === ' ') {
                event.stopPropagation();
                event.target.click();
            }
        });
    }

    dispatch(event, options={}) {
        options.bubbles ??= true;
        options.composed ??= true;
        return this.dispatchEvent(
            new CustomEvent(event, options)
        );
    }

    hasAttr(id, name, other) {
        id = this.#id(id);
        return (
            other && id.hasAttribute(other) ? -1 :
            id.hasAttribute(name)
        );
    }

    toggleAttr(id, name, value, other) {
        id = this.#id(id);
        if (value === undefined)
            return id.toggleAttribute(name);
        if (other && value === -1) {
            id.removeAttribute(name);
            return this.setAttribute(other, '');
        }
        id.removeAttribute(other);
        id.toggleAttribute(name, !!value);
    }

    setAria(id, name, value, other='true') {
        this.#id(id).setAttribute(
            `aria-${name}`,
            value === -1 ? other :
            value ? 'true' : 'false'
        );
    }
}
