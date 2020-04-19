import { Datum } from './datum.js';
import { PortData } from './port.js';
import { GroupData } from './group.js';
import { ListDataView } from './listdataview.js';
import { TreeNodeData } from './treenode.js';

export class MatrixData extends Datum
{
  constructor()
  {
    super();
    this.root = this.createGroup();
    this.nodes = new Map();
    this.last_id = 0;
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

    nodes.delete(id);
  }

  createPort(port)
  {
    if (!(port instanceof PortData))
    {
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

  addConnection(connection)
  {
  }

  deleteConnection(connection)
  {
  }

  createListDataView(amount, filterFunction, sortFunction)
  {
    return new ListDataView(this.root, amount, filterFunction, sortFunction);
  }
}
