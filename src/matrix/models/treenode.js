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
      if (parent !== null && this.parent !== null)
      {
        throw new Error('Node already has a parent.');
      }

      if (parent !== null && !parent.isGroup)
        throw new TypeError('Parent node must be a group.');

      this.parent = parent;
    }

    getPath()
    {
      const parent = this.parent;

      if (!parent) return [];

      return parent.getPath().concat([ parent ]);
    }
}
