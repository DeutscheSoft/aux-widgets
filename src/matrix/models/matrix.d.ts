import type { Datum, DatumInit } from './datum.js';
import type { PortData, PortProperties } from './port.js';
import type { GroupData } from './group.js';
import type { TreeNodeData, TreeNodeProperties } from './treenode.js';
import type { ConnectionData, ConnectionDataInit } from './connection.js';
import type { VirtualTreeDataView } from './virtualtreedataview.js';
import type { SubscriptionCallback } from '../../utils/subscriptions.js';

/**
 * A matrix: a tree of groups and ports, plus connections between ports.
 */
export declare class MatrixData extends Datum {
  /** Top-level group of the tree. */
  readonly root: GroupData;

  constructor();

  createPort(
    port?: PortData | DatumInit<PortProperties> | null,
    PortClass?: new (
      matrix: MatrixData,
      o: DatumInit<PortProperties>
    ) => PortData
  ): PortData;

  createGroup(
    group?: GroupData | DatumInit<TreeNodeProperties> | null,
    GroupClass?: new (
      matrix: MatrixData,
      o: DatumInit<TreeNodeProperties>
    ) => GroupData
  ): GroupData;

  addGroup(group: GroupData | DatumInit<TreeNodeProperties>): GroupData;
  deleteGroup(group: TreeNodeData): void;
  getGroupById(id: string | number): GroupData | undefined;

  addPort(port: PortData | DatumInit<PortProperties>): PortData;
  deletePort(port: TreeNodeData): void;
  getPortById(id: string | number): PortData | undefined;

  createConnection(
    connection: ConnectionData | ConnectionDataInit
  ): ConnectionData;
  addConnection(
    connection: ConnectionData | ConnectionDataInit
  ): ConnectionData;
  deleteConnection(connection: ConnectionData): void;

  connect(from: TreeNodeData, to: TreeNodeData): ConnectionData;

  getConnectionsOf(node: TreeNodeData): ConnectionData[];
  getConnectionsFrom(node: TreeNodeData): ConnectionData[];
  getConnectionsTo(node: TreeNodeData): ConnectionData[];
  getConnection(a: TreeNodeData, b: TreeNodeData): ConnectionData | undefined;

  forEachConnection(cb: (connection: ConnectionData) => void): void;

  createVirtualTreeDataView(
    amount: number,
    filterFunction:
      | ((
          node: TreeNodeData,
          callback: (value: boolean) => void
        ) => SubscriptionCallback | null | undefined)
      | null
      | undefined,
    sortFunction: (a: TreeNodeData, b: TreeNodeData) => number
  ): VirtualTreeDataView;
}
