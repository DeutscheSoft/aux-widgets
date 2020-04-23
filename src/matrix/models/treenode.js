import { MatrixDatum } from './matrixdatum.js';

export class TreeNodeData extends MatrixDatum
{
    get isGroup() { return false; }

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

    isChildOf(parent)
    {
      for (let node = this.parent; node; node = node.parent)
      {
        if (node === parent) return true;
      }

      return false;
    }

    getPath()
    {
      const parent = this.parent;

      if (!parent) return [];

      return parent.getPath().concat([ parent ]);
    }
}
