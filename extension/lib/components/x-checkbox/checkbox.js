import * as util from '../../util.js';
import { ShadowComponent } from '../component.js';

/**
 * Toggle the disabled state of all elements associated with the specified checkbox. \
 * The checkbox must have a `for` attribute containing a space-separated list of element IDs.
 */
function handleCheckBoxFor(checkbox) {
    const root = checkbox.getRootNode();
    const _for = checkbox.getAttribute('for') ?? '';
    const query = _for.split(' ').map(id => `[id="${id}"]`);
    const elements = root.querySelectorAll(`:is(${query.join(',')})`);
    for (const element of elements) element.disabled = !checkbox.checked;
}

/**
 * CheckBox web component.
 *
 * Allow users to alternate between ON/OFF, and an optional indeterminate state.
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/checkbox_role
 */
class CheckBox extends ShadowComponent {
    constructor() {
        super();
        this.type = 'checkbox';
        this.loadCSS('checkbox.css');
        this.loadHTML('checkbox.html');
    }

    async main() {
        await super.main();

        this.on('change', this.onChange);

        this.$input.setFocusable(0, [' ']);

        this.$label.on('click', this.onInputClick);
        this.$input.on('click', this.onInputClick);

        this.value = (this.storage.value ?? (
            this.has('indeterminate') ? 'mixed' :
            this.has('checked') ? 'true' : 'false'
        ));

        this.onSlotChange();
        for (const slot of this.shadowRoot.querySelectorAll('slot'))
            slot.on('slotchange', this.onSlotChange);
    }

    onChange(event) {
        // Save the current value in the session storage.
        event.target.save('value', event.target.value);
    }

    onSlotChange() {
        // Set the 'custom' class if the checkbox has both 'checked' and 'unchecked' slots.
        // Use SVG elements for checked and unchecked, and optionally the intermediate state.
        const checked = !!this.querySelector('[slot=checked]');
        const unchecked = !!this.querySelector('[slot=unchecked]');
        this.$input.classList.toggle('custom', checked && unchecked);
    }

    onInputClick(event) {
        // Allow users to click the input and label to toggle the checkbox.
        //
        // Do not toggle the checkbox if the user is holding down the alt key.
        // Allows users to select the label text without accidentally toggling the checkbox.
        if (!event.altKey) {
            this.value = !this.checked;
            this.dispatch('change', { cancelable: false });
        }
    }

    /**
     * Get the checked (ticked) state of checkbox.
     * @returns {number} 0 (unchecked), 1 (checked), -1 (indeterminate).
     */
    get checked() {
        return this.value === 'false' ? 0 :
            this.value === 'true' ? 1 : -1;
    }

    /**
     * Set the checked (ticked) state of checkbox.
     */
    set checked(value) {
        this.value = value;
    }

    /**
     * Get the checked (ticked) state of checkbox.
     * @returns {string} `'false'` (unchecked), `'true'` (checked), `'mixed'` (indeterminate).
     */
    get value() {
        return this.$input.get('aria-checked');
    }

    /**
     * Set the checked (ticked) state of checkbox.
     * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-checked
     */
    set value(value) {
        if (value === -1 || value === 'mixed') {
            this.remove('checked');
            this.set('indeterminate', '');
            this.$input.set('aria-checked', 'mixed');
        } else {
            value = util.bool(value);
            this.remove('indeterminate');
            this.toggle('checked', value);
            this.$input.set('aria-checked', value);
            handleCheckBoxFor(this);
        }
    }
}

customElements.define('x-checkbox', CheckBox);
