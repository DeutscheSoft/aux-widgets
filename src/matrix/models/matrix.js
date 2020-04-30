import { Datum } from './datum.js';
import { PortData } from './port.js';
import { GroupData } from './group.js';
import { ListDataView } from './listdataview.js';
import { TreeNodeData } from './treenode.js';
import { ConnectionData } from './connection.js';

export class MatrixData extends Datum
{
  constructor()
  {
    super();
    this.root = this.createGroup();
    this.nodes = new Map();
    this.last_id = 0;

    // Map<PortData, Map<PortData, ConnectionData>>
    this.connections = new Map();
  }

  registerNode(node)
  {
    if (!(node instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    const id = node.id;

    const nodes = this.nodes;

    if (nodes.has(id))
      throw new Error('Node with same id already defined.');

    nodes.set(id, node);
  }

  unregisterNode(node)
  {
    if (!(node instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    const id = node.id;
    const nodes = this.nodes;

    if (nodes.get(id) !== node)
      throw new Error('Removing unknown node.');

    this.getConnectionsOf(node).forEach((connection) => {
      this.deleteConnection(connection);
    });

    nodes.delete(id);
  }

  createPort(port)
  {
    if (!(port instanceof PortData))
    {
      if (!port) port = {};
      if (!port.id)
      {
        port.id = this.last_id++;
      }
      port = new PortData(this, port);
    }

    return port;
  }

  createGroup(group)
  {
    if (!(group instanceof GroupData))
    {
      if (!group) group = {};
      if (!group.id)
      {
        group.id = this.last_id++;
      }
      group = new GroupData(this, group);
    }

    return group;
  }

  // APIs for managing groups
  addGroup(group)
  {
    return this.root.addGroup(group);
  }

  deleteGroup(group)
  {
    return this.root.deleteGroup(group);
  }

  getGroupById(id)
  {
    const group = this.nodes.get(id);

    if (group && group instanceof GroupData)
      return group;
  }

  // APIs for managing ports

  // adds a port to this matrix (not into a group)
  addPort(port)
  {
    this.root.addPort(port);
  }

  deletePort(port)
  {
    this.root.deletePort(port);
  }

  getPortById(id)
  {
    const port = this.nodes.get(id);

    if (port && port instanceof PortData)
      return port;
  }

  // APIs for managing connections


  _lowRegisterConnection(from, to, connection)
  {
    let connections_from = this.connections.get(from);

    if (!connections_from)
    {
      connections_from = new Map();
      this.connections.set(from, connections_from);
    }

    if (connections_from.has(to))
    {
      throw new Error('Connection already exists.');
    }

    let connections_from_to = connections_from.get(to);

    connections_from.set(to, connection);
  }

  _lowUnregisterConnection(from, to, connection)
  {
    let connections_from = this.connections.get(from);

    if (connections_from)
    {
      const con = connections_from.get(to);

      if (con === connection)
      {
        connections_from.delete(to);

        if (!connections_from.size)
        {
          this.connections.delete(from);
        }

        return;
      }
    }

    throw new Error('Could not find connection.');
  }

  _registerConnection(connection)
  {
    this._lowRegisterConnection(connection.from, connection.to, connection);
    this._lowRegisterConnection(connection.to, connection.from, connection);
    this.emit('connectionAdded', connection);
  }

  _unregisterConnection(connection)
  {
    this._lowUnregisterConnection(connection.from, connection.to, connection);
    this._lowUnregisterConnection(connection.to, connection.from, connection);
    this.emit('connectionRemoved', connection);
  }

  createConnection(connection)
  {
    if (!(connection instanceof ConnectionData))
    {
      connection = new ConnectionData(this, connection);
    }

    return connection;
  }

  addConnection(connection)
  {
    connection = this.createConnection(connection);

    this._registerConnection(connection);

    return connection;
  }

  deleteConnection(connection)
  {
    this._unregisterConnection(connection);
  }

  connect(from, to)
  {
    return this.addConnection({
      from: from,
      to: to,
    });
  }

  getConnectionsOf(node)
  {
    const connections_map = this.connections.get(node);

    return connections_map ? Array.from(connections_map.values()) : [];
  }

  getConnectionsFrom(node)
  {
    return this.getConnectionsOf(node).filter((connection) => connection.from === node);
  }

  getConnectionsTo(node)
  {
    return this.getConnectionsOf(node).filter((connection) => connection.to === node);
  }

  forEachConnection(cb)
  {
    this.connections.forEach((map, port) => {
      map.forEach((connection) => {
        if (connection.from === port)
          cb(connection);
      });
    });
  }

  // other public apis

  createListDataView(amount, filterFunction, sortFunction)
  {
    return new ListDataView(this.root, amount, filterFunction, sortFunction);
  }
}
