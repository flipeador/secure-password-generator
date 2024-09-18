import { ShadowComponent } from '../component.js';

/**
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/tab_role
 */
class Tab extends ShadowComponent { }

/**
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/tabpanel_role
 */
class TabPanel extends ShadowComponent { }

/**
 * TabView web component.
 *
 * Provides users a collection of tabs that can be used to display several panels.
 * @see https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/tablist_role
 */
class TabView extends ShadowComponent {
    constructor() {
        super();
        this.loadCSS('tabview.css');
        this.loadHTML('tabview.html');
    }

    async main() {
        await super.main();

        this.$scrollable.on('wheel', this.onScrollableWheel);

        this.$tabs.on('click', this.onTabsClick);
        this.$tabs.on('keydown', this.onTabsKeyDown);

        const xtabs = this.querySelectorAll('x-tab');
        const xpanels = this.querySelectorAll('x-tabpanel');

        xtabs.forEach(($xtab, i) => this.add($xtab, xpanels[i]));

        const $activeTab = this.querySelector('[active]');
        if ($activeTab) this.active = $activeTab;
    }

    #create(role, $element) {
        if ($element.parentElement !== this)
            this.appendChild($element);
        const $div = document.createElement('div');
        $div.id = self.crypto.randomUUID();
        $div.innerHTML = `<slot name="${$div.id}"></slot>`;
        $div.role = role; $element.slot = $div.id;
        return $div;
    }

    #createTab($xtab) {
        const $tab = this.#create('tab', $xtab);
        return this.$tabs.insertBefore($tab, this.$empty);
    }

    #createPanel($xpanel) {
        const $panel = this.#create('tabpanel', $xpanel);
        $panel.set('hidden', '');
        return this.$panels.appendChild($panel);
    }

    onScrollableWheel(event) {
        // Convert vertical scroll to horizontal scroll.
        const left = 50 * (event.deltaY < 0 ? -1 : 1);
        this.$scrollable.scrollBy({ left, behavior: 'smooth' });
    }

    onTabsClick(event) {
        const path = event.composedPath();
        const index = path.indexOf(this.$tabs);
        const $tab = path[index - 1];

        if ($tab) {
            const $slot = $tab.firstElementChild;
            const $xtab = $slot.assignedElements()[0];

            if ($xtab !== this.active) {
                this.active = $xtab;
                this.dispatch('change', { cancelable: false });
            }

            $tab.focus();
        }
    }

    onTabsKeyDown(event) {
        const $focused = this.shadowRoot.activeElement;

        // Focuses the next tab in the tab list.
        if (event.key === 'ArrowRight')
            $focused.nextElementSibling?.focus?.();
        // Focuses the previous tab in the tab list.
        else if (event.key === 'ArrowLeft')
            $focused.previousElementSibling?.focus?.();
        // Focuses the last tab in the tab list.
        else if (event.key === 'End')
            this.$tabs.lastElementChild.focus();
        // Focuses the first tab in the tab list.
        else if (event.key === 'Home')
            this.$tabs.firstElementChild.focus();
    }

    add($xtab, $xpanel) {
        const $tab = this.#createTab($xtab);
        const $panel = this.#createPanel($xpanel);
        $tab.set('aria-controls', $panel.id);
        $panel.set('aria-labelledby', $tab.id);
    }

    get active() {
        return this.querySelector('[active]');
    }

    set active(value) {
        if (!(value instanceof Tab))
            value = this.querySelector(`
                & > x-tab:is(
                    [id="${value}"],
                    [name="${value}"]
                )
            `);

        if (!(value instanceof Tab)
        || value.parentElement !== this)
            throw new Error('Invalid tab');

        for (const $xtab of this.querySelectorAll('x-tab')) {
            const active = value === $xtab;
            $xtab.toggle('active', active);
            const $tab = $xtab.assignedSlot.parentElement;
            $tab.setFocusable(active ? 0 : -1, [' ', 'Enter']);
            $tab.set('aria-selected', `${active}`);
            const controls = $tab.get('aria-controls');
            const $panel = this.shadowRoot.getElementById(controls);
            $panel.toggle('hidden', !active);
        }

        // Dispatch the 'load' event the first time the tab is activated.
        if (value.set('activated') === null)
            this.dispatch('load', { cancelable: false });
    }
}

customElements.define('x-tab', Tab);
customElements.define('x-tabview', TabView);
customElements.define('x-tabpanel', TabPanel);
