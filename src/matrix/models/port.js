import { MatrixDatum } from './matrixdatum.js';

export class PortData extends MatrixDatum
{
    set id(value) { return this.set('id', value); }
    get id() { return this.get('id'); }

    set type(value) { return this.set('type', value); }
    get type() { return this.get('type'); }

    set label(value) { return this.set('label', value); }
    get label() { return this.get('label'); }
}
