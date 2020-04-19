import { TreeNodeData } from './treenode.js';
import { PortData } from './port.js';

import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

function on_child_treechanged()
{
  this.parent.emit('treeChanged');
}

export class GroupData extends TreeNodeData
{
    get isGroup() { return true; }

    constructor(matrix, o)
    {
      super(matrix, o);
      this.children = new Set();
    }

    addChild(child)
    {
      if (!(child instanceof TreeNodeData))
        throw new TypeError('Expected TreeDataNode');

      if (this.isChildOf(child))
        throw new Error('Creating graphs is not allowed.');

      this.matrix.registerNode(child);

      const children = this.children;

      child.setParent(this);
      children.add(child);

      this.emit('childAdded', child);
      this.emit('treeChanged', this);

      child.on('treeChanged', on_child_treechanged);
    }

    deleteChild(child)
    {
      if (!(child instanceof TreeNodeData))
        throw new TypeError('Expected TreeDataNode');

      const children = this.children;

      if (!children.has(child))
        throw new Error('Unknown child.');

      this.matrix.unregisterNode(child);

      child.setParent(null);
      children.delete(child);

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
        group = this.matrix.createGroup(group);

      this.addChild(group);
      return group;
    }

    deleteGroup(group)
    {
      this.deleteChild(group);
    }

    forEach(cb)
    {
      this.children.forEach(cb);
    }

    /**
     * Iterates all children of this group and all their children recursively.
     * Will descend into group nodes if the callback returns either undefined or
     * a trueish value.
     *
     * @param cb {Function} - A callback function to be called for each node in
     *  this subtree. The arguments are the node and the path description. The
     *  path description is an Array of objects with 3 properties `parent`,
     *  `index` and `length`. Parent is the parent node, `index` the index of
     *  the node in the list of children and `length` is the number of siblings.
     * @param sorter {Function} - An optional sort function. Will be used as an
     *  argument to Array.prototype.sort for each list of child nodes.
     */
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

    forEachAsync(callback)
    {
      let subs = init_subscriptions();
      const child_subscriptions = new Map();

      this.children.forEach((node) => {
        child_subscriptions.set(node, callback(node) || null);
      });

      subs = add_subscription(subs, this.subscribe('childAdded', (child) => {
        child_subscriptions.set(child, callback(child) || null);
      }));

      subs = add_subscription(subs, this.subscribe('childRemoved', (child) => {
        unsubscribe_subscriptions(child_subscriptions.get(child));
        child_subscriptions.delete(child);
      }));

      return () => {
        subs = unsubscribe_subscriptions(subs);
        child_subscriptions.forEach((subs) => unsubscribe_subscriptions(subs));
        child_subscriptions.clear();
      };
    }
}
