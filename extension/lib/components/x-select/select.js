import { Component } from '../component.js';

/**
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/select
 */
class Select extends Component {
    async main() {
        await super.main();

        this.$select = document.createElement('select');
        this.$select.append(...this.childNodes);
        this.append(this.$select);

        this.defineAttribute('value');

        this.$select.on('change', 'onSelectChange');
    }

    onSelectChange() {
        this.save('value', this.value);
    }

    get value() {
        return this.$select.value;
    }

    set value(value) {
        this.$select.value = value;
    }
}

customElements.define('x-select', Select);
