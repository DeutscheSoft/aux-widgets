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

export class ListDataView extends Events
{
    constructor(group, amount, filterFunction, sortFunction)
    {
        super();
        this.group = group;
        this.filterFunction = filterFunction;
        this.startIndex = 0;
        this.amount = amount;
        this.subscriptions = init_subscriptions();
        this.filterFunction = filterFunction;
        this.sortFunction = sortFunction;

        // lists of children (one for each group)
        this.childlists = new Map();

        let subs = this._subscribe(this.group);

        this.subscriptions = add_subscription(subs, this.subscriptions);
    }

    _subscribe(group)
    {
      const list = [];
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

        if (node instanceof GroupData)
        {
          sub = add_subscription(sub, this._subscribe(node)); 
        }

        sub = add_subscription(sub, () => {
          if (node === null) return;

          const index = list.indexOf(node);

          list.splice(index, 1);

          node = null;
        });

        return sub;
      });

      this.childlists.set(group, list)

      return add_subscription(sub, () => {
        this.childlists.delete(group);
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
}
