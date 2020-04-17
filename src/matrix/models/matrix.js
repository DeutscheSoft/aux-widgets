import { Datum } from './datum.js';
import { PortData } from './portdata.js';
import { GroupData } from './groupdata.js';
import { ConnectionData } from './connectiondata.js';
import { ListDataView } from './listdataview.js';
import { TreeNodeData } from './treenode.js';

export class MatrixData extends Datum
{
  constructor()
  {
    super();
    this.root = new GroupData();
    this.nodes = new Map();
  }

  registerNode(node)
  {
    if (!(child instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');
  }

  createPort(port)
  {
    if (!(port instanceof PortData))
    {
      port = new Port(this, port);
    }

    return port;
  }

  createGroup(group)
  {
    if (!(group instanceof GroupData))
    {
      group = new Group(this, group);
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

  createListDataView(filterFunction, amount)
  {
    return new ListDataView(this.root, filterFunction, amount);
  }
}
