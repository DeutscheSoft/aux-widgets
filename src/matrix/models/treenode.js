import { MatrixDatum } from './matrixdatum.js';

export class TreeNodeData extends MatrixDatum
{
    constructor(matrix, o)
    {
        super(matrix, o);
        this.parent = null;
    }

    set label(value) { return this.set('label', value); }
    get label() { return this.get('label'); }

    get id() { return this.get('id'); }

    setParent(parent)
    {
      if (this.parent)
      {
        throw new Error('Node already has a parent.');
      }

      this.parent = parent;
    }
}
