import * as QR from '../../qrcode.js';
import { ShadowComponent } from '../component.js';

class QRCode extends ShadowComponent {
    async main() {
        await super.main();

        await this.loadCSS('qrcode.css');
        await this.loadHTML('qrcode.html');

        this.defineAttribute('color');
        this.defineAttribute('background');
    }

    get color() {
        return this.$container.getAttribute('color');
    }

    set color(value) {
        this.$container.setAttribute('color', value);
    }

    get background() {
        return this.$container.getAttribute('background');
    }

    set background(value) {
        this.$container.setAttribute('background', value);
        this.$svg.style.setProperty('--background', value);
    }

    set value(value) {
        const size = QR.draw(this.$svg, value, {
            color: this.color,
            background: this.background,
        });
        this.$svg.set('width', 12 * size);
        this.$container.set('title', value || null);
    }
}

customElements.define('x-qrcode', QRCode);
