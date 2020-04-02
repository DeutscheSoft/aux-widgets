import { Events } from '../events.js'; 

function make_filter(filter)
{
  if (typeof(filter) === 'function')
  {
    if (filter.prototype)
    {
      return function (o) {
        return o instanceof filter;
      };
    }
    else
    {
      return filter;
    }
  }
  else if (filter === void(0))
  {
    return function () { return true; };
  }
  else
  {
    throw new Error('Unsupported filter type: ' + typeof(filter));
  }
}

export class ChildWidgets extends Events
{
  constructor(widget, options)
  {
    super();
    if (!options) options = {};
    this.widget = widget;
    this.filter = make_filter(options.filter);
    this.list = widget.get_children().filter(this.filter);
    this.subscriptions = [
      widget.subscribe('child_added', (child) => {
        if (!this.filter(child)) return;
        this.list.push(child);
        this.sortByDOM();
        this.emit('child_added', child, this.list.indexOf(child));
        this.emit('changed');
      }),
      widget.subscribe('child_removed', (child) => {
        if (!this.filter(child)) return;
        const position = this.list.indexOf(child);
        this.list = this.list.filter((_child) => _child !== child);
        this.emit('child_removed', child, position);
        this.emit('changed');
      }),
    ];
  }

  sortByDOM()
  {
    // TODO: this method currently assumes that the children are all
    // children of the same parent. this might not always be the case
    const list = this.list;

    if (!list.length) return;

    const parentNode = list[0].element.parentNode; 
    const nodes = Array.from(parentNode.children);

    list.sort(function (child1, child2) {
      if (child1 === child2) return 0;
      return nodes.indexOf(child1.element) < nodes.indexOf(child2.element) ? -1 : 1;
    });
  }

  sort()
  {
    this.sortByDOM();
    this.emit('changed');
  }

  indexOf(child)
  {
    return this.list.indexOf(child);
  }

  includes(child)
  {
    return this.list.indexOf(child) !== -1;
  }

  forEach(cb)
  {
    this.list.forEach(cb);
  }

  getList()
  {
    return this.list;
  }

  at(index)
  {
    return this.list[index];
  }

  destroy()
  {
    this.subscriptions.forEach((cb) => cb());
    this.widget = null;
  }
}
