import { Events } from '../../events.js';
import { init_subscribers, add_subscriber, remove_subscriber, call_subscribers } from '../../utils/subscribers.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { GroupData } from './group.js';

function allowAll(cb)
{
  return (node) => {
    return cb(node);
  };
}

class SuperGroup
{
  constructor(group, parent, index)
  {
    this.group = group;
    this.parent = parent;
    this.depth = parent ? (parent.depth + 1) : -1;
    this.size = 0;
    this.index = index !== void(0) ? index : -1;
    this.children = [];
  }

  childDistance(index)
  {
    let offset = 1;

    const list = this.children;

    for (let i = 0; i < index; i++)
    {
      const child = list[i];

      offset ++;

      if (child instanceof SuperGroup)
      {
        offset += child.size;
      }
    }

    return offset;
  }

  updateSize(diff)
  {
    this.size += diff;

    const parent = this.parent;

    if (parent !== null)
    {
      parent.updateSize(diff);
    }
  }
}

export class ListDataView extends Events
{
    // PRIVATE APIs
    _offsetFromParent(group, index)
    {
      return this.getSuperGroup(group).childDistance(index);
    }

    _updateSize(parent, diff)
    {
      parent.updateSize(diff);
      this.emit('sizeChanged', this.root.size);
    }

    _updateIndex(startIndex)
    {
      const list = this.list;

      for (let i = startIndex; i < list.length; i++)
      {
        const child = list[i];

        if (!(child instanceof GroupData)) continue;

        const super_group = this.groups.get(child);

        super_group.index = i;
      }
    }

    _childAdded(parent, child, index)
    {
      let sub = init_subscriptions();

      // increase size by one
      this._updateSize(parent, 1);

      const offset = parent.childDistance(index);
      const list = this.list;

      const list_index = parent.index + offset;

      list.splice(list_index, 0, child);

      let super_group;

      if (child instanceof GroupData)
      {
        super_group = new SuperGroup(child, parent, list_index);
        this.groups.set(child, super_group);
      }

      this._updateIndex(list_index + 1);

      if (child instanceof GroupData)
      {
        sub = add_subscription(sub, this._subscribe(super_group)); 
      }

      this._notifyRegion(list_index, list_index + 1);

      return sub;
    }

    _childRemoved(parent, child, index)
    {
      // NOTE: the subtree is always empty now, since
      // it is automatically removed before
      const size = (child instanceof GroupData)
        ? (1 + this.getSubtreeSize(child))
        : 1;

      // decrease size
      this._updateSize(parent, -size);

      const offset = parent.childDistance(index);
      const list = this.list;

      const list_index = parent.index + offset;

      if (list[list_index] !== child)
        throw new Error('Removing wrong child.');

      list.splice(list_index, size);
      this._updateIndex(list_index + size);
      this._notifyRegion(list_index, list_index + size);
    }

    _subscribe(super_group)
    {
      const list = super_group.children;
      const group = super_group.group;

      const sub = group.forEachAsync((node) => {
        let sub = init_subscriptions();

        // TODO: needs to be dynamic
        if (!this.filterFunction(node))
        {
          return init_subscriptions();
        }

        list.push(node);
        // TODO: needs to be dynamic
        list.sort(this.sortFunction);

        sub = add_subscription(sub, this._childAdded(super_group, node, list.indexOf(node)));

        sub = add_subscription(sub, () => {
          if (node === null) return;

          const index = list.indexOf(node);

          list.splice(index, 1);

          this._childRemoved(super_group, node, index);

          node = null;
        });

        return sub;
      });

      return sub;
    }

    _notifyRegion(start, end)
    {
      const startIndex = this.startIndex;
      const endIndex = startIndex + this.amount; 

      if (end <= startIndex) return;
      if (start >= endIndex) return;

      const from = Math.max(start, startIndex);
      const to = Math.min(end, endIndex);
      const list = this.list;
      const subscribers = this.subscribers;

      for (let i = from; i < to; i++)
      {
        const element = list[i];

        call_subscribers(subscribers, i, element);
      }
    }

    // PUBLIC APIs
    constructor(group, amount, filterFunction, sortFunction)
    {
        super();
        this.root = new SuperGroup(group, null);
        this.startIndex = 0;
        this.amount = amount;
        this.filterFunction = filterFunction || allowAll;
        this.sortFunction = sortFunction;
        this.subscriptions = init_subscriptions();

        // subscribers
        this.subscribers = init_subscribers();

        // global flat list
        this.list = [];

        // index in the flat list where each group
        this.groups = new Map([[ group, this.root ]]);

        let subs = this._subscribe(this.root);

        this.subscriptions = add_subscription(subs, this.subscriptions);
    }

    get size()
    {
      return this.root.size;
    }

    getSuperGroup(group)
    {
      if (!(group instanceof GroupData))
      {
        throw new TypeError('Expected GroupData instance as argument.');
      }

      const super_group = this.groups.get(group);

      if (!super_group)
      {
        throw new Error('No group info available for this group.');
      }

      return super_group;
    }

    getDepth(child)
    {
      const info = this.getSuperGroup(child.parent);

      return info.depth + 1;
    }

    getSubtreeSize(group)
    {
      const info = this.getSuperGroup(group);

      return info.size;
    }

    setStartIndex(index)
    {
      this.startIndex = index;
      this._notifyRegion(index, index + this.amount);
    }

    scrollStartIndex(offset)
    {
      this.startIndex += offset;

      if (offset > 0)
      {
        const end = this.startIndex + this.amount;
        this._notifyRegion(end - offset, end);
      }
      else if (offset < 0)
      {
        const start = this.startIndex;
        this._notifyRegion(start, start - offset);
      }
    }

    collapseGroup(group, collapsed)
    {
    }

    destroy()
    {
      this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
    }

    check()
    {
      this.forEach((child) => {
        if (child instanceof GroupData)
        {
          const index = this.getSuperGroup(child).index;

          if (this.list[index] !== child)
          {
            console.error('Found group at position %d. Found %o vs. %o.\n',
                        index, child.label, this.list[index]);
            throw new Error('Group is not at right position.');
          }
        }
      });
    }

    forEach(cb)
    {
      const rec = (group) => {
        const list = this.getSuperGroup(group).children;

        list.forEach((child) => {
          cb(child);
          if (child instanceof GroupData)
            rec(child);
        });
      };

      rec(this.root.group);
    }

    subscribeElements(cb)
    {
      if (typeof(cb) !== 'function')
        throw new TypeError('Expected function.');

      this.subscribers = add_subscriber(this.subscribers, cb);

      const from = this.startIndex;
      const to = from + this.amount;
      const list = this.list;

      for (let i = from; i < to; i++)
      {
        const element = list[i];

        call_subscribers(cb, i, element);
      }

      return () => {
        if (cb === null) return;
        this.subscribers = remove_subscriber(this.subscribers, cb);
        cb = null;
      };
    }

    /**
     * Emits the size of the list.
     */
    subscribeSize(cb)
    {
      call_subscribers(cb, this.root.size);

      return this.subscribe('sizeChanged', cb);
    }
}
