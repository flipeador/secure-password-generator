import { Base } from '../base.js';

/**
 * Checkbox element.
 * https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/checkbox_role
 */
class Checkbox extends Base {
    constructor() {
        super('checkbox');
        this.loadCSS('checkbox.css');
        this.loadHTML('checkbox.html');
    }

    main() {
        this.setFocusable(this.$checkbox);
        this.setAria('checkbox', 'disabled', this.disabled);
        this.setAria('checkbox', 'checked', this.value, 'mixed');
        this.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        if (!this.disabled && !event.altKey) {
            this.value = !this.value;
            this.dispatch('input');
        }
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(value) {
        this.toggleAttr(0, 'disabled', !!value);
        this.setAria('checkbox', 'disabled', value);
    }

    get value() {
        return this.hasAttr(0, 'checked', 'indeterminate');
    }

    set value(value) {
        this.toggleAttr(0, 'checked', !!value, 'indeterminate');
        this.setAria('checkbox', 'checked', value, 'mixed');
    }
}

customElements.define('x-checkbox', Checkbox);
