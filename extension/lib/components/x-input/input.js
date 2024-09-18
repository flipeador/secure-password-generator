import * as util from '../../util.js';
import { ShadowComponent } from '../component.js';

const STEP = 1;
const MIN = Number.MIN_SAFE_INTEGER;
const MAX = Number.MAX_SAFE_INTEGER;

const CLICKABLE = ':is([role=button],[role=checkbox])';

const INPUT_TYPES = ['color', 'date', 'datetime-local', 'email', 'number',
    , 'file', 'month', 'password', 'search', 'tel', 'time', 'url', 'week'];
const INPUT_MODES = ['none', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'];

function clamp(value, min, max, step) {
    value = parseInt(value ?? NaN);
    return util.clamp(value, min, max, step);
}

function removeDuplicates(str, unique) {
    if (!unique) return `${str}`;
    return [...new Set(`${str}`)].join('');
}

class Input extends ShadowComponent {
    async main() {
        await super.main();

        await this.loadCSS('input.css');
        await this.loadHTML('input.html');

        this.defineAttribute('type');
        this.defineAttribute('min');
        this.defineAttribute('max');
        this.defineAttribute('step');
        this.defineAttribute('value');
        this.defineAttribute('flags');
        this.defineAttribute('placeholder');
        this.defineAttribute('spellcheck', 'false');
        this.defineAttribute('autocomplete');

        this.defineToggleAttribute('unique');
        this.defineToggleAttribute('readonly');

        this.on('change', 'onChange');

        this.$container.on('click', 'onContainerClick');

        this.$input.on('blur', 'onInputBlur');
        this.$input.on('focus', 'onInputFocus');
        this.$input.on('wheel', 'onInputWheel');
        this.$input.on('change', 'onInputChange');
        this.$input.on('keydown', 'onInputKeyDown');

        this.$eye.setFocusable(0, [' ']);
        this.$eye.on('click', 'onEyeClick');

        this.$up.on('click', 'up');
        this.$down.on('click', 'down');

        this.$copy.setFocusable(0, [' ']);
        this.$copy.on('click', 'onCopyClick');

        for (const element of this.shadowRoot.querySelectorAll(CLICKABLE))
            element.on('click', event => event.stopPropagation());

        for (const element of this.querySelectorAll('[slot]'))
            this[`$${element.slot}`].style.display = 'flex';
    }

    focus() {
        this.$input.focus();
    }

    onChange() {
        this.value = this.text;
        const value = this.value;
        if (value || value === '' || value === 0)
            this.save('value', value);
    }

    onContainerClick() {
        this.focus();
    }

    onInputBlur() {
        const icon = this.querySelector('[slot=icon]');
        icon?.removeAttribute?.('focus');
    }

    onInputFocus() {
        const icon = this.querySelector('[slot=icon]');
        icon?.setAttribute?.('focus', '');
    }

    onInputWheel(event) {
        // Allow users to increase or decrease the value with the mouse wheel.
        // The value is changed only if the numeric input element is focused.
        if (this.type === 'numeric' && event.target.isFocused())
            event.deltaY > 0 ? this.down() : this.up();
    }

    onInputChange(event) {
        event.stopPropagation();
        this.dispatch('change', { cancelable: false });
    }

    onInputKeyDown(event) {
        if (this.type === 'numeric') {
            if (event.key === 'ArrowUp')
                this.up();
            else if (event.key === 'ArrowDown')
                this.down();
            else if (event.key === 'Home')
                this.setValue(this.min);
            else if (event.key === 'End')
                this.setValue(this.max);
        }
    }

    onEyeClick() {
        util.startViewTransition(() => {
            this.$input.type = this.$input.type === 'password' ? 'text' : 'password';
            this.$eye.set('aria-checked', `${this.$input.type === 'password'}`);
        });
    }

    onCopyClick() {
        if (this.text === '')
            return this.focus();
        this.$copy.disabled = true;
        setTimeout(() => this.$copy.disabled = false, 2000);
        window.navigator.clipboard.writeText(this.text);
    }

    setValue(value) {
        const text = this.text;
        this.value = value;
        if (text === this.text) return;
        this.dispatch('change', { cancelable: false });
    }

    up() {
        this.setValue((isNaN(this.value) ? this.min : this.value) + this.step);
    }

    down() {
        this.setValue((isNaN(this.value) ? this.max : this.value) - this.step);
    }

    get type() {
        if (this.flags.contains('password')) return 'password';
        return this.$input.inputMode || this.$input.type;
    }

    set type(value) {
        this.$input.type = INPUT_TYPES.includes(value) ? value : 'text';
        this.$input.inputMode = INPUT_MODES.includes(value) ? value : 'text';
        if (this.$input.inputMode === 'text')
            this.$input.remove('inputmode');
        const isNumber = value === 'numeric' || value === 'decimal';
        this.$input.toggle('role', isNumber, 'spinbutton');
        this.$input.classList.toggle('password', value === 'password');
        this.$eye.set('aria-checked', `${value === 'password'}`);
    }

    get readonly() {
        return this.$input.has('readonly');
    }

    set readonly(value) {
        this.$input.toggle('readonly', !!value);
    }

    get placeholder() {
        return this.$input.get('placeholder');
    }

    set placeholder(value) {
        this.$input.set('placeholder', value);
    }

    get spellcheck() {
        return this.$input.get('spellcheck') === 'true';
    }

    set spellcheck(value) {
        value = util.bool(value);
        this.$input.set('spellcheck', `${value}`);
    }

    get autocomplete() {
        return this.$input.get('autocomplete');
    }

    set autocomplete(value) {
        this.$input.toggle('autocomplete', !!value, value);
    }

    get min() {
        const value = this.$input.get('aria-valuemin');
        return Number(value ?? MIN);
    }

    set min(value) {
        this.$input.set('aria-valuemin', value);
    }

    get max() {
        const value = this.$input.get('aria-valuemax');
        return Number(value ?? MAX);
    }

    set max(value) {
        this.$input.set('aria-valuemax', value);
    }

    get step() {
        const value = this.$input.get('step');
        return Number(value ?? STEP);
    }

    set step(value) {
        this.$input.set('step', value);
    }

    get flags() {
        return this.$input.classList;
    }

    set flags(value) {
        for (const flag of value.split(' '))
            this.$input.classList.toggle(flag);
    }

    get text() {
        return this.$input.value;
    }

    set text(value) {
        this.$input.value = value;
    }

    get value() {
        if (this.type === 'numeric')
            return parseInt(this.text);
        return this.text;
    }

    set value(value) {
        if (this.type === 'numeric')
            value = clamp(value, this.min, this.max, this.step);
        this.text = removeDuplicates(value, this.unique);
    }
}

customElements.define('x-input', Input);
