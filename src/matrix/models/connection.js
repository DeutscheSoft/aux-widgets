/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

/**
 * @module matrix
 */

import { MatrixDatum } from './matrixdatum.js';
import { TreeNodeData } from './treenode.js';
import { typecheckInstance, typecheckString } from '../../utils/typecheck.js';

/**
 * An object representing a connection between two ports.
 */
export class ConnectionData extends MatrixDatum {
  constructor(matrix, o) {
    const from = o.from;
    const to = o.to;

    typecheckInstance(from, TreeNodeData);
    typecheckInstance(to, TreeNodeData);

    if (from.matrix !== to.matrix || matrix !== from.matrix)
      throw new Error('Both ports must be in the same matrix.');

    if (o.type === void 0) {
      o.type = '';
    } else typecheckString(o.type);

    super(matrix, o);
  }

  /**
   * The source of the connection.
   */
  get from() {
    return this.get('from');
  }

  /**
   * The sink of the connection.
   */
  get to() {
    return this.get('to');
  }

  /**
   * The type of the connection.
   */
  get type() {
    return this.get('type');
  }
}
