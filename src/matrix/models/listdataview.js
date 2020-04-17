import { Events } from '../../events.js';

export class ListDataView extends Events
{
    constructor(group, filterFunction, amount)
    {
        super();
        this.group = group;
        this.filterFunction = filterFunction;
        this.startIndex = 0;
        this.amount = amount;
    }

    setStartIndex(index)
    {
    }

    scrollStartIndex(offset)
    {
    }

    collapseGroup(group, collapsed)
    {
    }

    destroy()
    {
    }
}
