/**
 * @module matrix
 */

import { Datum } from './datum.js';
import { PortData } from './port.js';
import { GroupData } from './group.js';
import { VirtualTreeDataView } from './virtualtreedataview.js';
import { TreeNodeData } from './treenode.js';
import { ConnectionData } from './connection.js';

/**
 * Represents a matrix, which consists of a tree of groups and port objects;
 * and a set of connections between ports.
 */
export class MatrixData extends Datum {
  /**
   */
  constructor() {
    super();
    this.root = this.createGroup();
    this.nodes = new Map();
    this.last_id = 0;

    // Map<PortData, Map<PortData, ConnectionData>>
    this.connections = new Map();
  }

  registerNode(node) {
    if (!(node instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    const id = node.id;

    const nodes = this.nodes;

    if (nodes.has(id)) throw new Error('Node with same id already defined.');

    nodes.set(id, node);
  }

  unregisterNode(node) {
    if (!(node instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    const id = node.id;
    const nodes = this.nodes;

    if (nodes.get(id) !== node) throw new Error('Removing unknown node.');

    this.getConnectionsOf(node).forEach((connection) => {
      this.deleteConnection(connection);
    });

    nodes.delete(id);
  }

  /**
   * Creates a port object for this matrix.
   *
   * @param {Object} port - The data for the port object.
   * @param {Function} [PortClass=PortData] - The port data class to use.
   */
  createPort(port, PortClass) {
    if (!(port instanceof PortData)) {
      if (!PortClass) PortClass = PortData;
      if (!port) port = {};
      if (!port.id) {
        port.id = this.last_id++;
      }
      port = new PortClass(this, port);
    }

    return port;
  }

  /**
   * Creates a group object for this matrix.
   *
   * @param {Object} groupd - The data for the group object.
   * @param {Function} [GroupClass=GroupData] - The group data class to use.
   */
  createGroup(group, GroupClass) {
    if (!(group instanceof GroupData)) {
      if (!GroupClass) GroupClass = GroupData;
      if (!group) group = {};
      if (!group.id) {
        group.id = this.last_id++;
      }
      group = new GroupClass(this, group);
      if (!(group instanceof GroupData))
        throw new TypeError('GroupClass must extend GroupData.');
    }

    return group;
  }

  /**
   * Add a group to this matrix. Will be added at the top level of the tree.
   */
  addGroup(group) {
    return this.root.addGroup(group);
  }

  /**
   * Remove a group from the top level of the tree.
   */
  deleteGroup(group) {
    return this.root.deleteGroup(group);
  }

  /**
   * Find a group object for the given id.
   *
   * @param {any} id.
   */
  getGroupById(id) {
    const group = this.nodes.get(id);

    if (group && group instanceof GroupData) return group;
  }

  // APIs for managing ports

  /**
   * Add a port to this matrix. Will be added at the top level of the tree.
   */
  addPort(port) {
    this.root.addPort(port);
  }

  /**
   * Remove a port from the top level of the tree.
   */
  deletePort(port) {
    this.root.deletePort(port);
  }

  /**
   * Find a port object for the given id.
   *
   * @param {any} id.
   */
  getPortById(id) {
    const port = this.nodes.get(id);

    if (port && port instanceof PortData) return port;
  }

  _lowRegisterConnection(from, to, connection) {
    let connections_from = this.connections.get(from);

    if (!connections_from) {
      connections_from = new Map();
      this.connections.set(from, connections_from);
    }

    if (connections_from.has(to)) {
      throw new Error('Connection already exists.');
    }

    let connections_from_to = connections_from.get(to);

    connections_from.set(to, connection);
  }

  _lowUnregisterConnection(from, to, connection) {
    let connections_from = this.connections.get(from);

    if (connections_from) {
      const con = connections_from.get(to);

      if (con === connection) {
        connections_from.delete(to);

        if (!connections_from.size) {
          this.connections.delete(from);
        }

        return;
      }
    }

    throw new Error('Could not find connection.');
  }

  _registerConnection(connection) {
    this._lowRegisterConnection(connection.from, connection.to, connection);

    if (connection.to !== connection.from)
      this._lowRegisterConnection(connection.to, connection.from, connection);
    this.emit('connectionAdded', connection);
  }

  _unregisterConnection(connection) {
    this._lowUnregisterConnection(connection.from, connection.to, connection);
    if (connection.to !== connection.from)
      this._lowUnregisterConnection(connection.to, connection.from, connection);
    this.emit('connectionRemoved', connection);
  }

  /**
   * Create a connection object.
   */
  createConnection(connection) {
    if (!(connection instanceof ConnectionData)) {
      connection = new ConnectionData(this, connection);
    }

    return connection;
  }

  /**
   * Add a connection object.
   */
  addConnection(connection) {
    connection = this.createConnection(connection);

    this._registerConnection(connection);

    return connection;
  }

  /**
   * Delete a connection object.
   */
  deleteConnection(connection) {
    this._unregisterConnection(connection);
  }

  /**
   * Connect two ports.
   *
   * @param {PortData} from
   * @param {PortData} to
   */
  connect(from, to) {
    return this.addConnection({
      from: from,
      to: to,
    });
  }

  /**
   * Return all connections of the given node.
   */
  getConnectionsOf(node) {
    const connections_map = this.connections.get(node);

    return connections_map ? Array.from(connections_map.values()) : [];
  }

  /**
   * Return all connections from this node.
   */
  getConnectionsFrom(node) {
    return this.getConnectionsOf(node).filter(
      (connection) => connection.from === node
    );
  }

  /**
   * Return all connections to this node.
   */
  getConnectionsTo(node) {
    return this.getConnectionsOf(node).filter(
      (connection) => connection.to === node
    );
  }

  /**
   * Return the connection of the two given ports, if any exists.
   */
  getConnection(a, b) {
    const connections_map = this.connections.get(a);

    if (!connections_map) return;

    return connections_map.get(b);
  }

  /**
   * Iterate all connections.
   */
  forEachConnection(cb) {
    this.connections.forEach((map, port) => {
      map.forEach((connection) => {
        if (connection.from === port) cb(connection);
      });
    });
  }

  // other public apis

  createVirtualTreeDataView(amount, filterFunction, sortFunction) {
    return new VirtualTreeDataView(
      this.root,
      amount,
      filterFunction,
      sortFunction
    );
  }
}
