/**
 * @module matrix
 */

import { TreeNodeData } from './treenode.js';

/**
 * The data model of a port.
 */
export class PortData extends TreeNodeData
{
  /**
   * The type.
   */
  set type(value) { return this.set('type', value); }
  get type() { return this.get('type'); }
}
