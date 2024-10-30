import * as QR from '../../qrcode.js';
import { ShadowComponent } from '../component.js';

class QRCode extends ShadowComponent {
    async main() {
        await super.main();

        await this.loadCSS('qrcode.css');
        await this.loadHTML('qrcode.html');

        this.color = this.remove('color') || 'black';
        this.background = this.remove('background') || 'white';
        this.$svg.style.setProperty('--background', this.background);
    }

    download() {
        const canvas = document.createElement('canvas');
        QR.draw(canvas, this.value, { border: 'white' });

        const a = document.createElement('a');
        a.href = canvas.toDataURL(); // PNG
        a.download = 'qr-code.png';
        a.click();
    }

    get value() {
        return this.$container.get('title');
    }

    set value(value) {
        const options = { color: this.color, background: this.background };
        const size = QR.draw(this.$svg, value, options) * QR.CELL_SIZE_PX;
        this.$svg.set('width', size);
        this.$container.set('title', value || null);
    }
}

customElements.define('x-qrcode', QRCode);
