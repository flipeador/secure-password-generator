import { Component } from '../component.js';

/**
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/link_role
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/button_role
 */
class Button extends Component {
    async main() {
        await super.main();

        this.defineAttribute('href', null, true);
        this.setFocusable(0, [' ', 'Enter']);
        this.on('click', 'onClick');
    }

    onClick(event) {
        if (!this.href) return;
        event.stopPropagation();
        window.open(this.href);
    }

    get href() {
        return this.get('href');
    }

    set href(value) {
        value ||= null;
        this.set('href', value);
        this.set('role', value ? 'link' : 'button');
    }
}

customElements.define('x-button', Button);
