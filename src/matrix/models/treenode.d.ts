import type { MatrixDatum } from './matrixdatum.js';
import type { DatumInit } from './datum.js';
import type { MatrixData } from './matrix.js';
import type { GroupData } from './group.js';

/**
 * Known properties on tree nodes (groups and ports).
 *
 * Auto-assigned ids from {@link MatrixData.createPort} / `createGroup` are
 * numbers; callers may also supply string ids.
 *
 * Does not extend {@link MatrixDatumProperties}: see {@link DatumInit} for
 * why open keys are layered at init / `get`·`set` time instead.
 */
export interface TreeNodeProperties {
  id?: string | number;
  label?: string;
  icon?: string;
}

/**
 * Base class for matrix tree objects, e.g. groups and ports.
 *
 * Extend `P` to declare additional *typed* properties on custom node
 * subclasses. Untyped application data can be stored with {@link Datum.set}
 * without extending `P`.
 */
export declare class TreeNodeData<
  P extends TreeNodeProperties = TreeNodeProperties
> extends MatrixDatum<P> {
  /** Parent group, or `null` when unattached / root. */
  readonly parent: GroupData | null;

  /** True if this object is a group. */
  get isGroup(): boolean;

  constructor(matrix: MatrixData, o: DatumInit<P>);

  get label(): string | undefined;
  set label(value: string);

  get icon(): string | undefined;
  set icon(value: string);

  get id(): string | number | undefined;

  /** Returns true if this node is a descendant of the given node. */
  isChildOf(node: TreeNodeData): boolean;

  /** Ancestor groups from the root down to the parent of this node. */
  getPath(): GroupData[];
}
