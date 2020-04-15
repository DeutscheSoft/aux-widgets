import { MatrixDatum } from './matrixdatum.js';

export class GroupData extends MatrixDatum
{
    set label(value) { return this.set('label', value); }
    get label() { return this.get('label'); }

    set id(value) { return this.set('id', value); }
    get id() { return this.get('id'); }

    // adds a port to this group
    addPort(port)
    {
    }

    deletePort(port)
    {
    }

    addGroup(port)
    {
    }

    deleteGroup(port)
    {
    }
}
