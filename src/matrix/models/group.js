import { TreeNodeData } from './treenode.js';
import { PortData } from './portdata.js';

function on_child_treechanged()
{
  this.parent.emit('treeChanged');
}

export class GroupData extends TreeNodeData
{
    constructor(matrix, o)
    {
        super(matrix, o);
        this.children = new Set();
    }

    addChild(child)
    {
      if (!(child instanceof TreeNodeData))
        throw new TypeError('Expected TreeDataNode');

      this.matrix.registerNode(group);

      const children = this.children;

      child.setParent(this);
      children.add(child);

      this.emit('childAdded', child);
      this.emit('treeChanged', this);

      child.on('treeChanged', on_child_treechanged);
    }

    removeChild(child)
    {
      if (!(child instanceof TreeNodeData))
        throw new TypeError('Expected TreeDataNode');

      const children = this.children;

      if (!children.has(child))
        throw new Error('Unknown child.');

      this.matrix.unregisterNode(group);

      child.setParent(null);
      children.remove(child);

      child.off('treeChanged', on_child_treechanged);

      this.emit('childRemoved', child);
      this.emit('treeChanged', this);
    }

    // adds a port to this group
    addPort(port)
    {
      if (!(port instanceof PortData))
        port = this.matrix.createPort(port);

      this.addChild(port);
      return port;
    }

    deletePort(port)
    {
      this.deleteChild(port);
    }

    addGroup(group)
    {
      if (!(group instanceof GroupData))
        group = this.matrix.createPort(group);

      this.addChild(group);
      return group;
    }

    deleteGroup(group)
    {
      this.deleteChild(group);
    }

    forEachNode(cb, sorter, path)
    {
      const children = Array.from(this.children);

      if (sorter)
      {
        children.sort(sorter);
      }
      
      if (!Array.isArray(path))
      {
        path = [];
      }

      for (let i = 0; i < children.length; i++)
      {
        const child = children[i];
        const current_path = path.concat([
          {
            parent: this,
            index: i,
            length: children.length,
          }
        ]);

        const retval = cb(child, current_path);

        if (retval !== void(0) && !retval) continue;

        if (child instanceof GroupData)
        {
          child.forEachNode(cb, sorter, current_path);
        }
      }
    }
}
