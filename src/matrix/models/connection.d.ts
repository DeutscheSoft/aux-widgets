import type { MatrixDatum } from './matrixdatum.js';
import type { DatumInit } from './datum.js';
import type { MatrixData } from './matrix.js';
import type { TreeNodeData } from './treenode.js';

/**
 * Known properties of a connection. Extra application keys are allowed at
 * init via {@link DatumInit} / {@link ConnectionDataInit}.
 */
export interface ConnectionProperties {
  from: TreeNodeData;
  to: TreeNodeData;
  type?: string;
}

/**
 * Connection init: `from` / `to` required, plus optional known fields and any
 * application keys.
 */
export type ConnectionDataInit = DatumInit<ConnectionProperties> &
  Pick<ConnectionProperties, 'from' | 'to'>;

/**
 * An object representing a connection between two ports.
 */
export declare class ConnectionData extends MatrixDatum<ConnectionProperties> {
  constructor(matrix: MatrixData, o: ConnectionDataInit);

  get from(): TreeNodeData;
  get to(): TreeNodeData;
  get type(): string;
}
