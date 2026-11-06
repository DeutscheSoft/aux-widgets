import type { TreeNodeData, TreeNodeProperties } from './treenode.js';
import type { DatumInit } from './datum.js';
import type { MatrixData } from './matrix.js';
import type { PortData, PortProperties } from './port.js';
import type { SubscriptionCallback } from '../../utils/subscriptions.js';

/** One step in a {@link GroupData.forEachNode} path. */
export interface TreePathEntry {
  parent: GroupData;
  index: number;
  length: number;
}

/**
 * The data model of a group.
 *
 * Extend `P` for custom group subclasses with extra *typed* properties.
 * Untyped application data can be stored with {@link Datum.set} without
 * extending `P`.
 */
export declare class GroupData<
  P extends TreeNodeProperties = TreeNodeProperties
> extends TreeNodeData<P> {
  /** Always `true` for groups. */
  get isGroup(): boolean;

  constructor(matrix: MatrixData, o: DatumInit<P>);

  addChild(child: TreeNodeData): void;
  deleteChild(child: TreeNodeData): void;

  addPort(port: PortData | DatumInit<PortProperties>): PortData;
  deletePort(port: TreeNodeData): void;

  addGroup(group: GroupData | DatumInit<TreeNodeProperties>): GroupData;
  deleteGroup(group: TreeNodeData): void;

  forEach(cb: (child: TreeNodeData) => void): void;

  /**
   * Walk children recursively. Descends into groups when `cb` returns
   * `undefined` or a truthy value.
   */
  forEachNode(
    cb: (child: TreeNodeData, path: TreePathEntry[]) => unknown,
    sorter?: (a: TreeNodeData, b: TreeNodeData) => number,
    path?: TreePathEntry[]
  ): void;

  /**
   * Call `callback` for each current and future child. The callback may return
   * a subscription cleaned up when the child is removed.
   */
  forEachAsync(
    callback: (
      child: TreeNodeData
    ) => SubscriptionCallback | null | undefined | void
  ): SubscriptionCallback;
}
