import { Events } from '../../events.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { GroupData } from './group.js';

class ChildList extends Events
{
  constructor(group, sorter, filter)
  {
    this.list = [];
    this.sorter = sorter;
    this.filter = filter;
    this.subscription = group.forEachAsync((child) => {
      if (!filter(child)) return;

      this.list.push(child);
      this.list.sort(sorter);
      this.emit('changed');

      return () => {
        this.list = this.list.filter((_child) => child !== child);
        this.emit('changed');
      };
    });
  }

  destroy()
  {
    this.subscription();
  }
}

class GroupInfo
{
  constructor(depth)
  {
    this.depth = depth;
    this.size = 0;
    this.index = 0;
  }
}

function allowAll(cb)
{
  return (node) => {
    return cb(node);
  };
}

export class ListDataView extends Events
{
    constructor(group, amount, filterFunction, sortFunction)
    {
        super();
        this.group = group;
        this.startIndex = 0;
        this.amount = amount;
        this.filterFunction = filterFunction || allowAll;
        this.sortFunction = sortFunction;
        this.subscriptions = init_subscriptions();

        // lists of children (one for each group)
        this.childlists = new Map();

        // global flat list
        this.list = [];

        // index in the flat list where each group
        this.group_info = new Map();

        let subs = this._subscribe(this.group);

        this.subscriptions = add_subscription(subs, this.subscriptions);
    }

    getGroupInfo(group)
    {
      const info = this.group_info.get(group);

      if (!info)
        throw new Error('No group info available for this group.');

      return info;
    }

    getDepth(child)
    {
      if (child === this.group)
        return -1;

      const info = this.getGroupInfo(child.parent);

      return info.depth + 1;
    }

    getSubtreeSize(group)
    {
      const info = this.getGroupInfo(group);

      return info.size;
    }

    _childAdded(group, child)
    {
      do
      {
        let info = this.group_info.get(group)

        if (!info) break;

        info.size++;

        group = group.parent;
      }
      while (group);
    }

    _childRemoved(group, child)
    {
      let size = 1;

      if (child instanceof GroupData)
        size += this.getSubtreeSize(child);

      do
      {
        let info = this.group_info.get(group)

        if (!info) break;

        info.size -= size;

        group = group.parent;
      }
      while (group);
    }

    _subscribe(group)
    {
      const list = [];
      const info = new GroupInfo(this.getDepth(group));

      this.childlists.set(group, list);
      this.group_info.set(group, info);

      const sub = group.forEachAsync((node) => {
        let sub = init_subscriptions();

        // TODO: needs to be dynamic
        if (!this.filterFunction(node))
        {
          return init_subscriptions();
        }

        list.push(node);
        this._childAdded(group, node);

        // TODO: needs to be dynamic
        list.sort(this.sortFunction);

        sub = add_subscription(sub, () => {
          if (node === null) return;

          const index = list.indexOf(node);

          list.splice(index, 1);
          this._childRemoved(group, node);

          node = null;
        });

        if (node instanceof GroupData)
        {
          sub = add_subscription(sub, this._subscribe(node)); 
        }

        return sub;
      });

      return add_subscription(sub, () => {
        this.childlists.delete(group);
        this.group_info.delete(group);
      });
    }

    setStartIndex(index)
    {
      this.startIndex = index;
      // TODO: update list
    }

    scrollStartIndex(offset)
    {
    }

    collapseGroup(group, collapsed)
    {
    }

    destroy()
    {
      this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
    }

    forEach(cb)
    {
      const rec = (group) => {
        const list = this.childlists.get(group);

        list.forEach((child) => {
          cb(child);
          if (child instanceof GroupData)
            rec(child);
        });
      };

      rec(this.group);
    }

    subscribeElements(cb)
    {

    }
}
