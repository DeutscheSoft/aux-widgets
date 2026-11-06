import type { Events } from '../../events.js';
import type { VirtualTreeDataView } from './virtualtreedataview.js';
import type { TreeNodeData } from './treenode.js';
import type { ConnectionData } from './connection.js';
import type { SubscriptionCallback } from '../../utils/subscriptions.js';

/**
 * Visible cell content: a single connection, a set of connections (for groups),
 * or missing.
 */
export type ConnectionCell = ConnectionData | Set<ConnectionData> | undefined;

/**
 * A dataview for connections between two {@link VirtualTreeDataView}s.
 */
export declare class ConnectionDataView extends Events {
  get startIndex1(): number;
  get startIndex2(): number;
  get amount1(): number;
  get amount2(): number;

  constructor(
    virtualtreeview1: VirtualTreeDataView,
    virtualtreeview2: VirtualTreeDataView
  );

  getConnectionFor(
    row_element: TreeNodeData | undefined | null,
    column_element: TreeNodeData | undefined | null
  ): ConnectionCell;

  subscribeSize(
    cb: (rows: number, columns: number) => void
  ): SubscriptionCallback;

  subscribeAmount(
    cb: (rows: number, columns: number) => void
  ): SubscriptionCallback;

  subscribeElements(
    cb: (
      index1: number,
      index2: number,
      connection: ConnectionCell,
      row_element: TreeNodeData | undefined,
      column_element: TreeNodeData | undefined
    ) => void
  ): SubscriptionCallback;

  subscribeScrollView(
    cb: (row_offset: number, column_offset: number) => void
  ): SubscriptionCallback;

  observeConnectionsForRow(
    row_element: TreeNodeData,
    callback: (connections: Set<ConnectionData>) => void
  ): SubscriptionCallback;

  observeConnectionsForColumn(
    column_element: TreeNodeData,
    callback: (connections: Set<ConnectionData>) => void
  ): SubscriptionCallback;

  destroy(): void;
}
