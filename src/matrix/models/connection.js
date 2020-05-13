/**
 * @module matrix
 */

import { MatrixDatum } from './matrixdatum.js';
import { TreeNodeData } from './treenode.js';
import { typecheck_instance } from '../../utils/typecheck.js';

/**
 * An object representing a connection between two ports.
 */
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

  /**
   * The source of the connection.
   */
  get from() { return this.get('from'); }

  /**
   * The sink of the connection.
   */
  get to() { return this.get('to'); }

  /**
   * The type of the connection.
   */
  get type() { return this.get('type'); }
}
