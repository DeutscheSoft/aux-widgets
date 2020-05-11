import { MatrixDatum } from './matrixdatum.js';
import { TreeNodeData } from './treenode.js';
import { typecheck_instance } from '../../utils/typecheck.js';

export class ConnectionData extends MatrixDatum
{
  constructor(matrix, o)
  {
    const from = o.from;
    const to = o.to;

    typecheck_instance(from, TreeNodeData);
    typecheck_instance(to, TreeNodeData);

    if (from.matrix !== to.matrix || matrix !== from.matrix)
      throw new Error('Both ports must be in the same matrix.');

    if (o.type === void(0))
    {
      o.type = '';
    }
    else
      typecheck_string(o.type);

    super(matrix, o);
  }

  get from() { return this.get('from'); }
  get to() { return this.get('to'); }
  get type() { return this.get('type'); }
}
