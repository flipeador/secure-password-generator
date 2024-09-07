import * as util from '../../util.js';
import { Component } from '../component.js';

const NAME = 'x-input';

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

class TextBox extends Component {
    constructor() {
        super(NAME);
        this.loadCSS('input.css');
        this.loadHTML('input.html');
    }

    async main() {
        await super.main();

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

        this.on('change', this.onChange);

        this.$container.on('click', this.onContainerClick);

        this.$input.on('blur', this.onInputBlur);
        this.$input.on('wheel', this.onInputWheel);
        this.$input.on('change', this.onInputChange);
        this.$input.on('keydown', this.onInputKeyDown);

        this.$eye.setFocusable(true, true);
        this.$eye.on('click', this.onEyeClick);

        this.$up.on('click', this.up);
        this.$down.on('click', this.down);

        this.$copy.setFocusable(true, true);
        this.$copy.on('click', this.onCopyClick);

        for (const element of this.shadowRoot.querySelectorAll(CLICKABLE))
            element.on('click', event => event.stopPropagation());

        for (const element of this.querySelectorAll('[slot]'))
            this[`$${element.slot}`].style.display = 'flex';
    }

    focus() {
        this.$input.focus();
    }

    onChange(event) {
        const value = event.target.value;
        // Save the current value in the session storage.
        if (value || value === '' || value === 0)
            event.target.save('value', value);
    }

    onContainerClick() {
        this.focus();
    }

    onInputBlur() {
        // Validate the current value when the input loses focus.
        this.value = this.text;
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
        this.$input.type = this.$input.type === 'password' ? 'text' : 'password';
        this.$eye.setAttribute('aria-checked', `${this.$input.type === 'password'}`);
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
            this.$input.removeAttribute('inputmode');
        const isNumber = value === 'numeric' || value === 'decimal';
        this.$input.toggleAttribute('role', isNumber, 'spinbutton');
        this.$input.classList.toggle('password', value === 'password');
        this.$eye.setAttribute('aria-checked', `${value === 'password'}`);
    }

    get readonly() {
        return this.$input.hasAttribute('readonly');
    }

    set readonly(value) {
        this.$input.toggleAttribute('readonly', !!value);
    }

    get placeholder() {
        return this.$input.getAttribute('placeholder');
    }

    set placeholder(value) {
        this.$input.setAttribute('placeholder', value);
    }

    get spellcheck() {
        return this.$input.getAttribute('spellcheck') === 'true';
    }

    set spellcheck(value) {
        value = util.bool(value);
        this.$input.setAttribute('spellcheck', `${value}`);
    }

    get autocomplete() {
        return this.$input.getAttribute('autocomplete');
    }

    set autocomplete(value) {
        this.$input.toggleAttribute('autocomplete', !!value, value);
    }

    get min() {
        const value = this.$input.getAttribute('aria-valuemin');
        return Number(value ?? MIN);
    }

    set min(value) {
        this.$input.setAttribute('aria-valuemin', value);
    }

    get max() {
        const value = this.$input.getAttribute('aria-valuemax');
        return Number(value ?? MAX);
    }

    set max(value) {
        this.$input.setAttribute('aria-valuemax', value);
    }

    get step() {
        const value = this.$input.getAttribute('step');
        return Number(value ?? STEP);
    }

    set step(value) {
        this.$input.setAttribute('step', value);
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

customElements.define(NAME, TextBox);
