import type { TreeNodeData } from './treenode.js';
import type { SubscriptionCallback } from '../../utils/subscriptions.js';

/**
 * Subscribe to a boolean predicate for `node`. While the predicate is true,
 * run `continuation` and keep its subscription; tear it down when false.
 */
export function callContinuationIf(
  node: TreeNodeData,
  subscribe_predicate: (
    node: TreeNodeData,
    callback: (value: boolean) => void
  ) => SubscriptionCallback | null | undefined,
  continuation: (node: TreeNodeData) => SubscriptionCallback | null | undefined
): SubscriptionCallback;
