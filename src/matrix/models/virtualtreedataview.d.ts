import type { Events } from '../../events.js';
import type { GroupData } from './group.js';
import type { TreeNodeData } from './treenode.js';
import type { MatrixData } from './matrix.js';
import type { SubscriptionCallback } from '../../utils/subscriptions.js';

/**
 * Predicate used to filter the virtual tree. Invokes `callback` with whether
 * the node should be visible and returns a subscription.
 */
export type VirtualTreeFilterFunction = (
  node: TreeNodeData,
  callback: (value: boolean) => void
) => SubscriptionCallback | null | undefined;

export type VirtualTreeSortFunction = (
  a: TreeNodeData,
  b: TreeNodeData
) => number;

/**
 * Subscribe to changes that affect the sort order of `node`.
 */
export type VirtualTreeSubscribeSortDependencies = (
  node: TreeNodeData,
  callback: () => void
) => SubscriptionCallback | null | undefined;

/**
 * Flattened / windowed view over a {@link GroupData} subtree.
 */
export declare class VirtualTreeDataView extends Events {
  constructor(
    group: GroupData,
    amount: number,
    filterFunction: VirtualTreeFilterFunction | null | undefined,
    sortFunction: VirtualTreeSortFunction,
    subscribeSortDependencies?: VirtualTreeSubscribeSortDependencies | null
  );

  get matrix(): MatrixData;
  get group(): GroupData;
  get size(): number;
  get startIndex(): number;
  get amount(): number;

  get sortFunction(): VirtualTreeSortFunction;
  set sortFunction(fun: VirtualTreeSortFunction);

  /** Re-sort according to the current sort function. */
  triggerSort(): void;

  getDepth(child: TreeNodeData): number;
  getSubtreeSize(group: GroupData): number;

  setStartIndex(index: number): void;
  setAmount(amount: number): void;

  indexOf(child: TreeNodeData): number;
  includes(child: TreeNodeData): boolean;

  scrollStartIndex(offset: number): void;
  scrollStartIndexTo(index: number): void;

  collapseGroup(group: GroupData, is_collapsed: boolean): void;
  isCollapsed(group: GroupData): boolean;

  destroy(): void;

  forEach(cb: (child: TreeNodeData) => void): void;

  subscribeElements(
    cb: (
      index: number,
      element: TreeNodeData | undefined,
      treePosition: boolean[]
    ) => void,
    done_cb?: () => void
  ): SubscriptionCallback;

  subscribeSize(cb: (size: number) => void): SubscriptionCallback;
  subscribeAmount(cb: (amount: number) => void): SubscriptionCallback;
  subscribeStartIndexChanged(
    cb: (startIndex: number, previous?: number) => void
  ): SubscriptionCallback;
  subscribeScrollView(cb: (offset: number) => void): SubscriptionCallback;
  subscribeCollapsed(
    group: GroupData,
    cb: (is_collapsed: boolean) => void
  ): SubscriptionCallback;
  subscribeSorted(cb: () => void): SubscriptionCallback;

  at(index: number): TreeNodeData | undefined;
  get(offset: number): TreeNodeData | undefined;
  forEachElement(cb: (element: TreeNodeData | undefined) => void): void;
}
